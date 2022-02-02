import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import { MaintenanceJob, MaintenanceJobError } from "../..";

/**
 * Queries MongoDB for index recommendations and then
 * enacts those recommendations
 */
export const createIndexCreationJob = (): MaintenanceJob => {
    const runIndexCreation = (): TE.TaskEither<MaintenanceJobError, void> => {
        return pipe(
            queryIndexSuggestions(),
            TE.chain(chooseIndexesToAdd),
            TE.chain(addIndexes)
        )
    };

    return {
        run: runIndexCreation,
        id: "CreateIndexes",
        schedule: {
            hours: 1,
        },
    };
};

function queryIndexSuggestions(): TE.TaskEither<MaintenanceJobError,unknown> {
    throw new Error("Function not implemented.");
}

function chooseIndexesToAdd(indexSuggestions:unknown):TE.TaskEither<MaintenanceJobError,string[]> {
    throw new Error("Function not implemented.");
}

function addIndexes(indexes:string[]):TE.TaskEither<MaintenanceJobError, void> {
    throw new Error("Function not implemented.");
}

