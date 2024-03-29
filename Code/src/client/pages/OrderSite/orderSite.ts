import { fetchRestEndpoint } from "../../utils/client-server.js";
import {Food, OrderDay, OrderEntry, User} from "../interfaces";


const Host_URL = "http://localhost:3000/orderDay";

let gridForOrderdays = document.getElementById("FoodOrders");
const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})

const addODBtn: HTMLButtonElement = document.getElementById("buttonPlacement") as HTMLButtonElement;
let isTeacher = false

window.onload = async() =>{
    const username = sessionStorage.getItem('web-user');
    //console.log(username);
    isTeacher = sessionStorage.getItem("web-isTeacher") === "true";
    if(!isTeacher){
        addODBtn.remove();
    }

    const isClassMember: number = await isPoolMember(username);
    //console.log(isClassMember);

    const userResponse = await fetch('http://localhost:3000/user');
    let users:User[] = await userResponse.json();
    for(let i = 0;  i< users.length;i++){
      if(users[i].username === sessionStorage.getItem('web-user')){
        sessionStorage.setItem('username',users[i].username);
      }
    }
    if(isTeacher || isClassMember == 1){
        await getOrderDays();
    }
    if(!isTeacher){
        await fillOrderdayWithFood();
    }

        document.addEventListener('click', (event: MouseEvent) => {
            const targetElement = event.target as HTMLElement;

            // Überprüfen, ob das Ziellement selbst ein Button ist
            if(!isTeacher) {
                if (targetElement.classList.contains('bestellButton')) {
                    console.log(targetElement.classList.contains('bestellButton'));
                    /*const button = targetElement as HTMLButtonElement;
                    // Code zum Entfernen des Buttons
                    button.parentNode?.removeChild(button);*/

                    prepareOrderEntry(targetElement.parentElement?.parentElement);
                }
            }
            else{
                if (targetElement.classList.contains('showOrders')) {
                    console.log(targetElement.classList.contains('showOrders'));
                    /*const button = targetElement as HTMLButtonElement;
                    // Code zum Entfernen des Buttons
                    button.parentNode?.removeChild(button);*/

                    prepareOrderEntry(targetElement.parentElement?.parentElement);
                }
            }
        });
}

async function isPoolMember(username: string) {
    const response = await fetchRestEndpoint(`http://localhost:3000/user/isClassMember/${username}`, "GET");
    const result: {classMember: number} = await response.json();
    return result.classMember;
}

async function prepareOrderEntry(theHtmlElementparams:any) {
  const response = await fetch(Host_URL);
  const dateElement = theHtmlElementparams?.querySelector('div.dateInformation') as HTMLDivElement;
  let dateString:string|null = dateElement.textContent;
  let dateStringParts = dateString.split('-');
  dateString = dateStringParts[1] +'-'+dateStringParts[0];
  if(dateString !== null){
    let orderDays:OrderDay[] = await response.json();
    console.log(orderDays);

    for(let i = 0; i < orderDays.length;i++){
    if(orderDays[i].orderDate.toString().includes(dateString)){
      let id = i  + 1;
        if(new Date < new Date(orderDays[i].orderDate)){
          sessionStorage.setItem('orderDayID',id.toString());
            if(!isTeacher){
                window.location.href = "../foodlistSite/";
            }
            else{
                window.location.href = "../ShowOrders/";
            }

        }
        else{
          alert('Zu spät');         
          return;
        }
      }      
    }
  }
  
  /*
  console.log(sessionStorage.getItem('orderDayID'));
  console.log(sessionStorage.getItem('userID'));  
  */
  //window.location.href = '../foodlistSite/';
}
async function getOrderDays(){

    const response = await fetch(Host_URL);
    let htmlDivString: string = "";    
    if(response.ok){
        const orderdays = await response.json();

        orderdays.sort((a: OrderDay,b : OrderDay ) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());       
        
        for(let i = 0; i < orderdays.length; i++){
           // let formattedDate = (moment(orderdays[i].orderDate)).format('DD-MMM');
           
            //datum so formatieren das man in das Format dd-mm kommt
            let splittedDate = orderdays[i].orderDate.split('-');
            let formattedDate = splittedDate[2] + "-" + splittedDate[1];

            //datum zu Wochentag
            let d = new Date(orderdays[i].orderDate);
            let dayName = gsDayNames[d.getDay()];

            //Uhrzeit formatieren 
            let splittedDeadLine = orderdays[i].deadline.split(':');
            let formattedDeadLine = splittedDeadLine[0] + ":" + splittedDeadLine[1];

            const isTeacher: boolean = sessionStorage.getItem("web-isTeacher") === "true";
            if(!isTeacher){
                htmlDivString += `<div class="Tile DateInGrid"><div class="dateInformation">${formattedDate}</div><div class="Description">${dayName} <br> Deadline: ${formattedDeadLine}<button type="button" class="btn btn-success Button bestellButton" >Kebab</button></div></div> `
            }
            else{
                htmlDivString += `<div class="Tile DateInGrid" ><div class="dateInformation">${formattedDate}</div><div class="Description">${dayName} <br> Deadline: ${formattedDeadLine}<button type="button" class="Button showOrders" >Show Orders</button></div></div> `
            }
        }
    }
    if(gridForOrderdays != null){
        gridForOrderdays.innerHTML = htmlDivString

    }
    
}
async function getFoodForOrderDay(date:string):Promise<string>{
  let orderDayID:number = -1;
  let mealID = '-1';
  let mealString:string = 'nothing';
  let user:string = sessionStorage.getItem('username');
  let orderdays = await fetchRestEndpoint('http://localhost:3000/orderDay','GET');
  let oDays:OrderDay[] = await orderdays.json();
  for(let i = 0; i < oDays.length;i++){
    let dateString:string = oDays[i].orderDate.toString();      
    if(dateString.includes(date) === true){      
      orderDayID = i +1;  
        
      i = orderdays.length +1;
    }
  }
  let orderentrys = await fetchRestEndpoint('http://localhost:3000/orderentry/simple','GET');
  let oEntrys:OrderEntry[] = await orderentrys.json();  
  for(let i = 0; i< oEntrys.length;i++){ 
    if(parseInt(oEntrys[i].orderDayID) === parseInt(orderDayID.toString()) && oEntrys[i].username === user){
        
      mealID = oEntrys[i].mealID;
    }
  } 
  if(mealID !== '-1'){ 
    let foodResponse = await fetch(`http://localhost:3000/food/${mealID}`);
    let food:Food = await foodResponse.json();
    
    mealString = food.name;
  }
  return mealString;
}
async function fillOrderdayWithFood(){
  
  const elements = document.querySelectorAll('.dateInformation');
  for(let i = 0; i < elements.length;i++){
    let parentelement = elements[i].parentElement;
    let btnElement: HTMLButtonElement = parentelement.querySelector('.bestellButton');
    let dateElement = parentelement.querySelector('.dateInformation');
    let dateStringParts = dateElement.innerHTML.split('-');
    btnElement.innerHTML = await getFoodForOrderDay(dateStringParts[1]+'-'+dateStringParts[0]);
      btnElement.style.borderRadius = "5px";
    if(!(btnElement.innerHTML === "nothing")){
        btnElement.style.color = "#e0e0e0";
        btnElement.style.borderColor = "#2f6c2f";
        btnElement.style.backgroundColor = "#39833d";
    }
    else{
        btnElement.style.color = "#e0e0e0";
        btnElement.style.borderColor = "#5c0404";
        btnElement.style.backgroundColor = "#c91010";
    }
  }
}


var gsDayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

