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
    await wait(1000);
    if (content) content.classList.add('loaded');
    await wait(1000);
    animateH1(10, document.querySelectorAll('#animationH1')[0]);
  });
});

async function animateH1(rot, element) {
  const h1 = element || document.getElementById('animationH1');

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
    animateH1(5, entry.target);
  }
}

document.querySelectorAll('h1#animationH1').forEach((h1) => {
  observer.observe(h1);
});

function onLogoClick() {
  logo.style.transition = 'transform 0.3s ease-in-out';
  logo.style.transform = 'translateY(-20px) rotate(0deg)';
  setTimeout(() => {
    logo.style.transform = 'translateY(0px) rotate(360deg)';
  }, 300);
}

logo.addEventListener('click', onLogoClick);
