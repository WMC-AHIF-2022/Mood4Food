/*
export interface Food {
    id: number,
    name: String,
    ingredients: String
}
 */

export class Food {
    private id: number;
    private name: String;
    private ingredients: String;

    constructor(id: number, name: String, ingredients: String) {
        this.id = id;
        this.name = name;
        this.ingredients = ingredients;
    }

    getIngredientsList():String[]{
        return this.ingredients.trim().split(';');
    }
}