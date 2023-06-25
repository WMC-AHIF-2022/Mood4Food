import express, {response} from "express";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import {OrderEntry} from "../collective/OrderEntry";

//create router
export const entryRouter = express.Router();

entryRouter.get("/simple", async(request,response) => {    
    const db = await DB.createDBConnection();
    const orders: OrderEntry[] = await db.all<OrderEntry[]>("select * from orderEntry");
    await db.close();
    response.status(StatusCodes.OK).json(orders);
});

entryRouter.get("/allOrdersOnDay/:id", async(request, response) =>{
    const id = request.params.id;
    const db = await DB.createDBConnection();
    const statement = await db.prepare('select oe.id, u.firstname,u.lastname,f.name from orderentry oe INNER JOIN food f ON (f.id = oe.mealID) INNER JOIN user u ON (u.username = oe.username) where oe.orderDayID = ?1;');
    await statement.bind({1: id});

    const allOrders:{id: number,firstname:string, lastname:string,food:string}[] = await statement.all<{id:number, firstname:string, lastname:string,food:string}[]>();
    await statement.finalize();
    await db.close();
    response.status(StatusCodes.OK).json(allOrders);
})
//return all orderEntries
entryRouter.get("/", async(request,response) => {
    const db = await DB.createDBConnection();
    const orders: OrderEntry = await db.all<OrderEntry>("select c.username as name, f.name as food, od.orderDate as date " +
        "FROM orderEntry oe " +
        "INNER JOIN user c ON (oe.username = c.username)" +
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
        "INNER JOIN user c ON (oe.username = c.username)" +
        "INNER JOIN food f ON (oe.mealID = f.id)" +
        "INNER JOIN orderDay od ON (oe.orderDayID = od.id) where oe.id = ?1");
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

// add orderEntry
entryRouter.post("/", async(req, res) => {
    const odID: any = req.body.odID;
    const username: any = req.body.username;
    const mealID: any = req.body.mealID;
    if (typeof odID !== "string" || odID.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof username !== "string" || username.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof mealID !== "string" || mealID.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }

    const db = await DB.createDBConnection();
    // id selection
    const stmt1 = await db.prepare('select count(*) as "count" from OrderEntry');    
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
        const stmt2 = await db.prepare('select id from OrderEntry order by id desc limit 1');
        const result2 = await stmt2.get();
        await stmt2.finalize();        
        if(typeof result2 == "undefined"){
            res.status(StatusCodes.CONFLICT).send('Error during id selection');
            return;
        }
        let theID:number=result2.id + 1;        
        result1.count = theID;
    }    
    const id = result1.count;

    //check if odID, customerID and mealID exist
    //odID
    let temp = await db.prepare('select count(*) as count from OrderDay where id = ?1');
    await temp.bind({1:odID});
    const odResult = await temp.get();
    await temp.finalize();

    //customerID
    temp = await db.prepare('select count(*) as count from user where username = ?1');
    await temp.bind({1:username});
    const customerResult = await temp.get();
    await temp.finalize();

    //mealID
    temp = await db.prepare('select count(*) as count from Food where id = ?1');
    await temp.bind({1:mealID});
    const mealResult = await temp.get();
    await temp.finalize();
    if(typeof odResult == "undefined" || typeof customerResult == "undefined" || typeof mealResult == "undefined"){
        return;
    }
    if(odResult.count == 0){
        res.status(StatusCodes.BAD_REQUEST).send("orderDay-ID is not appropriate");
        return;
    }    
    if(customerResult.count == 0){
        res.status(StatusCodes.BAD_REQUEST).send("customer-ID is not appropriate");
        return;
    }
    if(mealResult.count == 0){
        res.status(StatusCodes.BAD_REQUEST).send("meal-ID is not appropriate");
        return;
    }
    
    // standard process
    
    
    const stmt = await db.prepare('insert  into OrderEntry (id, orderDayID, username, mealID) values (?1, ?2, ?3, ?4)');
    await stmt.bind({1:id, 2: odID, 3: username, 4: mealID});
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

// update orderEntry
entryRouter.put("/:id", async(req, res) => {
    const id: number = Number(req.params.id);
    const odID: any = req.body.odID;
    const username: any = req.body.username;
    const mealID: any = req.body.mealID;
    if (typeof odID !== "string" || odID.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof username !== "string" || username.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof mealID !== "string" || mealID.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }

    const db = await DB.createDBConnection();

    //check if odID, customerID and mealID exist
    //odID
    let temp = await db.prepare('select count(*) as count from OrderDay where id = ?1');
    await temp.bind({1:odID});
    const odResult = await temp.get();
    await temp.finalize();

    //customerID
    temp = await db.prepare('select count(*) as count from User where username = ?1');
    await temp.bind({1:username});
    const customerResult = await temp.get();
    await temp.finalize();

    //mealID
    temp = await db.prepare('select count(*) as count from Food where id = ?1');
    await temp.bind({1:mealID});
    const mealResult = await temp.get();
    await temp.finalize();
    if(typeof odResult == "undefined" || typeof customerResult == "undefined" || typeof mealResult == "undefined"){
        return;
    }
    if(odResult.count == 0){
        
        res.status(StatusCodes.BAD_REQUEST).send("orderDay-ID is not appropriate");
        return;
    }
    if(customerResult.count == 0){
        res.status(StatusCodes.BAD_REQUEST).send("username is not appropriate");
        return;
    }
    if(mealResult.count == 0){
        
        res.status(StatusCodes.BAD_REQUEST).send("meal-ID is not appropriate");
        return;
    }

    const stmt = await db.prepare('update or replace OrderEntry set orderDayID = ?1, username = ?2, mealID = ?3 where id = ?4');
    await stmt.bind({
        1: odID,
        2: username,
        3: mealID,
        4: id
    });
    const operationResult = await stmt.run();
    await stmt.finalize();
    await db.close();

    if(operationResult.changes == null || operationResult.changes !== 1){
        
        res.status(StatusCodes.BAD_REQUEST).json();
    }
    else{
        
        res.sendStatus(StatusCodes.ACCEPTED);
    }
});

// delete all orderEntries
entryRouter.delete("/", async(request, response) => {
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from orderEntry');
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
 
//delete one orderEntry
entryRouter.delete("/:id", async(request, response) => {
    const index: number = parseInt(request.params.id);
    if (isNaN(index) || index < 0) {
        response.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from orderEntry where id = ?1');
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