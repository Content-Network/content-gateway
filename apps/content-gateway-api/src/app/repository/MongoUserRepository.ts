import { createLogger } from "@banklessdao/util-misc";
import {
    ContentGatewayUser,
    UserCreationError,
    UserDeletionError,
    UserNotFoundError,
    UserRepository,
    UserUpdateError
} from "@domain/feature-gateway";
import * as TE from "fp-ts/TaskEither";
import { MongoClient } from "mongodb";
import { MongoUser } from "./mongo/MongoUser";

export const mongoUserToCGUser = (user: MongoUser): ContentGatewayUser => ({
    id: user.id.toString(),
    name: user.name,
    roles: user.roles,
    apiKeys: user.apiKeys,
});

type Deps = {
    dbName: string;
    collName: string;
    mongoClient: MongoClient;
};

export const createMongoUserRepository = async ({
    dbName,
    mongoClient,
    collName,
}: Deps): Promise<UserRepository> => {
    const db = mongoClient.db(dbName);
    const logger = createLogger("MongoUserRepository");
    const users = db.collection<MongoUser>(collName);

    await users.createIndex({ name: 1 });
    await users.createIndex({ roles: 1 });
    await users.createIndex({ "apiKeys.id": 1 });
    await users.createIndex({ "apiKeys.hash": 1 });

    const findById = (
        id: string
    ): TE.TaskEither<UserNotFoundError, ContentGatewayUser> => {
        return TE.left(new UserNotFoundError("Not implemented"));
    };

    const findByApiKeyId = (
        apiKey: string
    ): TE.TaskEither<UserNotFoundError, ContentGatewayUser> => {
        return TE.left(new UserNotFoundError("Not implemented"));
    };

    const findByApiKeyHash = (
        apiKey: string
    ): TE.TaskEither<UserNotFoundError, ContentGatewayUser> => {
        return TE.left(new UserNotFoundError("Not implemented"));
    };

    const createUser = (
        name: string,
        roles: string[]
    ): TE.TaskEither<UserCreationError, ContentGatewayUser> => {
        return TE.left(new UserCreationError("Not implemented"));
    };

    const updateUser = (
        user: ContentGatewayUser
    ): TE.TaskEither<UserUpdateError, void> => {
        return TE.left(new UserUpdateError("Not implemented"));
    };

    const deleteUser = (
        userId: string
    ): TE.TaskEither<UserDeletionError, void> => {
        return TE.left(new UserDeletionError("Not implemented"));
    };

    return {
        findById,
        findByApiKeyId,
        findByApiKeyHash,
        createUser,
        updateUser,
        deleteUser,
    };
};
