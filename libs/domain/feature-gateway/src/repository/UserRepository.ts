import * as TE from "fp-ts/TaskEither";
import {
    DatabaseError,
    UserCreationError,
    UserDeletionError,
    UserNotFoundError,
    UserUpdateError
} from ".";
import { ContentGatewayUser } from "./ContentGatewayUser";

export type UserRepository = {
    findById: (
        id: string
    ) => TE.TaskEither<UserNotFoundError | DatabaseError, ContentGatewayUser>;
    findByApiKeyId: (
        id: string
    ) => TE.TaskEither<UserNotFoundError | DatabaseError, ContentGatewayUser>;
    findByApiKeyHash: (
        hash: string
    ) => TE.TaskEither<UserNotFoundError | DatabaseError, ContentGatewayUser>;
    createUser: (
        name: string,
        roles: string[]
    ) => TE.TaskEither<UserCreationError, ContentGatewayUser>;
    updateUser: (
        user: ContentGatewayUser
    ) => TE.TaskEither<UserUpdateError, void>;
    deleteUser: (
        user: ContentGatewayUser
    ) => TE.TaskEither<UserDeletionError, void>;
};
