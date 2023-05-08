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

// add orderDate
orderDayRouter.post("/", async(req, res) => {
    const orderdate: any = req.body.orderdate;
    const deadline: any = req.body.deadline;
    console.log(orderdate,deadline);
    if (typeof orderdate !== "string" || orderdate.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("date missing or not ok");
        return;
    }
    if (typeof deadline !== "string" || deadline.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("time missing or not ok");
        return;
    }
    const db = await DB.createDBConnection();
    // id selection
    const stmt1 = await db.prepare('select count(*) as "count" from Orderday');
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
        const stmt2 = await db.prepare('select id from orderday order by id desc limit 1');
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
    const stmt = await db.prepare('insert or ignore into OrderDay values (?1, DATE(?2), TIME(?3))');
    await stmt.bind({1:id, 2: orderdate, 3: deadline});
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

// updates an orderDate
orderDayRouter.put("/:id", async(request, response) => {
    const id: number = Number(request.params.id);
    const date: any = request.body.orderdate;
    const time: any = request.body.deadline;
    if (typeof date !== "string" || date.trim().length === 0) {
        response.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof time !== "string" || time.trim().length === 0) {
        response.status(StatusCodes.BAD_REQUEST).send("ingredients missing or not ok");
        return;
    }

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('update or replace OrderDay set orderdate = ?1, deadline = ?2 where id = ?3');
    await stmt.bind({
        1: date,
        2: time,
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

// delete all orderDays
orderDayRouter.delete("/", async(request, response) => {
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from orderDay');
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

///deletes the orderDay at the given index
orderDayRouter.delete("/:id", async(request, response) => {
    const index: number = parseInt(request.params.id);
    if (isNaN(index) || index < 0) {
        response.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from orderDay where id = ?1');
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