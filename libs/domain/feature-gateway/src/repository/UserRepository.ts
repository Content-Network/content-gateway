import * as TE from "fp-ts/TaskEither";
import {
    UserCreationError,
    UserDeletionError,
    UserNotFoundError,
    UserUpdateError
} from ".";
import { ContentGatewayUser } from "./ContentGatewayUser";

export type UserRepository = {
    findById: (
        id: string
    ) => TE.TaskEither<UserNotFoundError, ContentGatewayUser>;
    findByApiKeyId: (
        id: string
    ) => TE.TaskEither<UserNotFoundError, ContentGatewayUser>;
    findByApiKeyHash: (
        hash: string
    ) => TE.TaskEither<UserNotFoundError, ContentGatewayUser>;
    createUser: (
        name: string,
        roles: string[]
    ) => TE.TaskEither<UserCreationError, ContentGatewayUser>;
    updateUser: (
        user: ContentGatewayUser
    ) => TE.TaskEither<UserUpdateError, void>;
    deleteUser: (userId: string) => TE.TaskEither<UserDeletionError, void>;
};
