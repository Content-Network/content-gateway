/**
 * This type represents the API key id/secret pair.
 * **Note that** the `secret` is is stored as a base64 encoded string.
 */
// TODO: find a way to clean the secret from memory after it is returned
export type APIKey = {
    id: string;
    secret: string;
};
