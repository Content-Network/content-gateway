import { createGraphQLClient, GraphQLClient } from "@shared/util-loaders";
import { AdditionalProperties, Required } from "@tsed/schema";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import * as t from "io-ts";
import { GraphQLDataLoaderBase } from "../base/GraphQLDataLoaderBase";
import { BATCH_SIZE } from "../defaults";

const URL = "https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai";

const QUERY: DocumentNode = gql`
    query poapTokens($limit: Int, $cursor: String) {
        tokens(
            first: $limit
            orderBy: created
            where: { created_gt: $cursor }
        ) {
            id
            created
            owner {
                id
            }
            event {
                id
            }
        }
    }
`;

const Token = t.strict({
    id: t.string,
    created: t.string,
    owner: t.strict({
        id: t.string,
    }),
    event: t.strict({
        id: t.string,
    }),
});

const Tokens = t.strict({
    tokens: t.array(Token),
});

type Tokens = t.TypeOf<typeof Tokens>;

const INFO = {
    namespace: "poap",
    name: "POAPToken",
    version: "V1",
};

@AdditionalProperties(false)
class POAPToken {
    @Required(true)
    id: string;
    @Required(true)
    ownerId: string;
    @Required(true)
    eventId: string;
    @Required(true)
    createdAt: number;
}

export class POAPTokenLoader extends GraphQLDataLoaderBase<Tokens, POAPToken> {
    public info = INFO;

    protected cursorMode = "cursor" as const;
    protected batchSize = BATCH_SIZE;
    protected type = POAPToken;
    protected cadenceConfig = {
        fullBatch: { minutes: 1 },
        partialBatch: { minutes: 5 },
    };

    protected graphQLQuery: DocumentNode = QUERY;
    protected codec = Tokens;

    constructor(client: GraphQLClient) {
        super(client);
    }

    protected mapGraphQLResult(result: Tokens): Array<POAPToken> {
        return result.tokens.map((token) => ({
            id: token.id,
            createdAt: parseInt(token.created),
            ownerId: token.owner.id,
            eventId: token.event.id,
        }));
    }

    protected getNextCursor(result: Array<POAPToken>) {
        return result.length > 0
            ? result[result.length - 1].createdAt.toString()
            : "0";
    }
}

export const createPOAPTokenLoader: () => POAPTokenLoader = () =>
    new POAPTokenLoader(createGraphQLClient(URL));
