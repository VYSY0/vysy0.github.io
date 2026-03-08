import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

const GITHUB_API_URL =
  'https://api.github.com/repos/VYSY0/vysy0.github.io/contents/a';
const ANNOUNCEMENT_FILE_PATTERN = /^an_\d{2}-\d{2}-\d{4}_\d{2}-\d{2}\.md$/;

let localFileIndexPromise;
let githubFileIndexPromise;
const contentCache = new Map();

function getDateFromFileName(filename) {
  const match = filename.match(/_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})/);
  if (match) {
    const [, day, month, year, hour, min] = match;
    return `${day}/${month}/${year} ${hour}:${min} UTC +1`;
  }
  const oldMatch = filename.match(/_(\d{2}\+\d{2}\+\d{4})/);
  return oldMatch ? oldMatch[1].replace(/\+/g, '/') : 'Unknown date';
}

function getSortableDate(filename) {
  const match = filename.match(/_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})/);
  if (match) {
    const [, day, month, year, hour, min] = match;
    return `${year}${month}${day}${hour}${min}`;
  }
  return '';
}

function sortFilesByDate(files) {
  return [...files].sort((a, b) => {
    const sortA = getSortableDate(a.name);
    const sortB = getSortableDate(b.name);
    return sortB.localeCompare(sortA);
  });
}

function displayFilesFromArray(filesArray, container) {
  console.log('Displaying', filesArray.length, 'files');
  container.innerHTML = '';

  filesArray.forEach((file) => {
    const htmlContent = marked.parse(file.content);
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

function buildLocalFileUrl(filename) {
  return `../../../../a/${filename}`;
}

async function fetchFileContent(url) {
  if (contentCache.has(url)) {
    return contentCache.get(url);
  }

  const contentPromise = (async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.text();
  })().catch((error) => {
    contentCache.delete(url);
    throw error;
  });

  contentCache.set(url, contentPromise);
  return contentPromise;
}

async function getLocalFileIndex() {
  if (!localFileIndexPromise) {
    localFileIndexPromise = (async () => {
      const response = await fetch('../../../../a/');
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const files = [...doc.querySelectorAll('a[href]')]
        .map((link) => link.getAttribute('href') || '')
        .map((href) => href.split('/').pop()?.split('?')[0] || '')
        .map((name) => decodeURIComponent(name))
        .filter((name) => ANNOUNCEMENT_FILE_PATTERN.test(name))
        .map((name) => ({ name }));

      return sortFilesByDate(
        files.filter(
          (file, index, array) =>
            array.findIndex((item) => item.name === file.name) === index
        )
      );
    })().catch((error) => {
      localFileIndexPromise = null;
      throw error;
    });
  }

  return localFileIndexPromise;
}

async function getGitHubFileIndex() {
  if (!githubFileIndexPromise) {
    githubFileIndexPromise = (async () => {
      const response = await fetch(GITHUB_API_URL);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const files = await response.json();
      if (!Array.isArray(files)) {
        throw new Error('Invalid GitHub API response');
      }

      return sortFilesByDate(
        files
          .filter((file) => ANNOUNCEMENT_FILE_PATTERN.test(file.name))
          .map((file) => ({
            name: file.name,
            downloadUrl: file.download_url,
          }))
      );
    })().catch((error) => {
      githubFileIndexPromise = null;
      throw error;
    });
  }

  return githubFileIndexPromise;
}

async function loadFiles(fileIndex, maxFiles, getUrl) {
  const selectedFiles = fileIndex.slice(0, maxFiles);

  console.log(
    'Found files:',
    selectedFiles.map((file) => file.name)
  );

  const loadedFiles = await Promise.all(
    selectedFiles.map(async (file) => {
      try {
        const mdText = await fetchFileContent(getUrl(file));
        if (mdText.trim() === '') {
          return null;
        }

        return { name: file.name, content: mdText };
      } catch (error) {
        console.error('Error fetching file:', file.name, error);
        return null;
      }
    })
  );

  return loadedFiles.filter(Boolean);
}

async function loadAnnouncements(maxFiles, preferLocal) {
  if (preferLocal) {
    try {
      console.log('Trying to load local files');
      const localFileIndex = await getLocalFileIndex();
      const localFiles = await loadFiles(localFileIndex, maxFiles, (file) =>
        buildLocalFileUrl(file.name)
      );

      if (localFiles.length > 0) {
        console.log('Local files loaded:', localFiles.length);
        return localFiles;
      }

      console.warn('No local files found, trying GitHub API');
    } catch (error) {
      console.error('Error loading local files:', error);
    }
  }

  const githubFileIndex = await getGitHubFileIndex();
  const githubFiles = await loadFiles(
    githubFileIndex,
    maxFiles,
    (file) => file.downloadUrl
  );

  console.log('GitHub files loaded:', githubFiles.length);
  return githubFiles;
}

export async function showAnnouncements(
  maxFiles = 5,
  elementID = 'file-container'
) {
  console.log(
    `showAnnouncements called with maxFiles=${maxFiles}, elementID=${elementID}`
  );

  const container = document.getElementById(elementID);
  if (!container) {
    console.error(`Element with ID "${elementID}" not found!`);
    return;
  }

  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  console.log('Is localhost:', isLocalhost);

  if (isLocalhost) {
    console.log('Running on localhost');
  } else {
    console.log('Running on production');
  }

  try {
    const files = await loadAnnouncements(maxFiles, isLocalhost);

    if (files.length > 0) {
      displayFilesFromArray(files, container);
    } else {
      console.error('No files found');
      container.innerHTML = '<p>No announcements found</p>';
    }
  } catch (error) {
    console.error('Error loading announcements:', error);
    container.innerHTML =
      '<p>Error loading announcements: ' + error.message + '</p>';
  }
}

if (document.getElementById('file-container')) {
  console.log('Auto-loading announcements for default container');
  showAnnouncements(5, 'file-container');
}
