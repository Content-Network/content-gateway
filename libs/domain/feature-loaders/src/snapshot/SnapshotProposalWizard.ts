import Ajv, { JSONSchemaType } from "ajv";
const ajv = new Ajv();

interface SnapshotProposalWizardDataType {
    spaces: string[]
}

const schema: JSONSchemaType<SnapshotProposalWizardDataType> = {
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

/**
 * 1. use the schema to generate forms
 * 2. wrap the create loader function so that it accepts VALIDATED wizard data
 */