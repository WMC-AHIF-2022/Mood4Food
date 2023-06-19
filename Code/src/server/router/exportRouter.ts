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
    console.log(path.join(__dirname,"..\\collective\\files"));
    var stream = fs.createReadStream(path.join(__dirname,"..\\collective\\files"));
    var filename = "test.pdf";
    // Be careful of special characters

    filename = encodeURIComponent(filename);
    // Ideally this should strip them

    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    stream.pipe(res);
});