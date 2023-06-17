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