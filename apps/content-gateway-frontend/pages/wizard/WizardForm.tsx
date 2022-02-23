/** @jsxImportSource @emotion/react */
import Form from "@rjsf/core";
import React from 'react'
import { css } from '@emotion/react'
import { wizards, snapshotProposalSchema as schema } from "@domain/feature-loaders"
//import { makeWizardLoaderConfig } from "@shared/util-loaders";
interface WizardFormPropTypes {
    activeFormId?: string;
}


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
