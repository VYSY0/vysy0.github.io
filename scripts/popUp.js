const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

const projectData = {
  hiraeth: `
    <h1>HiraethSMP (More Information.)</h1>
    <hr>
    <p id="small-info">Created on 23rd July 2025, it was in development since then.</p>
    <br><br>
    <p><span class="hiraeth">HiraethSMP</span> is a Next project, directed and created by VYSY0 (A.K.A: SamuraiBread)<br>which contains it's own original Addon: <span class="addon">HSMP's Races & More.</span></p><br><br>
    <p>It is originally EndfallenSMP v2, an sequel for previous project which sadly was sabotaged by one of the admins.</p>

    <h2>How It Started</h2>
    <hr>
    <p><span class="hiraeth">HiraethSMP</span> started as a backup plan to avoid more arguments than nececarry. It wasn't locked from EndfallenSMP, it was announced on the server as a new project than will come.<br>
    Original Release date was meant to be in December 15th 2025, but sadly Addon's bugs and map's problems forced it to be delayed, and originally scrapped.</p>
    <hr>
    <div>
    <p id="small-info">First Ever Message on Old HSMP Discord Server</p>
    <img src="./images/hsmp/popup/first_ever_hsmp_msg.png">
    </div>
    `,
  races: `
    <h1>Races & More</h1>
    <hr>
    <p>Placeholder</p>
  `,
  endfallen: `
    <h1>EndfallenSMP</h1>
    <hr>
    <p>Placeholder</p>
  `,
  bread: `
    <h1>BreadSMP</h1>
    <hr>
    <p id="small-info">Server Java. Existed in time between: 2020-2023</p>
    <p>BreadSMP was a Java Server created by VYSY0, in that time he was known as VToastyToast.<br>
    It originated from the idea of private YouTuber's SMPs ideas.</p>
    <hr>
    <h1>How It Started</h1>
    <p>BreadSMP started as a normal friend's only server. It had around 5-6 members online per day.
    <br>
    <br>
    <p>At around 2021, after one member left due to private reasons, VYSY0 started to wonder if it would be a great idea to transfer the server from Free Hosting, to payed Hosting.. And publish it as a public whitelist-only server accessible by everyone.</p>
    <hr>
    <h1>Early Seasons</h1>
    <p>First seasons of BreadSMP had no lore, it was online only to have fun with random members.<br><br>
    On Season 2 one member joined, and it started the cycle of seasons with lore. First it was an catastrophe, then an entity from nether. Finally, secret laboratories..</p>
    <hr>
    <h1>The End..</h1>
    <p>On season 5, BreadSMP was sadly announced to be discontinued due to PC problems.<br><br>

  `
};

document.querySelectorAll("#grid section").forEach(section => {
  section.addEventListener("click", () => {
    const key = section.dataset.project;
    modalBody.innerHTML = projectData[key];
    modal.classList.add("active");

    document.body.style.overflow = "hidden";
  });
});

const closeModalFunction = () => {
  modal.classList.remove("active");
  document.body.style.overflow = "";
};

closeModal.addEventListener("click", closeModalFunction);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFunction();
});