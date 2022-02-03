import {
    AtlasApiInfo,
    _queryIndexSuggestions,
} from "./IndexCreationJob";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

const throwLeft = TE.mapLeft((e) => {
    throw e;
});

describe("IndexCreationJob", () => {
    describe("_queryIndexSuggestions", () => {
        if (
            !(
                process.env.ATLAS_PUBLIC_KEY &&
                process.env.ATLAS_PRIVATE_KEY &&
                process.env.ATLAS_PROJECT_ID &&
                process.env.ATLAS_PROCESS_ID
            )
        )
            throw new Error("Set process variables");

        const atlasApiInfo: AtlasApiInfo = {
            publicKey: process.env.ATLAS_PUBLIC_KEY,
            privateKey: process.env.ATLAS_PRIVATE_KEY,
            projectId: process.env.ATLAS_PROJECT_ID,
            processId: process.env.ATLAS_PROCESS_ID,
        };
        it("should successfully access the endpoint", async () => {
            expect.assertions(1);
            return _queryIndexSuggestions(atlasApiInfo)().then((response)=>{
                console.log(response)
                expect(E.isRight(response)).toBeTruthy()
            });
        });
    });
    describe("_chooseIndexesToAdd", () => {
        //throw new Error("Not implemented yet");
    });
    describe("_addIndexes", () => {
        //throw new Error("Not implemented yet");
    });
});
