import { wait } from "../utils/main.js";

const h1 = document.getElementById('welcome')
const h2 = document.getElementById('vysy0home')
window.addEventListener(`load`, async () => {
    await wait(1000)
    h1.style.opacity = 1
    await wait(1000)
    h2.style.opacity = 1

    await wait(5000)
    
    h2.style.opacity = 0
    await wait(1000)
    h1.style.transition = "opacity 1.5s ease-in-out"
    h1.style.opacity = 0
    })