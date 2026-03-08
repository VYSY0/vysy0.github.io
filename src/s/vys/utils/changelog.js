import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

const GITHUB_API_URL =
  'https://api.github.com/repos/VYSY0/vysy0.github.io/contents/changelogs';
const LOCAL_CHANGELOGS_URL = new URL(
  '../../../../changelogs/',
  import.meta.url
);
const CHANGELOG_FILE_PATTERN = /^ch_v(\d+)-(\d+)-(\d+)\.md$/i;

let localFileIndexPromise;
let githubFileIndexPromise;
const contentCache = new Map();

function parseChangelogFileName(filename) {
  const match = filename.match(CHANGELOG_FILE_PATTERN);
  if (!match) {
    return null;
  }

  const [, major, minor, patch] = match;
  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
  };
}

function getVersionLabel(filename) {
  const parsedVersion = parseChangelogFileName(filename);
  if (!parsedVersion) {
    return filename;
  }

  return `v${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;
}

function compareVersions(fileA, fileB) {
  const versionA = parseChangelogFileName(fileA.name);
  const versionB = parseChangelogFileName(fileB.name);

  if (!versionA && !versionB) {
    return fileB.name.localeCompare(fileA.name);
  }

  if (!versionA) {
    return 1;
  }

  if (!versionB) {
    return -1;
  }

  if (versionA.major !== versionB.major) {
    return versionB.major - versionA.major;
  }

  if (versionA.minor !== versionB.minor) {
    return versionB.minor - versionA.minor;
  }

  return versionB.patch - versionA.patch;
}

function sortFilesByVersion(files) {
  return [...files].sort(compareVersions);
}

function displayFilesFromArray(filesArray, container) {
  console.log('Displaying', filesArray.length, 'changelog files');
  container.innerHTML = '';

  filesArray.forEach((file) => {
    const htmlContent = marked.parse(file.content);
    const fileDiv = document.createElement('div');
    fileDiv.classList.add('file-item');
    fileDiv.innerHTML = `
      <div class="file-name">${getVersionLabel(file.name)}</div>
      <div class="file-content">${htmlContent}</div>
      <div class="file-date">${file.name}</div>
    `;
    container.appendChild(fileDiv);
  });

  console.log('All changelog files added to page');
}

function buildLocalFileUrl(filename) {
  return new URL(filename, LOCAL_CHANGELOGS_URL).toString();
}

function buildLocalDirectoryUrl() {
  return LOCAL_CHANGELOGS_URL.toString();
}

function deduplicateFilesByName(files) {
  return files.filter(
    (file, index, array) =>
      array.findIndex((item) => item.name === file.name) === index
  );
}

function shouldPreferLocalChangelogs() {
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
        .filter((name) => CHANGELOG_FILE_PATTERN.test(name))
        .map((name) => ({ name }));

      return sortFilesByVersion(deduplicateFilesByName(files));
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

      return sortFilesByVersion(
        files
          .filter((file) => CHANGELOG_FILE_PATTERN.test(file.name))
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
    'Found changelog files:',
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
        console.warn('Skipping empty changelog file:', file.name);
        continue;
      }

      loadedFiles.push({ name: file.name, content: mdText });
    } catch (error) {
      console.error('Error fetching changelog file:', file.name, error);
    }
  }

  return loadedFiles;
}

async function loadChangelogs(maxFiles, preferLocal) {
  if (preferLocal) {
    try {
      console.log('Trying to load local changelog files');
      const localFileIndex = await getLocalFileIndex();
      const localFiles = await loadFiles(localFileIndex, maxFiles, (file) =>
        buildLocalFileUrl(file.name)
      );

      if (localFiles.length > 0) {
        console.log('Local changelog files loaded:', localFiles.length);
        return localFiles;
      }

      console.warn('No local changelog files found, trying GitHub API');
    } catch (error) {
      console.error('Error loading local changelog files:', error);
    }
  }

  const githubFileIndex = await getGitHubFileIndex();
  const githubFiles = await loadFiles(
    githubFileIndex,
    maxFiles,
    (file) => file.downloadUrl
  );

  console.log('GitHub changelog files loaded:', githubFiles.length);
  return githubFiles;
}

export async function showChangelogs(
  maxFiles = 5,
  elementID = 'file-container'
) {
  console.log(
    `showChangelogs called with maxFiles=${maxFiles}, elementID=${elementID}`
  );

  const container = document.getElementById(elementID);
  if (!container) {
    console.error(`Element with ID "${elementID}" not found!`);
    return;
  }

  const preferLocalChangelogs = shouldPreferLocalChangelogs();
  console.log('Prefer local changelogs:', preferLocalChangelogs);

  try {
    const files = await loadChangelogs(maxFiles, preferLocalChangelogs);

    if (files.length > 0) {
      displayFilesFromArray(files, container);
    } else {
      console.error('No changelog files found');
      container.innerHTML = '<p>No changelogs found</p>';
    }
  } catch (error) {
    console.error('Error loading changelogs:', error);
    container.innerHTML =
      '<p>Error loading changelogs: ' + error.message + '</p>';
  }
}

if (document.getElementById('file-container')) {
  console.log('Auto-loading changelogs for default container');
  showChangelogs(5, 'file-container');
}
