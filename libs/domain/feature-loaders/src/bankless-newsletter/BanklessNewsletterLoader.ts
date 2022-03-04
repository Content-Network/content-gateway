import { createGraphQLClient, ProgramError } from "@banklessdao/util-data";
import { programError } from "@banklessdao/util-misc";
import {
    Data,
    NonEmptyProperty,
    RequiredObjectRef,
} from "@banklessdao/util-schema";
import { InitContext, LoadContext, ScheduleMode } from "@shared/util-loaders";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import * as TE from "fp-ts/TaskEither";
import gql from "graphql-tag";
import * as t from "io-ts";
import { HTTPDataLoaderBase } from "../base/HTTPDataLoaderBase";
import { BATCH_SIZE } from "../defaults";

const INFO = {
    namespace: "bankless-newsletter",
    name: "Newsletter",
    version: "V1",
};

class Content {
    @NonEmptyProperty()
    body: string;
    @NonEmptyProperty()
    timestamp: number;
    @NonEmptyProperty()
    title: string;
}

class Algorithm {
    @NonEmptyProperty()
    name: string;
    @NonEmptyProperty()
    hash: string;
}

class Authorship {
    @NonEmptyProperty()
    contributor: string;
    @NonEmptyProperty()
    signingKey: string;
    @NonEmptyProperty()
    signature: string;
    @NonEmptyProperty()
    signingKeySignature: string;
    @NonEmptyProperty()
    signingKeyMessage: string;
    @RequiredObjectRef(Algorithm)
    algorithm: Algorithm;
    @NonEmptyProperty()
    version: string;
    @NonEmptyProperty()
    originalDigest: string;
}

@Data({
    info: INFO,
})
class Newsletter {
    @RequiredObjectRef(Content)
    content: Content;
    @NonEmptyProperty()
    digest: string;
    @RequiredObjectRef(Authorship)
    authorship: Authorship;
}

const APIEntry = t.strict({
    content: t.strict({
        body: t.string,
        timestamp: t.number,
        title: t.string,
    }),
    digest: t.string,
    authorship: t.strict({
        contributor: t.string,
        signingKey: t.string,
        signature: t.string,
        signingKeySignature: t.string,
        signingKeyMessage: t.string,
        algorithm: t.strict({
            name: t.string,
            hash: t.string,
        }),
        // I omitted nft as we don't support objects yet
        version: t.string,
        originalDigest: t.string,
    }),
});

type APIEntry = t.TypeOf<typeof APIEntry>;

const ARWEAVE_URL = "https://arweave.net/graphql";

const idLoadQuery = gql`
    query FetchTransactions($address: String!) {
        transactions(
            first: 100
            tags: [
                { name: "App-Name", values: ["MirrorXYZ"] }
                { name: "Contributor", values: [$address] }
            ]
        ) {
            edges {
                node {
                    id
                    tags {
                        name
                        value
                    }
                }
            }
        }
    }
`;

const idsCodec = t.strict({
    data: t.strict({
        transactions: t.strict({
            edges: t.array(
                t.strict({
                    id: t.string,
                })
            ),
        }),
    }),
});

export class BanklessNewsletterLoader extends HTTPDataLoaderBase<
    APIEntry,
    Newsletter
> {
    public info = INFO;
    protected batchSize = BATCH_SIZE;
    protected type = Newsletter;
    protected cadenceConfig = {
        [ScheduleMode.BACKFILL]: { seconds: 5 },
        [ScheduleMode.INCREMENTAL]: { minutes: 5 },
    };

    protected codec = APIEntry;

    private publisherAddress: string;
    private client = createGraphQLClient(ARWEAVE_URL);
    private idLookup: Map<string, string>;
    private lastId: string;
    private currentId: string;

    constructor(publisherAddress: string) {
        super();
        this.publisherAddress = publisherAddress;
    }

    protected preLoad(
        context: LoadContext
    ): TaskEither<ProgramError, LoadContext> {
        if (this.lastId === this.currentId) {
            return pipe(
                this.refreshIds(),
                TE.map(() => context)
            );
        } else {
            return TE.right(context);
        }
    }

    preInitialize(context: InitContext): TaskEither<ProgramError, InitContext> {
        return pipe(
            this.refreshIds(),
            TE.map(() => context)
        );
    }

    refreshIds(): TaskEither<ProgramError, void> {
        return pipe(
            this.client.query(
                idLoadQuery,
                {
                    address: this.publisherAddress,
                },
                idsCodec
            ),
            TE.map((data) => {
                this.idLookup = new Map();
                const entries = data.data.transactions.edges;
                if (entries.length > 0) {
                    const lastEntry = entries[entries.length - 1];
                    const firstEntry = entries[0];
                    this.idLookup.set(lastEntry.id, firstEntry.id);
                    if (entries.length > 1) {
                        for (let i = 0; i < entries.length - 2; i++) {
                            const current = entries[i];
                            const next = entries[i + 1];
                            this.idLookup.set(current.id, next.id);
                        }
                    }
                    this.currentId = firstEntry.id;
                    this.lastId = lastEntry.id;
                }
                return undefined;
            })
        );
    }

    protected getUrlFor() {
        return `https://arweave.net/${this.currentId}`;
    }

    protected mapResult(result: APIEntry): Array<Newsletter> {
        this.currentId =
            this.idLookup.get(this.currentId) ??
            programError("Id lookup invalid");
        return [result];
    }

    // 👇 We don't use cursor here.
    protected extractCursor() {
        return "0";
    }
}

export const createBanklessNewsletterLoader = (
    publisherAddress: string
): BanklessNewsletterLoader => new BanklessNewsletterLoader(publisherAddress);
