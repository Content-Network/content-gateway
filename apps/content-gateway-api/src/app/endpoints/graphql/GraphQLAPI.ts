import { DataStorage, SchemaStorage } from "@domain/feature-gateway";
import { toGraphQLType } from "@shared/util-graphql";
import { Operator } from "@shared/util-loaders";
import { Schema, schemaInfoToString } from "@shared/util-schema";
import { Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import { map } from "fp-ts/lib/Identity";
import * as O from "fp-ts/Option";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import * as TO from "fp-ts/TaskOption";
import * as g from "graphql";
import * as pluralize from "pluralize";
import { Logger } from "tslog";
import { operators as operatorsType } from "./types/Operators";
import { createResultsType, Results } from "./types/Results";

type SchemaGQLTypePair = [Schema, g.GraphQLObjectType];

const maxItems = 1000;
const logger = new Logger({ name: "GraphQLAPI" });

export type Middleware = (
    request: Request,
    response: Response
) => Promise<void>;

export type Deps = {
    readonly schemaStorage: SchemaStorageDecorator;
    readonly dataStorage: DataStorage;
};

export type GraphQLAPI = {
    readonly middleware: Middleware;
};

export type SchemaStorageDecorator = SchemaStorage & {
    onRegister: (listener: () => void) => void;
};

/**
 * Creates a new GraphQL API that can be used as an Express middleware.
 */
export const createGraphQLAPI = async (deps: Deps): Promise<Middleware> => {
    let currentMiddleware = await createGraphQLMiddleware(deps);
    deps.schemaStorage.onRegister(() => {
        createGraphQLMiddleware(deps).then((middleware) => {
            currentMiddleware = middleware;
        });
    });
    return (request: Request, response: Response): Promise<void> => {
        return currentMiddleware(request, response);
    };
};

const createGraphQLMiddleware = async ({
    schemaStorage,
    dataStorage,
}: Deps): Promise<Middleware> => {
    const schemas = await schemaStorage.findAll()();
    pipe(
        schemas,
        O.map((s) => {
            const str = s
                .map((schema) => schemaInfoToString(schema.info))
                .join();
            logger.info(`Current schemas are: ${str}`);
        })
    );
    return pipe(
        schemas,
        O.getOrElse(() => [] as Schema[]),
        A.map(
            (schema: Schema) =>
                [schema, toGraphQLType(schema)] as SchemaGQLTypePair
        ),
        A.map(([schema, type]) => {
            const name = schema.info.name;

            const findById = async (id: bigint) => {
                return pipe(
                    dataStorage.findById(id),
                    TO.map((data) => data.record),
                    TO.getOrElse(() => T.of(undefined))
                )();
            };

            const findByFilters = async (
                first?: number,
                after?: string,
                operators?: Operator[]
            ): Promise<Results> => {
                const notes = [] as string[];
                let limit = first ?? maxItems;
                if (limit > maxItems) {
                    limit = maxItems;
                    notes.push(
                        `The requested amount of items (${first}) is greater than the allowed maximum (${maxItems}). Setting after to ${maxItems}.`
                    );
                }
                if (typeof first === "undefined") {
                    notes.push(
                        `First was undefined, returning ${maxItems} items.`
                    );
                }

                // 👇 We do this to determine whether there is a next page or not.
                limit++;

                return pipe(
                    dataStorage.findByFilters({
                        info: schema.info,
                        cursor: after ? BigInt(after) : undefined,
                        limit: limit,
                        operators: operators ?? [],
                    }),
                    T.map((entryList) => {
                        // TODO: write tests for this paging stuff
                        const entries = entryList.entries;
                        const hasNextPage = entries.length === limit;
                        const hasEntries = entries.length > 0;
                        let startCursor: string;
                        let endCursor: string;
                        if (hasNextPage) {
                            // 👇 We only needed this for hasNextPage.
                            entries.pop();
                        }
                        if (hasEntries) {
                            startCursor = entries[0].id.toString();
                            endCursor =
                                entries[entries.length - 1].id.toString();
                            logger.info("Has entries");
                        } else {
                            startCursor = after;
                            endCursor = startCursor;
                            logger.info("Has no entries");
                        }

                        logger.info("Cursors: ", {
                            startCursor,
                            endCursor,
                        });

                        return {
                            pageInfo: {
                                hasNextPage,
                                startCursor: startCursor,
                                endCursor: endCursor,
                            },
                            errors: [],
                            notes: notes,
                            data: entries.map((entry) => ({
                                ...entry,
                                id: entry.id.toString(),
                            })),
                        };
                    })
                )();
            };

            return {
                [name]: {
                    type: type,
                    args: {
                        id: { type: g.GraphQLInt },
                    },
                    resolve: async (_, { id }) => {
                        return findById(id);
                    },
                },
                [`${pluralize.plural(name)}`]: {
                    type: createResultsType(type),
                    args: {
                        after: { type: g.GraphQLString },
                        first: { type: g.GraphQLInt },
                        operators: operatorsType,
                    },
                    resolve: (_, { first, after, operators }) => {
                        return findByFilters(first, after, operators);
                    },
                },
            };
        }),
        A.reduce(
            {} as g.Thunk<g.GraphQLFieldConfigMap<unknown, unknown>>,
            (acc, curr) => ({
                ...acc,
                ...curr,
            })
        ),
        map((fields) => {
            const queryType = new g.GraphQLObjectType({
                name: "Query",
                fields: fields,
            });
            return new g.GraphQLSchema({ query: queryType });
        }),
        map((schema) => {
            return graphqlHTTP({
                schema: schema,
                graphiql: true,
            });
        })
    );
};

/**
 * Decorates a schema storage with a side effect that will regenerate
 * the GraphQL api whenever a new schema is saved.
 */
export const decorateSchemaStorage = (
    schemaStorage: SchemaStorage
): SchemaStorageDecorator => {
    const gLogger = new Logger({ name: "graphql-updater" });
    const listeners = [] as Array<() => void>;
    return {
        ...schemaStorage,
        register: (schema: Schema) => {
            return pipe(
                schemaStorage.register(schema),
                TE.map((result) => {
                    gLogger.info("Generating new GraphQL API");
                    listeners.forEach((listener) => listener());
                    return result;
                })
            );
        },
        onRegister: (listener: () => void) => {
            listeners.push(listener);
        },
    };
};