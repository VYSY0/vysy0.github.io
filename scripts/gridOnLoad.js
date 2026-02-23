import { wait } from './actions.js';

export async function gridOnLoad() {
     const grid = document.getElementById('grid');
     if (!grid) return;

     for (const gridElement of grid.children) {
          await wait(500);
          gridElement.style.opacity = 1;
     }
}
