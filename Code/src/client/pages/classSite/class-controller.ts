import {fetchRestEndpoint} from "../../utils/client-server.js";

const tableBody: HTMLTableSectionElement = document.getElementById('table-body') as HTMLTableSectionElement;
const deleteBtnH = document.getElementById('deleteBtnH');
const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
const whiteOverlay = document.getElementById('whiteOverlay') as HTMLDivElement;
const addCustomerBtn = document.getElementById('addCustomerBtn') as HTMLButtonElement;
const addBtn = document.getElementById('addBtn') as HTMLButtonElement;
const importBox = document.getElementById('importBox') as HTMLDivElement;
const addingBox = document.getElementById('addingBox') as HTMLDivElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
//const confirmImportBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
const closeBtns = document.getElementsByClassName('closeBtn') as HTMLCollection;
const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})
for(let x = 0; x < closeBtns.length;x++){
    closeBtns[x].addEventListener('click',()=>{
        closeWhiteOverlay();
    });
}
let isTeacher: boolean = false;
let curEl = -1;

//const home_URL = "http://localhost:3000/food";

window.onload = async() =>{
    isTeacher = sessionStorage.getItem("web-isTeacher") === "true";
    if(!isTeacher){
        deleteBtnH?.remove();
        addCustomerBtn.remove();
        //importBtn.remove();
    }
    await refresh("");
}

///Refreshes the meal-table by fetching the data from the server.
async function refresh(input: string){
    const response = await fetchRestEndpoint("http://localhost:3000/user/class", "GET");
    const customers = await response.json();

    if(!(input === "")) {
        for (let i = 0; i < customers.length; i++) {

            if (!customers[i].lastname.includes(input)) {
                customers.splice(i, 1);
                i = -1;
            }
        }
    }
    
    tableBody.innerHTML = '';
    for(let i = 0; i < customers.length; i++){
        //console.log(customers[i]);
        const row = document.createElement("tr");
        tableBody.appendChild(row);
        row.id = customers[i].id;
        //row.insertCell(0).innerHTML = `<div>${customers[i].id}</div>`;
        row.insertCell(0).innerHTML = `${customers[i].username}`;
        row.insertCell(1).innerHTML = `${customers[i].lastname}`;
        row.insertCell(2).innerHTML = `${customers[i].firstname}`;
        if(isTeacher)
            row.insertCell(3).innerHTML = `<input type="checkbox" class="classCheckBox">`;
    }
}

///sends an DELETE-Request to the server for the specific index parameter.
async function removeCustomer(username: string){
    const data = {username: username};
    await fetchRestEndpoint(`http://localhost:3000/user/poolRemoval`,"POST", data);
}
///Gathers the data from the input elements and sends an object to the server with a POST-Request.
async function addCustomerByInputElements(){
    const usernameBox = document.getElementById("usernameInput") as HTMLInputElement;
    const username = usernameBox.value;

    //console.log(username);

    const data = {username: username};

    const response = await fetchRestEndpoint('http://localhost:3000/user/poolAddition',"POST", data);

    if(response.ok){
        await refresh("");
        usernameBox.innerText = "";
    }
    else{
        alert('could not be found');
    }
}

// importBtn.addEventListener('click', ()=>{
//     whiteOverlay.style.display = "flex";
//
//     importBox.style.display = "block";
// });

addCustomerBtn.addEventListener('click', ()=> {
    whiteOverlay.style.display = "flex";
    addingBox.style.display = "block";
})

addBtn.addEventListener('click', async ()=>{
    await addCustomerByInputElements();
});

deleteBtn.addEventListener('click', async()=>{
    const inputElements = document.getElementsByTagName("input");
    let activeList = [];
    let count = 0;
    for(let x = 0;x < inputElements.length; x++){
        const curElement = inputElements.item(x) as HTMLInputElement;
        if(curElement.type == "checkbox" && curElement.checked == true){
            //console.log(curElement.parentElement!.parentElement!.firstChild.textContent);
            activeList.push(curElement.parentElement!.parentElement!.firstChild.textContent);
        }
    }

    for(let x = 0; x < activeList.length; x++){
        try{
            //console.log(activeList[x]);
            await removeCustomer(activeList[x]);
        }
        catch(e){
            alert(e);
            return;
        }
    }
    await refresh("");
});

///Sets the display of the white background and all boxes to 'none'
function closeWhiteOverlay(){
    whiteOverlay.style.display = "none";
    //importBox.style.display = "none";
    addingBox.style.display = "none";
}
// get Search field
const inputElement = document.getElementById("classSearch") as HTMLInputElement;
inputElement.addEventListener("keyup", async (event: KeyboardEvent) => { 
    const inputValue = inputElement.value;    
    const tableBodyElement = document.getElementById("table-body") as HTMLTableSectionElement;
    while (tableBodyElement.firstChild) { 
        tableBodyElement.removeChild(tableBodyElement.firstChild); 
    }

    await refresh(inputValue);
    
  });
