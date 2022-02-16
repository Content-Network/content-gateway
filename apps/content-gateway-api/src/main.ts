import {
    base64Decode,
    createLogger,
    extractRight,
    programError,
    verifiedEnvVar
} from "@banklessdao/util-misc";
import { ContentGatewayUserCodec } from "@domain/feature-gateway";
import * as E from "fp-ts/Either";
import { MongoClient } from "mongodb";
import { createApp } from "./app/";

const logger = createLogger("main");

const url =
    process.env.MONGO_CGA_URL ?? programError("You must specify MONGO_CGA_URL");
const dbName =
    process.env.MONGO_CGA_USER ??
    programError("You must specify MONGO_CGA_USER");

const mongoClient = new MongoClient(url, {
    keepAlive: true,
});

export const SCHEMAS_COLLECTION_NAME = "schemas";
export const USERS_COLLECTION_NAME = "users";

async function main() {
    const port =
        process.env.PORT ||
        process.env.CGA_PORT ||
        programError("You must specify either PORT or CGA_PORT");
    const nodeEnv = process.env.NODE_ENV ?? programError("NODE_ENV not set");
    const rootApiKey = process.env.ROOT_API_KEY ?? programError("ROOT_API_KEY not set");
    const rootUserRaw =
        process.env.ROOT_USER ?? programError("ROOT_USER not set");
    const rootUserMaybe = ContentGatewayUserCodec.decode(
        JSON.parse(base64Decode(rootUserRaw))
    );
    if (E.isLeft(rootUserMaybe)) {
        programError(`ROOT_USER is invalid`);
    }
    const resetDb = process.env.RESET_DB === "true";
    const addFrontend = process.env.ADD_FRONTEND === "true";

    const atlasApiInfo = {
        publicKey: verifiedEnvVar("ATLAS_PUBLIC_KEY"),
        privateKey: verifiedEnvVar("ATLAS_PRIVATE_KEY"),
        projectId: verifiedEnvVar("ATLAS_PROJECT_ID"),
        processId: verifiedEnvVar("ATLAS_PROCESS_ID"),
    }

    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    logger.info(`Connected to MongoDB at ${url}`);

    const app = await createApp({
        dbName,
        mongoClient,
        nodeEnv,
        resetDb,
        addFrontend,
        rootUser: extractRight(rootUserMaybe),
        rootApiKey: rootApiKey,
        schemasCollectionName: SCHEMAS_COLLECTION_NAME,
        usersCollectionName: USERS_COLLECTION_NAME,
        atlasApiInfo
    });

    const server = app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`);
    });

    server.on("error", (err) => {
        logger.error(err);
    });
}

main().catch((err) => logger.error(err));
