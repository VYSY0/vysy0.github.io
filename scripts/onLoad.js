import { wait } from './actions.js';
import { gridOnLoad } from './gridOnLoad.js';

async function headerAnimationOnLoad() {
     const header = document.getElementById('headerBeforeLoad');
     await wait(1000);
     header.style.opacity = 0.5;
     header.style.transform = 'translateY(0)';

     await wait(1000);

     header.style.opacity = 1;

     const section = document.getElementById('sectionBeforeLoad');
     section.style.transform = 'translateX(0)';

     await wait(500);

     const section2 = document.getElementById('sectionBeforeLoad2');
     section2.style.transform = 'translateX(0)';

     await wait(500);

     const section3 = document.getElementById('sectionBeforeLoad3');
     section3.style.transform = 'translateX(0)';

     await wait(500);

     const section4 = document.getElementById('sectionBeforeLoad4');
     section4.style.transform = 'translateX(0)';
}

window.addEventListener('load', async () => {
     headerAnimationOnLoad();
     await wait(1000);
     gridOnLoad();
});
