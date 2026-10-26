/* COLOR GUIDE: curated front-end data for Stage 3 (no server required). */
const guideColors = [
  { name:'Sky Blue', hex:'#60A5FA', family:'blue', tone:'bright' },
  { name:'Rose Pink', hex:'#F472B6', family:'pink', tone:'soft' },
  { name:'Lavender Mist', hex:'#A78BFA', family:'purple', tone:'soft' },
  { name:'Honey Gold', hex:'#EAB308', family:'yellow', tone:'bright' },
  { name:'Teal Tide', hex:'#14B8A6', family:'green', tone:'bright' },
  { name:'Coral Pop', hex:'#F97316', family:'orange', tone:'bright' },
  { name:'Sage Green', hex:'#84CC16', family:'green', tone:'bright' },
  { name:'Cocoa Brown', hex:'#7C4A2D', family:'brown', tone:'dark' },
  { name:'Vanilla Cream', hex:'#FFF7ED', family:'neutral', tone:'light' },
  { name:'Ocean Depth', hex:'#2563EB', family:'blue', tone:'dark' },
  { name:'Peach Fuzz', hex:'#FDBA74', family:'orange', tone:'light' },
  { name:'Plum Dream', hex:'#A855F7', family:'purple', tone:'bright' },
  { name:'Mint Leaf', hex:'#6EE7B7', family:'green', tone:'light' },
  { name:'Ruby Red', hex:'#DC2626', family:'red', tone:'bright' },
  { name:'Lemon Glow', hex:'#FDE047', family:'yellow', tone:'light' },
  { name:'Slate Gray', hex:'#64748B', family:'neutral', tone:'soft' },
  { name:'Azure Breeze', hex:'#38BDF8', family:'blue', tone:'bright' },
  { name:'Midnight Navy', hex:'#1E3A8A', family:'blue', tone:'dark' },
  { name:'Powder Blue', hex:'#BFDBFE', family:'blue', tone:'light' },
  { name:'Cobalt Flash', hex:'#1D4ED8', family:'blue', tone:'bright' },
  { name:'Ice Lagoon', hex:'#A5F3FC', family:'blue', tone:'light' },
  { name:'Blush Petal', hex:'#FBCFE8', family:'pink', tone:'light' },
  { name:'Berry Bloom', hex:'#DB2777', family:'pink', tone:'bright' },
  { name:'Dusty Rose', hex:'#BE8A9A', family:'pink', tone:'soft' },
  { name:'Bubblegum', hex:'#F9A8D4', family:'pink', tone:'light' },
  { name:'Iris Purple', hex:'#7C3AED', family:'purple', tone:'bright' },
  { name:'Wisteria', hex:'#C4B5FD', family:'purple', tone:'light' },
  { name:'Deep Amethyst', hex:'#581C87', family:'purple', tone:'dark' },
  { name:'Orchid Haze', hex:'#D8B4FE', family:'purple', tone:'soft' },
  { name:'Sunflower', hex:'#FACC15', family:'yellow', tone:'bright' },
  { name:'Buttermilk', hex:'#FEF3C7', family:'yellow', tone:'light' },
  { name:'Amber Sunset', hex:'#D97706', family:'yellow', tone:'dark' },
  { name:'Golden Sand', hex:'#FCD34D', family:'yellow', tone:'soft' },
  { name:'Forest Fern', hex:'#166534', family:'green', tone:'dark' },
  { name:'Emerald Bay', hex:'#059669', family:'green', tone:'bright' },
  { name:'Pistachio', hex:'#D9F99D', family:'green', tone:'light' },
  { name:'Olive Grove', hex:'#65743A', family:'green', tone:'soft' },
  { name:'Sea Glass', hex:'#99F6E4', family:'green', tone:'light' },
  { name:'Tangerine', hex:'#FB923C', family:'orange', tone:'bright' },
  { name:'Apricot Glow', hex:'#FED7AA', family:'orange', tone:'light' },
  { name:'Burnt Orange', hex:'#C2410C', family:'orange', tone:'dark' },
  { name:'Cantaloupe', hex:'#FDBA8C', family:'orange', tone:'soft' },
  { name:'Mocha Latte', hex:'#A16207', family:'brown', tone:'dark' },
  { name:'Hazelnut', hex:'#B88B67', family:'brown', tone:'soft' },
  { name:'Sandstone', hex:'#E7C9A9', family:'brown', tone:'light' },
  { name:'Cloud White', hex:'#F8FAFC', family:'neutral', tone:'light' },
  { name:'Charcoal Ink', hex:'#334155', family:'neutral', tone:'dark' },
  { name:'Silver Fog', hex:'#CBD5E1', family:'neutral', tone:'soft' },
  { name:'Cherry Burst', hex:'#EF4444', family:'red', tone:'bright' },
  { name:'Brick Red', hex:'#991B1B', family:'red', tone:'dark' }
];

/* Same mobile menu behavior as the other pages. */
const guideMenuButton = document.querySelector('.menu-toggle');
const guideNavLinks = document.getElementById('nav-links');
if (guideMenuButton && guideNavLinks) {
  guideMenuButton.addEventListener('click', () => {
    const open = guideNavLinks.classList.toggle('is-open');
    guideMenuButton.setAttribute('aria-expanded', String(open));
  });
}

const grid = document.getElementById('guide-grid');
const searchInput = document.getElementById('guide-search');
const familyFilter = document.getElementById('guide-family');
const toneFilter = document.getElementById('guide-tone');
const sortSelect = document.getElementById('guide-sort');
const noResults = document.getElementById('guide-no-results');
const guideStatus = document.getElementById('guide-status');

/* Convert the six-character HEX data into displayed RGB values. */
function toRgb(hex) {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  return rgb.join(', ');
}

/* Create cards using DOM methods so search text cannot become HTML. */
function makeGuideCard(color) {
  const card = document.createElement('article');
  card.className = 'guide-card';
  const swatch = document.createElement('div');
  swatch.className = 'guide-swatch';
  swatch.style.backgroundColor = color.hex;
  swatch.setAttribute('aria-label', `${color.name} color swatch`);
  card.append(swatch);
  const title = document.createElement('h2');
  title.textContent = color.name;
  card.append(title);
  [['HEX', color.hex], ['RGB', toRgb(color.hex)]].forEach(([label, value]) => {
    const detail = document.createElement('div');
    detail.className = 'guide-detail';
    const text = document.createElement('span');
    text.textContent = `${label}: ${value}`;
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'guide-copy';
    copy.dataset.copy = value;
    copy.title = `Copy ${label}`;
    copy.setAttribute('aria-label', `Copy ${label} for ${color.name}`);
    const icon = document.createElement('img');
    icon.src = '../contact/icons/copy_icon.png';
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');
    copy.append(icon);
    detail.append(text, copy);
    card.append(detail);
  });
  return card;
}

/* Fifty known colors; render 12 first, then add more when the visitor scrolls. */
const BATCH_SIZE = 12;
const LOAD_DELAY_MS = 1000; // Brief visual pause, not a real server request.
let matchingColors = [];
let visibleCount = 0;
let loading = false;
let pendingLoad = null;
let listVersion = 0;
const loadMoreTarget = document.getElementById('guide-load-more');
const loadingLabel = document.getElementById('guide-loading-label');
const endMessage = document.getElementById('guide-end-message');

function appendNextBatch() {
  if (visibleCount >= matchingColors.length) return;
  const next = matchingColors.slice(visibleCount, visibleCount + BATCH_SIZE);
  const fragment = document.createDocumentFragment();
  next.forEach(color => fragment.appendChild(makeGuideCard(color)));
  grid.appendChild(fragment);
  visibleCount += next.length;
  guideStatus.textContent = `${visibleCount} of ${matchingColors.length} colors shown`;
  const more = visibleCount < matchingColors.length;
  loadMoreTarget.hidden = !more;
  if (more) loadingLabel.textContent = 'Scroll for more colors';
  endMessage.hidden = more || matchingColors.length !== guideColors.length;
}

/* Prevent repeated observer triggers while a batch is loading. */
function requestNextBatch() {
  if (loading || visibleCount >= matchingColors.length || loadMoreTarget.hidden) return;
  loading = true;
  const version = listVersion;
  loadingLabel.textContent = 'Loading more colors...';
  loadMoreTarget.setAttribute('aria-busy', 'true');
  pendingLoad = setTimeout(() => {
    pendingLoad = null;
    if (version !== listVersion) return;
    appendNextBatch();
    loading = false;
    loadMoreTarget.removeAttribute('aria-busy');
  }, LOAD_DELAY_MS);
}

function renderGuide() {
  ++listVersion;
  clearTimeout(pendingLoad);
  pendingLoad = null;
  loading = false;
  loadMoreTarget.removeAttribute('aria-busy');
  const term = searchInput.value.trim().toLowerCase().replace(/^#/, '');
  matchingColors = guideColors.filter(color =>
    (color.name.toLowerCase().includes(term) || color.hex.toLowerCase().includes(term)) &&
    (familyFilter.value === 'all' || color.family === familyFilter.value) &&
    (toneFilter.value === 'all' || color.tone === toneFilter.value)
  );
  // Rankings here are curated demo ordering, not live popularity data.
  if (sortSelect.value === 'az') matchingColors.sort((a,b) => a.name.localeCompare(b.name));
  if (sortSelect.value === 'za') matchingColors.sort((a,b) => b.name.localeCompare(a.name));
  if (sortSelect.value === 'newest') matchingColors.reverse();
  if (sortSelect.value === 'popular' || sortSelect.value === 'trending') {
    const priority = sortSelect.value === 'popular'
      ? ['Sky Blue','Teal Tide','Rose Pink','Lavender Mist','Mint Leaf','Coral Pop']
      : ['Sage Green','Peach Fuzz','Lavender Mist','Honey Gold','Ocean Depth'];
    const rank = name => priority.indexOf(name) < 0 ? 999 : priority.indexOf(name);
    matchingColors.sort((a,b) => rank(a.name) - rank(b.name));
  }
  grid.replaceChildren();
  visibleCount = 0;
  noResults.hidden = matchingColors.length !== 0;
  endMessage.hidden = true;
  loadMoreTarget.hidden = matchingColors.length === 0;
  if (matchingColors.length) appendNextBatch();
  else guideStatus.textContent = 'No matching colors';
}

[searchInput, familyFilter, toneFilter, sortSelect].forEach(control => {
  control.addEventListener(control === searchInput ? 'input' : 'change', renderGuide);
});

/* A small threshold prevents loading long before the visitor reaches the end. */
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) requestNextBatch();
  }, { rootMargin: '0px 0px 0px 0px', threshold: .1 });
  observer.observe(loadMoreTarget);
} else {
  window.addEventListener('scroll', () => {
    if (!loadMoreTarget.hidden && loadMoreTarget.getBoundingClientRect().top < window.innerHeight) requestNextBatch();
  }, { passive: true });
}

/* Delegate copy clicks: preserve the icon and show brief accessible feedback. */
grid.addEventListener('click', async event => {
  const button = event.target.closest('.guide-copy');
  if (!button) return;
  const value = button.dataset.copy;
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    const oldLabel = button.getAttribute('aria-label');
    button.setAttribute('aria-label', 'Copied!');
    button.title = 'Copied!';
    clearTimeout(button.feedbackTimer);
    button.feedbackTimer = setTimeout(() => {
      button.setAttribute('aria-label', oldLabel);
      button.title = oldLabel.replace(/^Copy /, 'Copy ');
    }, 1100);
  } catch {
    window.prompt('Copy this value:', value);
  }
});
renderGuide();
