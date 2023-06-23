import {fetchRestEndpoint} from "../../utils/client-server.js";

const tableBody: HTMLTableSectionElement = document.getElementById('table-body') as HTMLTableSectionElement;
const deleteBtnH = document.getElementById('deleteBtnH');
const importBtn = document.getElementById('importBtn') as HTMLButtonElement;
const whiteOverlay = document.getElementById('whiteOverlay') as HTMLDivElement;
const addMealBtn = document.getElementById('addMealBtn') as HTMLButtonElement;
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
let isTeacher: boolean = false;

//const home_URL = "http://localhost:3000/food";

/*<tr>

    <th>

        </th>
        </tr>*/

window.onload = async() =>{
    isTeacher = sessionStorage.getItem("web-isTeacher") === "true";
    if(!isTeacher){
        deleteBtnH?.remove();
        addMealBtn.remove();
        importBtn.remove();
    }
    await refresh("");
}

async function getAmountOfOrdersfor(index: number): Promise<string>{
    const response = await fetchRestEndpoint(`http://localhost:3000/food/${index}/amount`,"GET")
    const amount = await response.json();
    return `${amount.value}`;
}

///Refreshes the meal-table by fetching the data from the server.
async function refresh(input: string){
    const response = await fetchRestEndpoint("http://localhost:3000/food", "GET");
    const meals = await response.json();

    if(!(input === "")) {
        for (let i = 0; i < meals.length; i++) {

            if (!meals[i].name.includes(input)) {
                meals.splice(i, 1);
                i = -1;
            }
        }
    }

    tableBody.innerHTML = '';
    for(let i = 0; i < meals.length; i++){
        const row = document.createElement("tr");
        tableBody.appendChild(row);
        row.insertCell(0).innerHTML = `${meals[i].id}`;
        row.insertCell(1).innerHTML = `${meals[i].name}`;
        row.insertCell(2).innerHTML = await getAmountOfOrdersfor(meals[i].id);
        if(isTeacher)
            row.insertCell(3).innerHTML = `<input type="checkbox" class="mealCheckBox">`;
        row.addEventListener('click',(e)=>{
            const target = e.target as HTMLButtonElement;
            if(target.tagName != "INPUT"){
                sessionStorage.setItem('selectedFoodItem', meals[i].id);
                window.location.href=`http://localhost:3000/pages/foodObjectSite`;
            }
        });
    }
}

///sends an DELETE-Request to the server for the specific index parameter.
async function deleteMeal(index:number){
    await fetchRestEndpoint(`http://localhost:3000/food/${index}`,"DELETE");
}
///Gathers the data from the input elements and sends an object to the server with a POST-Request.
async function addMealByInputElements(){
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

    const data = {number: number, name: name, ingredients: ingredients};

    const response = await fetchRestEndpoint('http://localhost:3000/food',"POST", data);

    if(response.ok){
        await refresh("");
        numberBox.value = "";
        nameBox.value = "";
        ingredientsBox.value = "";
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
async function insertMealsFromString(content:string){
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


        const content = {number: number, name: name, ingredients: ingredients};

        const response = await fetchRestEndpoint("http://localhost:3000/food", "POST", content);

        //console.log(response);

        if(!response.ok){
            alert(`${name} is already in the list`);
        }
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
    await addMealByInputElements();
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
                await insertMealsFromString(content);
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
            activeList.push(curElement.parentElement!.parentElement!.firstElementChild!.innerHTML);
        }
    }

    for(let x = 0; x < activeList.length; x++){
        try{
            await deleteMeal(Number(activeList[x]));
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
const inputElement = document.getElementById("foodSearch") as HTMLInputElement;
inputElement.addEventListener("keyup", async (event: KeyboardEvent) => { 
    const inputValue = inputElement.value;    
    const tableBodyElement = document.getElementById("table-body") as HTMLTableSectionElement;
    while (tableBodyElement.firstChild) { 
        tableBodyElement.removeChild(tableBodyElement.firstChild); 
    }

    await refresh(inputValue);
  });
