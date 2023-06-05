import {fetchRestEndpoint} from "../../utils/client-server.js";

const tableBody: HTMLTableSectionElement = document.getElementById('table-body') as HTMLTableSectionElement;
const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
const whiteOverlay = document.getElementById('whiteOverlay') as HTMLDivElement;
const addMealBtn = document.getElementById('addCustomerBtn') as HTMLButtonElement;
const addBtn = document.getElementById('addBtn') as HTMLButtonElement;
const importBox = document.getElementById('importBox') as HTMLDivElement;
const addingBox = document.getElementById('addingBox') as HTMLDivElement;
const deleteBtn = document.getElementById('deleteBtn') as HTMLButtonElement;
const confirmImportBtn = document.getElementById('confirmBtn') as HTMLButtonElement;
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
let curEl = -1;

//const home_URL = "http://localhost:3000/food";

window.onload = async() =>{
    await refresh("");
}

///Refreshes the meal-table by fetching the data from the server.
async function refresh(input: string){
    const response = await fetchRestEndpoint("http://localhost:3000/customers", "GET");
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
        row.insertCell(0).innerHTML = `${customers[i].lastname}`;
        row.insertCell(1).innerHTML = `${customers[i].firstname}`;
        row.insertCell(2).innerHTML = `${customers[i].className}`;
        row.insertCell(3).innerHTML = `<input type="checkbox" class="classCheckBox">`;
    }
}

///sends an DELETE-Request to the server for the specific index parameter.
async function deleteCustomer(index:number){
    await fetchRestEndpoint(`http://localhost:3000/customers/${index}`,"DELETE");
}
///Gathers the data from the input elements and sends an object to the server with a POST-Request.
async function addCustomerByInputElements(){
    const lastNameBox = document.getElementById("lastNameInput") as HTMLInputElement;
    const firstNameBox = document.getElementById("firstNameInput") as HTMLInputElement;
    const classBox = document.getElementById("classInput") as HTMLInputElement;
    const lastName = lastNameBox.value;
    const firstName = firstNameBox.value;
    const className = classBox.value;

    console.log(lastName,firstName,className);

    const data = {lastName: lastName, firstName: firstName, className: className};

    const response = await fetchRestEndpoint('http://localhost:3000/customers',"POST", data);

    if(response.ok){
        await refresh("");
        firstNameBox.value = "";
        lastNameBox.value = "";
        classBox.value = "";
    }
    else{
        alert("Error during adding process");
    }
}

///
// {@addMealByInputElements}
//
//
/**
 * Reads the lines of the given parameter and, like in the
 * {@link #addMealByInputElements() addMealByInputElements()},
 * gathers the data in an object and sends it to the server with a POST-Request.
 */
async function insertCustomersFromString(content:string){
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
        const lastName:string = data[0];
        const firstName: string = data[1];
        const className: string = data[2];

        console.log(lastName, firstName, className);


        const content = {lastName: lastName, firstName: firstName, className: className};

        const response = await fetchRestEndpoint("http://localhost:3000/customers", "POST", content);

        //console.log(response);
    }
    await refresh("");
}

importBtn.addEventListener('click', ()=>{
    whiteOverlay.style.display = "flex";

    importBox.style.display = "block";
});

addMealBtn.addEventListener('click', ()=> {
    whiteOverlay.style.display = "flex";

    addingBox.style.display = "block";
})

addBtn.addEventListener('click', async ()=>{
    await addCustomerByInputElements();
});

confirmImportBtn.addEventListener('click', ()=>{
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;

    if(!fileInput.files){
        alert('no file selected');
        return;
    }

    let content: string = "";
    const file = fileInput!.files?.item(0);
    if (file) {
        const reader = new FileReader();
        reader.addEventListener("load", async() => {
            //console.log(reader.result);
            if(typeof reader.result == "string"){
                content = reader.result;
                //console.log(content);
                await insertCustomersFromString(content);
            }
        });
        reader.readAsText(file);
    }
});

deleteBtn.addEventListener('click', async()=>{
    const inputElements = document.getElementsByTagName("input");
    let activeList = [];
    let count = 0;
    for(let x = 0;x < inputElements.length; x++){
        const curElement = inputElements.item(x) as HTMLInputElement;
        if(curElement.type == "checkbox" && curElement.checked == true){
            console.log(curElement.parentElement!.parentElement!.id);
            activeList.push(curElement.parentElement!.parentElement!.id);
        }
    }

    for(let x = 0; x < activeList.length; x++){
        try{
            await deleteCustomer(Number(activeList[x]));
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
    importBox.style.display = "none";
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
