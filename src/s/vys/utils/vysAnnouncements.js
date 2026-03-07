import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

const container = document.getElementById('file-container');
console.log('Script loaded, container:', container);

// funkcja wyciągająca datę z nazwy pliku
function getDateFromFileName(filename) {
  const match = filename.match(/_(\d{2}\+\d{2}\+\d{4})_(\d{2}:\d{2})/);
  if (match) {
    const date = match[1].replace(/\+/g, '/');
    const time = match[2];
    return `${date} ${time}`;
  }
  // Fallback dla starego formatu bez godziny
  const oldMatch = filename.match(/_(\d{2}\+\d{2}\+\d{4})/);
  return oldMatch ? oldMatch[1].replace(/\+/g, ' ') : 'Unknown date';
}

// Funkcja do ładowania plików lokalnie (dla developmentu)
async function loadLocalFiles() {
  console.log('Loading local files...');
  try {
    // Lista plików do załadowania (można rozszerzyć)
    const files = ['an_07+03+2026_19:04.md'];

    for (const file of files) {
      console.log(`Fetching file: ./a/${file}`);
      const response = await fetch(`./a/${file}`);
      console.log(`Response status: ${response.status}`);
      if (response.ok) {
        const mdText = await response.text();
        console.log(`Markdown text: ${mdText}`);
        const fileDiv = document.createElement('div');
        fileDiv.classList.add('file-item');

        const htmlContent = marked(mdText);
        console.log(`HTML content: ${htmlContent}`);

        fileDiv.innerHTML = `
          <div class="file-name">${file}</div>
          <div class="file-content">${htmlContent}</div>
          <div class="file-date">${getDateFromFileName(file)}</div>
        `;
        container.appendChild(fileDiv);
        console.log('File div added to container');
      } else {
        console.error(`Failed to load ${file}: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Error loading local files:', error);
    // Fallback do GitHub API
    loadFromGitHub();
  }
}

// Funkcja do ładowania z GitHub API
async function loadFromGitHub() {
  const apiUrl =
    'https://api.github.com/repos/VYSY0/vysy0.github.io/contents/pages/vys/a';

  try {
    const res = await fetch(apiUrl);
    const files = await res.json();

    files.slice(0, 5).forEach(async (file) => {
      if (file.name.endsWith('.md')) {
        try {
          const res = await fetch(file.download_url);
          const mdText = await res.text();

          const fileDiv = document.createElement('div');
          fileDiv.classList.add('file-item');

          const htmlContent = marked(mdText);

          fileDiv.innerHTML = `
            <div class="file-name">${file.name}</div>
            <div class="file-content">${htmlContent}</div>
            <div class="file-date">${getDateFromFileName(file.name)}</div>
          `;
          container.appendChild(fileDiv);
        } catch (error) {
          console.error('Error fetching file:', file.name, error);
        }
      }
    });
  } catch (error) {
    console.error('Error fetching files from GitHub:', error);
  }
}

// Sprawdź czy jesteśmy na localhost
if (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) {
  console.log('Running on localhost, loading local files');
  loadLocalFiles();
} else {
  console.log('Running on production, loading from GitHub');
  loadFromGitHub();
}
