import { fetchRestEndpoint } from "./utils/client-server.js";

const btnLogin = document.getElementById("btnLogin") as HTMLButtonElement;
const loginStatus = document.getElementById("loginStatus") as HTMLLabelElement;
const loginError = document.getElementById("loginError") as HTMLLabelElement;

btnLogin.addEventListener("click", async () => await login());

export async function login() {
    loginStatus.innerHTML = "";
    loginError.innerHTML = "";
    const elementUsername = <HTMLInputElement>document.getElementById("username");
    const username = elementUsername.value;
    const elementPassword = <HTMLInputElement>document.getElementById("password");
    const password = elementPassword.value;

    const data = JSON.parse(`{"username": "${username}", "password": "${password}"}`);
    const response = await fetchRestEndpoint("http://localhost:3000/user/login", "POST", data);
    //console.log(response);
    if(!response.ok){
        loginError.innerHTML = "Login failed";
    }
    else{
        sessionStorage.setItem('web-isTeacher', await response.json());
        sessionStorage.setItem('web-user', username);
        window.location.href = "pages/OrderSite/";
    }
}