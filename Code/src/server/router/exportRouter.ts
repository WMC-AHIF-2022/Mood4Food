import express, {response} from "express";
import { DB } from "../database";
import { StatusCodes } from "http-status-codes";
import {generateFile} from "../collective/export-repository";
import fs from "fs";
import path from "path";

//create router
export const exportRouter = express.Router();

exportRouter.get("/pdf", async(req, res)=>{
    await generateFile();
    res.sendStatus(StatusCodes.OK);
});