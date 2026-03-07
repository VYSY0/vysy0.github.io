import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

const container = document.getElementById('file-container');

// funkcja wyciągająca datę z nazwy pliku
function getDateFromFileName(filename) {
  const match = filename.match(/_(\d{2}\+\d{2}\+\d{4})/);
  return match ? match[1] : 'Unknown date';
}

// Twój URL do folderu z plikami md
const apiUrl =
  'https://api.github.com/repos/VYSY0/vysy0.github.io/contents/pages/vys/a';

fetch(apiUrl)
  .then((res) => res.json())
  .then((files) => {
    files.slice(0, 5).forEach((file) => {
      if (file.name.endsWith('.md')) {
        fetch(file.download_url)
          .then((res) => res.text())
          .then((mdText) => {
            const fileDiv = document.createElement('div');
            fileDiv.classList.add('file-item');

            // tutaj zamieniamy markdown na HTML
            const htmlContent = marked(mdText);

            fileDiv.innerHTML = `
              <div class="file-name">${file.name}</div>
              <div class="file-content">${htmlContent}</div>
              <div class="file-date">${getDateFromFileName(file.name)}</div>
            `;
            container.appendChild(fileDiv);
          });
      }
    });
  })
  .catch((err) => console.error('Error fetching files:', err));
