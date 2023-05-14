import {DB} from "../database";
import {User} from "./user";

export async function addUser(user: User){
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('INSERT INTO users(USERNAME, PASSWORD, TEACHER) VALUES (?1, ?2, ?3)');
    await stmt.bind({1: user.username, 2: user.password, 3:user.teacher});
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();

    if (typeof operationResult.changes !== "number" || operationResult.changes !== 1) {
        throw new Error("Username is already known");
    }
    else {
        user.id = operationResult.lastID!;
    }
}

export async function getAllUsers(): Promise<User[]>{
    const db = await DB.createDBConnection();
    const users: User[] = await db.all<User[]>('SELECT * FROM users');
    await db.close();
    return users;
}

export async function isAuthorized(user: User): Promise<boolean>{
    const db = await  DB.createDBConnection();
    const stmt = await db.prepare(`SELECT * FROM users WHERE username = ?1`);
    await stmt.bind({1: user.username});
    const result: User | undefined = await stmt.get<User>();
    await stmt.finalize();
    await db.close();

    return typeof result !== "undefined" && result.password === user.password
}