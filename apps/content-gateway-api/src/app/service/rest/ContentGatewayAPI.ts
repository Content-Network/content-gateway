import { ContentGateway } from "@domain/feature-gateway";
import {
    jsonBatchPayloadCodec,
    jsonPayloadCodec,
    mapCodecValidationError,
    ProgramError,
    programErrorCodec,
} from "@shared/util-dto";
import { createLogger } from "@shared/util-fp";
import { createSchemaFromObject } from "@shared/util-schema";
import * as express from "express";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";

const logger = createLogger("ContentGatewayAPI");

type Deps = {
    contentGateway: ContentGateway;
    app: express.Application;
};

/**
 * This is the REST API of Content Gateway that is used
 * by the Content Gateway Client
 */
export const generateContentGatewayAPI = async ({
    contentGateway,
    app,
}: Deps) => {
    app.use(
        express.json({
            strict: true,
            limit: "50mb",
        })
    );

    const router = express.Router();

    router.get("/stats", async (_, res) => {
        await pipe(
            contentGateway.loadStats(),
            TE.fromTask,
            sendResponse(res, "Schema stats")
        )();
    });

    router.post("/register", async (req, res) => {
        await pipe(
            createSchemaFromObject(req.body),
            TE.fromEither,
            TE.chainW(contentGateway.register),
            TE.map(() => ({})),
            sendResponse(res, "Schema registration")
        )();
    });

    router.post("/receive", async (req, res) => {
        return pipe(
            jsonPayloadCodec.decode(req.body),
            mapCodecValidationError("Validating json payload failed"),
            TE.fromEither,
            TE.chainW(contentGateway.receive),
            TE.map(() => ({})),
            sendResponse(res, "Payload receiving ")
        )();
    });

    router.post("/receive-batch", async (req, res) => {
        logger.info("Receiving batch...");
        await pipe(
            jsonBatchPayloadCodec.decode(req.body),
            mapCodecValidationError("Validating json payload failed"),
            TE.fromEither,
            TE.chainW(contentGateway.receiveBatch),
            TE.map(() => ({})),
            sendResponse(res, "Batch payload receiving")
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
