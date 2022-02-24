import { WeakWizardLoaderConfig } from "@shared/util-loaders";
import { snapshotProposalWizardConfig } from "./snapshot/SnapshotProposalWizard";

/**
 * This is how the front and backend will agree on how to format
 * and use wizard configs
 */
const wizardsList:WeakWizardLoaderConfig[] = [
    snapshotProposalWizardConfig
]

export const wizards = wizardsList.reduce((acc,next)=>{
    acc[next.schema.$id] = next
    return acc
},{} as Record<string,WeakWizardLoaderConfig>)