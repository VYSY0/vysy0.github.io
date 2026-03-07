import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

const container = document.getElementById('file-container');
console.log('Script loaded, container:', container);

// funkcja wyciągająca datę z nazwy pliku
function getDateFromFileName(filename) {
  // Nowy format: an_07-03-2026_19-04.md
  const match = filename.match(/_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})/);
  if (match) {
    const [, day, month, year, hour, min] = match;
    return `${day} ${month} ${year} ${hour}:${min}`;
  }
  // Fallback dla starego formatu
  const oldMatch = filename.match(/_(\d{2}\+\d{2}\+\d{4})/);
  return oldMatch ? oldMatch[1].replace(/\+/g, ' ') : 'Unknown date';
}

// Funkcja do wyciągnięcia daty do sortowania (YYYYMMDDHHMI)
function getSortableDate(filename) {
  const match = filename.match(/_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})/);
  if (match) {
    const [, day, month, year, hour, min] = match;
    return `${year}${month}${day}${hour}${min}`;
  }
  return '';
}

// Funkcja do ładowania plików lokalnie (dla developmentu)
async function loadLocalFiles() {
  console.log('Loading local files...');
  try {
    // Lista plików do załadowania (można rozszerzyć)
    const filenames = ['an_07-03-2026_19-04.md', 'an_07-03-2026_19-10.md'];
    let loadedFiles = [];

    for (const file of filenames) {
      console.log(`Fetching file: ./a/${file}`);
      const response = await fetch(`./a/${file}`);
      console.log(`Response status: ${response.status}`);
      if (response.ok) {
        const mdText = await response.text();
        if (mdText.trim() !== '') {
          loadedFiles.push({ name: file, content: mdText });
        }
      }
    }

    if (loadedFiles.length > 0) {
      console.log('Local files loaded:', loadedFiles.length);
      displayFilesFromArray(loadedFiles);
    } else {
      console.warn('No local files found, trying GitHub API');
      loadFromGitHub();
    }
  } catch (error) {
    console.error('Error loading local files:', error);
    // Fallback do GitHub API
    loadFromGitHub();
  }
}

// Wyświetl wszystkie pliki z tablicy
function displayFilesFromArray(filesArray) {
  console.log('Displaying', filesArray.length, 'files');
  
  filesArray.forEach(file => {
    const htmlContent = marked(file.content);
    const fileDiv = document.createElement('div');
    fileDiv.classList.add('file-item');
    fileDiv.innerHTML = `
      <div class="file-name">${file.name}</div>
      <div class="file-content">${htmlContent}</div>
      <div class="file-date">${getDateFromFileName(file.name)}</div>
    `;
    container.appendChild(fileDiv);
  });
  
  console.log('All files added to page');
}

// Funkcja do ładowania z GitHub API
async function loadFromGitHub() {
  const apiUrl =
    'https://api.github.com/repos/VYSY0/vysy0.github.io/contents/pages/vys/a';

  try {
    const res = await fetch(apiUrl);
    const files = await res.json();

    // Filtruj pliki o nowym formacie
    const mdFiles = files.filter(f => f.name.match(/^an_\d{2}-\d{2}-\d{4}_\d{2}-\d{2}\.md$/));
    
    // Sortuj od najnowszego do najstarszego
    mdFiles.sort((a, b) => {
      const sortA = getSortableDate(a.name);
      const sortB = getSortableDate(b.name);
      return sortB.localeCompare(sortA);
    });

    // Weź maksymalnie 5 plików
    const selectedFiles = mdFiles.slice(0, 5);

    console.log('Found files:', selectedFiles.map(f => f.name));

    if (selectedFiles.length > 0) {
      // Załaduj zawartość wszystkich plików
      for (const file of selectedFiles) {
        try {
          const mdResponse = await fetch(file.download_url);
          const mdText = await mdResponse.text();

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
    } else {
      console.error('No files found');
      container.innerHTML = '<p>No announcements found</p>';
    }
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
