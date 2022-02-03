import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as E from "fp-ts/lib/Either";
import { MaintenanceJob, MaintenanceJobError } from "../..";
import * as t from "io-ts";
// @ts-expect-error There are no type definitions for this package :'(
import * as DigestFetch from "digest-fetch";

/**
 * Queries MongoDB for index recommendations and then
 * enacts those recommendations
 */
export const createIndexCreationJob = (
    atlasApiInfo: AtlasApiInfo
): MaintenanceJob => {
    const runIndexCreation = (): TE.TaskEither<MaintenanceJobError, void> => {
        return pipe(
            _queryIndexSuggestions(atlasApiInfo),
            TE.chain(_chooseIndexesToAdd),
            TE.chain(_addIndexes)
        );
    };

    return {
        run: runIndexCreation,
        id: "CreateIndexes",
        schedule: {
            hours: 1,
        },
    };
};

export interface AtlasApiInfo {
    publicKey: string;
    privateKey: string;
    projectId: string;
    processId: string;
}

/**
 * INTERNAL OBJECTS, DO NOT USE:
 * they are exported for testing purposes only
 */

/**io-ts codec for verifying external input*/
const IndexSuggestionCodec = t.strict({
    shapes: t.unknown, // We aren't using this so idc what it is
    suggestedIndexes: t.array(
        t.strict({
            id: t.string,
            impact: t.array(t.string),
            index: t.array(t.record(t.string, t.number)),
            namespace: t.string,
            weight: t.number,
        })
    ),
});

type IndexSuggestion = t.TypeOf<typeof IndexSuggestionCodec>;

const makeSuggestedIndexUrl = (atlasApiInfo: AtlasApiInfo) =>
    `https://cloud.mongodb.com/api/atlas/v1.0/groups/${atlasApiInfo.projectId}/processes/${atlasApiInfo.processId}/performanceAdvisor/suggestedIndexes`;

export function _queryIndexSuggestions(
    atlasApiInfo: AtlasApiInfo
): TE.TaskEither<MaintenanceJobError, IndexSuggestion> {
    const client = new DigestFetch(
        atlasApiInfo.publicKey,
        atlasApiInfo.privateKey,
        {}
    );
    const url = makeSuggestedIndexUrl(atlasApiInfo);

    // Query the endpoint for index suggestions
    const unsafeFetch = (): Promise<Response> => client.fetch(url, {});
    const fetch = (): TE.TaskEither<MaintenanceJobError, Response> =>
        TE.tryCatch(
            unsafeFetch,
            (e) => new MaintenanceJobError(new Error(String(e)))
        );

    const parseResponse = (
        res: Response
    ): TE.TaskEither<MaintenanceJobError, IndexSuggestion> => {
        return TE.tryCatch(
            async () => {
                const resJson = await res.json();
                if (E.isLeft(IndexSuggestionCodec.decode(resJson)))
                    throw new Error(
                        `\nIndexSuggestion response failed codec decode\
                         \nExpected IndexSuggestions, got: ${JSON.stringify(
                             resJson
                         )}`
                    );
                return resJson as IndexSuggestion;
            },
            (e) => new MaintenanceJobError(new Error(String(e)))
        );
    };
    return pipe(fetch(), TE.chain(parseResponse));
}

export function _chooseIndexesToAdd(
    indexSuggestions: IndexSuggestion
): TE.TaskEither<MaintenanceJobError, string[]> {
    throw new Error("Function not implemented.");
}

export function _addIndexes(
    indexes: string[]
): TE.TaskEither<MaintenanceJobError, void> {
    throw new Error("Function not implemented.");
}
