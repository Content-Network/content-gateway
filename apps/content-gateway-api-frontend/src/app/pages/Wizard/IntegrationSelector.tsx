import { Select } from "@chakra-ui/react";

interface IntegrationSelectorProps {
    setActiveForm:(activeFormId:string)=>unknown
}

function IntegrationSelector({setActiveForm}:IntegrationSelectorProps) {
    return ( 
        <Select placeholder='Select Integration Form'>
            <option value='option1'>Snapshot</option>
            <option value='option2'>Discord</option>
            <option value='option3'>YouTube</option>
        </Select>
    );
}

export default IntegrationSelector;