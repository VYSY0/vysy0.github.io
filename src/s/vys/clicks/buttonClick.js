import { wait } from '../../wait.js';
const vysWebsite = document.getElementById('vysWeb');
const hsmpWebsite = document.getElementById('hsmpWeb');
const background = document.getElementById('bg');
const header = document.getElementById('main-header');
const projectsSection = document.getElementById('projects');
const contact = document.getElementById('contact');

function removeLoadedClass() {
  if (background) background.classList.remove('loaded');
  if (header) header.classList.remove('loaded');
  if (projectsSection) projectsSection.classList.remove('loaded');
  if (contact) contact.classList.remove('loaded');
}

window.addEventListener('load', () => {
  if (vysWebsite) {
    vysWebsite.addEventListener('click', async () => {
      removeLoadedClass();
      await wait(1500);
      window.open('./pages/vys/home.html', '_self');
    });
  }

  if (hsmpWebsite) {
    hsmpWebsite.addEventListener('click', async () => {
      removeLoadedClass();
      await wait(1500);
      window.open('./pages/hsmp/home.html', '_self');
    });
  }
});
