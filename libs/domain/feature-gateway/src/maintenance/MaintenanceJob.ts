import { ProgramError } from "@banklessdao/util-data";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { SimpleIntervalJob, SimpleIntervalSchedule } from "toad-scheduler";
import { Logger } from "tslog";
import { MaintenanceJobError } from "./errors";

/**
 * A job designed to perform maintenance tasks on the gateway
 */
export interface MaintenanceJob {
    id:string,
    run:()=>TaskEither<MaintenanceJobError,void>,
    schedule:SimpleIntervalSchedule,
}

export type addMaintenanceJob = (job:MaintenanceJob) => TaskEither<ProgramError,void>

export const toToadJob = (job:MaintenanceJob):SimpleIntervalJob => {
    // TODO: Implement
    return {} as SimpleIntervalJob
}