import {fetchRestEndpoint} from "../../utils/client-server.js";

const exportBtn: HTMLButtonElement = document.getElementById("startExport") as HTMLButtonElement;

exportBtn.addEventListener('click', async()=>{
    await fetchRestEndpoint("http://localhost:3000/exporter/pdf", "GET");
});