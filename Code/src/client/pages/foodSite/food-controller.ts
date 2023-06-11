import { OrderEntry } from "../../../server/collective/OrderEntry.js";
import {fetchRestEndpoint} from "../../utils/client-server.js";

interface Food {
    id: number,
    name: string,
    ingredients: string
}
const btnLogout = document.getElementById('logoutButton')as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})
const btnAddMealToOrderday = document.getElementById('addToOrderDay')as HTMLButtonElement;

 btnAddMealToOrderday.addEventListener("click", () => {
     addingMeal();
})
async function addingMeal(){
    
    let idElement = document.getElementById('numberForm');     
    if(sessionStorage.getItem('orderDayID') !== '-1' && sessionStorage.getItem('userID') !== '-1'){
        let userID = sessionStorage.getItem('userID');
        let orderDayID = sessionStorage.getItem('orderDayID');
        let foodID = Number.parseInt(idElement!.innerHTML);
        let newOrderEntry:any;       
        if(userID !== null && orderDayID!== null){
        newOrderEntry = 
            {
            odID: `${orderDayID}`,
            customerID: `${userID}`,
            mealID: `${foodID}`
            };
        }      
       
       let allOrderEntrysPromis = await fetch('http://localhost:3000/orderentries/simple');
       let allOrderEntrys:any []= await allOrderEntrysPromis.json();       
       let alreadyEntry = -1;
       for(let i = 0; i < allOrderEntrys.length;i++){
        if(allOrderEntrys[i] !== undefined){            
            const parsedObject: OrderEntry = {
                name: allOrderEntrys[i].customerID.toString(),
                food: allOrderEntrys[i].mealID.toString(),
                date: allOrderEntrys[i].orderDayID.toString(),
            };
            if(parsedObject.name == newOrderEntry!.customerID && parsedObject.date == newOrderEntry!.odID){
                alreadyEntry = allOrderEntrys[i].id;                
                i = allOrderEntrys.length+1;
            }        
        }
       }       
       if(alreadyEntry === -1){        
        let theResult = await fetchRestEndpoint('http://localhost:3000/orderentries','POST',newOrderEntry);
        console.log(theResult);
        alert('Speiße wurde hinzugefügt');
       }
       else{        
        let theResult = await fetchRestEndpoint(`http://localhost:3000/orderentries/${alreadyEntry}`,'PUT',newOrderEntry);
        alert('Speiße wurde erneuert');
       }
       /*
       let theResult = fetchRestEndpoint('http://localhost:3000/orderentries','POST',newOrderEntry);
       console.log(theResult);
       sessionStorage.setItem('userID','-1');
       sessionStorage.setItem('orderDayID','-1');*/
    }
}
window.onload = async() => {
    //alert(sessionStorage.getItem('selectedFoodItem'));
    if(sessionStorage.getItem('orderDayID') !== '-1' && sessionStorage.getItem('userID') !== '-1'){        
        btnAddMealToOrderday.disabled;
    }
    const header = document.getElementById('contentHeader') as HTMLDivElement;
    const numberForm = document.getElementById('numberForm') as HTMLAnchorElement;
    const nameForm = document.getElementById('nameForm') as HTMLAnchorElement;
    const ingredientsBox = document.getElementById('ingredients') as HTMLDivElement;
    const returnBtn = document.getElementById('returnLnk') as HTMLAnchorElement;

    returnBtn.addEventListener('click', ()=>{
        window.location.href = "/pages/foodlistSite/";
    })

    const food: Food = await getFoodById(sessionStorage.getItem('selectedFoodItem')as string)as Food;
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