import { WrappedJSONSchemaType } from "."
import { DataLoaderBase } from ".."
import { convertToWizardLoader } from "./makeWizardLoaderConfig"

describe("makeWizardLoaderConfig",()=>{
    describe("convertToWizardLoader",()=>{
        const dummyDataLoaderBase = (_:any)=>({} as DataLoaderBase<unknown,unknown>)
        it("should create a loader for the json schema on the ajv website",()=>{
            convertToWizardLoader(dummyDataLoaderBase,exampleJSONSchema)
        })
    })
})

// @ts-expect-error The types don't match but it's a test and that's okay
const exampleJSONSchema:WrappedJSONSchemaType<unknown> = {
    $id:"TestSchema",
    type: "object",
    properties: {
      foo: {type: "integer"},
      bar: {type: "string", nullable: true}
    },
    required: ["foo"],
    additionalProperties: false
}
