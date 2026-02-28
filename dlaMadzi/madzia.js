const background = document.getElementById('bg');
const sekcja = document.getElementById(`sekcjaOpa`);
const header = document.getElementById(`headerL`);
window.addEventListener('load', async () => {
  background.style.filter = 'blur(0)';
  await sleep(5000);
  sekcja.style.opacity = 1;
  header.style.opacity = 1;
});
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
