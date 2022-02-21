import Ajv from "ajv/dist/jtd"
import {JSONSchemaType} from "ajv"
import { flow } from "fp-ts/lib/function";
const ajv = new Ajv()
import { DataLoaderBase } from "..";
import { left, right } from "fp-ts/lib/Either";
import { programError } from "@banklessdao/util-misc";

export const convertToWizardLoader = (
    createLoader: (data: unknown) => DataLoaderBase<unknown, unknown>,
    jsonSchema: JSONSchemaType<Record<string, unknown>>
) => {
    const parse = ajv.compileParser(jsonSchema)

    //  take output of parse, check if it is undefined, and then return an Either value
    const toEitherLoader = (value: unknown) => {
        if(value) return right(value);
        return left(programError(parse.message || "Wizard Loader Parser Failed"))
    }
    return flow(
        parse,
        toEitherLoader
    )
};
