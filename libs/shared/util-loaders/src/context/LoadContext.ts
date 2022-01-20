/**
 * Contains the data that's necessary for loading data.
 */
export type LoadContext = {
    /**
     * This is where we "left off" after the last loading. A cursor
     * is an opaque string that is usually a sequential id or a timestamp.
     */
    cursor?: string;
    /**
     * The number of items to load.
     */
    limit: number;
};

/**
 * Broadens the definition of Load context to allow for the temporary use of
 * number cursors. This type should only be used inside of a loader class
 * as a number cursor will cause downstream problems if Prisma get's
 * ahold of it
 */
export interface InternalLoadContext extends Omit<LoadContext,"cursor"> {
    cursor?: string | number
}
