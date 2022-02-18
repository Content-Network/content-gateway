import {
    createContentGatewayClient,
    createHTTPAdapterV1
} from "@banklessdao/content-gateway-sdk";
import { createLogger } from "@banklessdao/util-misc";
import { schemaInfoToString } from "@banklessdao/util-schema";
import { createLoaderRegistry } from "@domain/feature-loaders";
import {
    createJobScheduler,
    DEFAULT_CURSOR,
    DEFAULT_LIMIT,
    Job,
    ScheduleMode
} from "@shared/util-loaders";
import * as bodyParser from "body-parser";
import * as express from "express";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import * as t from "io-ts";
import { withMessage } from "io-ts-types";
import { Db } from "mongodb";
import { join } from "path";
import { MongoJob } from "../repository/mongo/MongoJob";
import { createMongoJobRepository } from "../repository/MongoJobRepository";

export type AppParams = {
    nodeEnv: string;
    db: Db;
    jobsCollName: string;
    cgaAPIKey: string;
    cgaURL: string;
    youtubeAPIKey?: string;
    ghostAPIKey?: string;
    snapshotSpaces?: string[];
    discordBotToken?: string;
    discordChannel?: string;
};

export const createApp = async (appParams: AppParams) => {
    const { nodeEnv, db, jobsCollName } = appParams;
    const logger = createLogger("ContentGatewayLoaderApp");
    const jobs = db.collection<MongoJob>(jobsCollName);

    logger.info(`Running in ${nodeEnv} mode`);

    const loaderRegistry = createLoaderRegistry({
        ghostApiKey: appParams.ghostAPIKey,
        youtubeApiKey: appParams.youtubeAPIKey,
        snapshotSpaces: appParams.snapshotSpaces,
        discordBotToken: process.env.DISCORD_BOT_TOKEN,
        discordChannel: process.env.DISCORD_CHANNEL,
    });
    const jobRepository = await createMongoJobRepository({
        db,
        collName: jobsCollName,
    });

    const contentGatewayClient = createContentGatewayClient({
        adapter: createHTTPAdapterV1({
            apiUrl: appParams.cgaURL,
            apiKey: appParams.cgaAPIKey,
        }),
    });

    const scheduler = createJobScheduler({
        jobRepository,
        contentGatewayClient,
    });

    await pipe(
        scheduler.start(),
        TE.mapLeft((err) => {
            logger.error("Starting the Job scheduler failed", err);
            return err;
        })
    )();

    for (const loader of loaderRegistry.loaders) {
        await scheduler.register(loader)();
    }

    const app = express();

    app.use(bodyParser.json());

    const NameParam = t.strict({
        name: t.string,
    });

    const JobDescriptorParam = t.strict({
        info: t.strict({
            namespace: withMessage(
                t.string,
                () => "Namespace must be a string"
            ),
            name: withMessage(t.string, () => "Name must be a string"),
            version: withMessage(t.string, () => "Version must be a string"),
        }),
        scheduledAt: withMessage(
            t.number,
            () => "ScheduledAt must be a number"
        ),
        scheduleMode: withMessage(
            t.union([
                t.literal(ScheduleMode.BACKFILL),
                t.literal(ScheduleMode.INCREMENTAL),
            ]),
            () => "ScheduleMode must be either BACKFILL or INCREMENTAL"
        ),
        cursor: withMessage(t.string, () => "Cursor must be a string"),
        limit: withMessage(t.number, () => "Limit must be a number"),
    });

    const mapJobToJson = (job: Job) => ({
        name: schemaInfoToString(job.info),
        state: job.state,
        scheduleMode: job.scheduleMode,
        cursor: job.cursor,
        limit: job.limit,
        currentFailCount: job.currentFailCount,
        scheduledAt: job.scheduledAt.getTime(),
        previousScheduledAt: job.previousScheduledAt?.getTime(),
        updatedAt: job.updatedAt.getTime(),
    });

    // TODO: move these to the repo
    app.get("/api/v1/rest/jobs", async (_, res) => {
        const jobs = await jobRepository.findAll()();
        res.send(
            jobs.map((job) => {
                return mapJobToJson(job);
            })
        );
    });

    app.post("/api/v1/rest/jobs/", (req, res) => {
        pipe(
            JobDescriptorParam.decode(req.body),
            E.fold(
                (errors) => {
                    res.status(400).send(
                        errors.map(
                            (e) => `${e.value} was invalid: ${e.message}`
                        )
                    );
                },
                (params) => {
                    return pipe(
                        scheduler.schedule({
                            info: params.info,
                            scheduledAt: new Date(params.scheduledAt),
                            scheduleMode: params.scheduleMode,
                            cursor: params.cursor,
                            limit: params.limit,
                        }),
                        TE.fold(
                            (e) => async () => {
                                res.status(500).send(e);
                            },
                            (job) => async () => {
                                res.send(mapJobToJson(job));
                            }
                        )
                    )();
                }
            )
        );
    });

    app.get("/api/v1/rest/jobs/reset", (_, res) => {
        return pipe(
            jobRepository.findAll(),
            TE.fromTask,
            TE.chainW((result) => {
                return pipe(
                    result.map((job) => {
                        return scheduler.schedule({
                            info: job.info,
                            scheduledAt: new Date(),
                            scheduleMode: ScheduleMode.BACKFILL,
                            cursor: DEFAULT_CURSOR,
                            limit: DEFAULT_LIMIT,
                        });
                    }),
                    TE.sequenceArray
                );
            }),
            TE.fold(
                (e) => async () => {
                    res.status(500).send(e);
                },
                (result) => async () => {
                    res.send(result.map(mapJobToJson));
                }
            )
        )();
    });

    app.get("/api/v1/rest/jobs/:name", async (req, res) => {
        pipe(
            NameParam.decode(req.params),
            E.fold(
                (errors) => {
                    res.status(400).send(errors);
                },
                (params) => {
                    jobs.findOne({ name: params.name })
                        .then((job) => {
                            if (!job) {
                                res.status(404).send("Not found");
                            } else {
                                res.send({
                                    name: job.name,
                                    state: job.state,
                                    scheduleMode: job.scheduleMode,
                                    cursor: job.cursor,
                                    limit: job.limit,
                                    currentFailCount: job.currentFailCount,
                                    previousScheduledAt:
                                        job.previousScheduledAt?.getTime(),
                                    scheduledAt: job.scheduledAt.getTime(),
                                    updatedAt: job.updatedAt.getTime(),
                                    logs: job.logs.map((log) => ({
                                        note: log.note,
                                        state: log.state,
                                        info: log.info,
                                        createdAt: log.createdAt.getTime(),
                                    })),
                                });
                            }
                        })
                        .catch((e) => {
                            res.status(500).send(e);
                        });
                }
            )
        );
    });

    app.get("/api/v1/rest/jobs/:name/reset", async (req, res) => {
        pipe(
            NameParam.decode(req.params),
            E.fold(
                (errors) => {
                    res.status(400).send(errors);
                },
                (params) => {
                    const parts = params.name.split(".");
                    return pipe(
                        jobRepository.findJob({
                            namespace: parts[0],
                            name: parts[1],
                            version: parts[2],
                        }),
                        TO.chain(TO.fromNullable),
                        TE.fromTaskOption(() => new Error("Not found")),
                        TE.chainW((job) =>
                            scheduler.schedule({
                                info: job.info,
                                scheduledAt: new Date(),
                                scheduleMode: ScheduleMode.BACKFILL,
                                cursor: DEFAULT_CURSOR,
                                limit: DEFAULT_LIMIT,
                            })
                        ),
                        TE.fold(
                            (e) => async () => {
                                res.status(500).send(e);
                            },
                            (job) => async () => {
                                res.send(mapJobToJson(job));
                            }
                        )
                    )();
                }
            )
        );
    });

    const clientBuildPath = join(
        __dirname,
        "../content-gateway-loader-frontend"
    );
    app.use(express.static(clientBuildPath));
    app.get("*", (_, response) => {
        response.sendFile(join(clientBuildPath, "index.html"));
    });

    return app;
};
