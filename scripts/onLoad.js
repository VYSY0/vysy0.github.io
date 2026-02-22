import { wait } from "./actions.js";


async function headerAnimationOnLoad() {
    const header = document.getElementById('headerBeforeLoad');
    await wait(1000);
    header.style.opacity = 0.5;
    header.style.transform = 'translateY(0)';

    await wait(1000)

    header.style.opacity = 1;

}

window.addEventListener('load', () => {
    headerAnimationOnLoad();
})