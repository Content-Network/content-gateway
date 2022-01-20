import { createGraphQLClient, GraphQLClient, ProgramError } from "@banklessdao/util-data";
import { LoadContext, ScheduleMode } from "@shared/util-loaders";
import { Data, Nested, NonEmptyProperty, OptionalNumberArrayOf, OptionalObjectRef, OptionalProperty, OptionalStringArrayOf, Property, RequiredArrayRef, RequiredStringArrayOf } from "@banklessdao/util-schema";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import * as t from "io-ts";
import * as TE from "fp-ts/TaskEither";
import { GraphQLDataLoaderBase } from "../base/GraphQLDataLoaderBase";
import { BATCH_SIZE } from "../defaults";
import { withMessage } from "io-ts-types";

export const URL = "https://hub.snapshot.org/graphql";

export const makeQUERY: (space:String)=>DocumentNode = (space) => {
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

// Helper for optional fields
const optional = <T extends t.Mixed>(x:T)=>t.union([x,t.undefined])

export const ProposalCodec = t.strict({
    id: t.string,
    author: t.string,
    created: t.number,
    space: optional(t.strict({
        id: t.string,
        name: t.string
    })),
    type: optional(t.string),
    strategies: withMessage(t.array(t.strict({
        name:t.string,
    })),()=>"strategies failed"),
    title: t.string,
    body: optional(t.string),
    choices: t.array(t.string),
    start: t.number,
    end: t.number,
    snapshot: t.string,
    state: t.string,
    link: optional(t.string),
    scores: optional(t.array(t.number)),
    votes: optional(t.number)
});

export const ProposalsCodec = t.strict({
    proposals: t.array(ProposalCodec),
});

export type Proposals = t.TypeOf<typeof ProposalsCodec>;

const INFO = {
    namespace: "snapshot",
    name: "Proposal",
    version: "V1",
};
@Nested()
class Space {
    @OptionalProperty()
    name: string
    @NonEmptyProperty()
    id: string
}

@Nested()
class Strategy {
    @NonEmptyProperty()
    name:string
}

@Data({
    info: INFO,
})
export class Proposal {
    @NonEmptyProperty()
    id: string
    @NonEmptyProperty()
    author: string
    @NonEmptyProperty()
    created: number
    @OptionalObjectRef(Space)
    space: Space | undefined
    @OptionalProperty()
    type:string | undefined
    @RequiredArrayRef(Strategy)
    strategies: Strategy[]
    @NonEmptyProperty()
    title:string
    @OptionalProperty()
    body: string | undefined
    @RequiredStringArrayOf()
    choices: string[]
    @NonEmptyProperty()
    start: number
    @NonEmptyProperty()
    end: number
    @NonEmptyProperty()
    snapshot: string
    @NonEmptyProperty()
    state: string
    @OptionalProperty()
    link: string | undefined
    @OptionalNumberArrayOf()
    scores: number[] | undefined
    @OptionalProperty()
    votes: number 
}

export class SnapshotProposalLoader extends GraphQLDataLoaderBase<Proposals, Proposal> {
    public info = INFO;

    protected cursorMode = "cursor" as const;
    protected batchSize = BATCH_SIZE;
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
        return result.proposals as Array<Proposal>
    }

    protected extractCursor(proposals: Proposals) {
        const p = proposals.proposals
        return String(p[p.length-1].created);
    }
}

export const createSnapshotProposalLoader: (space:string) => SnapshotProposalLoader = (space) =>
    new SnapshotProposalLoader(createGraphQLClient(URL),space);
