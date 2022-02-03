import {
    jsonBatchPayloadCodec,
    mapCodecValidationError,
    ProgramError,
    programErrorCodec,
    schemaInfoCodec,
} from "@banklessdao/util-data";
import { createLogger } from "@banklessdao/util-misc";
import { createSchemaFromObject } from "@banklessdao/util-schema";
import {
    ContentGateway,
    ContentGatewayUser,
    UserNotFoundError,
    UserRepository,
} from "@domain/feature-gateway";
import * as bcrypt from "bcrypt";
import * as express from "express";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import * as t from "io-ts";
import { ANON_USER } from "../../..";

const logger = createLogger("ContentGatewayAPI");

type Deps = {
    app: express.Application;
    userRepository: UserRepository;
    contentGateway: ContentGateway;
};

/**
 * This is the REST API of Content Gateway that is used
 * by the Content Gateway Client
 */
export const generateContentGatewayAPIV1 = async ({
    app,
    userRepository,
    contentGateway,
}: Deps) => {
    app.use(
        express.json({
            strict: true,
            limit: "50mb",
        })
    );

    const router = express.Router();

    const extractUser = (
        req: express.Request
    ): TE.TaskEither<ProgramError, ContentGatewayUser> => {
        const secret = req.header("X-Api-Key");
        const error = new UserNotFoundError(
            "User not found for the given API key"
        );
        if (!secret) {
            return TE.of(ANON_USER);
        } else {
            return pipe(
                Buffer.from(secret, "base64").toString(),
                (key) => TE.fromTask(() => bcrypt.hash(key, 10)),
                TE.mapLeft(() => error),
                TE.chain(userRepository.findByApiKeyHash),
                TE.orElse(() => TE.right(ANON_USER))
            );
        }
    };

    const extractBody = <T>(
        req: express.Request,
        codec: t.Type<T>
    ): TE.TaskEither<ProgramError, T> => {
        return pipe(
            codec.decode(req.body),
            mapCodecValidationError("Validating json payload failed"),
            TE.fromEither
        );
    };

    router.get("/schema/stats", async (req, res) => {
        await pipe(
            extractUser(req),
            TE.map((currentUser) => ({
                currentUser,
                data: undefined,
            })),
            contentGateway.loadSchemaStats,
            sendResponse(res, "Schema stats")
        )();
    });

    router.post("/schema/", async (req, res) => {
        await pipe(
            TE.Do,
            TE.bind("currentUser", () => extractUser(req)),
            TE.bindW("schema", () =>
                TE.fromEither(createSchemaFromObject(req.body))
            ),
            TE.map(({ currentUser, schema }) => ({
                currentUser,
                data: {
                    schema: schema,
                    // * 👇 We can register for another user in the future
                    owner: currentUser,
                },
            })),
            contentGateway.registerSchema,
            sendResponse(res, "Schema registration")
        )();
    });

    router.delete("/schema/", async (req, res) => {
        // TODO: move this outer pipe into a function
        // TODO: do status reporting in sendResponse only based on the error type (400 vs 500)
        pipe(
            schemaInfoCodec.decode(req.body),
            E.fold(
                (errors) => {
                    res.status(400).send(
                        errors.map(
                            (e) => `${e.value} was invalid: ${e.message}`
                        )
                    );
                },
                (schemaInfo) => {
                    return pipe(
                        extractUser(req),
                        TE.map((currentUser) => ({
                            currentUser,
                            data: schemaInfo,
                        })),
                        contentGateway.removeSchema,
                        sendResponse(res, "Remove schema")
                    )();
                }
            )
        );
    });

    router.post("/data/receive", async (req, res) => {
        return pipe(
            TE.Do,
            // 👇 we can skip the context mapping phase as these two form a context
            TE.bind("currentUser", () => extractUser(req)),
            TE.bindW("payload", () => extractBody(req, jsonBatchPayloadCodec)),
            TE.map(({ currentUser, payload }) => {
                return {
                    currentUser,
                    data: {
                        info: payload.info,
                        records: payload.data,
                    },
                };
            }),
            contentGateway.saveData,
            sendResponse(res, "Payload receiving ")
        )();
    });

    return router;
};

const sendResponse = (res: express.Response, operation: string) =>
    TE.fold(
        (e: ProgramError) => {
            logger.warn(`${operation} failed`, e);
            res.status(500).json(programErrorCodec.encode(e));
            return T.of(undefined);
        },
        (data) => {
            res.status(200).send(data);
            return T.of(undefined);
        }
    );
