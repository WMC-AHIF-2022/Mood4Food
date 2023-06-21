import { fetchRestEndpoint } from "./utils/client-server.js";

const btnLogin = document.getElementById("btnLogin") as HTMLButtonElement;
const btnSignup = document.getElementById("btnSignup") as HTMLButtonElement;
const loginStatus = document.getElementById("loginStatus") as HTMLLabelElement;
const loginError = document.getElementById("loginError") as HTMLLabelElement;

btnSignup.addEventListener("click", async () => await signup());
btnLogin.addEventListener("click", async () => await login());

export async function login() {
    loginStatus.innerHTML = "";
    loginError.innerHTML = "";
    const elementUsername = <HTMLInputElement>document.getElementById("username");
    const username = elementUsername.value;
    const elementPassword = <HTMLInputElement>document.getElementById("password");
    const password = elementPassword.value;

    const data = JSON.parse(`{"username": "${username}", "password": "${password}"}`);
    const response = await fetchRestEndpoint("http://localhost:3000/users/login", "POST", data);
    console.log(response);
    if(!response.ok){
        loginError.innerHTML = "Login failed";
    }
    else{
        sessionStorage.setItem('web-isTeacher', await response.json());
        sessionStorage.setItem('web-user', username);
        window.location.href = "pages/OrderSite/";
    }
}

export async function signup() {

    loginError.innerHTML = "";
    const elementUsername = <HTMLInputElement>document.getElementById("username");
    const username = elementUsername.value;
    const elementPassword = <HTMLInputElement>document.getElementById("password");
    const password = elementPassword.value;
    const elementIsTeacher = <HTMLInputElement>document.getElementById("checkBoxTeacher");
    const isTeacher = elementIsTeacher.checked;
    console.log(isTeacher);
    let teacher = 0;
    if(isTeacher){
        teacher = 1;        
    }

    const data = JSON.parse(`{"id": "${3}", "username": "${username}", "password": "${password}", "teacher": "${teacher}"}`);
    const response = await fetchRestEndpoint("http://localhost:3000/users/signup", "POST", data);

    if(response.ok){
        loginStatus.innerHTML = "Signup successful, please login to continue";
    }
    else{
        loginError.innerHTML = "Signup failed";
    }
}
export {}