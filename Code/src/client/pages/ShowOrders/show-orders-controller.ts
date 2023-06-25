import {fetchRestEndpoint} from "../../utils/client-server.js";

const tableBody: HTMLTableSectionElement = document.getElementById('table-body') as HTMLTableSectionElement;
const deleteBtnH = document.getElementById('deleteBtnH');
const exportBtn = document.getElementById('ExportBtn') as HTMLButtonElement;
const whiteOverlay = document.getElementById('whiteOverlay') as HTMLDivElement;
const importBox = document.getElementById('importBox') as HTMLDivElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
const confirmImportBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
const closeBtns = document.getElementsByClassName('closeBtn') as HTMLCollection;

const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})
window.onload = async() =>{
    const users = await fetchRestEndpoint(`http://localhost:3000/users`,"GET");
    await refresh()
}

async function getAmountOfOrdersfor(index: number): Promise<string>{
    const response = await fetchRestEndpoint(`http://localhost:3000/food/${index}/amount`,"GET");
    const amount = await response.json();
    return `${amount.value}`;
}

async function refresh(){
    const response1 = await fetchRestEndpoint("http://localhost:3000/food", "GET");
    const response2 = await fetchRestEndpoint("http://localhost:3000/users", "GET");
    const response3 = await fetchRestEndpoint("http://localhost:3000/orderentries", "GET");
    const meals = await response1.json();
    const users = await response2.json();
    const orderEntries = await response3.json();
    console.log(meals);
    console.log(users);
    console.log(orderEntries);
        for (let i = 0; i < meals.length; i++) {
            if (!meals[i].name.includes("")) {
                meals.splice(i, 1);
                console.log(meals);
                i = -1;
            }
        }

    tableBody.innerHTML = '';
    for(let i = 0; i < users.length; i++){
        const row = document.createElement("tr");
        tableBody.appendChild(row);
        if(orderEntries[i].name === users[i].username) {
            row.insertCell(0).innerHTML = `${users[i].username}`;
            row.insertCell(1).innerHTML = `${orderEntries[i].food}`;
            row.insertCell(2).innerHTML = await getAmountOfOrdersfor(meals[i].id);
            row.insertCell(3).innerHTML = `<input type="checkbox" class="mealCheckBox">`;
        }
        /*row.addEventListener('click',(e)=> {
            const target = e.target as HTMLButtonElement;
            if (target.tagName != "INPUT") {
                sessionStorage.setItem('selectedFoodItem', meals[i].id);
                window.location.href = `http://localhost:3000/pages/foodSite`;
            }
        });*/
    }
}