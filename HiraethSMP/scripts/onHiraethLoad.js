import { wait } from '../../scripts/actions.js';

async function titleAnimation() {
     const title = document.getElementById('hiraethTitle');
     await wait(1000);
     title.style.opacity = 1;

     await wait(2000);
     const button = document.getElementById('startButton');
     button.style.transform = 'translateY(0)';
     button.style.opacity = 1;
}

window.addEventListener('load', async () => {
     titleAnimation();
});

const button = document.getElementById('startButton');
const titleElement = document.getElementById('hiraethTitle');
const mainPage = document.getElementById('part2')

button.addEventListener('click', () => {
     titleElement.style.opacity = 0;
     button.style.opacity = 0;
     titleElement.style.pointerEvents = "none";
     button.style.pointerEvents = "none";
     mainPage.style.opacity = 1;
});
