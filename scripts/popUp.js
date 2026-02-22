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
    <p>System ras i mechanik RPG, pozwalający graczom tworzyć unikalne postacie.</p>
  `,
  endfallen: `
    <h1>EndfallenSMP</h1>
    <hr>
    <p>Mroczny projekt z własnym lore i mechaniką przetrwania w świecie Endfallen.</p>
  `,
  bread: `
    <h1>BreadSMP</h1>
    <hr>
    <p>Projekt społecznościowy z twistem, skupiony na współpracy i kreatywności graczy.</p>
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