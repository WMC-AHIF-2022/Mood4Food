
<<<<<<< HEAD
const home_URLL = "http://localhost:3000/orderdays";

///Updates the meal-table by fetching the data from the server
async function refresh1(){
    console.log(home_URLL)

    const response = await fetch(home_URLL);
=======
const home_URL = "http://localhost:3000/orderday";

///(needs to be updated)Updates the meal-table by fetching the data from the server
async function refresh(){
    const response = await fetch(home_URL);
>>>>>>> 6cc63d1c9205a722e56e31e7e22fb00c09f0f0f1

    if(response.ok){
        const meals = await response.json();
        /*
        const tableBody: HTMLTableSectionElement = document.getElementById('') as HTMLTableSectionElement;
        tableBody.innerHTML = '';
        for(let i = 0; i < meals.length; i++){
            const row = document.createElement("tr");
            tableBody.appendChild(row);
            row.insertCell(0).innerHTML = `${meals[i].id}`;
            row.insertCell(1).innerHTML = `${meals[i].name}`;
            row.insertCell(2).innerHTML = `0`;
            row.insertCell(3).innerHTML = `<img class=\"removeBtn\" onclick=\"deleteWarning(${meals[i].id})\" src=\"../../pics/close.png\">`;

        }
        */


        console.log(meals);

    }
}

///This function deletes a meal-item by delivering the id/number of the item.
async function deleteMeal1(index:number){
    const deleteURL = `${home_URL}/${index}`;
    const response = await fetch(deleteURL, {method:'DELETE'});

    if(response.ok){
        await refresh();
    }
    else{
        alert(`Could not delete number ${index}`);
    }
}

async function addMealByInputElements1(){
    const numberBox = document.getElementById("numberInput") as HTMLInputElement;
    const nameBox = document.getElementById("nameInput") as HTMLInputElement;
    const ingredientsBox = document.getElementById("ingredientsInput") as HTMLInputElement;
    const number = numberBox.value;
    const name = nameBox.value;
    const ingredients = ingredientsBox.value;

    if(!Number(number) && ingredients.length == 0 || name.length == 0){
        alert('Wrong input! D:');
        return;
    }

    console.log(number,name,ingredients);

    let options: any = { method:'POST' };
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify({number: number, name: name, ingredients: ingredients});

    const response = await fetch(home_URL, options);

    if(response.ok){
        await refresh();
        numberBox.value = "";
        nameBox.value = "";
        ingredientsBox.value = "";
    }
    else{
        alert("Error during adding process");
    }
}

async function insertMealsFromString1(content:string){
    //console.log(content);
    const lines: string[] = content.split(/\r\n|\r|\n/);
    //console.log(lines[1]);
    for(let x = 0; x < lines.length-1; x++){
        const line = lines[x];
        const data: string[] = line.split(';');
        if(data.length != 3){
            //console.log(data);
            alert(`Wrong number of columns (there should be 3, but there are ${data.length})`);
            return;
        }
        //console.log(data[0]);
        if(!Number(data[0])){
            alert(`Column 0/Row ${x} should be a number, but it is not.`);
            return;
        }
        const number:string = data[0];
        const name: string = data[1];
        const ingredients = data[2];

        console.log(number,name,ingredients);

        let options: any = { method:'POST' };
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify({number: number, name: name, ingredients: ingredients});

        const response = await fetch(home_URL, options);

        //console.log(response);

        if(!response.ok){
            alert(`Error during adding process in line ${x}`);
        }
        else{
            await refresh();
        }
    }
}


const buttonHs = document.getElementById("buttonHs");


if(buttonHs != null){
buttonHs.addEventListener("click", async () => console.log(await refresh()));
}
/*
import {getOrderdays} from "../../../server/data/orderday-repository"





export async function getAllOrders(){

    console.log(await getOrderdays());

}




   

*/
