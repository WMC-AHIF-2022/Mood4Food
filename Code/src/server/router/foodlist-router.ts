import express, {response} from "express";
import { Food } from "../collective/Food";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";

const foodList: Food[] = [];

//create router
export const foodlistRouter = express.Router();

//return all meals
foodlistRouter.get("/", async(request, response) => {
    const db = await DB.createDBConnection();
    const meals: Food[] = await db.all<Food[]>('select * from food');
    await db.close();

    response.status(StatusCodes.OK).json(meals);
});
//s
//return one meal
foodlistRouter.get("/:id", async(req, res) => {
    const id: number = Number(req.params.id);

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select * from food where id = ?1');
    await stmt.bind({1: id});
    const meal: Food | undefined = await stmt.get<Food>();
    await stmt.finalize();
    await db.close();

    if(meal === undefined){
        res.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    res.status(StatusCodes.OK).json(meal);
});

//return one meal
foodlistRouter.get("/:id/amount", async(req, res) => {
    const id: number = Number(req.params.id);

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('select count(oe.id) as "value" from food f LEFT OUTER JOIN orderentry oe ON (f.id = oe.mealID) GROUP BY f.name HAVING f.id = ?1');
    await stmt.bind({1: id});
    const amount: string | undefined = await stmt.get<string>();
    await stmt.finalize();
    await db.close();

    if(amount === undefined){
        res.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    res.status(StatusCodes.OK).json(amount);
});

// add meal
foodlistRouter.post("/", async(req, res) => {
    const number: any = req.body.number;
    const name: any = req.body.name;
    const ingredients: any = req.body.ingredients;
    if (typeof number !== "string" || number.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof name !== "string" || name.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof ingredients !== "string" || ingredients.trim().length === 0) {
        res.status(StatusCodes.BAD_REQUEST).send("ingredients missing or not ok");
        return;
    }
    const db = await DB.createDBConnection();

    // standard process
    const stmt = await db.prepare('insert or ignore into Food (id, name, ingredients) values (?1, ?2, ?3)');
    await stmt.bind({1:number, 2: name, 3: ingredients});
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

// update meal
foodlistRouter.put("/:id", async(request, response) => {
    const id: number = Number(request.params.id);
    const name: any = request.body.name;
    const ingredients: any = request.body.ingredients;
    if (typeof name !== "string" || name.trim().length === 0) {
        response.status(StatusCodes.BAD_REQUEST).send("name missing or not ok");
        return;
    }
    if (typeof ingredients !== "string" || ingredients.trim().length === 0) {
        response.status(StatusCodes.BAD_REQUEST).send("ingredients missing or not ok");
        return;
    }

    const db = await DB.createDBConnection();
    const stmt = await db.prepare('update or replace Food set name = ?1, ingredients = ?2 where id = ?3');
    await stmt.bind({
        1: name,
        2: ingredients,
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

// delete all meals
foodlistRouter.delete("/", async(request, response) => {
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from food');
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
foodlistRouter.delete("/:id", async(request, response) => {
    const index: number = parseInt(request.params.id);
    if (isNaN(index) || index < 0) {
        response.sendStatus(StatusCodes.NOT_FOUND);
        return;
    }
    const db = await DB.createDBConnection();
    const stmt = await db.prepare('delete from food where id = ?1');
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