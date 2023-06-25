import {DB} from "../database";
import {User} from "./user";
import bcrypt from "bcrypt";

export async function addUser(user: User){
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('INSERT INTO user VALUES (?1, ?2, ?3, ?4, ?5, ?6)');
    await stmt.bind({1: user.username, 2: user.password, 3:user.lastname, 4:user.firstname, 5:user.classMember, 6:user.teacher});
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();

    if (typeof operationResult.changes !== "number" || operationResult.changes !== 1) {
        throw new Error("Username is already known");
    }
}

export async function getAllUsers(): Promise<User[]>{
    const db = await DB.createDBConnection();
    const users: User[] = await db.all<User[]>('SELECT * FROM user');
    await db.close();
    return users;
}

export async function getAllStudentsWhoAreMembersOfTheClass(): Promise<User[]>{
    const db = await DB.createDBConnection();
    const users: User[] = await db.all<User[]>('SELECT * FROM user WHERE classMember = true AND teacher = false');
    await db.close();
    return users;
}

export async function isAuthorized(user: User): Promise<boolean>{
    const db = await  DB.createDBConnection();
    const stmt = await db.prepare(`SELECT * FROM user WHERE username = ?1`);
    await stmt.bind({1: user.username});
    const result: User | undefined = await stmt.get<User>();
    await stmt.finalize();
    await db.close();

    if(result === undefined){
        return false;
    }

    //verschlüsselung
    return await bcrypt.compare(user.password, result.password);
}

export async function isTeacher(user: User): Promise<boolean>{
    const db = await  DB.createDBConnection();
    const stmt = await db.prepare(`SELECT * FROM user WHERE username = ?1`);
    await stmt.bind({1: user.username});
    const result: User | undefined = await stmt.get<User>();
    await stmt.finalize();
    await db.close();

    //return value ist ein boolean
    return typeof result !== "undefined" && result.teacher == 1;
}

export async function addToClassPool(username: string){
    console.log(username);
    const db = await  DB.createDBConnection();
    const stmt = await db.prepare(`UPDATE user SET classMember = true WHERE username = ?1`);
    await stmt.bind({1: username});
    await stmt.run();
    await stmt.finalize();
    await db.close();
}

export async function removeFromClassPool(username: string){
    const db = await  DB.createDBConnection();
    const stmt = await db.prepare(`UPDATE user SET classMember = false WHERE username = ?1`);
    await stmt.bind({1: username});
    await stmt.run();
    await stmt.finalize();
    await db.close();
}

export async function checkIfIsMember(username: string): Promise<{classMember: boolean}>{
    const db = await  DB.createDBConnection();
    const stmt = await db.prepare(`SELECT classMember FROM user WHERE username = ?1`);
    await stmt.bind({1: username});
    const result: { classMember: boolean } | undefined = await stmt.get();
    await stmt.finalize();
    await db.close();

    //this here is only necessary because the compiler wants it so
    // (we already know that it exists, because it is checked before the function is entered)
    if(result === undefined){
        return {classMember: false};
    }
    return result;
}