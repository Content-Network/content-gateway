import { SafeApiKey } from "@domain/feature-gateway";

export type MongoUser = {
    id: string;
    name: string;
    roles: string[];
    apiKeys: SafeApiKey[];
};
