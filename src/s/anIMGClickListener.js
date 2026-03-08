const IMAGE_OVERLAY_ID = 'image-overlay';

let activeImage = null;

function getContainer(containerRef) {
  if (containerRef instanceof Element) {
    return containerRef;
  }

  if (typeof containerRef !== 'string') {
    return null;
  }

  if (
    containerRef.startsWith('#') ||
    containerRef.startsWith('.') ||
    containerRef.includes(' ')
  ) {
    return document.querySelector(containerRef);
  }

  return document.getElementById(containerRef) || document.querySelector(containerRef);
}

function getImageScopes(container) {
  const scopedContents = Array.from(container.querySelectorAll('.file-content'));
  return scopedContents.length > 0 ? scopedContents : [container];
}

function createOrUpdateImageGrid(scope) {
  const images = Array.from(scope.querySelectorAll('img'));
  if (images.length <= 1) {
    return;
  }

  let grid = scope.querySelector(':scope > .image-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.classList.add('image-grid');
    scope.appendChild(grid);
  }

  grid.classList.toggle('two', images.length <= 7);
  grid.classList.toggle('three', images.length > 7);

  images.forEach((image) => {
    if (image.parentElement !== grid) {
      grid.appendChild(image);
    }
  });
}

function ensureImageOverlay() {
  let overlay = document.getElementById(IMAGE_OVERLAY_ID);
  if (overlay) {
    return overlay;
  }

  overlay = document.createElement('div');
  overlay.id = IMAGE_OVERLAY_ID;
  overlay.className = 'image-overlay';

  const overlayImage = document.createElement('img');
  overlayImage.className = 'image-overlay-content';
  overlayImage.alt = '';
  overlay.appendChild(overlayImage);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target === overlayImage) {
      closeEnlargedImage();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeEnlargedImage();
    }
  });

  document.body.appendChild(overlay);
  return overlay;
}

export function closeEnlargedImage() {
  const overlay = document.getElementById(IMAGE_OVERLAY_ID);
  if (!overlay) {
    return;
  }

  overlay.classList.remove('is-visible');
  document.body.classList.remove('image-overlay-open');

  const overlayImage = overlay.querySelector('.image-overlay-content');
  if (overlayImage instanceof HTMLImageElement) {
    overlayImage.removeAttribute('src');
    overlayImage.alt = '';
  }

  if (activeImage) {
    activeImage.classList.remove('enlargedImage');
    activeImage = null;
  }
}

export function enlargeImage(image) {
  if (!(image instanceof HTMLImageElement)) {
    return;
  }

  const overlay = ensureImageOverlay();
  const overlayImage = overlay.querySelector('.image-overlay-content');
  if (!(overlayImage instanceof HTMLImageElement)) {
    return;
  }

  const isSameImageOpen =
    overlay.classList.contains('is-visible') && activeImage === image;

  if (isSameImageOpen) {
    closeEnlargedImage();
    return;
  }

  if (activeImage) {
    activeImage.classList.remove('enlargedImage');
  }

  activeImage = image;
  activeImage.classList.add('enlargedImage');

  overlayImage.src = image.currentSrc || image.src;
  overlayImage.alt = image.alt || '';

  overlay.classList.add('is-visible');
  document.body.classList.add('image-overlay-open');
}

export function setupImageInteractions(containerRef) {
  const container = getContainer(containerRef);
  if (!container || container.dataset.imageInteractionsReady === 'true') {
    return null;
  }

  container.dataset.imageInteractionsReady = 'true';

  let isSyncingGrid = false;

  const syncImageGrids = () => {
    if (isSyncingGrid) {
      return;
    }

    isSyncingGrid = true;

    try {
      getImageScopes(container).forEach(createOrUpdateImageGrid);
    } finally {
      isSyncingGrid = false;
    }
  };

  syncImageGrids();

  const observer = new MutationObserver(() => {
    syncImageGrids();
  });

  observer.observe(container, { childList: true, subtree: true });

  container.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLImageElement)) {
      return;
    }

    if (!container.contains(event.target)) {
      return;
    }

    const parentLink = event.target.closest('a');
    if (parentLink) {
      event.preventDefault();
    }

    enlargeImage(event.target);
  });

  return () => {
    observer.disconnect();
    delete container.dataset.imageInteractionsReady;
  };
}
