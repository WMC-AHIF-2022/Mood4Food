import express from "express";
import { join } from "path";
import cors from "cors";
import { foodRouter } from "./router/food-router";

// create express application
const app = express();
app.use(express.json());
app.use(cors());

app.use("/food", foodRouter);

const path = join(__dirname, '../client');
app.use(express.static(path));

// start http server
const port:number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});