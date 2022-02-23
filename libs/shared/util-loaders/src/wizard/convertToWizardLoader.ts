import Ajv from "ajv/dist/jtd";
import { JSONSchemaType } from "ajv";
import { flow } from "fp-ts/lib/function";
const ajv = new Ajv();
import { DataLoaderBase } from "..";
import E, { Either, left, right } from "fp-ts/lib/Either";
import { programError } from "@banklessdao/util-misc";

type WrappedJSONSchemaType<T> = JSONSchemaType<T>;

export interface WizardLoaderConfig<T> {
    schema: WrappedJSONSchemaType<T>;
    makeLoader: MakeWizardLoaderType;
    type: string;
}

/**
 * Un-parameterized version of WizardLoaderConfig to avoid
 * existential types (which are not natively supported in ts).
 * **Only** use this to avoid existential types
 */
export interface WeakWizardLoaderConfig extends Omit<WizardLoaderConfig<unknown>, "schema"> {
    schema: Record<string, unknown>;
}

type MakeWizardLoaderType = (json: string) => Either<never, DataLoaderBase<unknown,unknown>>;

const convertToWizardLoader = <T>(
    createLoader: (data: T) => DataLoaderBase<unknown, unknown>,
    jsonSchema: WrappedJSONSchemaType<T>
):MakeWizardLoaderType => {
    const parse = ajv.compileParser<T>(jsonSchema);

    //  take output of parse, check if it is undefined, and then return an Either value
    const toEitherLoader = (value: T | undefined) => {
        if (value !== undefined) {
            return right(value);
        }
        return left(
            programError(parse.message || "Wizard Loader Parser Failed")
        );
    };
    return flow(
        parse, 
        toEitherLoader,
        E.map(createLoader)
    );
};

export const makeWizardLoaderConfig = <T>(
    createLoader: (data: T) => DataLoaderBase<unknown, unknown>,
    jsonSchema: WrappedJSONSchemaType<T>,
    type: string
): WizardLoaderConfig<T> => ({
    schema: jsonSchema,
    makeLoader: convertToWizardLoader(createLoader, jsonSchema),
    type
});
