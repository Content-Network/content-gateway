import { Select } from "@chakra-ui/react";

function IntegrationSelector() {
    return ( 
        <Select placeholder='Select Integration Form'>
            <option value='option1'>Snapshot</option>
            <option value='option2'>Discord</option>
            <option value='option3'>YouTube</option>
        </Select>
    );
}

export default IntegrationSelector;