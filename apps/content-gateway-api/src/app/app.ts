/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ContentGatewayClientV1,
    createContentGatewayClientV1,
} from "@banklessdao/content-gateway-sdk";
import {
    ContentGateway,
    createContentGateway,
    DataRepository,
} from "@domain/feature-gateway";
import { createLogger, programError, verifiedEnvVar } from "@banklessdao/util-misc";
import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import * as g from "graphql";
import { MongoClient } from "mongodb";
import { join } from "path";
import { Logger } from "tslog";
import {
    createGraphQLAPIV1 as createGraphQLAPIV1,
    createInMemoryOutboundDataAdapter,
    ObservableSchemaRepository,
    toObservableSchemaRepository,
} from ".";
import { createMongoDataRepository, createMongoSchemaRepository } from "./";
import { liveLoaders } from "./live-loaders";
import { LiveLoader } from "./live-loaders/LiveLoader";
import { generateContentGatewayAPIV1 } from "./service";
import { createJobs, JobConfig } from "./maintenance/jobs/jobs";
import { createMongoMaintainer } from "./repository/MongoMaintainer";
import { ToadScheduler } from "toad-scheduler";

export type ApplicationContext = {
    logger: Logger;
    env: string;
    isDev: boolean;
    isProd: boolean;
    app: express.Application;
    mongoClient: MongoClient;
    schemaRepository: ObservableSchemaRepository;
    dataRepository: DataRepository;
    contentGateway: ContentGateway;
    client: ContentGatewayClientV1;
};

export const createApp = async ({
    dbName,
    mongoClient,
}: {
    dbName: string;
    mongoClient: MongoClient;
}) => {
    const env = process.env.NODE_ENV ?? programError("NODE_ENV not set");
    const isDev = env === "development";
    const isProd = env === "production";
    const resetDb = process.env.RESET_DB === "true";
    const addFrontend = process.env.ADD_FRONTEND === "true";

    const atlasApiInfo = {
        publicKey: verifiedEnvVar("ATLAS_PUBLIC_KEY"),
        privateKey: verifiedEnvVar("ATLAS_PRIVATE_KEY"),
        projectId: verifiedEnvVar("ATLAS_PROJECT_ID"),
        processId: verifiedEnvVar("ATLAS_PROCESS_ID"),
    }

    const logger = createLogger("ContentGatewayAPIApp");

    if (resetDb) {
        await mongoClient.db(dbName).dropDatabase();
    }
    logger.info(`Running in ${env} mode`);

    const app = express();
    const schemaRepository = toObservableSchemaRepository(
        await createMongoSchemaRepository({ dbName, mongoClient })
    );
    const dataRepository = createMongoDataRepository({
        dbName,
        mongoClient,
        schemaRepository,
    });

    const contentGateway = createContentGateway({
        schemaRepository,
        dataRepository,
    });
    const client = createContentGatewayClientV1({
        apiKey: "",
        adapter: createInMemoryOutboundDataAdapter({
            contentGateway,
        }),
    });
    const maintenanceJobConfig: JobConfig = {
        atlasApiInfo: atlasApiInfo
    }
    const maintenanceJobs = createJobs(maintenanceJobConfig,mongoClient.db(dbName))
    const maintenanceJobsScheduler = new ToadScheduler()
    createMongoMaintainer(maintenanceJobs,maintenanceJobsScheduler)

    const context: ApplicationContext = {
        logger,
        env,
        isDev,
        isProd,
        app,
        mongoClient,
        schemaRepository,
        dataRepository,
        contentGateway,
        client,
    };

    app.use("/api/v1/rest/", await generateContentGatewayAPIV1(context));
    app.use("/api/v1/graphql/", await createGraphQLAPIV1(context));
    app.use(
        "/api/v1/graphql-live",
        createGraphQLLiveService({
            liveLoaders: liveLoaders,
        })
    );

    const clientBuildPath = join(__dirname, "../content-gateway-api-frontend");
    if (addFrontend || isProd) {
        app.use(express.static(clientBuildPath));
        app.get("*", (_, response) => {
            response.sendFile(join(clientBuildPath, "index.html"));
        });
    }

    return app;
};

export const createGraphQLLiveService = (deps: {
    readonly liveLoaders: LiveLoader<any, any>[];
}) => {
    const fields = deps.liveLoaders
        .map((loader) => loader.configure())
        .reduce((acc, next) => {
            return { ...acc, ...next };
        }, {} as g.GraphQLFieldConfigMap<string, unknown>);
    return graphqlHTTP({
        schema: new g.GraphQLSchema({
            query: new g.GraphQLObjectType({
                name: "Query",
                fields: fields,
            }),
        }),
        graphiql: true,
    });
};
