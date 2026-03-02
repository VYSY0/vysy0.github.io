import { wait } from '../../wait.js';

const background = document.getElementById('bg');

window.addEventListener('load', () => {
  requestAnimationFrame(async () => {
    await wait(1000); // wait for 1 second
    if (background) background.classList.add('loaded');
  });
});
