import { createLogger, programError } from "@banklessdao/util-misc";
import { PrismaClient } from "@cgl/prisma";
import { createApp } from "./app";

const logger = createLogger("main");
const prisma = new PrismaClient();

async function main() {
    const port =
        process.env.PORT ||
        process.env.CGL_PORT ||
        programError("You must specify either PORT or CGL_PORT");

    const cgaAPIKey =
        process.env.CGA_API_KEY || programError("You must specify CGA_API_KEY");
    const cgaURL =
        process.env.CGA_URL || programError("You must specify CGA_URL");
    const youtubeAPIKey =
        process.env.YOUTUBE_API_KEY ||
        programError("You must specify YOUTUBE_API_KEY");
    const discordChannel =
        process.env.DISCORD_CHANNEL ||
        programError("You must specify DISCORD_CHANNEL");
    const discordBotToken =
        process.env.DISCORD_BOT_TOKEN ||
        programError("You must specify DISCORD_BOT_TOKEN");
    const ghostAPIKey =
        process.env.GHOST_API_KEY ||
        programError("You must specify GHOST_API_KEY");
    const snapshotSpaces =
        process.env.SNAPSHOT_SPACES?.split(",") ||
        programError("You must specify SNAPSHOT_SPACES");
    const nodeEnv =
        process.env.NODE_ENV ?? programError("You must specify NODE_ENV");
    const resetDb = process.env.RESET_DB === "true";
    const addFrontend = process.env.ADD_FRONTEND === "true";

    const app = await createApp({
        cgaAPIKey,
        cgaURL,
        ghostAPIKey,
        nodeEnv,
        prisma,
        resetDb,
        snapshotSpaces,
        youtubeAPIKey,
        addFrontend,
        discordBotToken,
        discordChannel,
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
        prisma.$disconnect();
    });
