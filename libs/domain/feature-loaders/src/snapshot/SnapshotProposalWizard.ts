import { createSnapshotProposalLoader } from ".";
import { makeWizardLoaderConfig, WrappedJSONSchemaType } from "@shared/util-loaders";

interface SnapshotProposalWizardDataType {
    spaces: string[];
}

const snapshotProposalSchema: WrappedJSONSchemaType<SnapshotProposalWizardDataType> = {
    $id: "SnapshotProposal",
    title: "Snapshot Proposal",
    type: "object",
    properties: {
        spaces: {
            type: "array",
            minItems: 1,
            items: { type: "string", minLength: 1 },
        },
    },
    required: ["spaces"],
};

const wizardDataToLoader = (data: SnapshotProposalWizardDataType) => {
    return createSnapshotProposalLoader(data.spaces);
};

export const snapshotProposalWizardConfig = makeWizardLoaderConfig(
    wizardDataToLoader,
    snapshotProposalSchema
);
