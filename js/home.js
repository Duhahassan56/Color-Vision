// mobile menu, image upload, color picker and copy buttons
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav-links');

// Highlight the current page automatically when the shared navbar is reused.
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const linkPage = new URL(link.getAttribute('href'), location.href).pathname.split('/').pop();
  const isCurrent = linkPage === currentPage;
  link.classList.toggle('active', isCurrent);
  if (isCurrent) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
});
menuButton.addEventListener('click', () => {
  const opened = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(opened));
});

// DOM references 
const fileInput = document.getElementById('image-input');
const dropZone = document.getElementById('drop-zone');
const emptyState = document.getElementById('upload-empty');
const workspace = document.getElementById('image-workspace');
const canvas = document.getElementById('image-canvas');
// to active canvas tools and pixle readablity
const context = canvas.getContext('2d', { willReadFrequently: true });
const selectedColor = document.getElementById('selected-color');
const colorList = document.getElementById('color-list');
const popup = document.getElementById('color-popup');
const popupName = document.getElementById('popup-name');
const popupHex = document.getElementById('popup-hex');
const popupRgb = document.getElementById('popup-rgb');
// localstorage key name
const storageKey = 'colorVisionRecentColors';

// palette for stage 3, will remove in stage 4
const namedColors = [
  ['Burgundy','#800020'], ['Maroon','#800000'], ['Crimson','#DC143C'], ['Dark Red','#8B0000'],
  ['Red','#FF0000'], ['Coral','#FF7F50'], ['Tomato','#FF6347'], ['Orange','#FFA500'],
  ['Burnt Orange','#CC5500'], ['Gold','#FFD700'], ['Mustard','#D4A017'], ['Yellow','#FFFF00'],
  ['Olive','#808000'], ['Lime Green','#32CD32'], ['Green','#008000'], ['Forest Green','#228B22'],
  ['Mint Green','#98FF98'], ['Teal','#008080'], ['Turquoise','#40E0D0'], ['Cyan','#00FFFF'],
  ['Sky Blue','#60A5FA'], ['Light Blue','#ADD8E6'], ['Royal Blue','#4169E1'], ['Blue','#0000FF'],
  ['Navy Blue','#000080'], ['Indigo','#4B0082'], ['Purple','#800080'], ['Violet','#8F00FF'],
  ['Lavender Mist','#A78BFA'], ['Lavender','#E6E6FA'], ['Magenta','#FF00FF'],
  ['Rose Pink','#F472B6'], ['Hot Pink','#FF69B4'], ['Pink','#FFC0CB'], ['Peach','#FFE5B4'],
  ['Beige','#F5F5DC'], ['Ivory','#FFFFF0'], ['Brown','#A52A2A'], ['Chocolate','#7B3F00'],
  ['Tan','#D2B48C'], ['White','#FFFFFF'], ['Light Gray','#D3D3D3'], ['Gray','#808080'],
  ['Charcoal','#36454F'], ['Black','#000000']
];
// Find the nearest name from the temporary offline color list
// In Stage 4,JSON/server lookup can replace this function
function colorName(r, g, b) {
  let closest = 'Picked Color';
  let bestDistance = Infinity;
  for (const [name, value] of namedColors) {
    const rr = parseInt(value.slice(1, 3), 16);
    const gg = parseInt(value.slice(3, 5), 16);
    const bb = parseInt(value.slice(5, 7), 16);
    // Weighted RGB distance is a simple approximation, not an exact color naming service
    const distance = 2 * (r - rr) ** 2 + 4 * (g - gg) ** 2 + 3 * (b - bb) ** 2;
    if (distance < bestDistance) { bestDistance = distance; closest = name; }
  }
  return closest;
}
// Restore recent colors from browser
function loadSavedColors() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(item => item && /^#[0-9a-f]{6}$/i.test(item.hex) && typeof item.name === 'string' && typeof item.rgb === 'string').slice(0, 3);
  }
// if it's empty return an empty arry, don't stop the website
 catch { return []; }
}

// save colors
let recentColors = loadSavedColors();
function saveColors() {
  try { localStorage.setItem(storageKey, JSON.stringify(recentColors)); }
  catch { /* Continue working even when browser storage is blocked. */ }
}

// copy btn
function makeCopyButton(value, label) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'copy-button'; button.innerHTML = '<img src="../contact/icons/copy_icon.png" alt="" aria-hidden="true">';
  button.dataset.copy = value; button.setAttribute('aria-label', `Copy ${label}`);
  button.title = `Copy ${label}`;
  return button;
}

// Render either the empty state or the three recent colors 
function renderRecentColors() {
  colorList.replaceChildren();
  // no colors
  if (!recentColors.length) {
    const message = document.createElement('div');
    message.className = 'recent-empty';
    // make HTML for 3 color blocks icon 
    message.innerHTML = `<div class="recent-empty-swatches" aria-hidden="true"><span></span><span></span><span></span></div><strong>A Splash of Color?</strong><p>Pick a color from any image, and your last three colors will appear here.</p>`;
    colorList.append(message);
    return;
  }

  // colors saved in localstorage
  recentColors.forEach(({ hex, rgb, name }) => {
    // make the card color
    const row = document.createElement('div'); row.className = 'color-row shadow-box';
    // make the color card box to show the selected color
    const swatch = document.createElement('span'); swatch.className = 'color-swatch';
    swatch.style.setProperty('--swatch', hex);
    const title = document.createElement('strong'); title.textContent = name;
    const hexInfo = document.createElement('span'); hexInfo.append('HEX: ');
    const hexBold = document.createElement('b'); hexBold.textContent = hex;
    hexInfo.append(hexBold, ' ', makeCopyButton(hex, hex));
    const rgbInfo = document.createElement('span'); rgbInfo.append('RGB: ');
    const rgbBold = document.createElement('b'); rgbBold.textContent = rgb;
    rgbInfo.append(rgbBold, ' ', makeCopyButton(rgb, `RGB ${rgb}`));
    // wrop up the card
    row.append(swatch, title, hexInfo, rgbInfo); colorList.append(row);
  });
}
renderRecentColors();

// Keep popup at the selected point in the page as the user scrolls
function positionPopup(clientX, clientY) {
  // Anchor the card to the clicked point in the DOCUMENT, not the viewport
  // It scrolls naturally with the image and never follows the user's screen
  const section = document.getElementById('start-picking');
  const rect = section.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const gap = 16;
  const edge = 10;
  const width = popup.offsetWidth;
  const height = popup.offsetHeight;
  let left = Math.max(edge, Math.min(x - width / 2, section.clientWidth - width - edge));
  let top = y - height - gap;
  // When picking near the top of the image, place the card below the click
  if (top < edge) top = y + gap;
  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

// show the popup
function showPopup(hex, rgb, name, event) {
  popup.style.setProperty('--popup-color', hex);
  popupName.textContent = name; popupHex.textContent = hex; popupRgb.textContent = rgb;
  document.getElementById('popup-copy-hex').dataset.copy = hex;
  document.getElementById('popup-copy-rgb').dataset.copy = rgb;
  popup.hidden = false;
  positionPopup(event.clientX, event.clientY);
}
function hidePopup() { popup.hidden = true; }

// drag & drop section

// upload image
function openFilePicker() { fileInput.click(); }
document.getElementById('upload-button').addEventListener('click', openFilePicker);
document.getElementById('change-image').addEventListener('click', openFilePicker);
// chose a file
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) loadImage(fileInput.files[0]);
  fileInput.value = '';
});

// drag image
['dragenter', 'dragover'].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add('is-dragging');
  });
});
// drop image
['dragleave', 'drop'].forEach(eventName => {
  dropZone.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove('is-dragging');
  });
});
// take the dropped image
dropZone.addEventListener('drop', event => {
  const file = [...event.dataTransfer.files].find(isSupportedImage);
  if (file) loadImage(file);
  else alert('Please choose a JPG, PNG or WebP image.');
});

// check file type
function isSupportedImage(file) {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

// Show the chosen file on the canvas
function loadImage(file) {
  if (!isSupportedImage(file)) {
    alert('Please choose a JPG, PNG or WebP image.');
    return;
  }
  // make URL of image for the browser
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => {
    // Keep the canvas reasonably sized without changing sampled colors
    const scale = Math.min(1, 1400 / Math.max(image.width, image.height));
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    emptyState.hidden = true;
    workspace.hidden = false;
    selectedColor.textContent = 'Select a color from the image';
    hidePopup();
    URL.revokeObjectURL(objectUrl);
  };
  // if falied to load the image
  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    alert('Could not open this image.');
  };
  image.src = objectUrl;
}

// Read the clicked pixel, then update popup and recent history
canvas.addEventListener('click', event => {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((event.clientX - bounds.left) * canvas.width / bounds.width)));
  const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((event.clientY - bounds.top) * canvas.height / bounds.height)));
  // read pixels
  const [r, g, b] = context.getImageData(x, y, 1, 1).data;
  // from RGB to HEX
  const hex = '#' + [r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('').toUpperCase();
  //  data showen
  const rgb = `${r}, ${g}, ${b}`;
  const name = colorName(r, g, b);
  selectedColor.textContent = `Selected ${name}: ${hex} | RGB: ${rgb}`;
  showPopup(hex, rgb, name, event);
  addRecentColor(hex, rgb, name);
});

// 3 recent colors
function addRecentColor(hex, rgb, name) {
  // Avoid duplicates, most recently picked color goes first
  recentColors = [{ hex, rgb, name }, ...recentColors.filter(color => color.hex !== hex)].slice(0, 3);
  saveColors();
  renderRecentColors();
}

// Copy HEX and RGB
async function copyValue(button) {
  const value = button.dataset.copy;
  if (!value) return;
  // the copy statement
  try {
    await navigator.clipboard.writeText(value);
    // Keep the copy icon in the button; do not replace its HTML with text.
    // Give short feedback using the tooltip instead.
    const originalTitle = button.dataset.originalTitle || button.title;
    button.dataset.originalTitle = originalTitle;
    button.title = 'Copied!';
    button.setAttribute('aria-label', 'Copied!');
    button.classList.add('copy-success');
    clearTimeout(button.copyFeedbackTimer);
    button.copyFeedbackTimer = setTimeout(() => {
      button.title = originalTitle;
      button.setAttribute('aria-label', originalTitle);
      button.classList.remove('copy-success');
    }, 1200);
  }
  // if copy failed
  catch { window.prompt('Copy this value:', value); }
}
// Dismiss the popup only on outside clicks, X, or Escape
document.addEventListener('click', event => {
  const button = event.target.closest('.copy-button');
  if (button) { copyValue(button); return; }
  if (!popup.hidden && !event.target.closest('#color-popup') && event.target !== canvas) hidePopup();
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') hidePopup(); });
document.getElementById('popup-close').addEventListener('click', hidePopup);
