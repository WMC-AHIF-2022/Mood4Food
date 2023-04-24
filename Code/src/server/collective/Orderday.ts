import {OrderEntry} from "./Order";

export class OrderDay {
    private id: number;
    private _orderDate: Date;
    private _deadLine: Date;
    private _orderList: Map<number, OrderEntry>;

    constructor(id: number, orderDate: Date, deadLine: Date, orderList?: Map<number,OrderEntry>) {
        this.id = id;
        this._orderDate = orderDate;
        this._deadLine = deadLine;
        if(orderList != undefined){
            this._orderList = orderList;
        }
        else{
            this._orderList = new Map<number, OrderEntry>();
        }
    }

    get orderDate(): Date {
        return this._orderDate;
    }


    get deadLine(): Date {
        return this._deadLine;
    }

    addOrder(value: OrderEntry) {
        if(!this._orderList.has(value.id)){
            this._orderList.set(value.id, value);
        }
    }

    toString(){
        return `This OrderDay has ${this._orderList.size} order/s!`;
    }
}