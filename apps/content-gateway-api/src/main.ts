/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    base64Decode,
    createLogger,
    extractRight,
    programError,
} from "@banklessdao/util-misc";
import { ContentGatewayUserCodec } from "@domain/feature-gateway";
import * as E from "fp-ts/Either";
import { MongoClient } from "mongodb";
import { createApp } from "./app/";
import { AtlasApiInfo } from "./app/maintenance/jobs/index-handling/IndexCreationJob";

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
    const rootApiKey =
        process.env.ROOT_API_KEY ?? programError("ROOT_API_KEY not set");
    const rootUserRaw =
        process.env.ROOT_USER ?? programError("ROOT_USER not set");
    const rootUserMaybe = ContentGatewayUserCodec.decode(
        JSON.parse(base64Decode(rootUserRaw))
    );
    if (E.isLeft(rootUserMaybe)) {
        programError(`ROOT_USER is invalid`);
    }
    const publicKey = process.env.ATLAS_PUBLIC_KEY;
    const privateKey = process.env.ATLAS_PRIVATE_KEY;
    const projectId = process.env.ATLAS_PROJECT_ID;
    const processId = process.env.ATLAS_PROCESS_ID;
    const atlasOk = privateKey && publicKey && projectId && processId;
    const atlasApiInfo: AtlasApiInfo | undefined = atlasOk
        ? {
              publicKey: publicKey!,
              privateKey: privateKey!,
              projectId: projectId!,
              processId: processId!,
          }
        : undefined;

    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    logger.info(`Connected to MongoDB at ${url}`);

    const app = await createApp({
        dbName,
        mongoClient,
        nodeEnv,
        atlasApiInfo,
        rootUser: extractRight(rootUserMaybe),
        rootApiKey: rootApiKey,
        schemasCollectionName: SCHEMAS_COLLECTION_NAME,
        usersCollectionName: USERS_COLLECTION_NAME,
    });

    const server = app.listen(port, () => {
        console.log(`Listening at http://localhost:${port}`);
    });

    server.on("error", (err) => {
        logger.error(err);
    });
}

main()
    .catch((err) => logger.error(err))
    .finally(() => {
        mongoClient.close();
    });
