/* eslint-disable @typescript-eslint/no-explicit-any */
import { Operator } from "@shared/util-loaders";
import { SchemaInfo, schemaInfoToString } from "@shared/util-schema";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import { StorageError } from "./Errors";

export type SinglePayload = {
    info: SchemaInfo;
    record: Record<string, unknown>;
};

export type ListPayload = {
    info: SchemaInfo;
    records: Record<string, unknown>[];
};

export type Entry = {
    id: bigint;
    record: Record<string, unknown>;
};

export type EntryWithInfo = {
    info: SchemaInfo;
} & Entry;

export type EntryList = {
    info: SchemaInfo;
    entries: Entry[];
};

export type SchemaFilter = {
    cursor?: bigint;
    limit: number;
    info: SchemaInfo;
};

export type OperatorFilter = {
    cursor?: bigint;
    limit: number;
    operators: Operator[];
    info: SchemaInfo;
};

/**
 * The [[DataStorage]] is a server-side component of the content gateway.
 * It is responsible for storing the data received from the SDK.
 */
export type DataStorage = {
    store: (entry: SinglePayload) => TE.TaskEither<StorageError, EntryWithInfo>;
    storeBulk: (
        entryList: ListPayload
    ) => TE.TaskEither<StorageError, EntryList>;
    findById: (id: bigint) => TO.TaskOption<EntryWithInfo>;
    findBySchema: (filter: SchemaFilter) => T.Task<EntryList>;
    findByFilters: (filter: OperatorFilter) => T.Task<EntryList>;
};

export type DataStorageStub = {
    storage: Map<string, Entry[]>;
} & DataStorage;

/**
 * This factory function creates a new [[DataStorage]] instance that will
 * use the supplied [[map]] as the storage. This is useful for testing.
 */
export const createDataStorageStub = (
    map: Map<string, Entry[]> = new Map()
): DataStorageStub => {
    const lookup = new Map<bigint, Entry>();
    let counter = 1;

    const store = (
        singlePayload: SinglePayload
    ): TE.TaskEither<StorageError, EntryWithInfo> => {
        const keyStr = schemaInfoToString(singlePayload.info);
        if (!map.has(keyStr)) {
            map.set(keyStr, []);
        }
        const entry = {
            id: BigInt(counter),
            info: singlePayload.info,
            record: singlePayload.record,
        };
        counter++;
        map.get(keyStr)?.push(entry);
        lookup.set(entry.id, entry);
        return TE.right(entry);
    };

    return {
        storage: map,
        store: store,
        storeBulk: (
            listPayload: ListPayload
        ): TE.TaskEither<StorageError, EntryList> => {
            const { info, records } = listPayload;
            return pipe(
                records,
                A.map((record) => store({ info, record })),
                TE.sequenceArray,
                TE.map((entries) => ({
                    info,
                    entries: [...entries],
                }))
            );
        },
        findById: (): TO.TaskOption<EntryWithInfo> => TO.none,
        findBySchema: (filter: SchemaFilter) =>
            T.of({ info: filter.info, entries: [] }),
        findByFilters: (filter: OperatorFilter) =>
            T.of({ info: filter.info, entries: [] }),
    };
};
