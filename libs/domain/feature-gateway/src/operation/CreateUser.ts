import { Operation } from "@shared/util-auth";
import { UserRepository } from "..";
import { ContentGatewayUser } from "../repository/ContentGatewayUser";

export type CreateUserParams = {
    name: string;
    roles: string[];
};

export type CreateUser = Operation<CreateUserParams, ContentGatewayUser>;

export const CREATE_USER = "CREATE_USER";

/**
 * Creates a new User.
 */
export const makeCreateUser = (userRepository: UserRepository): CreateUser => ({
    name: CREATE_USER,
    execute: ({ name, roles }: CreateUserParams) =>
        userRepository.createUser(name, roles),
});
