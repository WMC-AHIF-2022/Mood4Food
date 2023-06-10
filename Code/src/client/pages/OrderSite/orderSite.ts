import {Food} from "../../../server/collective/Food";
import {Person} from "../../../server/collective/Person";
import { OrderEntry } from "../../../server/collective/OrderEntry";
import {OrderDay} from "../../../server/collective/Orderday";


const Host_URL = "http://localhost:3000/orderdays";

let gridForOrderdays = document.getElementById("FoodOrders");
const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})



window.onload = async() =>{
    await getOrderdays();
    console.log(sessionStorage.getItem('web-isTeacher'));
    document.addEventListener('click', (event: MouseEvent) => {
        const targetElement = event.target as HTMLElement;
      
        // Überprüfen, ob das Ziellement selbst ein Button ist
        if (targetElement.classList.contains('bestellButton') ) {
          
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
  if(dateString !== null){
    let orderDays:OrderDay[] = await response.json();     
    for(let i = 0; i < orderDays.length;i++){
    if(orderDays[i].orderDate.toString().includes(dateString)){
      let id = i  + 1;
        sessionStorage.setItem('orderDayID',id.toString());
      }
    }
  }
  
}
async function getOrderdays(){

    const response = await fetch(Host_URL);
    let htmlDivString: string = "";    
    if(response.ok){
        const orderdays = await response.json();
        
        for(let i = 0; i < orderdays.length; i++){
           // let formattedDate = (moment(orderdays[i].orderDate)).format('DD-MMM');
           
            //datum so formatieren das man in das Format dd-mm kommt
            let splittedDate = orderdays[i].orderDate.split('-');
            let formattedDate = splittedDate[1] + "-" + splittedDate[2];

            //datum zu Wochentag
            let d = new Date(orderdays[i].orderDate);
            let dayName = gsDayNames[d.getDay()];

            //Uhrzeit formatieren 
            let splittedDeadLine = orderdays[i].deadline.split(':');
            let formattedDeadLine = splittedDeadLine[0] + ":" + splittedDeadLine[1];

            htmlDivString += `<div class="Tile DateInGrid"><div class="dateInformation">${formattedDate}</div><div class="Description">${dayName} <br> Deadline: ${formattedDeadLine}<button type="button" class="btn btn-success Button bestellButton" >Kebab</button></div></div> `           
        }

    }
    if(gridForOrderdays != null){
        gridForOrderdays.innerHTML = htmlDivString

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

