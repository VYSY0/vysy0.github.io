function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let Page1buttonIsActive = false

const background = document.getElementById('bg');
const header = document.getElementById('headerView')

const  buttonSection = document.getElementById('buttonSection')

window.addEventListener('load', async () => {
  background.style.filter = 'blur(0)';
  background.style.width = '100%'
  await wait(5000)

  header.style.transform = "translateY(0)"
  header.style.opacity = 1
  await wait(1000)
  buttonSection.style.opacity = 1
  Page1buttonIsActive = true
});


const buttonYes = document.getElementById('buttonYes')
const buttonNo = document.getElementById(`buttonNo`)

const message = document.getElementById(`message`)


buttonNo.addEventListener(`click`, async () => {
  if (!Page1buttonIsActive) return;
  const answer = confirm(`Napewno nie chcesz otworzyć prezentu?`)

  if (answer) {
  window.close()
}
})

buttonYes.addEventListener(`click`, async () => {
    if (!Page1buttonIsActive) return;

  buttonSection.style.opacity = 0
  buttonNo.style.cursor = "auto"
  buttonYes.style.cursor = "auto"
  message.style.opacity = 1
  Page1buttonIsActive = false
})