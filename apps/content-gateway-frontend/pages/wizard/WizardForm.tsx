/** @jsxImportSource @emotion/react */
import Form from "@rjsf/core";
import React from 'react'
import { css } from '@emotion/react'
import { wizards } from "@domain/feature-loaders"
interface WizardFormPropTypes {
    activeFormId?: string;
}

// const schema = {
//     type: "object",
//     properties: {
//         spaces: {
//             type: "array",
//             minItems: 1,
//             items: { type: "string", minLength: 1 }
//         },
//     },
//     required: ["spaces"],
// };
const schema = wizards[0].schema

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
