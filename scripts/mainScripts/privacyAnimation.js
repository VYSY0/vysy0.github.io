import { wait } from "../utils/main.js";

const html = document.getElementById('html')
const Header = document.getElementById('headerStyle')
const Navigation = document.getElementById('navigation')
const section = document.getElementById('privacy')

window.addEventListener(`load`, async () => {
    await wait(2000)
    Header.classList.add('fade-in-down')
    Header.style.opacity = "1"
    Header.style.transform = "translateY(0)"
    
    await wait(500)
    Navigation.classList.add('fade-in-down')
    Navigation.style.opacity = "1"
    
    await wait(300)
    section.classList.add('fade-in-up')
    section.style.opacity = "1"
    
    html.style.overflow = "scroll"
})
