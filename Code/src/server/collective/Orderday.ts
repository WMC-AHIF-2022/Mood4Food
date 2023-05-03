import {OrderEntry} from "./Order";

export class OrderDay {
    private id: number;
    private _orderDate: Date;
    private _deadLine: Date;

    constructor(id: number, orderDate: Date, deadLine: Date, orderList?: Map<number,OrderEntry>) {
        this.id = id;
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