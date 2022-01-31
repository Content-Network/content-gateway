import { DataLoader } from "@shared/util-loaders";
import {
    createBANKAccountLoader,
    createBountyLoader,
    createBanklessAcademyCourseLoader,
    createPOAPAccountLoader,
    createPOAPTokenLoader
} from ".";
import { createBanklessPodcastLoader } from "./bankless-podcast";
import { createBANKTransactionLoader } from "./bankless-token/BanklessTokenTransactionLoader";
import { createBANKTransferLoader } from "./bankless-token/BanklessTokenTransferLoader";
import { createBanklessWebsitePostLoader } from "./bankless-website/BanklessGhostPostLoader";
import { createENSDomainLoader } from "./ens/ENSLoader";
import { createPOAPEventLoader } from "./poap-token/POAPEventLoader";
import { createPOAPTransferLoader } from "./poap-token/POAPTransferLoader";
import { createSnapshotProposalLoader } from "./snapshot";

export type LoadersConfig = {
    youtubeApiKey: string;
    ghostApiKey: string;
    snapshotSpaces: string[];
};

/**
 * 📗 Note for developers: this is where you should add your loader(s).
 */
export const createLoaders = (apiKeys: LoadersConfig) =>
    [
        createBanklessAcademyCourseLoader(),
        createBountyLoader(),
        createBanklessPodcastLoader(apiKeys.youtubeApiKey),
        createBanklessWebsitePostLoader(apiKeys.ghostApiKey),
        createBANKAccountLoader(),
        createBANKTransactionLoader(),
        createBANKTransferLoader(),
        createPOAPEventLoader(),
        createPOAPTokenLoader(),
        createPOAPAccountLoader(),
        createPOAPTransferLoader(),
        createSnapshotProposalLoader(apiKeys.snapshotSpaces),
        createENSDomainLoader(),
    ] as DataLoader<unknown>[];
