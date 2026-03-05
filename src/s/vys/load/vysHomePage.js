import { wait } from '../../wait.js';

const background = document.getElementById('bg');
const logo = document.getElementById('logo');
const mainNav = document.getElementById('main-nav');
const content = document.getElementById('content');

window.addEventListener('load', () => {
  requestAnimationFrame(async () => {
    if (background) background.classList.add('loaded');
    await wait(1500);
    if (logo) logo.classList.add('loaded');
    if (mainNav) mainNav.classList.add('loaded');
    if (content) content.classList.add('loaded');
    await wait(1000);
    animateH1(10);
  });
});

async function animateH1(rot) {
  const h1 = document.querySelector('#welcomeMSG h1');

  if (!h1) return;

  h1.style.transform = `rotate(${rot}deg)`;
  await wait(500);

  h1.style.transform = `rotate(${-rot}deg)`;
  await wait(500);

  h1.style.transform = `rotate(0deg)`;
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(onVisible);
  },
  {
    threshold: 0.1,
  }
);

function onVisible(entry) {
  if (entry.isIntersecting) {
    animateH1(10);
  }
}

observer.observe(document.querySelector('#welcomeMSG h1'));
