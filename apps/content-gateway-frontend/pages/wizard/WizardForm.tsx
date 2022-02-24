import Form from "@rjsf/bootstrap-4";
import { css } from '@emotion/react'
import { wizards } from "@domain/feature-loaders"
interface WizardFormPropTypes {
    activeFormId?: string;
}

function WizardForm({ activeFormId }: WizardFormPropTypes) {
    const schema = wizards[activeFormId].schema
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
