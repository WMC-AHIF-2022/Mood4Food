const foodLnk: HTMLLinkElement = document.getElementById('foodLnk') as HTMLLinkElement;
const orderLnk: HTMLLinkElement = document.getElementById('orderLnk') as HTMLLinkElement;
const classLnk: HTMLLinkElement = document.getElementById('classLnk') as HTMLLinkElement;
const homeLnk: HTMLLinkElement = document.getElementById('homeLnk') as HTMLLinkElement;

foodLnk.addEventListener('click', () => window.location.href = "/pages/foodlistSite/");
orderLnk.addEventListener('click', () => window.location.href = "/pages/OrderSite/");
classLnk.addEventListener('click', () => window.location.href = "/");
homeLnk.addEventListener('click', ()=> window.location.href = "/");