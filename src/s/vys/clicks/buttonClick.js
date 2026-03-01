import { wait } from '../../wait.js';

window.addEventListener('load', () => {
  const vysWebsite = document.getElementById('vysWeb');
  const hsmpWebsite = document.getElementById('hsmpWeb');
  const background = document.getElementById('bg');

  if (vysWebsite) {
    vysWebsite.addEventListener('click', async () => {
      if (background) background.classList.remove('loaded');
      await wait(1000);
      window.open('./pages/vys/home.html', '_self');
    });
  }

  if (hsmpWebsite) {
    hsmpWebsite.addEventListener('click', async () => {
      if (background) background.classList.remove('loaded');
      await wait(1000);
      window.open('./pages/hsmp/home.html', '_self');
    });
  }
});
