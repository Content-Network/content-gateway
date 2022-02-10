import { MaintenanceJob } from "./MaintenanceJob";
import { ToadScheduler} from "toad-scheduler";
import { pipe } from "fp-ts/lib/function";
import { makeToToadJob } from ".";
import { Logger } from "tslog";

export interface Maintainer {
    readonly jobs: MaintenanceJob[];
    stop: () => void;
}

export const attachJobs = (
    jobs: MaintenanceJob[],
    scheduler: ToadScheduler,
    logger: Logger
) => {
    const toToadJob = makeToToadJob(logger);

    jobs.forEach((job) => {
        pipe(job, toToadJob, scheduler.addSimpleIntervalJob);
    });
};
