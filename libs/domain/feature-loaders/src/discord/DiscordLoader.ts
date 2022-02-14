import { notEmpty, programError } from "@banklessdao/util-misc";
import {
    LoadContext,
    ScheduleMode,
    DataLoaderBase,
    DEFAULT_CURSOR,
    DatabaseError,
} from "@shared/util-loaders";

import { ProgramError, UnknownError } from "@banklessdao/util-data";
import {
    Data,
    NonEmptyProperty,
    OptionalProperty,
} from "@banklessdao/util-schema";
import { TextChannel, Client, Intents, Collection, Message } from "discord.js";
import * as TE from "fp-ts/lib/TaskEither";
import { left } from "fp-ts/lib/Separated";

const INFO = {
    namespace: "discord",
    name: "Message",
    version: "V1",
};

@Data({
    info: INFO,
})
class DiscordMessage {
    @NonEmptyProperty()
    id: string;
    @OptionalProperty()
    content?: string;
    @NonEmptyProperty()
    createdAt: string;
}

type DiscordFetchResult = Collection<string, Message>;

export class DiscordLoader extends DataLoaderBase<
    DiscordFetchResult,
    DiscordMessage
> {
    public info = INFO;

    // Discord doesn't allow 1000 here
    protected batchSize = 100;
    protected type = DiscordMessage;
    protected cadenceConfig = {
        [ScheduleMode.BACKFILL]: { seconds: 5 },
        [ScheduleMode.INCREMENTAL]: { minutes: 5 },
    };

    private token: string;
    private channelId: string;

    client = new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.DIRECT_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGES,
        ],
    });

    constructor(token: string, channelId: string) {
        super();
        this.token = token;
        this.channelId = channelId;
        this.client.login(this.token);
    }

    protected loadRaw(context: LoadContext) {
        return TE.tryCatch(
            () => {
                const channel = this.client.channels.cache.get(
                    this.channelId
                ) as TextChannel;

                return channel.messages.fetch({
                    limit: this.batchSize,
                    after: context.cursor,
                });
            },
            (err: unknown) => {
                return new DatabaseError(String(err));
            }
        );
    }

    protected mapResult(rawData: DiscordFetchResult): Array<DiscordMessage> {
        return rawData
            .map((rawData) => ({
                id: rawData.id,
                content: rawData.content,
                createdAt: rawData.createdAt.toString(),
            }))
            .filter(notEmpty);
    }

    protected extractCursor(result: DiscordFetchResult) {
        return result.at(result.size - 1)?.id || DEFAULT_CURSOR;
    }
}

export const createDiscordLoader = (token: string, channelId: string) =>
    new DiscordLoader(token, channelId);
