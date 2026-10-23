// COLOR TOOLS: mobile navigation, tool flow, palette generation and contrast checks.
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.getElementById('nav-links');
menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

const defaultView = document.getElementById('tools-default');
const workspace = document.getElementById('tools-workspace');
const palettePanel = document.getElementById('palette-panel');
const contrastPanel = document.getElementById('contrast-panel');
const paletteTab = document.getElementById('palette-tab');
const contrastTab = document.getElementById('contrast-tab');

// Figma flow: Default -> selected tool input -> result; tabs switch tools.
function openTool(tool) {
  defaultView.hidden = true;
  workspace.hidden = false;
  const paletteActive = tool === 'palette';
  palettePanel.hidden = !paletteActive;
  contrastPanel.hidden = paletteActive;
  paletteTab.setAttribute('aria-selected', String(paletteActive));
  contrastTab.setAttribute('aria-selected', String(!paletteActive));
}
document.querySelectorAll('[data-tool]').forEach(button => {
  button.addEventListener('click', () => openTool(button.dataset.tool));
});
paletteTab.addEventListener('click', () => openTool('palette'));
contrastTab.addEventListener('click', () => openTool('contrast'));
document.getElementById('back-to-tools').addEventListener('click', () => {
  workspace.hidden = true;
  defaultView.hidden = false;
});

// HEX helpers: accept #RRGGBB or RRGGBB and reject invalid characters.
function normalizeHex(raw) {
  const hex = raw.trim().replace(/^#/, '');
  return /^[0-9a-f]{6}$/i.test(hex) ? `#${hex.toUpperCase()}` : null;
}
function hexToRgb(hex) {
  return [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16));
}
function rgbToHex(channels) {
  return '#' + channels.map(channel => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0')).join('').toUpperCase();
}
function attachPicker(hexId, pickerId, onChange) {
  const hexInput = document.getElementById(hexId);
  const picker = document.getElementById(pickerId);
  picker.addEventListener('input', () => {
    hexInput.value = picker.value.slice(1).toUpperCase();
    if (onChange) onChange();
  });
  hexInput.addEventListener('input', () => {
    const normalized = normalizeHex(hexInput.value);
    if (normalized) {
      picker.value = normalized;
      if (onChange) onChange();
    }
  });
  return hexInput;
}
const paletteHex = attachPicker('palette-hex', 'palette-picker', () => {
  document.getElementById('palette-error').hidden = true;
});

// Harmonious colors using HSL: original shade plus nearby and lighter shades.
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const difference = max - min;
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (difference !== 0) {
    s = difference / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / difference) % 6; break;
      case g: h = (b - r) / difference + 2; break;
      default: h = (r - g) / difference + 4;
    }
    h = (h * 60 + 360) % 360;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgb.map(channel => (channel + m) * 255);
}
function generatePalette(baseHex) {
  const [h, s, l] = rgbToHsl(...hexToRgb(baseHex));
  // Analogous tones with progressively lighter values, as in the Figma result.
  return [
    baseHex,
    rgbToHex(hslToRgb((h + 24) % 360, Math.min(.9, s * .85), Math.min(.79, l + .16))),
    rgbToHex(hslToRgb((h + 45) % 360, Math.min(.75, s * .65), Math.min(.84, l + .26))),
    rgbToHex(hslToRgb((h + 62) % 360, Math.min(.65, s * .45), Math.min(.93, l + .40)))
  ];
}
function addCopyFeedback(button, value) {
  navigator.clipboard.writeText(value).then(() => {
    button.classList.add('copied');
    button.title = 'Copied!';
    setTimeout(() => { button.classList.remove('copied'); button.title = `Copy ${value}`; }, 1100);
  }).catch(() => window.prompt('Copy this HEX value:', value));
}
document.getElementById('generate-palette').addEventListener('click', () => {
  const hex = normalizeHex(paletteHex.value);
  const error = document.getElementById('palette-error');
  error.hidden = Boolean(hex);
  if (!hex) { paletteHex.focus(); return; }
  paletteHex.value = hex.slice(1);
  document.getElementById('palette-picker').value = hex;
  const result = document.getElementById('palette-results');
  result.replaceChildren();
  generatePalette(hex).forEach(color => {
    const card = document.createElement('div');
    card.className = 'palette-card';
    const swatch = document.createElement('div');
    swatch.className = 'palette-color';
    swatch.style.backgroundColor = color;
    const details = document.createElement('div');
    details.className = 'palette-details';
    const name = document.createElement('strong');
    name.textContent = color;
    const copy = document.createElement('button');
    copy.className = 'palette-copy';
    copy.type = 'button';
    copy.title = `Copy ${color}`;
    copy.setAttribute('aria-label', `Copy ${color}`);
    copy.innerHTML = '<img src="../contact/icons/copy_icon.png" alt="">';
    copy.addEventListener('click', () => addCopyFeedback(copy, color));
    details.append(name, copy);
    card.append(swatch, details);
    result.append(card);
  });
  document.getElementById('palette-empty').hidden = true;
  result.hidden = false;
});

// Contrast checker: WCAG relative luminance and contrast ratio formulas.
const textHex = attachPicker('text-hex', 'text-picker', resetContrastResult);
const backgroundHex = attachPicker('background-hex', 'background-picker', resetContrastResult);
function resetContrastResult() {
  document.getElementById('contrast-error').hidden = true;
  document.getElementById('contrast-results').hidden = true;
  document.getElementById('contrast-empty').hidden = false;
  document.getElementById('contrast-preview').hidden = true;
  document.getElementById('contrast-preview-heading').hidden = true;
}
function relativeLuminance(hex) {
  const linear = hexToRgb(hex).map(value => {
    const channel = value / 255;
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}
function contrastRatio(first, second) {
  const one = relativeLuminance(first), two = relativeLuminance(second);
  return (Math.max(one, two) + .05) / (Math.min(one, two) + .05);
}
// Fresh example copy for each contrast check (large lead + smaller detail).
const previewSamples = [
  ['The quick brown fox', 'jumps over the lazy dog.'],
  ['Colors tell a story', 'make every word easy to read.'],
  ['Design with confidence', 'check each shade before you share.'],
  ['Small details matter', 'especially when everyone should be able to read.'],
  ['Find your perfect match', 'balance expression with clarity.'],
  ['Make ideas stand out', 'with colors that work together.']
];
let lastPreviewIndex = -1;
function choosePreviewSample() {
  // Avoid showing the same phrase on consecutive checks.
  const offset = 1 + Math.floor(Math.random() * (previewSamples.length - 1));
  lastPreviewIndex = (lastPreviewIndex + offset) % previewSamples.length;
  return previewSamples[lastPreviewIndex];
}

document.getElementById('check-contrast').addEventListener('click', () => {
  const foreground = normalizeHex(textHex.value);
  const background = normalizeHex(backgroundHex.value);
  const error = document.getElementById('contrast-error');
  error.hidden = Boolean(foreground && background);
  if (!foreground || !background) return;
  textHex.value = foreground.slice(1);
  backgroundHex.value = background.slice(1);
  document.getElementById('text-picker').value = foreground;
  document.getElementById('background-picker').value = background;
  const preview = document.getElementById('contrast-preview');
  const [lead, detail] = choosePreviewSample();
  document.getElementById('preview-lead').textContent = lead;
  document.getElementById('preview-detail').textContent = detail;
  preview.hidden = false;
  document.getElementById('contrast-preview-heading').hidden = false;
  preview.style.color = foreground;
  preview.style.backgroundColor = background;
  const ratio = contrastRatio(foreground, background);
  const passesAAA = ratio >= 7;
  const passesAA = ratio >= 4.5;
  const title = document.getElementById('contrast-title');
  const description = document.getElementById('contrast-description');
  const icon = document.getElementById('contrast-icon');
  document.getElementById('contrast-ratio').textContent = `${ratio.toFixed(2)}:1`;
  title.textContent = passesAA ? 'Nice Match!' : 'Low Contrast';
  description.textContent = passesAAA ? 'Passes WCAG AA and AAA for normal text.' : passesAA ? 'Passes WCAG AA for normal text.' : 'Does not meet WCAG AA for normal text (4.5:1).';
  icon.src = passesAA ? '../contact/icons/patch-check.png' : '../contact/icons/patch-exclamation.png';
  document.getElementById('contrast-empty').hidden = true;
  document.getElementById('contrast-results').hidden = false;
});
