
const express = require('express');
const path = require('path');

const router = express.Router();

// Display the Color Tools page
router.get('/color-tools', (req, res) => {
  res.sendFile(path.join(__dirname, '../../html/color-tools.html'));
});

// Validate and normalize a HEX color
function normalizeHex(value) {
  if (typeof value !== 'string') return null;

  const hex = value.trim().replace(/^#/, '');

  return /^[0-9a-f]{6}$/i.test(hex)
    ? `#${hex.toUpperCase()}`
    : null;
}

// Convert HEX to RGB
function hexToRgb(hex) {
  return [1, 3, 5].map(start =>
    parseInt(hex.slice(start, start + 2), 16)
  );
}

// Convert RGB to HEX
function rgbToHex(channels) {
  return '#' + channels.map(channel =>
    Math.max(0, Math.min(255, Math.round(channel)))
      .toString(16)
      .padStart(2, '0')
  ).join('').toUpperCase();
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const difference = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (difference !== 0) {
    s = difference / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / difference) % 6;
        break;
      case g:
        h = (b - r) / difference + 2;
        break;
      default:
        h = (r - g) / difference + 4;
    }

    h = (h * 60 + 360) % 360;
  }

  return [h, s, l];
}

// Convert HSL to RGB
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

// Generate matching colors
function generatePalette(baseHex) {
  const [h, s, l] = rgbToHsl(...hexToRgb(baseHex));

  return [
    baseHex,
    rgbToHex(hslToRgb(
      (h + 24) % 360,
      Math.min(.9, s * .85),
      Math.min(.79, l + .16)
    )),
    rgbToHex(hslToRgb(
      (h + 45) % 360,
      Math.min(.75, s * .65),
      Math.min(.84, l + .26)
    )),
    rgbToHex(hslToRgb(
      (h + 62) % 360,
      Math.min(.65, s * .45),
      Math.min(.93, l + .40)
    ))
  ];
}

// Palette Generator API
router.post('/api/generate-palette', (req, res) => {
  const hex = normalizeHex(req.body?.hex);

  if (!hex) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid six-digit HEX color.'
    });
  }

  const colors = generatePalette(hex);

  res.json({
    success: true,
    baseColor: hex,
    colors
  });
});


// Calculate relative luminance using WCAG formula
function relativeLuminance(hex) {
  const linear = hexToRgb(hex).map(value => {
    const channel = value / 255;

    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * linear[0] +
    0.7152 * linear[1] +
    0.0722 * linear[2]
  );
}

// Calculate contrast ratio between two colors
function contrastRatio(first, second) {
  const one = relativeLuminance(first);
  const two = relativeLuminance(second);

  return (Math.max(one, two) + 0.05) /
         (Math.min(one, two) + 0.05);
}

// Contrast Checker API
router.post('/api/check-contrast', (req, res) => {
  const foreground = normalizeHex(req.body?.foreground);
  const background = normalizeHex(req.body?.background);

  if (!foreground || !background) {
    return res.status(400).json({
      success: false,
      message: 'Please enter valid six-digit HEX colors.'
    });
  }

  const ratio = contrastRatio(foreground, background);

  res.json({
    success: true,
    foreground,
    background,
    ratio: Number(ratio.toFixed(2)),
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7
  });
});


module.exports = router;
