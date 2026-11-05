/* COLOR GUIDE — server-powered filtering, sorting, and infinite scroll. */
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

/* Format RGB values from the validated server HEX. */
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

/* Color filtering and pagination now happen on the Express server. */
const loadMoreTarget = document.getElementById('guide-load-more');
const loadingLabel = document.getElementById('guide-loading-label');
const endMessage = document.getElementById('guide-end-message');
const retryButton = document.getElementById('guide-retry');
const PAGE_SIZE = 12;
const LOAD_DELAY_MS = 1000;
let currentPage = 0;
let total = 0;
let hasMore = false;
let loading = false;
let requestVersion = 0;
let activeController = null;
let delayTimer = null;
let searchTimer = null;

function wait(milliseconds) {
  return new Promise(resolve => { delayTimer = setTimeout(resolve, milliseconds); });
}

function setLoading(isLoading) {
  loading = isLoading;
  loadMoreTarget.setAttribute('aria-busy', String(isLoading));
  loadingLabel.textContent = isLoading ? 'Loading more colors...' : 'Scroll for more colors';
  loadMoreTarget.hidden = !isLoading && !hasMore;
}

function getQuery(page) {
  return new URLSearchParams({
    search: searchInput.value.trim(),
    family: familyFilter.value,
    tone: toneFilter.value,
    sort: sortSelect.value,
    page: String(page)
  });
}

async function fetchGuidePage(page, version, delayed = false) {
  if (loading) return;
  const controller = new AbortController();
  activeController = controller;
  setLoading(true);
  retryButton.hidden = true;
  noResults.hidden = true;

  try {
    // Keep the one-second loading animation used by the original design.
    // Only subsequent batches wait; the first 12 colors appear promptly.
    const request = fetch(`/api/guide-colors?${getQuery(page)}`, { signal: controller.signal });
    if (delayed) await wait(LOAD_DELAY_MS);
    const response = await request;
    if (!response.ok) throw new Error('Unable to load colors');
    const data = await response.json();
    if (!data.success || !Array.isArray(data.colors) || !Number.isInteger(data.total)) {
      throw new Error('Unexpected server response');
    }
    if (version !== requestVersion) return;

    const fragment = document.createDocumentFragment();
    data.colors.forEach(color => fragment.appendChild(makeGuideCard(color)));
    grid.appendChild(fragment);
    currentPage = page;
    total = data.total;
    hasMore = data.hasMore;

    const shown = Math.min(currentPage * PAGE_SIZE, total);
    guideStatus.textContent = `${shown} of ${total} colors shown`;
    noResults.hidden = total !== 0;
    noResults.replaceChildren();

    const emptyTitle = document.createElement('h3');
    emptyTitle.textContent = 'These Colors Are Playing Hide-and-Seek!';

    const emptyDescription = document.createElement('p');
    emptyDescription.textContent ="We couldn't find a match. Wanna try another clue?";

    noResults.append(emptyTitle, emptyDescription);
    endMessage.hidden = hasMore || total !== 100 || shown === 0;
  } catch (err) {
    if (controller.signal.aborted || version !== requestVersion) return;
    noResults.textContent = 'Oops! The Color Factory Is on a Break! Our little color makers need a moment. Try again!';
    noResults.hidden = false;
    retryButton.hidden = false;
    guideStatus.textContent = 'Colors could not be loaded';
    hasMore = false;
    endMessage.hidden = true;
  } finally {
    if (version === requestVersion) {
      setLoading(false);
      activeController = null;
    }
  }
}

function renderGuide() {
  ++requestVersion;
  if (activeController) activeController.abort();
  if (delayTimer) clearTimeout(delayTimer);
  activeController = null;
  delayTimer = null;
  loading = false;
  currentPage = 0;
  total = 0;
  hasMore = false;
  grid.replaceChildren();
  endMessage.hidden = true;
  retryButton.hidden = true;
  guideStatus.textContent = 'Loading colors';
  fetchGuidePage(1, requestVersion);
}

function requestNextBatch() {
  if (loading || !hasMore || loadMoreTarget.hidden) return;
  fetchGuidePage(currentPage + 1, requestVersion, true);
}

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderGuide, 250);
});
[familyFilter, toneFilter, sortSelect].forEach(control =>
  control.addEventListener('change', renderGuide)
);
retryButton.addEventListener('click', () => {
  if (currentPage === 0) renderGuide();
  else fetchGuidePage(currentPage + 1, requestVersion);
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) requestNextBatch();
  }, { threshold: 0.1 });
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
