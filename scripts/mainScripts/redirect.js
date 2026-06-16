import {wait} from "../utils/main.js";

const enabled = true

window.addEventListener('load', async () => {
    if (enabled == false) {
        alert('/!\\ Redirection is Disabled.')
        return;
    }

    await wait(10000)
    window.location.href = "./home.html"
})