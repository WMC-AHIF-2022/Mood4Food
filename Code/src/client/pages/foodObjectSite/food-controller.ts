
import {fetchRestEndpoint} from "../../utils/client-server.js";
import {OrderEntry} from "../interfaces";

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

 btnAddMealToOrderday.addEventListener ("click", async() => {
     await addingMeal();
})

async function addingMeal(){
    
    let idElement = document.getElementById('numberForm');     
    if(sessionStorage.getItem('orderDayID') !== '-1' && sessionStorage.getItem('web-user') !== '-1'){
        let username = sessionStorage.getItem('web-user');
        let orderDayID = sessionStorage.getItem('orderDayID');
        let foodID = Number.parseInt(idElement!.innerHTML);
        let newOrderEntry:any;  
            
        if(username !== null && orderDayID!== null){
        newOrderEntry = 
            {
            odID: `${orderDayID}`,
            username: `${username}`,
            mealID: `${foodID}`
            };
        }      
       
       let allOrderEntrysPromis = await fetch('http://localhost:3000/orderentry/simple');
       let allOrderEntrys:any []= await allOrderEntrysPromis.json();       
       let alreadyEntry = -1;
       for(let i = 0; i < allOrderEntrys.length;i++){
        if(allOrderEntrys[i] !== undefined){            
            const parsedObject: OrderEntry = {
                username: allOrderEntrys[i].username.toString(),
                mealID: allOrderEntrys[i].mealID.toString(),
                orderDayID: allOrderEntrys[i].orderDayID.toString(),
            };
            
            if(parsedObject.username == newOrderEntry!.username && parsedObject.orderDayID == newOrderEntry!.odID){
                alreadyEntry = allOrderEntrys[i].id;                
                i = allOrderEntrys.length+1;
            }        
        }
       }       
       if(alreadyEntry === -1){
           console.log(newOrderEntry);
           let theResult = await fetchRestEndpoint('http://localhost:3000/orderEntry','POST',newOrderEntry);

           alert('Speise wurde hinzugefügt');
       }
       else{        
        let theResult = await fetchRestEndpoint(`http://localhost:3000/orderEntry/${alreadyEntry}`,'PUT',newOrderEntry);
        alert('Speise wurde erneuert');
       }       
       sessionStorage.setItem('orderDayID','-1');
       window.location.href = '../OrderSite/index.html';
       /*
       
       
       let theResult = fetchRestEndpoint('http://localhost:3000/orderentries','POST',newOrderEntry);
       console.log(theResult);
       sessionStorage.setItem('userID','-1');
       sessionStorage.setItem('orderDayID','-1');*/
    }
}

let curObjectID:string = "";

window.onload = async() => {
    curObjectID = sessionStorage.getItem('selectedFoodItem');
    const isTeacher = sessionStorage.getItem("web-isTeacher") === "true";
     const orderdayid = sessionStorage.getItem("orderDayID");
     //console.log(orderdayid);
    if(isTeacher || orderdayid === null || orderdayid === '-1'){
        btnAddMealToOrderday.remove();
    }
    const header = document.getElementById('contentHeader') as HTMLDivElement;
    const numberForm = document.getElementById('numberForm') as HTMLAnchorElement;
    const nameForm = document.getElementById('nameForm') as HTMLAnchorElement;
    const ingredientsBox = document.getElementById('ingredients') as HTMLDivElement;
    const returnBtn = document.getElementById('returnLnk') as HTMLAnchorElement;
    const orderListBox: HTMLDivElement = document.getElementById('orderList') as HTMLDivElement;

    returnBtn.addEventListener('click', ()=>{
        window.location.href = "/pages/foodlistSite/";
    })

    const food: Food = await getFoodById(curObjectID)as Food;
    const ingredients: string[] = getAllIngredients(food.ingredients);
    let html = "";
    

    for(let x = 0; x < ingredients.length; x++){
        html += `<div class="ingredient">${ingredients[x]}</div>`;
    }

    header.innerText = food.name;
    numberForm.innerText = `${food.id}`;
    nameForm.innerText = food.name;
    ingredientsBox.innerHTML = html;
    html = "";

    const response = await fetchRestEndpoint(`http://localhost:3000/foodObject/orders/${curObjectID}`, "GET");
    const orderRequests: {customer: string, date:string}[] = await response.json();
    for(let x = 0; x < orderRequests.length; x++){
        const date = new Date(orderRequests[x].date);
        html += `<div class="orderRequest">${orderRequests[x].customer} has ordered this meal for ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}</div>`;
    }
    orderListBox.innerHTML = html;
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