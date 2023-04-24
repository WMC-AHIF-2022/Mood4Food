import {Food} from "./Food";
import {Person} from "./Person";

export interface OrderEntry {
    id: number,
    food: Food,
    person: Person
}