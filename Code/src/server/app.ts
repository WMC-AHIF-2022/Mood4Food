import express from "express";
import { join } from "path";
import cors from "cors";
import { foodRouter } from "./router/food-router";
import {customerRouter} from "./router/customer-router";
import {orderDayRouter} from "./router/order-day-router";
import {entryRouter} from "./router/orderentry-router";

// create express application
const app = express();
app.use(express.json());
app.use(cors());

app.use("/food", foodRouter);
app.use("/customer", customerRouter);
app.use("/orderday", orderDayRouter);
app.use("/orderentry", entryRouter);

const path = join(__dirname, '../client');
app.use(express.static(path));

// start http server
const port:number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});