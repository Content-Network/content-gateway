/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger } from "@banklessdao/util-misc";
import {
    ContentGateway,
    ContentGatewayUser,
    createContentGateway,
    DataRepository,
    UserRepository
} from "@domain/feature-gateway";
import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import * as g from "graphql";
import { Collection, MongoClient, ObjectId } from "mongodb";
import { join } from "path";
import { ToadScheduler } from "toad-scheduler";
import {
    authorization,
    createGraphQLAPIV1,
    createMongoUserRepository,
    ObservableSchemaRepository,
    toObservableSchemaRepository
} from ".";
import { createMongoDataRepository, createMongoSchemaRepository } from "./";
import { liveLoaders } from "./live-loaders";
import { LiveLoader } from "./live-loaders/LiveLoader";
import { AtlasApiInfo } from "./maintenance/jobs/index-handling/IndexCreationJob";
import { createJobs, JobConfig } from "./maintenance/jobs/jobs";
import { MongoUser } from "./repository/mongo/MongoUser";
import { createMongoMaintainer } from "./repository/MongoMaintainer";
import { generateContentGatewayAPIV1 } from "./service";

export type ApplicationContext = {
    app: express.Application;
    schemaRepository: ObservableSchemaRepository;
    userRepository: UserRepository;
    dataRepository: DataRepository;
    contentGateway: ContentGateway;
};

export type AppParams = {
    nodeEnv: string;
    dbName: string;
    mongoClient: MongoClient;
    schemasCollectionName: string;
    usersCollectionName: string;
    rootUser: ContentGatewayUser;
    rootApiKey: string;
    atlasApiInfo?: AtlasApiInfo;
};

export const createApp = async (params: AppParams) => {
    const logger = createLogger("ContentGatewayAPIApp");
    const { dbName, mongoClient } = params;
    const db = mongoClient.db(dbName);
    const users = db.collection<MongoUser>(params.usersCollectionName);

    logger.info(`Running in ${params.nodeEnv} mode`);

    const app = express();

    const schemaRepository = toObservableSchemaRepository(
        await createMongoSchemaRepository({
            db,
            collName: params.schemasCollectionName,
            usersCollName: params.usersCollectionName,
        })
    );

    const dataRepository = createMongoDataRepository({
        db,
        schemaRepository,
    });

    const userRepository = await createMongoUserRepository({
        db,
        collName: params.usersCollectionName,
    });

    const contentGateway = createContentGateway({
        dataRepository,
        userRepository,
        schemaRepository,
        authorization,
    });
    if (params.atlasApiInfo) {
        logger.info(
            "Atlas information was present, creating index maintenance job"
        );
        const maintenanceJobConfig: JobConfig = {
            atlasApiInfo: params.atlasApiInfo,
        };
        const maintenanceJobs = createJobs(
            maintenanceJobConfig,
            mongoClient.db(dbName)
        );
        const maintenanceJobsScheduler = new ToadScheduler();
        createMongoMaintainer(maintenanceJobs, maintenanceJobsScheduler);
    } else {
        logger.info(
            "Atlas information was not present, skipping index maintenance job"
        );
    }

    const context: ApplicationContext = {
        app,
        schemaRepository,
        dataRepository,
        userRepository,
        contentGateway,
    };

    await ensureRootUserExists(params.rootUser, users);

    app.use("/api/v1/rest/", await generateContentGatewayAPIV1(context));
    app.use("/api/v1/graphql/", await createGraphQLAPIV1(context));
    app.use(
        "/api/v1/graphql-live",
        createGraphQLLiveService({
            liveLoaders: liveLoaders,
        })
    );

    const clientBuildPath = join(__dirname, "../content-gateway-api-frontend");
    app.use(express.static(clientBuildPath));
    app.get("*", (_, response) => {
        response.sendFile(join(clientBuildPath, "index.html"));
    });

    return app;
};

const ensureRootUserExists = async (
    rootUser: ContentGatewayUser,
    users: Collection<MongoUser>
) => {
    const existingUser = await users.findOne({
        _id: new ObjectId(rootUser.id),
    });
    if (!existingUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...toInsert } = rootUser;
        await users.insertOne({
            ...toInsert,
            _id: new ObjectId(rootUser.id),
        });
    }
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
