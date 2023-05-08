import express from "express";
import { join } from "path";
import cors from "cors";
import { foodRouter } from "./router/food-router";
import {customerRouter} from "./router/customer-router";
import {orderDayRouter} from "./router/order-day-router";
import {entryRouter} from "./router/orderentry-router";

// create express application

const app = express();

const path = join(__dirname, "../client");
const options = { extensions: ["html"] };
app.use(cors());
app.use(express.json())
app.use(express.static(path, options));

app.use("/food", foodRouter);
app.use("/customer", customerRouter);
app.use("/orderday", orderDayRouter);
app.use("/orderentry", entryRouter);


// start http server
const port:number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});