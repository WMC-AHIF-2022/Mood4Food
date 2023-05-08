import express, {response} from "express";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import {Person} from "../collective/Person";

const personList: Person[] = [];

//create router
export const customerRouter = express.Router();

//return all customers
customerRouter.get("/", async(request,response) => {
    const db = await DB.createDBConnection();
    const persons: Person[] = await db.all<Person[]>('select * from customer');
    await db.close();

    response.status(StatusCodes.OK).json(persons);
});

//return one customer
customerRouter.get("/:id", async(req, res) => {
    const id: number = Number(req.params.id);

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select * from customer where id = ?1');
    await stmt.bind({1: id});
    const person: Person | undefined = await stmt.get<Person>();
    await stmt.finalize();
    await db.close();

    if(person === undefined){
        res.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    res.status(StatusCodes.OK).json(person);
});

// add customer
customerRouter.post("/", async(req, res) => {
    const firstname: any = req.body.firstname;
    const lastname: any = req.body.lastname;
    if (typeof firstname !== "string" || firstname.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof lastname !== "string" || lastname.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    const db = await DB.createDBConnection();
    // id selection
    const stmt1 = await db.prepare('select count(*) as "count" from Customer');
    const result1 : { count: number } | undefined = await stmt1.get();
    await stmt1.finalize();
    if(typeof result1 == "undefined"){
        res.status(StatusCodes.CONFLICT).send('Error during id selection');
        return;
    }

    if(result1.count == 0){
        result1.count = 1;
    }
    else{
        const stmt2 = await db.prepare('select id from customer order by id desc limit 1');
        const result2 = await stmt2.get();
        await stmt2.finalize();
        if(typeof result2 == "undefined"){
            res.status(StatusCodes.CONFLICT).send('Error during id selection');
            return;
        }
        result1.count = result2.count++;
    }

    const id = result1.count;
    console.log(id);

    // standard process
    const stmt = await db.prepare('insert or ignore into Customer (id, firstname, lastname) values (?1, ?2, ?3)');
    await stmt.bind({1:id, 2: firstname, 3: lastname});
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();

    if(operationResult.changes == null || operationResult.changes !== 1){
        res.status(StatusCodes.BAD_REQUEST).send("db error occurred");
    }
    else{
        res.status(StatusCodes.CREATED).json({id: operationResult.lastID});
    }
});

// update customer
customerRouter.put("/:id", async(request, response) => {
    const id: number = Number(request.params.id);
    const firstname: any = request.body.firstname;
    const lastname: any = request.body.lastname;
    if (typeof firstname !== "string" || firstname.trim().length === 0) {
        response.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof lastname !== "string" || lastname.trim().length === 0) {
        response.status(StatusCodes.BAD_REQUEST).send("ingredients missing or not ok");
        return;
    }

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('update or replace Customer set firstname = ?1, lastname = ?2 where id = ?3');
    await stmt.bind({
        1: firstname,
        2: lastname,
        3: id
    });
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();

    if(operationResult.changes == null || operationResult.changes !== 1){
        response.status(StatusCodes.BAD_REQUEST);
    }
    else{
        response.sendStatus(StatusCodes.ACCEPTED);
    }
});

// delete all meals TODO: solve interruption TODO: OLD
customerRouter.delete("/", async(request, response) => {
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('drop table food');
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();
    if(operationResult.changes == null || operationResult.changes !== 1){
        response.status(StatusCodes.BAD_REQUEST);
    }
    else{
        response.sendStatus(StatusCodes.ACCEPTED);
    }
});

//delete one meal
customerRouter.delete("/:id", async(request, response) => {
    const index: number = parseInt(request.params.id);
    if (isNaN(index) || index < 0) {
        response.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from customer where id = ?1');
    await stmt.bind({1:index});
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();
    if(operationResult.changes == null || operationResult.changes !== 1){
        response.status(StatusCodes.BAD_REQUEST);
    }
    else{
        response.sendStatus(StatusCodes.ACCEPTED);
    }
});