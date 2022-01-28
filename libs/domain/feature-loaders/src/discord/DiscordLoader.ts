import { notEmpty } from "@banklessdao/util-misc";
import {
    LoadContext,
    ScheduleMode,
    DataLoaderBase,
    DEFAULT_CURSOR,
} from "@shared/util-loaders";
import { Data, NonEmptyProperty } from "@banklessdao/util-schema";
import * as t from "io-ts";
import { withMessage } from "io-ts-types";
import { BATCH_SIZE } from "../defaults";
import { pipe } from "fp-ts/lib/function";
import { TextChannel, Client, Intents } from "discord.js";
import { map } from "fp-ts/lib/Functor";
import * as TE from "fp-ts/lib/TaskEither";

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
    @NonEmptyProperty()
    content: string;
    @NonEmptyProperty()
    createdAt: string;
}

const DiscordMessageCodec = t.strict({
    id: t.string,
    content: t.string,
    createdAt: t.string,
});

const DiscordMessagesCodec = t.strict({
    messages: withMessage(
        t.array(DiscordMessageCodec),
        () => "DiscordMessage is required"
    ),
});

type DiscordMessages = t.TypeOf<typeof DiscordMessagesCodec>;

export class DiscordLoader extends DataLoaderBase<
    DiscordMessages,
    DiscordMessage
> {
    public info = INFO;

    protected batchSize = BATCH_SIZE;
    protected type = DiscordMessage;
    protected cadenceConfig = {
        [ScheduleMode.BACKFILL]: { seconds: 5 },
        [ScheduleMode.INCREMENTAL]: { minutes: 5 },
    };

    protected codec = DiscordMessagesCodec;

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

        // Create a new client instance
        // Login to Discord with your client's token
        this.client.login(token);
    }

    protected loadRaw(context: LoadContext) {

        const channel = this.client.channels.cache.get(
            this.channelId
        ) as TextChannel;

        return  channel.messages
            .fetch({ limit: 100 })
            .then((messages) => {
                messages.map((message) => {
                    message.id, 
                    message.content, 
                    message.createdAt;
                });
            });
    }

    protected mapResult(result: DiscordMessages): Array<DiscordMessage> {
        return result.messages
            .map((result) => {
                try {
                    return {
                        id: result.id,
                        content: result.content,
                        createdAt: result.createdAt,
                    };
                } catch (e) {
                    this.logger.warn(
                        `Processing Discord Messages failed`,
                        e,
                        result
                    );
                    return undefined;
                }
            })
            .filter(notEmpty);
    }

    protected extractCursor(result: DiscordMessages) {
        if (result.messages.length > 0) {
            return result.messages[length - 1].createdAt;
        }
        return DEFAULT_CURSOR;
    }
}

export const createDiscordLoader = (token: string, channelId: string) =>
    new DiscordLoader(token, channelId);
