import {OrderEntry} from "./OrderEntry";

export class OrderDay {
    private _orderDate: Date;
    private _deadLine: Date;

    constructor(orderDate: Date, deadLine: Date, orderList?: Map<number,OrderEntry>) {
        this._orderDate = orderDate;
        this._deadLine = deadLine;
    }

    get orderDate(): Date {
        return this._orderDate;
    }

    get deadLine(): Date {
        return this._deadLine;
    }
}