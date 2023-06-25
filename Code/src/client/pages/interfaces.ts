export interface User {
    username: string,
    password: string,
    lastname: string,
    firstname: string,
    classMember: boolean,
    teacher?: number
}

export interface OrderDay {
    id: number,
    orderDate: string,
    deadline: string
}

export interface OrderEntry {
    username: string,
    mealID: string,
    orderDayID: string
}

export class Food {
    private id: number;
    public name: string;
    private ingredients: string;

    constructor(id: number, name: string, ingredients: string) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
    }

    getIngredientsList():String[]{
        return this.ingredients.trim().split(';');
    }
}