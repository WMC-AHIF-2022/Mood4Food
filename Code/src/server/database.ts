import { Database as Driver } from "sqlite3";
import { open, Database } from "sqlite";

export const dbFileName = 'data.db';

export class DB {
    public static async createDBConnection(): Promise<Database> {

        const db = await open({
            filename: `./${dbFileName}`,
            driver: Driver
        });
        await db.run('PRAGMA foreign_keys = ON');
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

        await connection.run(
            `create table if not exists OrderDay(
                id INTEGER NOT NULL PRIMARY KEY,
                orderDate TEXT DEFAULT (DATE('now')) NOT NULL,
                deadline TEXT DEFAULT (TIME('now','start of day','-1 Seconds')) NOT NULL
            ) strict`
        );

        await connection.run(`
            CREATE TABLE IF NOT EXISTS User (
                username TEXT NOT NULL PRIMARY KEY,
                password TEXT NOT NULL,
                lastname TEXT NOT NULL,
                firstname TEXT NOT NULL,
                classMember BOOLEAN,
                teacher INTEGER
            )
        `);

         await connection.run(
             `create table if not exists OrderEntry(
                 id INTEGER NOT NULL PRIMARY KEY,
                 orderDayID INTEGER NOT NULL,
                 username TEXT NOT NULL,
                 mealID INTEGER NOT NULL,
                 CONSTRAINT fk_orderDate
                     FOREIGN KEY (orderDayID) 
                     REFERENCES OrderDay(id) 
                     ON DELETE CASCADE,
                 CONSTRAINT fk_user
                     FOREIGN KEY (username) 
                     REFERENCES User(username) 
                     ON DELETE CASCADE,
                 CONSTRAINT fk_food 
                     FOREIGN KEY (mealID) 
                     REFERENCES Food(id) 
                     ON DELETE CASCADE
            ) strict`
        );
    }
}