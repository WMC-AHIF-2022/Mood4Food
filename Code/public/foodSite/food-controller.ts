
const home_URL = "http://localhost:3000/food";

///Updates the meal-table by fetching the data from the server
async function refresh(){
    const response = await fetch(home_URL);

    if(response.ok){
        const meals = await response.json();

        const tableBody: HTMLTableSectionElement = document.getElementById('table-body') as HTMLTableSectionElement;
        tableBody.innerHTML = '';
        for(let i = 0; i < meals.length; i++){
            const row = document.createElement("tr");
            tableBody.appendChild(row);
            row.insertCell(0).innerHTML = `${meals[i].id}`;
            row.insertCell(1).innerHTML = `${meals[i].name}`;
            row.insertCell(2).innerHTML = `0`;
            row.insertCell(3).innerHTML = `<img class=\"removeBtn\" onclick=\"deleteWarning(${meals[i].id})\" src=\"../pics/close.png\">`;

        }
    }
}

///This function deletes a meal-item by delivering the id/number of the item.
async function deleteMeal(index:number){
    const deleteURL = `${home_URL}/${index}`;
    const response = await fetch(deleteURL, {method:'DELETE'});

    if(response.ok){
        await refresh();
    }
    else{
        alert(`Could not delete number ${index}`);
    }
}

///This function adds a meal-item.
async function addMeal(){
    const numberBox = document.getElementById("numberInput") as HTMLInputElement;
    const nameBox = document.getElementById("nameInput") as HTMLInputElement;
    const ingredientsBox = document.getElementById("ingredientsInput") as HTMLInputElement;
    const number = numberBox.value;
    const name = nameBox.value;
    const ingredients = ingredientsBox.value;

    if(!Number(number) || ingredients.length == 0 || name.length == 0){
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