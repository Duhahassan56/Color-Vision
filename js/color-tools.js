// MOBILE NAVIGATION
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.getElementById('nav-links');

menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

// TOOL NAVIGATION
const defaultView = document.getElementById('tools-default');
const workspace = document.getElementById('tools-workspace');
const palettePanel = document.getElementById('palette-panel');
const contrastPanel = document.getElementById('contrast-panel');
const paletteTab = document.getElementById('palette-tab');
const contrastTab = document.getElementById('contrast-tab');

function openTool(tool) {
  defaultView.hidden = true;
  workspace.hidden = false;

  const paletteActive = tool === 'palette';

  palettePanel.hidden = !paletteActive;
  contrastPanel.hidden = paletteActive;

  paletteTab.setAttribute(
    'aria-selected',
    String(paletteActive)
  );

  contrastTab.setAttribute(
    'aria-selected',
    String(!paletteActive)
  );
}

document.querySelectorAll('[data-tool]').forEach(button => {
  button.addEventListener('click', () => {
    openTool(button.dataset.tool);
  });
});

paletteTab.addEventListener('click', () => {
  openTool('palette');
});

contrastTab.addEventListener('click', () => {
  openTool('contrast');
});

document.getElementById('back-to-tools').addEventListener('click', () => {
  workspace.hidden = true;
  defaultView.hidden = false;
});

// HEX VALIDATION & COLOR PICKERS
function normalizeHex(raw) {
  if (typeof raw !== 'string') return null;

  const hex = raw.trim().replace(/^#/, '');

  return /^[0-9a-f]{6}$/i.test(hex)
    ? `#${hex.toUpperCase()}`
    : null;
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
    }

    if (onChange) onChange();
  });

  return hexInput;
}

// PALETTE GENERATOR
const paletteHex = attachPicker(
  'palette-hex',
  'palette-picker',
  () => {
    document.getElementById('palette-error').hidden = true;
  }
);

function addCopyFeedback(button, value) {
  navigator.clipboard.writeText(value)
    .then(() => {
      button.classList.add('copied');
      button.title = 'Copied!';

      setTimeout(() => {
        button.classList.remove('copied');
        button.title = `Copy ${value}`;
      }, 1100);
    })
    .catch(() => {
      window.prompt('Copy this HEX value:', value);
    });
}

document.getElementById('generate-palette').addEventListener(
  'click',
  async () => {
    const hex = normalizeHex(paletteHex.value);
    const error = document.getElementById('palette-error');

    error.textContent =
      'Oops! This color needs six little HEX digits to work its magic!';

    error.hidden = Boolean(hex);

    if (!hex) {
      paletteHex.focus();
      return;
    }

    paletteHex.value = hex.slice(1);

    document.getElementById('palette-picker').value = hex;

    const button = document.getElementById('generate-palette');
    button.disabled = true;

    try {
      const response = await fetch('/api/generate-palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hex })
      });

      if (!response.ok) {
        throw new Error('Palette generation failed.');
      }

      const data = await response.json();

      if (
        !Array.isArray(data.colors) ||
        data.colors.length !== 4 ||
        !data.colors.every(color => normalizeHex(color))
      ) {
        throw new Error('Invalid palette response.');
      }

      const result = document.getElementById('palette-results');
      result.replaceChildren();

      data.colors.forEach(color => {
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

        copy.innerHTML =
          '<img src="../contact/icons/copy_icon.png" alt="">';

        copy.addEventListener('click', () => {
          addCopyFeedback(copy, color);
        });

        details.append(name, copy);
        card.append(swatch, details);
        result.append(card);
      });

      document.getElementById('palette-empty').hidden = true;
      result.hidden = false;

    } catch (err) {
      error.textContent =
        'Oops! Our colors are taking a tiny break. Try again!';

      error.hidden = false;

    } finally {
      button.disabled = false;
    }
  }
);

// CONTRAST CHECKER — PREVIEW SENTENCES
const previewSentences = [
  {
    title: 'The Dancing Potato',
    subtitle: 'wears tiny shoes to every party.'
  },
  {
    title: 'A Curious Little Fox',
    subtitle: 'found a secret door inside a watermelon.'
  },
  {
    title: 'The Grumpy Green Frog',
    subtitle: 'refuses to share his strawberry cake.'
  },
  {
    title: 'Seven Silly Penguins',
    subtitle: 'are learning how to ride a bicycle.'
  },
  {
    title: 'The Midnight Cookie',
    subtitle: 'escaped from the kitchen at twelve.'
  },
  {
    title: 'A Sleepy Pink Flamingo',
    subtitle: 'is dreaming of a chocolate waterfall.'
  },
  {
    title: 'The Polite Little Dragon',
    subtitle: 'always says please before breathing fire.'
  },
  {
    title: 'A Banana in Pajamas',
    subtitle: 'went for a walk under the moon.'
  },
  {
    title: 'The Invisible Purple Cow',
    subtitle: 'is hiding behind a very small tree.'
  },
  {
    title: 'The Wobbly Jellyfish',
    subtitle: 'opened a bakery at the bottom of the sea.'
  },
  {
    title: 'A Fancy Orange Octopus',
    subtitle: 'bought eight matching pairs of socks.'
  },
  {
    title: 'The Tiny Royal Mouse',
    subtitle: 'lost its golden crown in a bowl of soup.'
  }
];

let lastPreviewIndex = -1;

function showRandomPreview() {
  let index;

  do {
    index = Math.floor(Math.random() * previewSentences.length);
  } while (index === lastPreviewIndex);

  lastPreviewIndex = index;

  const sentence = previewSentences[index];

  document.getElementById('preview-title').textContent =
    sentence.title;

  document.getElementById('preview-subtitle').textContent =
    sentence.subtitle;
}

// CONTRAST CHECKER — INPUTS & RESET
const textHex = attachPicker(
  'text-hex',
  'text-picker',
  resetContrastResult
);

const backgroundHex = attachPicker(
  'background-hex',
  'background-picker',
  resetContrastResult
);

function resetContrastResult() {
  document.getElementById('contrast-error').hidden = true;
  document.getElementById('contrast-results').hidden = true;
  document.getElementById('contrast-empty').hidden = false;

  const preview = document.getElementById('contrast-preview');

  preview.style.color = '';
  preview.style.backgroundColor = '';
  preview.hidden = true;

  document.getElementById('preview-heading').hidden = true;
}

// CONTRAST CHECKER 
document.getElementById('check-contrast').addEventListener(
  'click',
  async () => {
    const foreground = normalizeHex(textHex.value);
    const background = normalizeHex(backgroundHex.value);
    const error = document.getElementById('contrast-error');

    error.textContent =
      'Two colors, please! Give us a pair of six-digit HEX codes to compare.';

    error.hidden = Boolean(foreground && background);

    if (!foreground || !background) {
      resetContrastResult();

      // Keep the validation message visible.
      error.hidden = false;
      return;
    }

    const button = document.getElementById('check-contrast');
    button.disabled = true;

    try {
      const response = await fetch('/api/check-contrast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foreground,
          background
        })
      });

      if (!response.ok) {
        throw new Error('Contrast check failed.');
      }

      const data = await response.json();

      if (
        typeof data.ratio !== 'number' ||
        !Number.isFinite(data.ratio) ||
        data.ratio < 1 ||
        data.ratio > 21 ||
        typeof data.passesAA !== 'boolean' ||
        typeof data.passesAAA !== 'boolean' ||
        !normalizeHex(data.foreground) ||
        !normalizeHex(data.background)
      ) {
        throw new Error('Invalid contrast response.');
      }

      textHex.value = data.foreground.slice(1);
      backgroundHex.value = data.background.slice(1);

      document.getElementById('text-picker').value =
        data.foreground;

      document.getElementById('background-picker').value =
        data.background;

      showRandomPreview();

      const preview = document.getElementById('contrast-preview');

      preview.style.color = data.foreground;
      preview.style.backgroundColor = data.background;
      preview.hidden = false;

      document.getElementById('preview-heading').hidden = false;

      document.getElementById('contrast-ratio').textContent =
        `${data.ratio.toFixed(2)}:1`;

      document.getElementById('contrast-title').textContent =
        data.passesAAA
          ? 'A Perfect Pair!'
          : data.passesAA
            ? 'Looking Good!'
            : 'Oops, Too Close!';

      document.getElementById('contrast-description').textContent =
        data.passesAAA
          ? 'These two are a dream team! Easy to read and lovely together.'
          : data.passesAA
            ? 'A sweet little match! Clear, comfy, and easy on the eyes.'
            : 'These two are blending in a little too much. Try giving them more contrast!';

      document.getElementById('contrast-icon').src =
        data.passesAA
          ? '../contact/icons/patch-check.png'
          : '../contact/icons/patch-exclamation.png';

      document.getElementById('contrast-empty').hidden = true;
      document.getElementById('contrast-results').hidden = false;

    } catch (err) {
      error.textContent =
        'Uh-oh! Our color detective is off duty. Try again!';

      error.hidden = false;
      resetContrastResult();

      // Keep the server-error message visible.
      error.hidden = false;

    } finally {
      button.disabled = false;
    }
  }
);
