import { wait } from "../utils/main.js";

const body = document.getElementById('body')
const Header = document.getElementById('headerStyle')
window.addEventListener(`load`, async () => {
    await wait(5000)
    Header.style.transform("-40px")
    body.style.alignItems = "flex-start"
    })