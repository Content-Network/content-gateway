import { JSONSchemaType } from "ajv";
import { createSnapshotProposalLoader } from ".";
import { makeWizardLoaderConfig } from "@shared/util-loaders";

interface SnapshotProposalWizardDataType {
    spaces: string[];
}

export const snapshotProposalSchema: JSONSchemaType<SnapshotProposalWizardDataType> = {
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
    snapshotProposalSchema,
    "SnapshotProposal"
);
