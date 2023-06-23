import { OrderEntry } from "../../../server/collective/OrderEntry";

const Host_URL = "http://localhost:3000/orderdays";
const btnLogout = document.getElementById('logoutButton') as HTMLButtonElement;
btnLogout.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href="/";
})


//getting every HTML Element(Date Picker, Input field und Button)
const buttonForCompleteOrderday = document.getElementById("buttonHs");
let divForDatePicker = document.getElementById("datePicker");
const datePicker = document.getElementById("start") as HTMLInputElement;

const inputForDeadLine = document.getElementById("deadLineInput") as HTMLInputElement;

window.onload = () => {
    datePicker.value = Date.now().toLocaleString("yyyy-mm-dd")
};

//Eventhandler for Button 
if(buttonForCompleteOrderday != null){

    buttonForCompleteOrderday.addEventListener("click", async () =>{

        if(!await createOderday()){
           
           console.log("");

        }
        else{
            alert("Orderday succsesfully added");
            window.location.href="../OrderSite/index.html"
        }
    });
}
async function createOderday(): Promise<Boolean>{
    let TodaysDate: number = Date.now();   

    
    const datePickerValueString: string = datePicker.value;
    const datePickerInDateFormat: Date = new Date(datePickerValueString);
    let deadLine: string = inputForDeadLine.value; 
    console.log(datePickerValueString, datePickerInDateFormat.getTime(),"TodaysDate:" ,TodaysDate,"In DateFormat", datePickerInDateFormat);

    console.log(await  IsDateInDatabase(datePickerValueString));

        
    if(datePickerInDateFormat.getTime() < TodaysDate || await !IsDateInDatabase(datePickerValueString)){
        alert("Bitte wählen Sie ein gültiges Datum ");
        return false;
    }
    else{
        console.log("Alles baba und Date passt auch");
    }

    var trigger = deadLine,
    regexp = new RegExp('^[0-9][0-9]\\:[0-9][0-9]$'),
    test = regexp.test(trigger);

    if(!test){
        alert("Bitte wähle eine gültige dead line (HH:MM)");
        return false;
    }
    deadLine += ":00";  
    
    let options: any = { method:'POST' };

    options.headers = { "Content-Type": "application/json" };
    console.log("Input für options:", datePickerValueString, deadLine);
    options.body = JSON.stringify({orderdate: datePickerValueString, deadline: deadLine});

    console.log("1", options.body);
    const response = await fetch(Host_URL, options);
    console.log("2");


    if(response.ok){
        return true;    
       
    }
    else{
        alert("Fehler während beim Hinzufügen");
        alert(response.text)
    }
    return false;
} 

async function IsDateInDatabase(date: string): Promise<boolean>{
    const response = await fetch(Host_URL);

    if(response.ok){
        const orderdays: OrderEntry[] = await response.json();    
        console.log(orderdays);

        for(let i = 0; i < orderdays.length; i++){
            if(date == orderdays[i].orderDayID){
                return true;
            }
        }
    }
    return false; 
}