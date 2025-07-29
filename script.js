// Script for RealtyPro website

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  // Gallery functionality on property page
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('mainImage');
  if (thumbnails && mainImage) {
    thumbnails.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        // Update main image source
        const newSrc = thumb.getAttribute('data-large');
        if (newSrc) {
          mainImage.src = newSrc;
        }
        // Remove active from all and add to clicked
        thumbnails.forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  // The map on the property page is embedded via an iframe. No need to
  // initialise Leaflet here. If interactive maps are required in future,
  // Leaflet or other libraries can be initialised at this point.

  // Initialise Three.js 3D tour if the container exists
  initThreeTour();
});

// Modal handling
function openContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.style.display = 'flex';
    // Prevent body scroll when modal open
    document.body.style.overflow = 'hidden';
  }
}

function closeContactModal() {
  const modal = document.getElementById('contactModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// Contact form submission
function sendContact(e) {
  e.preventDefault();
  alert('Спасибо! Мы свяжемся с вами в ближайшее время.');
  closeContactModal();
  // Reset form fields
  const form = e.target;
  form.reset();
}

// Favourite toggle
function toggleFavourite(button) {
  if (!button) return;
  button.classList.toggle('active');
  const isActive = button.classList.contains('active');
  // Update button content based on state
  if (isActive) {
    button.innerHTML = '<i class="fa-solid fa-heart"></i> В избранном';
  } else {
    button.innerHTML = '<i class="fa-solid fa-heart"></i> В избранное';
  }
}

// 3D tour modal handling
function open3DTour() {
  const modal = document.getElementById('tour3DModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function close3DTour() {
  const modal = document.getElementById('tour3DModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

// -----------------------------------------------------------------------------
// CSS‑based Virtual Tour
// This function creates a 3D cube using CSS transforms. Each face of the cube
// is assigned an interior image to simulate the feeling of being inside a room.
// The cube can be rotated horizontally and vertically with the mouse or touch.
function initThreeTour() {
  const container = document.getElementById('threeContainer');
  if (!container) return;
  // Clear any existing content
  container.innerHTML = '';
  // Determine the size of the cube: use the smaller of width/height to avoid
  // distortion and maintain a square base. Limit maximum to 800px for
  // performance.
  const width = container.clientWidth;
  const height = container.clientHeight;
  const size = Math.min(width, height);

  // Create the cube element
  const cube = document.createElement('div');
  cube.className = 'cube';
  cube.style.width = `${size}px`;
  cube.style.height = `${size}px`;
  // Initially rotate to a pleasant viewing angle
  let rotX = 0;
  let rotY = 0;
  cube.style.transform = `translateZ(${-size / 2}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

  // Helper to create a face
  function createFace(className, backgroundUrl, extraStyles = {}) {
    const face = document.createElement('div');
    face.className = `cube-face cube-face-${className}`;
    if (backgroundUrl) {
      face.style.backgroundImage = `url('${backgroundUrl}')`;
    }
    if (extraStyles.backgroundColor) {
      face.style.backgroundColor = extraStyles.backgroundColor;
    }
    return face;
  }

  // Compute the translation distance for each face (half of cube size)
  const tz = size / 2;

  // Faces definitions: order doesn't matter as long as transforms are set via CSS
  const faces = [
    { name: 'front', url: 'assets/interior3.png', transform: `rotateY(0deg) translateZ(${tz}px)` },
    { name: 'back', url: 'assets/interior4.png', transform: `rotateY(180deg) translateZ(${tz}px)` },
    { name: 'right', url: 'assets/interior1.png', transform: `rotateY(90deg) translateZ(${tz}px)` },
    { name: 'left', url: 'assets/interior2.png', transform: `rotateY(-90deg) translateZ(${tz}px)` },
    { name: 'top', url: null, transform: `rotateX(90deg) translateZ(${tz}px)`, color: '#ffffff' },
    { name: 'bottom', url: null, transform: `rotateX(-90deg) translateZ(${tz}px)`, color: '#ffffff' },
  ];
  faces.forEach((faceDef) => {
    const face = createFace(faceDef.name, faceDef.url, { backgroundColor: faceDef.color });
    face.style.transform = faceDef.transform;
    cube.appendChild(face);
  });

  // Append cube to container
  container.appendChild(cube);

  // Rotation control variables
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  function getClientX(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  }

  function getClientY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  function updateTransform() {
    cube.style.transform = `translateZ(${-size / 2}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  function onStart(e) {
    isDragging = true;
    startX = getClientX(e);
    startY = getClientY(e);
    e.preventDefault();
  }

  function onMove(e) {
    if (!isDragging) return;
    const x = getClientX(e);
    const y = getClientY(e);
    const dx = x - startX;
    const dy = y - startY;
    // Adjust rotation speeds; negative dy rotates along X to invert direction
    rotY += dx * 0.3;
    rotX -= dy * 0.3;
    startX = x;
    startY = y;
    updateTransform();
    e.preventDefault();
  }

  function onEnd() {
    isDragging = false;
  }

  // Event listeners for mouse and touch interactions
  cube.addEventListener('mousedown', onStart);
  cube.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchend', onEnd);

  // Recreate the cube when the container resizes to maintain proportions
  window.addEventListener('resize', () => {
    // Debounce by using requestAnimationFrame
    requestAnimationFrame(() => {
      initThreeTour();
    });
  });
}