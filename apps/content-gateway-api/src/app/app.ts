/* eslint-disable @typescript-eslint/no-explicit-any */
import { createLogger, programError } from "@banklessdao/util-misc";
import {
    ContentGateway,
    createContentGateway,
    DataRepository,
    UserRepository
} from "@domain/feature-gateway";
import * as express from "express";
import { graphqlHTTP } from "express-graphql";
import * as g from "graphql";
import { MongoClient } from "mongodb";
import { join } from "path";
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
import { generateContentGatewayAPIV1 } from "./service";

export type ApplicationContext = {
    app: express.Application;
    schemaRepository: ObservableSchemaRepository;
    userRepository: UserRepository;
    dataRepository: DataRepository;
    contentGateway: ContentGateway;
};

export const SCHEMAS_COLLECTION_NAME = "schemas";
export const USERS_COLLECTION_NAME = "users";

export const createApp = async ({
    dbName,
    mongoClient,
}: {
    dbName: string;
    mongoClient: MongoClient;
}) => {
    const env = process.env.NODE_ENV ?? programError("NODE_ENV not set");
    const resetDb = process.env.RESET_DB === "true";
    const addFrontend = process.env.ADD_FRONTEND === "true";
    const logger = createLogger("ContentGatewayAPIApp");
    const db = mongoClient.db(dbName);

    if (resetDb) {
        await mongoClient.db(dbName).dropDatabase();
    }
    logger.info(`Running in ${env} mode`);

    const app = express();

    const schemaRepository = toObservableSchemaRepository(
        await createMongoSchemaRepository({
            db,
            collName: SCHEMAS_COLLECTION_NAME,
            usersCollName: USERS_COLLECTION_NAME,
        })
    );

    const dataRepository = createMongoDataRepository({
        db,
        schemaRepository,
    });

    const userRepository = await createMongoUserRepository({
        db,
        collName: USERS_COLLECTION_NAME,
    });

    const contentGateway = createContentGateway({
        dataRepository,
        userRepository,
        schemaRepository,
        authorization,
    });

    const context: ApplicationContext = {
        app,
        schemaRepository,
        dataRepository,
        userRepository,
        contentGateway,
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
    if (addFrontend) {
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
