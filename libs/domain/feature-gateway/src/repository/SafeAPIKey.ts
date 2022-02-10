/**
 * This API Key object contains the id of the key and the hashed secret.
 */
export type SafeApiKey = {
    id: string;
    hash: string;
    // TODO: we can include permissions here in a later implementation
};
