import Ajv from "ajv";
import { JSONSchemaType } from "ajv";
import { flow } from "fp-ts/lib/function";
import { DataLoaderBase } from "..";
import { Either, left, right } from "fp-ts/lib/Either";
import * as E from "fp-ts/lib/Either";
import { programError } from "@banklessdao/util-misc";
const ajv = new Ajv();

type RequireExtraInfo = {
    /** Used to uniquely identify a loader schema for parsing */
    $id:string,
    /** Used as the title of the loader on the front end */
    title:string
}
export type WrappedJSONSchemaType<T> = JSONSchemaType<T> & RequireExtraInfo;


export interface WizardLoaderConfig<T> {
    schema: WrappedJSONSchemaType<T>;
    makeLoader: MakeWizardLoaderType;
}

/**
 * Un-parameterized version of WizardLoaderConfig to avoid
 * existential types (which are not natively supported in ts).
 * **Only** use this to avoid existential types
 */
export interface WeakWizardLoaderConfig
    extends Omit<WizardLoaderConfig<unknown>, "schema"> {
    schema: Record<string, unknown>;
}

type MakeWizardLoaderType = (
    json: string
) => Either<never, DataLoaderBase<unknown, unknown>>;

export const convertToWizardLoader = <T>(
    createLoader: (data: T) => DataLoaderBase<unknown, unknown>,
    jsonSchema: WrappedJSONSchemaType<T>
): MakeWizardLoaderType => {
    const validate = ajv.compile<T>(jsonSchema);
    const parse = (json: string) =>
        validate(JSON.parse(json)) ? JSON.parse(json) : undefined;

    //  take output of parse, check if it is undefined, and then return an Either value
    const toEitherLoader = (value: T | undefined) => {
        if (value !== undefined) {
            return right(value);
        }
        return left(
            programError(
                JSON.stringify(validate.errors) || "Wizard Loader Parser Failed"
            )
        );
    };
    return flow(parse, toEitherLoader, E.map(createLoader));
};

export const makeWizardLoaderConfig = <T>(
    createLoader: (data: T) => DataLoaderBase<unknown, unknown>,
    jsonSchema: WrappedJSONSchemaType<T>,
): WizardLoaderConfig<T> => ({
    schema: jsonSchema,
    makeLoader: convertToWizardLoader(createLoader, jsonSchema)
});
