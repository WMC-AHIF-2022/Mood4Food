import { fetchRestEndpoint } from "../../utils/client-server.js";

const btnLogin = document.getElementById("btnLogin") as HTMLButtonElement;
const btnSignup = document.getElementById("btnSignup") as HTMLButtonElement;
const checkBox = document.getElementById("checkBoxIsTeacher") as HTMLInputElement;
const elemUsername = document.getElementById("username") as HTMLInputElement;
const elemPassword = document.getElementById("password") as HTMLInputElement;

btnSignup.addEventListener("click", async () => await signup());
btnLogin.addEventListener("click", async () => await login());

async function login() {
    try {
        //loginStatus.innerHTML = "";
        //loginError.innerHTML = "";
        const elementUsername = <HTMLInputElement>document.getElementById("username");
        const username = elementUsername.value;
        const elementPassword = <HTMLInputElement>document.getElementById("password");
        const password = elementPassword.value;

        const data = JSON.parse(`{"username": "${username}", "password": "${password}"}`);
        await fetchRestEndpoint("http://localhost:3000/users/login", "POST", data);
        sessionStorage.setItem('chat-user', username);
        window.location.href = "pages/foodSite/";
    } catch (e) {
        alert(e);
    }
}

async function signup() {
    alert(`fehler: ${checkBox.checked}`);
    //try {
        const username = elemUsername.value;

        const password = elemPassword.value;

        const isTeacher = checkBox.checked;
        let numberTeacher:number = 0;
        if(isTeacher){
            numberTeacher = 1;
        }

        console.log(username, password, numberTeacher);
        const data = {username:username, password:password, teacher:numberTeacher};
        //await fetchRestEndpoint("http://localhost:3000/users/signup", "POST", data);
        //loginStatus.innerHTML = "Signup successful, please login to continue";

    //} catch (e) {
    //    alert(e);
   //}
}
