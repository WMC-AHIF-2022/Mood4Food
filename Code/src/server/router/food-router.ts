import express, {response} from "express";
import { Food } from "../collective/Food";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import path from "path";

const foodList: Food[] = [];

//create router
export const foodRouter = express.Router();

foodRouter.get("/:id", (request, response)=>{
    response.status(StatusCodes.OK).redirect("./");
});