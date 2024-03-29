import express from "express";
import { join } from "path";
import cors from "cors";
import { foodlistRouter } from "./router/foodlist-router";
import {orderDayRouter} from "./router/order-day-router";
import {entryRouter} from "./router/orderentry-router";
import {foodRouter} from "./router/food-router";
import {userRouter} from "./router/user-router";

// create express application

const app = express();

const path = join(__dirname, "../client");
const options = { extensions: ["html"] };
app.use(cors());
app.use(express.json())
app.use(express.static(path, options));

app.use("/food", foodlistRouter);
app.use("/orderDay", orderDayRouter);
app.use("/orderEntry", entryRouter);
app.use("/foodObject", foodRouter);
app.use("/user", userRouter);


// start http server
const port:number = 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});