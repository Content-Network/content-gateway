import { banklessAcademyLoader } from "./BanklessAcademyLoader";
import {
    createClientStub,
    ContentGatewayClientStub,
} from "@banklessdao/content-gateway-client";
import { createJobSchedulerStub, JobSchedulerStub } from "..";
import { isRight } from "fp-ts/lib/Either";

describe("Given an Bankless Academy loader", () => {
    const loader = banklessAcademyLoader;

    let clientStub: ContentGatewayClientStub;
    let jobSchedulerStub: JobSchedulerStub;

    beforeEach(() => {
        clientStub = createClientStub();
        jobSchedulerStub = createJobSchedulerStub();
    });

    it("When initialize is called Then it runs successfully", async () => {
        const result = await loader.initialize({
            client: clientStub,
            jobScheduler: jobSchedulerStub,
        })();

        expect(isRight(result)).toBeTruthy();
    });

    it("When initialize is called Then it schedules a job", async () => {
        await loader.initialize({
            client: clientStub,
            jobScheduler: jobSchedulerStub,
        })();

        expect(jobSchedulerStub.scheduledJobs[0].name).toEqual(loader.name);
    });
});
