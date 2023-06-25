import express from "express";
import {StatusCodes} from "http-status-codes";
import {
    addToClassPool,
    addUser,
    getAllUsers,
    getAllStudentsWhoAreMembersOfTheClass,
    isAuthorized,
    isTeacher, removeFromClassPool, checkIfIsMember
} from "../collective/user-repository";
import {User} from "../collective/user";
import bcrypt from "bcrypt";
import {DB} from "../database";

export const saltRounds: number = 8;
export const userRouter = express.Router();

export const teacherCode: string = "jd/l2n)=and;f=9";

userRouter.post("/signup", async function (request, response) {
    const username: string = request.body.username;
    const password: string = request.body.password;
    const lastname: string = request.body.lastName;
    const firstname: string = request.body.firstName;
    const classMember: boolean = false;
    const teacher: number = request.body.teacher;
    const code: string = request.body.teacherCode;

    if(teacher == 1 && code !== teacherCode){
        response.status(StatusCodes.BAD_REQUEST).send('teacherPassword was wrong');
        return;
    }
    if (password.trim().length === 0){
        response.sendStatus(StatusCodes.BAD_REQUEST);
        return;
    }

    const user: User = {
        username: username,
        password: password,
        lastname: lastname,
        firstname: firstname,
        classMember: classMember,
        teacher: teacher
    }

    //console.log(user);

    user.password = await bcrypt.hash(password, saltRounds);

    try {
        await addUser(user);
        response.sendStatus(StatusCodes.OK);
    }
    catch (e) {
        response.status(StatusCodes.BAD_REQUEST).send(e);
    }
});

userRouter.post("/login", async (request, response) => {
    const username: string = request.body.username;
    const password: string = request.body.password;

    const user: User = {
        username: username,
        password: password,
        lastname: "",
        firstname: "",
        classMember: false
    }
    const isUserAuthorized: boolean = await isAuthorized(user);
    if (isUserAuthorized){
        const isHigherEntity = `${await isTeacher(user)}`;
        response.status(StatusCodes.OK).json(isHigherEntity);
    }
    else {
        response.sendStatus(StatusCodes.UNAUTHORIZED);
    }
})

userRouter.post("/poolAddition", async (req, res)=>{
    const username = req.body.username;

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select count(*) from user where username = ?1');
    await stmt.bind({1: username});
    const result = await stmt.get();
    await stmt.finalize();
    await db.close();

    if(typeof result.changes !== "undefined" && result.changes !== 1){
        res.status(StatusCodes.BAD_REQUEST).send('User does not exist');
    }
    else{
        await addToClassPool(username);
        res.status(StatusCodes.OK).send('username now is part of the class-pool');
    }
});

userRouter.post("/poolRemoval", async (req, res)=>{
    const username = req.body.username;

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select count(*) from user where username = ?1');
    await stmt.bind({1: username});
    const result = await stmt.get();
    await stmt.finalize();
    await db.close();

    if(typeof result.changes !== "undefined" && result.changes !== 1){
        res.status(StatusCodes.BAD_REQUEST).send('User does not exist');
    }
    else{
        await removeFromClassPool(username);
        res.status(StatusCodes.OK).send('username is no longer part of the class-pool');
    }
});

userRouter.get("/", async (request, response) => {
    const users = await getAllUsers();
    response.status(StatusCodes.OK).json(users);
})

userRouter.get("/class", async (request, response) => {
    const users = await getAllStudentsWhoAreMembersOfTheClass();
    response.status(StatusCodes.OK).json(users);
})

userRouter.get("/isClassMember/:username", async (req, res) => {
    const username = req.params.username;

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select count(*) from user where username = ?1');
    await stmt.bind({1: username});
    const result = await stmt.get();
    await stmt.finalize();
    await db.close();

    if(typeof result.changes !== "undefined" && result.changes !== 1){
        res.status(StatusCodes.BAD_REQUEST).send('User does not exist');
    }
    else{
        const result = await checkIfIsMember(username);
        res.status(StatusCodes.OK).json(result);
    }
});