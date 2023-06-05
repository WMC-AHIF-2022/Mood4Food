import express from "express";
import {StatusCodes} from "http-status-codes";
import {addUser, getAllUsers, isAuthorized, isTeacher} from "../collective/user-repository";
import {User} from "../collective/user";

export const userRouter = express.Router();

userRouter.post("/signup", async function (request, response) {
    const username: string = request.body.username;
    const password: string = request.body.password;
    const teacher: number = request.body.teacher;

    if (password.trim().length === 0){
        response.sendStatus(StatusCodes.BAD_REQUEST);
        return;
    }

    const user: User = {
        id: -1,
        username: username,
        password: password,
        teacher: teacher
    }
    try {
        await addUser(user);
        response.sendStatus(StatusCodes.OK);
    }
    catch (e) {
        response.sendStatus(StatusCodes.BAD_REQUEST);
    }
});

userRouter.post("/login", async (request, response) => {
    const username: string = request.body.username;
    const password: string = request.body.password;

    const user: User = {
        id: -1,
        username: username,
        password: password
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

userRouter.get("/", async (request, response) => {
    const users = await getAllUsers();
    response.status(StatusCodes.OK).json(users);
})