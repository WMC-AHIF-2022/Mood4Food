import { Database as Driver } from "sqlite3";
import { open, Database } from "sqlite";

export const dbFileName = 'data.db';

export class DB {
    public static async createDBConnection(): Promise<Database> {

        const db = await open({
            filename: `./${dbFileName}`,
            driver: Driver
        });
        await DB.ensureTablesCreated(db);
        return db;
    }
    private static async ensureTablesCreated(connection: Database): Promise<void> {
        await connection.run(
            `create table if not exists Food(
                id INTEGER NOT NULL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                ingredients TEXT
            ) strict`
        );
    }
}