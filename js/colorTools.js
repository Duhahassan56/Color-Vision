const paletteTabBtn = document.getElementById('paletteTabBtn');
const contrastTabBtn = document.getElementById('contrastTabBtn');
const palettePanel = document.getElementById('palettePanel');
const contrastPanel = document.getElementById('contrastPanel');

if (contrastTabBtn && paletteTabBtn) {
  contrastTabBtn.addEventListener('click', () => {
    contrastTabBtn.classList.add('active');
    paletteTabBtn.classList.remove('active');
    contrastPanel.classList.remove('hidden');
    palettePanel.classList.add('hidden');
  });

  paletteTabBtn.addEventListener('click', () => {
    paletteTabBtn.classList.add('active');
    contrastTabBtn.classList.remove('active');
    palettePanel.classList.remove('hidden');
    contrastPanel.classList.add('hidden');
  });
}

const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');

if (colorPicker && hexInput) {
  colorPicker.addEventListener('input', (e) => {
    hexInput.value = e.target.value.replace('#', '').toUpperCase();
  });
}

const makePaletteBtn = document.getElementById('makePaletteBtn');
const paletteResultGrid = document.getElementById('paletteResultGrid');

function generatePalette(baseHex) {
  
  let hex = baseHex.replace('#', '');
  if (hex.length !== 6) hex = '0C8D90'; 
  
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

     
  const colors = [
    `#${hex.toUpperCase()}`,
    `#${Math.min(255, Math.floor(r * 1.3)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(g * 1.3)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(b * 1.3)).toString(16).padStart(2, '0')}`.toUpperCase(),
    `#${Math.min(255, Math.floor(r * 1.5)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(g * 1.5)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(b * 1.5)).toString(16).padStart(2, '0')}`.toUpperCase(),
    `#${Math.min(255, Math.floor(r * 1.8)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(g * 1.8)).toString(16).padStart(2, '0')}${Math.min(255, Math.floor(b * 1.8)).toString(16).padStart(2, '0')}`.toUpperCase()
  ];

  if (paletteResultGrid) {
    paletteResultGrid.innerHTML = '';
    colors.forEach(color => {
      const card = document.createElement('div');
      card.className = 'palette-card';
      card.style.backgroundColor = color;
      

      card.style.color = (r*0.299 + g*0.587 + b*0.114) > 180 ? '#000' : '#fff';
      card.textContent = color;
      paletteResultGrid.appendChild(card);
    });
  }
}


if (makePaletteBtn) {
  makePaletteBtn.addEventListener('click', () => {
    const userColor = hexInput ? hexInput.value : '0C8D90';
    generatePalette(userColor);
  });
}
