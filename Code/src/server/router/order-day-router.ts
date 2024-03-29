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

orderDayRouter.get("/foodAndAmount/:id", async (req, res)=>{
    const id = req.params.id;
    const db = await DB.createDBConnection();
    const stmt = await db.prepare("select f.name as 'food', count(oe.mealID) as 'amount' from orderentry oe INNER JOIN food f ON (oe.mealID = f.id) where oe.orderDayID = ?1 GROUP BY f.name");
    await stmt.bind({1:id});
    const mealOrders: {food: String, amount: number}[] | undefined = await stmt.all();
    await stmt.finalize();
    await db.close();

    if(mealOrders === undefined){
        res.sendStatus(StatusCodes.NOT_FOUND);
    }
    res.status(StatusCodes.OK).json(mealOrders);
});

// add orderDate
orderDayRouter.post("/", async(req, res) => {
    const orderdate: any = req.body.orderdate;
    const deadline: any = req.body.deadline;
    //console.log(orderdate,deadline);
    if (typeof orderdate !== "string" || orderdate.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("date missing or not ok");
        return;
    }
    if (typeof deadline !== "string" || deadline.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("time missing or not ok");
        return;
    }
    const db = await DB.createDBConnection();
    let id = 1;
    // id selection
    const stmt1 = await db.prepare('select count(*) as count from orderday');//select id from orderday order by 1 desc limit 1
    //console.log(await stmt1.get());
    const result1 = await stmt1.get();
    await stmt1.finalize();
    if(result1.count != 0){
        //console.log("that's not the first one");
        const stmt2 = await db.prepare('select id as count from orderday order by 1 desc limit 1');
        const result2 = await stmt2.get();
        await stmt2.finalize();
        id = result2.count + 1;
    }
    if(typeof result1 == "undefined"){
        res.status(StatusCodes.CONFLICT).send('Error during id selection');
        return;
    }

    /*
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
    */
    //console.log(id);

    // standard process
    const stmt = await db.prepare('insert or ignore into OrderDay values (?1, ?2, ?3)');
    //console.log(await stmt.bind());
    await stmt.bind({1:id, 2: orderdate, 3: deadline});
    //console.log(await stmt.finalize());
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();   

    //console.log(operationResult.changes);
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