import { User } from "@shared/util-auth";
import { SafeApiKey } from ".";

export interface ContentGatewayUser extends User<string> {
    apiKeys: SafeApiKey[];
}
