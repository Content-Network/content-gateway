import { Heading, VStack } from "@chakra-ui/layout";
import { FunctionComponent } from "react";
import Layout from "../../layouts/Layout";
import IntegrationSelector from "./IntegrationSelector";

const Wizard: FunctionComponent = () => {
    return (
        <Layout>
            <VStack spacing= {4} margin={[4,6,20,20]}>
                <Heading>Integration Wizard</Heading>
                <IntegrationSelector></IntegrationSelector>
            </VStack>
        </Layout>
    );
};

export default Wizard;
