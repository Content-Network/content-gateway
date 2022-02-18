import { UnknownError } from "@banklessdao/util-data";
import { DatabaseError } from "@shared/util-loaders";
import * as TE from "fp-ts/TaskEither";

export const wrapDbOperation =
    <R>(op: () => Promise<R>) =>
    () => {
        return TE.tryCatch(
            () => op(),
            (e: unknown) => {
                return new DatabaseError(
                    e instanceof Error ? e : new UnknownError(e)
                );
            }
        );
    };