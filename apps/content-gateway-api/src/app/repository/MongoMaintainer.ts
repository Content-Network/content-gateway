import {
    attachJobs,
    Maintainer,
    MaintenanceJob,
} from "@domain/feature-gateway";
import { ToadScheduler } from "toad-scheduler";

/**
 * Create a maintainer for the MongoDB that will periodically run tasks
 * to keep the database in good condition
 */
export const createMongoMaintainer = (jobs: MaintenanceJob[],scheduler = new ToadScheduler()): Maintainer => {
    attachJobs(jobs, scheduler);
    return {
        jobs,
        stop: scheduler.stop,
    };
};
