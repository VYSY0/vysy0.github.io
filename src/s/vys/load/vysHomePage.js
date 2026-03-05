import { wait } from '../../wait.js';

const background = document.getElementById('bg');
const logo = document.getElementById('logo');
const mainNav = document.getElementById('main-nav');

window.addEventListener('load', () => {
  requestAnimationFrame(async () => {
    if (background) background.classList.add('loaded');
    await wait(1500);
    if (logo) logo.classList.add('loaded');
    if (mainNav) mainNav.classList.add('loaded');
  });
});
