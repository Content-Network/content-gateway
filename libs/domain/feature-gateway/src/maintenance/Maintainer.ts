import { MaintenanceJob } from "./MaintenanceJob";
import { ToadScheduler, SimpleIntervalJob, Task } from 'toad-scheduler';
import { pipe } from "fp-ts/lib/function";
import { toToadJob } from ".";
import { Logger } from "tslog";

export interface Maintainer {
    readonly jobs:MaintenanceJob[],
    stop: ()=>void
}

export const attachJobs = (jobs:MaintenanceJob[],scheduler:ToadScheduler) => {
    jobs.forEach((job)=>{
        pipe(
            job,
            toToadJob,
            scheduler.addSimpleIntervalJob
        )
    })
}