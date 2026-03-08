import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

const GITHUB_API_URL =
  'https://api.github.com/repos/VYSY0/vysy0.github.io/contents/a';
const LOCAL_ANNOUNCEMENTS_URL = new URL('../../../../a/', import.meta.url);
const ANNOUNCEMENT_FILE_PATTERN =
  /^an_(\d{2})-(\d{2})-(\d{4})_(\d{2})-(\d{2})\.md$/;

let localFileIndexPromise;
let githubFileIndexPromise;
const contentCache = new Map();

function parseAnnouncementFileName(filename) {
  const match = filename.match(ANNOUNCEMENT_FILE_PATTERN);
  if (!match) {
    return null;
  }

  const [, day, month, year, hour, min] = match;
  return {
    day,
    month,
    year,
    hour,
    min,
    sortKey: `${year}${month}${day}${hour}${min}`,
  };
}

function getDateFromFileName(filename) {
  const parsedDate = parseAnnouncementFileName(filename);
  if (parsedDate) {
    const { day, month, year, hour, min } = parsedDate;
    return `${day}/${month}/${year} ${hour}:${min} UTC +1`;
  }

  const oldMatch = filename.match(/_(\d{2}\+\d{2}\+\d{4})/);
  return oldMatch ? oldMatch[1].replace(/\+/g, '/') : 'Unknown date';
}

function getSortableDate(filename) {
  return parseAnnouncementFileName(filename)?.sortKey || '';
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
  return new URL(filename, LOCAL_ANNOUNCEMENTS_URL).toString();
}

function buildLocalDirectoryUrl() {
  return LOCAL_ANNOUNCEMENTS_URL.toString();
}

function deduplicateFilesByName(files) {
  return files.filter(
    (file, index, array) =>
      array.findIndex((item) => item.name === file.name) === index
  );
}

function shouldPreferLocalAnnouncements() {
  const { hostname, protocol } = window.location;
  const isPrivateIpv4 =
    /^10\./.test(hostname) ||
    /^127\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);

  if (protocol === 'file:') {
    return true;
  }

  return (
    hostname === 'localhost' ||
    hostname === '0.0.0.0' ||
    hostname === '[::1]' ||
    isPrivateIpv4 ||
    hostname.endsWith('.local')
  );
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
      const response = await fetch(buildLocalDirectoryUrl());
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

      return sortFilesByDate(deduplicateFilesByName(files));
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
  console.log(
    'Found files:',
    fileIndex.map((file) => file.name)
  );

  const loadedFiles = [];

  for (const file of fileIndex) {
    if (loadedFiles.length >= maxFiles) {
      break;
    }

    try {
      const mdText = await fetchFileContent(getUrl(file));
      if (mdText.trim() === '') {
        console.warn('Skipping empty announcement file:', file.name);
        continue;
      }

      loadedFiles.push({ name: file.name, content: mdText });
    } catch (error) {
      console.error('Error fetching file:', file.name, error);
    }
  }

  return loadedFiles;
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

  const preferLocalAnnouncements = shouldPreferLocalAnnouncements();
  console.log('Prefer local announcements:', preferLocalAnnouncements);

  if (preferLocalAnnouncements) {
    console.log('Trying local announcements first');
  } else {
    console.log('Loading announcements from GitHub first');
  }

  try {
    const files = await loadAnnouncements(maxFiles, preferLocalAnnouncements);

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
