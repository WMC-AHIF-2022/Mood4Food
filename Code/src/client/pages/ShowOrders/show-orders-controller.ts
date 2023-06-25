import {fetchRestEndpoint} from "../../utils/client-server.js";
import {OrderDay} from "../interfaces";

const tableBody: HTMLTableSectionElement = document.getElementById('table-body') as HTMLTableSectionElement;
const deleteBtnH = document.getElementById('deleteBtnH');
const exportBtn = document.getElementById('ExportBtn') as HTMLButtonElement;
const whiteOverlay = document.getElementById('whiteOverlay') as HTMLDivElement;
const importBox = document.getElementById('importBox') as HTMLDivElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
const confirmImportBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
const closeBtns = document.getElementsByClassName('closeBtn') as HTMLCollection;
const btnOrderDayTitle = document.getElementById('orderDayTitle');

const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
const orderId = sessionStorage.getItem('orderDayID');
const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})
window.onload = async() =>{
    const response = await fetchRestEndpoint(`http://localhost:3000/orderDay/${orderId}`, "GET");

    const orderDay:OrderDay = await response.json();
    const date = new Date(orderDay.orderDate);
    const day = date.getDay();
    const title = `OrderDay: ${days[day]}, ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
    btnOrderDayTitle.innerText = title;
    console.log(orderDay);
    await refresh()
}



async function refresh(){

    const response = await fetchRestEndpoint(`http://localhost:3000/orderEntry/allOrdersOnDay/${orderId}`, "GET");
    const allOrders:{id:number, firstname:string, lastname:string,name:string}[] = await response.json();
    tableBody.innerHTML = '';
    for(let i = 0; i < allOrders.length; i++){
        const row = document.createElement("tr");
        row.id = `${allOrders[i].id}`;
        tableBody.appendChild(row);
                row.insertCell(0).innerHTML = `${allOrders[i].firstname}`;
                row.insertCell(1).innerHTML = `${allOrders[i].lastname}`;
                row.insertCell(2).innerHTML = `${allOrders[i].name}`;
                row.insertCell(3).innerHTML = `<input type="checkbox" class="mealCheckBox">`;

        /*row.addEventListener('click',(e)=> {
            const target = e.target as HTMLButtonElement;
            if (target.tagName != "INPUT") {
                sessionStorage.setItem('selectedFoodItem', meals[i].id);
                window.location.href = `http://localhost:3000/pages/foodSite`;
            }
        });*/
    }
}
deleteBtn.addEventListener('click', async()=>{
    const inputElements = document.getElementsByTagName("input");
    let activeList = [];
    let count = 0;
    for(let x = 0;x < inputElements.length; x++){
        const curElement = inputElements.item(x) as HTMLInputElement;
        if(curElement.type == "checkbox" && curElement.checked == true){
            activeList.push(curElement.parentElement!.parentElement!.id!);
        }
    }
    console.log(activeList);
    for(let x = 0; x < activeList.length; x++){
        try{
            await deleteOrderEntry(Number(activeList[x]));
        }
        catch(e){
            alert(e);
            return;
        }
    }
    await refresh();
});

async function deleteOrderEntry(number: number) {
    await fetchRestEndpoint(`http://localhost:3000/orderEntry/${number}`,"DELETE");
}