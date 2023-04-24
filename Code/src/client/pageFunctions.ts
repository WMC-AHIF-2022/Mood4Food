import * as fs from 'fs';

function addOverlay(){
    const contentElement: HTMLDivElement = document.getElementById('addMealContent') as HTMLDivElement;
    switchOverlay(contentElement);
}

function importOverlay(){
    const contentElement: HTMLDivElement = document.getElementById('importContent') as HTMLDivElement;
    switchOverlay(contentElement);
}

function deleteWarning(id:number){
    const contentElement: HTMLDivElement = document.getElementById('deleteWarningContent') as HTMLDivElement;
    const yesBtn: HTMLButtonElement = document.getElementById('yesBtn') as HTMLButtonElement;
    switchOverlay(contentElement);
    yesBtn.addEventListener("mousedown", async () => {
        await deleteMeal(id);
        switchOverlay('deleteWarningContent')
    });
}

///parameter is either an element itself or the id of it
function switchOverlay(value:any){
    const overlaySlide : HTMLDivElement = document.getElementById("whiteOverlay") as HTMLDivElement;

    if(overlaySlide.style.display === 'none'){
        overlaySlide.style.display = 'flex';
    }
    else {
        overlaySlide.style.display = 'none';
    }

    if(value !== undefined){
        if(typeof value == "string"){
            //console.log('it is a string');
            const element = document.getElementById(value);
            //console.log(element);
            element!.style.display = 'none';
        }
        else if(value instanceof HTMLDivElement){
            //console.log('it is an element');
            value.style.display = 'block';
        }
    }
}

function insertFromFile(){

}