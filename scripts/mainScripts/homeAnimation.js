import { wait } from "../utils/main.js";

const html = document.getElementById('html')
const body = document.getElementById('body')
const Header = document.getElementById('headerStyle')
const Navigation = document.getElementById('navigation')
const sections = document.querySelectorAll('section')

window.addEventListener(`load`, async () => {
    await wait(5000)
    Header.style.opacity = 0;
    
    await wait(500)
    Navigation.classList.add('fade-in-down')
    Navigation.style.opacity = "1"
    
    await wait(500)
    sections.forEach(async (section, index) => {
        await wait(300 * index)
        section.classList.add('fade-in-up')
        section.style.opacity = "1"
    })
    html.style.overflow = "scroll";
})