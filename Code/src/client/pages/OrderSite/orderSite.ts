import {Food} from "../../../server/collective/Food";
import {Person} from "../../../server/collective/Person";
import { OrderEntry } from "../../../server/collective/OrderEntry";
import {OrderDay} from "../../../server/collective/Orderday";
import {User} from "../../../server/collective/user";
import { fetchRestEndpoint } from "../../utils/client-server.js";


const Host_URL = "http://localhost:3000/orderdays";

let gridForOrderdays = document.getElementById("FoodOrders");
const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})

const addODBtn: HTMLButtonElement = document.getElementById("buttonPlacement") as HTMLButtonElement;

window.onload = async() =>{
    const isTeacher: boolean = sessionStorage.getItem("web-isTeacher") === "true";
    const userResponse = await fetch('http://localhost:3000/users');
    let users:User[] = await userResponse.json();
    for(let i = 0;  i< users.length;i++){
      if(users[i].username === sessionStorage.getItem('web-user')){
        sessionStorage.setItem('userID',users[i].id.toString());
      }
    }
    await getOrderdays();
    await fillOrderdayWithFood();
    if(!isTeacher){
        addODBtn.remove();
    }
    
    
    document.addEventListener('click', (event: MouseEvent) => {
        const targetElement = event.target as HTMLElement;
        
        // Überprüfen, ob das Ziellement selbst ein Button ist
        if (targetElement.classList.contains('bestellButton') ) {
          console.log(targetElement.classList.contains('bestellButton'));
          /*const button = targetElement as HTMLButtonElement;
          // Code zum Entfernen des Buttons
          button.parentNode?.removeChild(button);*/          
          
          prepareOrderEntry(targetElement.parentElement?.parentElement)
          
        }


      });
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
async function getOrderdays(){

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
                htmlDivString += `<div class="Tile DateInGrid" onclick="window.location.href='../ShowOrders/'"><div class="dateInformation">${formattedDate}</div><div class="Description">${dayName} <br> Deadline: ${formattedDeadLine}</div></div> `
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
  let user:string = sessionStorage.getItem('userID');  
  let orderdays = await fetchRestEndpoint('http://localhost:3000/orderdays','GET');  
  let oDays:OrderDay[] = await orderdays.json();
  for(let i = 0; i < oDays.length;i++){
    let dateString:string = oDays[i].orderDate.toString();      
    if(dateString.includes(date) === true){      
      orderDayID = i +1;  
        
      i = orderdays.length +1;
    }
  }
  let orderentrys = await fetchRestEndpoint('http://localhost:3000/orderentries/simple','GET');  
  let oEntrys:OrderEntry[] = await orderentrys.json();  
  for(let i = 0; i< oEntrys.length;i++){ 
    if(parseInt(oEntrys[i].orderDayID) === parseInt(orderDayID.toString()) && parseInt(oEntrys[i].customerID) === parseInt(user)){   
        
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
    let btnElement = parentelement.querySelector('.bestellButton');
    let dateElement = parentelement.querySelector('.dateInformation');
    let dateStringParts = dateElement.innerHTML.split('-');
    btnElement.innerHTML = await getFoodForOrderDay(dateStringParts[1]+'-'+dateStringParts[0]);
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



/*

Wenn man auf den not orderd yet knopf klickt, dann sollte man auf eine neue seite kommen. 
Auf dieser Seite kann man dann für den jeweiligen orderday ein Essen auswählen. 
Dann wird man automatisch wieder zu Orderday seite Zurückgeschupft.


Wenn man schon ein Essen ausgewählt hat und die Deadline noch nicht erreicht ist, dann kann man sein Essen noch bearbeiten. 
Dann ist es der gleiche Prozess wie oben. 


Aus der Teacher Sicht, kann man keine Essen bestellen, sondern nur die jeweiligen Orderdays festelgen. 
Dafür klickt man auf den [+ add Orderday] Button wo man auch auf eine Seperate Seite kommt.
Da kann man einen Orderday erstellen und eine Deadline festelegen. 



*/

