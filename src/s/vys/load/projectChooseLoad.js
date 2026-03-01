import { wait } from '../../wait.js';

const background = document.getElementById('bg');
const header = document.getElementById('main-header');
const projectsSection = document.getElementById('projects');

window.addEventListener('load', () => {
  requestAnimationFrame(async () => {
    if (background) background.classList.add('loaded');
    await wait(5000);
    if (header) header.classList.add('loaded');
    if (projectsSection) projectsSection.classList.add('loaded');
  });
});
