// Article-specific presentation. Recorded output remains the only data source.
(() => {
  function parseMedalOutput(text) {
    const lines = text.trim().split(/\r?\n/);
    const countries = new Set();
    const rows = [];
    for (const line of lines) {
      const match = line.match(/^(.+?)\s+MedalCount\s*\{\s*g:\s*(\d+),\s*s:\s*(\d+),\s*b:\s*(\d+)\s*\}\s*$/);
      if (!match) return null;
      const country = match[1].trim();
      const medals = match.slice(2).map(Number);
      if (!country || countries.has(country) || !medals.every(Number.isSafeInteger)) return null;
      countries.add(country);
      rows.push({country, medals});
    }
    return rows.length ? rows : null;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = {parseMedalOutput};
  if (typeof document === 'undefined') return;
  const page = document.querySelector('.study-page');
  if (!page || document.querySelector('.medal-exhibit')) return;
  const listing = page.querySelector('.study-prose > .code-listing');
  const source = listing?.querySelector('pre code');
  const rows = source && parseMedalOutput(source.textContent);
  if (!rows) return; // Unrecognized output stays intact; never guess its structure.

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const exhibit = element('figure', 'notebook-result notebook-result--forest medal-exhibit');
  const caption = element('figcaption', 'result-caption');
  caption.append(
    element('span', 'result-eyebrow', 'The example’s output'),
    element('span', 'result-title', 'A country ranking.'),
    element('span', 'result-description', listing.querySelector('.code-caption')?.textContent.trim() || 'Recorded medal counts from this example.'),
    element('span', 'result-meta', `${rows.length} countries · 3 medal counts`),
  );
  const viewport = element('div', 'result-table');
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'region');
  viewport.setAttribute('aria-label', 'Recorded medal counts');
  const table = element('table');
  table.append(element('caption', 'result-accessible-caption', 'Medal counts from the article’s recorded output, in their original order'));
  const head = element('thead');
  const header = element('tr');
  ['Country', 'Gold', 'Silver', 'Bronze'].forEach((label, index) => {
    const cell = element('th', index ? `result-number medal-${index}` : '', label);
    cell.scope = 'col';
    header.append(cell);
  });
  head.append(header);
  const body = element('tbody');
  rows.forEach(({country, medals}, index) => {
    const row = element('tr');
    const name = element('th');
    name.scope = 'row';
    const position = element('span', 'medal-exhibit__position', String(index + 1).padStart(2, '0'));
    position.setAttribute('aria-hidden', 'true');
    name.append(position, document.createTextNode(country));
    row.append(name);
    medals.forEach((count, index) => row.append(element('td', `result-number medal-${index + 1}${count === 0 ? ' is-zero' : ''}`, String(count))));
    body.append(row);
  });
  table.append(head, body);
  const raw = element('details', 'result-source');
  raw.append(element('summary', '', 'Inspect the recorded output'));
  viewport.append(table);
  exhibit.append(caption, viewport, raw);
  listing.before(exhibit);
  raw.append(listing); // Keep the original node, source bytes, controls and anchors.

  function revealSource(hash) {
    let target;
    try { target = document.getElementById(decodeURIComponent(hash.slice(1))); }
    catch { return; }
    if (target && listing.contains(target)) {
      raw.open = true;
      requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
    }
  }
  revealSource(location.hash);
  window.addEventListener('hashchange', () => revealSource(location.hash));
  page.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search) revealSource(url.hash);
  });
})();
