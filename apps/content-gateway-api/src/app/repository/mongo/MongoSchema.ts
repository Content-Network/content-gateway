import { MongoUser } from "./MongoUser";

export type MongoSchema = {
    key: string;
    ownerId: string;
    owner: MongoUser;
    jsonSchema: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
};
