import { createGraphQLClient, GraphQLClient, ProgramError } from "@banklessdao/util-data";
import { LoadContext, ScheduleMode } from "@shared/util-loaders";
import { Data, NonEmptyProperty } from "@banklessdao/util-schema";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import * as t from "io-ts";
import * as TE from "fp-ts/TaskEither";
import { GraphQLDataLoaderBase } from "../base/GraphQLDataLoaderBase";
import { BATCH_SIZE } from "../defaults";
import { withMessage } from "io-ts-types";

const URL = "https://hub.snapshot.org/graphql";

const makeQUERY: (space:String)=>DocumentNode = (space) => {
    space = `"${space}"` // So it gets parsed correctly
    return gql`
        query snapshotProposals($limit: Int,$cursor: Int) {
            proposals (
                first: $limit,
                where: {
                    space_in: [${space}],
                    created_gt: $cursor
                },
                orderBy: "created",
                orderDirection: asc
            ) {
                id
                strategies {
                    name
                    params
                }
                title
                body
                choices
                created
                start
                end
                snapshot
                state
                author
                space {
                    id
                    name
                }
            }
    }
    `;
}

const ProposalCodec = t.strict({
    id: t.string,
    author: t.string,
    created: t.number,
    // space: t.strict({ // TODO: uncomment optional members
    //     id: t.string,
    //     name: t.string
    // }),
    // type: t.string,
    strategies: withMessage(t.array(t.strict({
        name:t.string,
        params:t.unknown
    })),()=>"strategies failed"),
    title: t.string,
    //body: t.string,
    choices: t.array(t.string),
    start: t.number,
    end: t.number,
    snapshot: t.string,
    state: t.string,
    // link: t.string,
    // scores: t.array(t.number),
    // votes: t.number
});

const ProposalsCodec = t.strict({
    proposals: t.array(ProposalCodec),
});

type Proposals = t.TypeOf<typeof ProposalsCodec>;

const INFO = {
    namespace: "snapshot",
    name: "Proposal",
    version: "V1",
};

@Data({
    info: INFO,
})
class Proposal {
    @NonEmptyProperty()
    id: string
    @NonEmptyProperty()
    author: string
    @NonEmptyProperty()
    created: number
    // space: {
    //     id: string
    //     name: string
    // }
    type:string
    @NonEmptyProperty()
    strategies: {name:string,params:unknown}[]
    @NonEmptyProperty()
    title:string
    //body: string
    @NonEmptyProperty()
    choices: string[]
    @NonEmptyProperty()
    start: number
    @NonEmptyProperty()
    end: number
    @NonEmptyProperty()
    snapshot: string
    @NonEmptyProperty()
    state: string
    // link: string
    // scores: number[]
    // votes: number
}

export class SnapshotProposalLoader extends GraphQLDataLoaderBase<Proposals, Proposal> {
    public info = INFO;

    protected cursorMode = "cursor" as const;
    protected batchSize = 1 //BATCH_SIZE; TODO: uncomment this
    protected type = Proposal;
    protected cadenceConfig = {
        [ScheduleMode.BACKFILL]: { seconds: 5 },
        [ScheduleMode.INCREMENTAL]: { minutes: 5 },
    };

    protected graphQLQuery: DocumentNode;
    protected codec = ProposalsCodec;

    constructor(client: GraphQLClient,space: String) {
        super(client);
        this.graphQLQuery = makeQUERY(space)
    }

    protected preLoad(
        context: LoadContext
    ): TE.TaskEither<ProgramError, LoadContext> {
        // Avoid using a string by default
        if (!context.cursor) {
            context.cursor = 0
        }
        if (typeof context.cursor == "string") {
            context.cursor = Number(context.cursor)
        }
        return TE.right(context);
    }

    protected mapResult(result: Proposals): Array<Proposal> {
        return result.proposals.map((proposal)=>{
            return {
                ...proposal,
            }
        })
    }

    protected extractCursor(proposals: Proposals) {
        const p = proposals.proposals
        return String(p[p.length-1].created);
    }
}

export const createSnapshotProposalLoader: (space:string) => SnapshotProposalLoader = (space) =>
    new SnapshotProposalLoader(createGraphQLClient(URL),space);