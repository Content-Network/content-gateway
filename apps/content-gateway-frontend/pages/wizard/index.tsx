import { Heading, Text, VStack } from "@chakra-ui/layout";
import Layout from "../../components/layout/layout";
import { FunctionComponent, useState } from "react";
import IntegrationSelector from "./IntegrationSelector";
import WizardForm from "./WizardForm";

const Wizard: FunctionComponent = () => {
    const [activeFormId, setActiveFormId] = useState<string>();

    return (
        //<Layout>
        <VStack spacing={4} margin={[4, 6, 20, 40]} marginTop={[4, 6, 10, 10]}>
            <Heading>Integration Wizard</Heading>
            <IntegrationSelector setActiveForm={setActiveFormId} />
            {activeFormId ? (
                <WizardForm activeFormId={activeFormId} />
            ) : (
                <Text>Please Select a Loader</Text>
            )}
        </VStack>
        //</Layout>
    );
};

export default Wizard;
