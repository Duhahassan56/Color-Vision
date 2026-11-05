const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const colorsFile = path.join(__dirname, '../data/guide-colors.json');

const allowedFamilies = new Set(['all', 'blue', 'pink', 'purple', 'yellow', 'green', 'orange', 'brown', 'neutral', 'red']);
const allowedTones = new Set(['all', 'light', 'bright', 'dark', 'soft']);
const allowedSorts = new Set(['default', 'popular', 'newest', 'trending', 'az', 'za']);
const PAGE_SIZE = 12;

router.get('/color-guide', (req, res) => {
  res.sendFile(path.join(__dirname, '../../html/color-guide.html'));
});

// Filter, sort, and paginate the curated guide on the server.
router.get('/api/guide-colors', (req, res) => {
  const { search = '', family = 'all', tone = 'all', sort = 'default', page = '1' } = req.query;
  if ([search, family, tone, sort, page].some(value => typeof value !== 'string') ||
      search.length > 100 || !allowedFamilies.has(family) || !allowedTones.has(tone) ||
      !allowedSorts.has(sort) || !/^[1-9]\d{0,5}$/.test(page)) {
    return res.status(400).json({ success: false, message: 'Oops! Those color filters need a little fix.' });
  }

  try {
    const colors = JSON.parse(fs.readFileSync(colorsFile, 'utf8'));
    const term = search.trim().toLowerCase().replace(/^#/, '');
    const matches = colors.filter(color =>
      (color.name.toLowerCase().includes(term) || color.hex.toLowerCase().includes(term)) &&
      (family === 'all' || color.family === family) &&
      (tone === 'all' || color.tone === tone)
    );

    if (sort === 'az') matches.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'za') matches.sort((a, b) => b.name.localeCompare(a.name));
    // 'newest' is reverse curated order: this collection has no publication dates.
    if (sort === 'newest') matches.reverse();
    // Popular/trending priorities are curated, not real-time popularity metrics.
    if (sort === 'popular' || sort === 'trending') {
      const priority = sort === 'popular'
        ? ['Sky Blue', 'Teal Tide', 'Rose Pink', 'Lavender Mist', 'Mint Leaf', 'Coral Pop']
        : ['Sage Green', 'Peach Fuzz', 'Lavender Mist', 'Honey Gold', 'Ocean Depth'];
      const rank = name => { const index = priority.indexOf(name); return index === -1 ? 999 : index; };
      matches.sort((a, b) => rank(a.name) - rank(b.name));
    }

    const pageNumber = Number(page);
    const start = (pageNumber - 1) * PAGE_SIZE;
    return res.json({
      success: true,
      colors: matches.slice(start, start + PAGE_SIZE),
      total: matches.length,
      page: pageNumber,
      pageSize: PAGE_SIZE,
      hasMore: start + PAGE_SIZE < matches.length
    });
  } catch (error) {
    console.error('Color Guide could not load colors:', error);
    return res.status(500).json({ success: false, message: 'Oops! Our colors are taking a tiny break. Try again!' });
  }
});

module.exports = router;
