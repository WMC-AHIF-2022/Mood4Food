import express, {response} from "express";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import {OrderEntry} from "../collective/OrderEntry";

//create router
export const entryRouter = express.Router();

//return all orderEntries
entryRouter.get("/", async(request,response) => {
    const db = await DB.createDBConnection();
    const orders: OrderEntry = await db.all<OrderEntry>("select c.lastname || ' ' || c.firstname as name, f.name as food, od.orderDate as date " +
        "FROM orderEntry oe " +
        "INNER JOIN customer c ON (oe.customerID = c.id)" +
        "INNER JOIN food f ON (oe.mealID = f.id)" +
        "INNER JOIN orderDay od ON (oe.orderDayID = od.id)");
    await db.close();

    response.status(StatusCodes.OK).json(orders);
});

//return one orderEntry
entryRouter.get("/:id", async(req, res) => {
    const id: number = Number(req.params.id);

    const db = await DB.createDBConnection();
    const stmt = await db.prepare("select c.lastname || ' ' || c.firstname as name, f.name as food, od.orderDate as date " +
        "FROM orderEntry oe " +
        "INNER JOIN customer c ON (oe.customerID = c.id)" +
        "INNER JOIN food f ON (oe.mealID = f.id)" +
        "INNER JOIN orderDay od ON (oe.orderDayID = od.id)" +
        "WHERE oe.id = ?1");
    await stmt.bind({1: id});
    const entry: OrderEntry | undefined = await stmt.get<OrderEntry>();
    await stmt.finalize();
    await db.close();

    if(entry === undefined){
        res.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    res.status(StatusCodes.OK).json(entry);
});

// add orderEntry TODO: it's undone
entryRouter.post("/", async(req, res) => {
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

// update orderEntry TODO: it's undone
entryRouter.put("/:id", async(request, response) => {
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

// delete all orderEntries TODO: solve interruption TODO: it's undone
entryRouter.delete("/", async(request, response) => {
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

//delete one orderEntry TODO: it's undone
entryRouter.delete("/:id", async(request, response) => {
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