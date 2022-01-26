import { User } from "./User";

/**
 * Represents a business object that has an [[owner]] and
 * can be identified by an [[id]].
 */
export interface Entity<ID extends number | string> {
    owner: User<ID>;
}
