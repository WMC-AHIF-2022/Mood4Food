import {fetchRestEndpoint} from "../../utils/client-server.js";

const loginStatus = document.getElementById("loginStatus") as HTMLLabelElement;
const loginError = document.getElementById("loginError") as HTMLLabelElement;

const btnSignUp = document.getElementById("btnSignup") as HTMLButtonElement;
btnSignUp.addEventListener('click', async() => {await signup()});

export async function signup() {

    loginError.innerHTML = "";
    const elementIsTeacher = <HTMLInputElement>document.getElementById("checkBoxTeacher");
    const isTeacher = elementIsTeacher.checked;
    const elementUsername = <HTMLInputElement>document.getElementById("username");
    const username = elementUsername.value;
    const elementPassword = <HTMLInputElement>document.getElementById("password");
    const password = elementPassword.value;
    const elementLastName: HTMLInputElement = document.getElementById("lastname") as HTMLInputElement;
    const lastname = elementLastName.value;
    const elementFirstName: HTMLInputElement = document.getElementById("firstname") as HTMLInputElement;
    const firstname = elementFirstName.value;

    console.log(isTeacher);
    let teacher = 0;
    if(isTeacher){
        teacher = 1;
    }

    const data = JSON.parse(`{"username": "${username}", "password": "${password}", "lastName": "${lastname}", "firstName": "${firstname}", "className": ${false}, "teacher": "${teacher}"}`);
    //console.log(data);
    const response = await fetchRestEndpoint("http://localhost:3000/user/signup", "POST", data);

    if(response.ok){
        loginStatus.innerHTML = "Signup successful, please login to continue";
    }
    else{
        loginError.innerHTML = "Signup failed";
    }
}