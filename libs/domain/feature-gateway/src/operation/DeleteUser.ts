import { Operation } from "@shared/util-auth";
import { UserRepository } from "..";

export const DELETE_USER = "DELETE_USER";

export type DeleteUserParams = {
    userId: string;
};

export type DeleteUser = Operation<DeleteUserParams, void>;

/**
 * Deletes a User.
 */
export const makeDeleteUser = (userRepository: UserRepository): DeleteUser => ({
    name: DELETE_USER,
    execute: ({ userId }: DeleteUserParams) =>
        userRepository.deleteUser(userId),
});
