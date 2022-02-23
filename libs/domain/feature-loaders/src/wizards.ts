import { WeakWizardLoaderConfig } from "@shared/util-loaders";
import { snapshotProposalWizardConfig } from "./snapshot/SnapshotProposalWizard";

/**
 * This is how the front and backend will agree on how to format
 * and use wizard configs
 */
export const wizards:WeakWizardLoaderConfig[] = [
    snapshotProposalWizardConfig
]