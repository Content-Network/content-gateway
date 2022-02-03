// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { programError } from "@banklessdao/util-misc";
import { UserRepository } from "@domain/feature-gateway";
import { Collection, Db, MongoClient } from "mongodb";
import { v4 as uuid } from "uuid";
import { createMongoUserRepository } from ".";
import { MongoUser } from "./mongo/MongoUser";

const url =
    process.env.MONGO_CGA_URL ?? programError("MONGO_CGA_URL is missing");
const dbName =
    process.env.MONGO_CGA_USER ?? programError("MONGO_CGA_USER is missing");

describe("Given a Mongo user repository", () => {
    let target: UserRepository;
    let mongoClient: MongoClient;
    let db: Db;
    let users: Collection<MongoUser>;


    const collName = uuid();

    beforeAll(async () => {
        mongoClient = new MongoClient(url);
        db = mongoClient.db(dbName);
        users = db.collection<MongoUser>(collName);
        await mongoClient.connect();

        target = await createMongoUserRepository({
            dbName,
            collName,
            mongoClient,
        });
    });

    afterAll(async () => {
        await users.drop();
        await mongoClient.close();
    });

    describe("When creating a new schema entry", () => {
        it("Then it is successfully created when valid", async () => {});
    });
});
