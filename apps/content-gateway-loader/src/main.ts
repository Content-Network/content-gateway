import { createLogger, programError } from "@banklessdao/util-misc";
import { MongoClient } from "mongodb";
import { createApp } from "./app";

const logger = createLogger("main");

const url =
    process.env.MONGO_CGL_URL ?? programError("You must specify MONGO_CGA_URL");
const dbName =
    process.env.MONGO_CGL_USER ??
    programError("You must specify MONGO_CGL_USER");

const mongoClient = new MongoClient(url, {
    keepAlive: true,
});

const jobsCollName = "jobs";

async function main() {
    const port =
        process.env.PORT ||
        process.env.CGL_PORT ||
        programError("You must specify either PORT or CGL_PORT");

    const cgaAPIKey =
        process.env.CGA_API_KEY || programError("You must specify CGA_API_KEY");
    const cgaURL =
        process.env.CGA_URL || programError("You must specify CGA_URL");
    const nodeEnv =
        process.env.NODE_ENV ?? programError("You must specify NODE_ENV");

    const youtubeAPIKey = process.env.YOUTUBE_API_KEY;
    const ghostAPIKey = process.env.GHOST_API_KEY;
    const snapshotSpaces = process.env.SNAPSHOT_SPACES?.split(",");
    const discordBotToken = process.env.DISCORD_BOT_TOKEN;
    const discordChannel = process.env.DISCORD_CHANNEL;

    await mongoClient.connect();
    await mongoClient.db("admin").command({ ping: 1 });
    logger.info(`Connected to MongoDB at ${url}`);

    const db = mongoClient.db(dbName);

    const app = await createApp({
        cgaAPIKey,
        cgaURL,
        nodeEnv,
        db,
        jobsCollName,
        ghostAPIKey,
        discordBotToken,
        discordChannel,
        snapshotSpaces,
        youtubeAPIKey,
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
