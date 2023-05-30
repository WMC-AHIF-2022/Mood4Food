import {fetchRestEndpoint} from "../../utils/client-server.js";

interface Food {
    id: number,
    name: string,
    ingredients: string
}

window.onload = async() => {
    //alert(sessionStorage.getItem('selectedFoodItem'));
    const header = document.getElementById('contentHeader') as HTMLDivElement;
    const numberForm = document.getElementById('numberForm') as HTMLAnchorElement;
    const nameForm = document.getElementById('nameForm') as HTMLAnchorElement;
    const ingredientsBox = document.getElementById('ingredients') as HTMLDivElement;
    const returnBtn = document.getElementById('returnLnk') as HTMLAnchorElement;

    returnBtn.addEventListener('click', ()=>{
        window.location.href = "/pages/foodlistSite/";
    })

    const food: Food = await getFoodById(sessionStorage.getItem('selectedFoodItem'));
    const ingredients: string[] = getAllIngredients(food.ingredients);
    let html = "";

    for(let x = 0; x < ingredients.length; x++){
        html += `<div class="ingredient">${ingredients[x]}</div>`;
    }

    header.innerText = food.name;
    numberForm.innerText = `${food.id}`;
    nameForm.innerText = food.name;
    ingredientsBox.innerHTML = html;

};

function getAllIngredients(text: string): string[]{
    let ingredients:string[] = text.split(',');

    for(let x = 0; x < ingredients.length; x++){
        ingredients[x] = ingredients[x].trim();
    }

    return ingredients;
}

async function getFoodById(id: string){
    try {
        const response = await fetchRestEndpoint(`http://localhost:3000/food/${id}`, "GET");
        const food: Food = await response.json();
        return food;
    }
    catch (e) {
        console.log(e);
    }
}