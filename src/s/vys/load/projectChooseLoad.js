function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const background = document.getElementById('bg');
const header = document.getElementById('main-header');
const projectsSection = document.getElementById('projects');
const contact = document.getElementById('contact');

window.addEventListener('load', () => {
  requestAnimationFrame(async () => {
    if (background) background.classList.add('loaded');
    await wait(1500);
    if (header) header.classList.add('loaded');
    if (projectsSection) projectsSection.classList.add('loaded');
    if (contact) contact.classList.add('loaded');
  });
});
