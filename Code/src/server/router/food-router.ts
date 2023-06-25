import express, {response} from "express";
import { Food } from "../collective/Food";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import path from "path";

const foodList: Food[] = [];

//create router
export const foodRouter = express.Router();

foodRouter.get("/:id", async(request, response)=>{
    const id = request.params.id;
    const db = await DB.createDBConnection();
    const orders: Food[] = await db.all<Food[]>(`select * from food where id = ${id}`);
    await db.close();
    response.status(StatusCodes.OK).send(orders);
});

foodRouter.get("/", async(request, response)=>{
    const db = await DB.createDBConnection();
    const orders: Food[] = await db.all<Food[]>("select * from food");
    await db.close();
    response.status(StatusCodes.OK).json(orders)
});

foodRouter.get("/orders/:id", async(req, res)=>{
    const id = req.params.id;

    const db = await DB.createDBConnection();
    const stmt = await db.prepare("select u.username as 'customer',od.orderdate as 'date' from orderentry oe INNER JOIN users u ON (oe.customerID = u.id) INNER JOIN orderday od ON (oe.orderDayID = od.id) where mealID = ?1;");
    await stmt.bind({1: id});
    const result: {customer: string, date: string}[] = await stmt.all<{customer: string, date:string}[]>();
    await stmt.finalize();
    await db.close();
    res.status(StatusCodes.OK).json(result);
});