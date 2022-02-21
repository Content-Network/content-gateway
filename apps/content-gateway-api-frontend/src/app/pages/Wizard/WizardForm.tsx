/** @jsxImportSource @emotion/react */
import Form from "@rjsf/core";
import React from 'react'
import { css } from '@emotion/react'
interface WizardFormPropTypes {
    activeFormId?: string;
}

const schema = {
    title: "A registration form",
    description: "A simple form example.",
    type: "object",
    required: ["firstName", "lastName"],
    properties: {
        firstName: {
            type: "string",
            title: "First name",
            default: "Chuck",
        },
        lastName: {
            type: "string",
            title: "Last name",
        },
        telephone: {
            type: "string",
            title: "Telephone",
            minLength: 10,
        },
    },
} as any;

function WizardForm({ activeFormId }: WizardFormPropTypes) {
    return (
        <div css={formCss}>
            <Form schema={schema} />
        </div>
    );
}

const formCss = css`
    width:100%;

    form.rjsf {
        display: flex;
        flex-direction: column;
        row-gap: 16px;
        width: 100%;
    }
    #root {
        display: grid;
        row-gap: 12px;
    }
`;

export default WizardForm;
