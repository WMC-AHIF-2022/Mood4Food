/*
export interface Food {
    id: number,
    name: String,
    ingredients: String
}
 */

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