import express, {response} from "express";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import {OrderDay} from "../collective/Orderday";


//create router
export const orderDayRouter = express.Router();

//return all orderDays
orderDayRouter.get("/", async(request, response) => {
    const db = await DB.createDBConnection();
    const orderDays: OrderDay[] = await db.all<OrderDay[]>('select * from OrderDay');
    await db.close();

    response.status(StatusCodes.OK).json(orderDays);
});

//return one orderDay
orderDayRouter.get("/:id", async(req, res) => {
    const id: number = Number(req.params.id);

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select * from orderDay where id = ?1');
    await stmt.bind({1: id});
    const orderDay: OrderDay | undefined = await stmt.get<OrderDay>();
    await stmt.finalize();
    await db.close();

    if(orderDay === undefined){
        res.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    res.status(StatusCodes.OK).json(orderDay);
});

// add customer TODO: OLD
orderDayRouter.post("/", async(req, res) => {
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
    const id : { count: number } | undefined = await stmt1.get();
    await stmt1.finalize();
    if(typeof id == "undefined"){
        res.status(StatusCodes.CONFLICT).send('Error during id selection');
        return;
    }
    console.log(id.count);

    // standard process
    const stmt = await db.prepare('insert or ignore into Customer (id, firstname, lastname) values (?1, ?2, ?3)');
    await stmt.bind({1:id.count, 2: firstname, 3: lastname});
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

// update customer TODO: OLD
orderDayRouter.put("/:id", async(request, response) => {
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
orderDayRouter.delete("/", async(request, response) => {
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

//delete one meal TODO: OLD
orderDayRouter.delete("/:id", async(request, response) => {
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