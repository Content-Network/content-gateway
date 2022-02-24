import Form from "@rjsf/core";
import { css } from '@emotion/react'
import { wizards } from "@domain/feature-loaders"
interface WizardFormPropTypes {
    activeFormId?: string;
}

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
