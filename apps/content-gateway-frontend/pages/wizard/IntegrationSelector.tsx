import { Select } from "@chakra-ui/react";
import { wizards } from "@domain/feature-loaders"

interface IntegrationSelectorProps {
    setActiveForm:(activeFormId:string)=>unknown
}

function IntegrationSelector({setActiveForm}:IntegrationSelectorProps) {
    const options = Object.entries(wizards).map(([key, w]) => {
        return <option key={key} value={key}>{w.schema.title}</option>;
    });
    console.log(options)
    return ( 
        <Select placeholder='Select Integration Form' onChange={(e)=>{
            setActiveForm(e.target.value)
        }}>
            {options}
        </Select>
    );
}

export default IntegrationSelector;