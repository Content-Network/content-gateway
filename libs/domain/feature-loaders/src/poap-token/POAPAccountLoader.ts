import {
    createGraphQLClient,
    GraphQLClient,
    LoadContext,
} from "@shared/util-loaders";
import { AdditionalProperties, Required } from "@tsed/schema";
import gql from "graphql-tag";
import * as t from "io-ts";
import { GraphQLDataLoaderBase } from "../base/GraphQLDataLoaderBase";
import { BATCH_SIZE } from "../defaults";

const URL = "https://api.thegraph.com/subgraphs/name/poap-xyz/poap-xdai";

const QUERY = gql`
    query poapAccounts($limit: Int, $cursor: String) {
        accounts(first: $limit, orderBy: id, where: { id_gt: $cursor }) {
            id
        }
    }
`;

const Account = t.strict({
    id: t.string,
});

const Accounts = t.strict({
    accounts: t.array(Account),
});

type Accounts = t.TypeOf<typeof Accounts>;

const INFO = {
    namespace: "poap",
    name: "POAPAccount",
    version: "V1",
};

@AdditionalProperties(false)
class POAPAccount {
    @Required(true)
    id: string;
}

export class POAPAccountLoader extends GraphQLDataLoaderBase<
    Accounts,
    POAPAccount
> {
    public info = INFO;

    protected cursorMode = "cursor" as const;
    protected batchSize = BATCH_SIZE;
    protected type = POAPAccount;
    protected cadenceConfig = {
        fullBatch: { minutes: 1 },
        partialBatch: { minutes: 5 },
    };

    protected graphQLQuery = QUERY;
    protected codec = Accounts;

    constructor(client: GraphQLClient) {
        super(client);
    }

    protected mapGraphQLResult(result: Accounts): Array<POAPAccount> {
        return result.accounts.map((account) => ({
            id: account.id,
        }));
    }

    protected getNextCursor(result: Array<POAPAccount>) {
        return result.length > 0
            ? result[result.length - 1].id.toString()
            : "0";
    }
}

export const createPOAPAccountLoader: () => POAPAccountLoader = () =>
    new POAPAccountLoader(createGraphQLClient(URL));
