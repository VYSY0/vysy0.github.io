const background = document.getElementById('bg');

window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    background.classList.add('loaded');
  });
});
