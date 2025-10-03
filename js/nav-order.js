document.addEventListener('DOMContentLoaded', () => {
  const WANT = ['home','pricing','contact']; // first, in this order

  document.querySelectorAll('ul.navbar-nav').forEach(ul => {
    const lis = Array.from(ul.querySelectorAll(':scope > li'));
    if (!lis.length) return;

    // map normalized anchor text -> <li> (first match wins)
    const byKey = new Map();
    lis.forEach(li => {
      const a = li.querySelector('a');
      if (!a) return;
      const key = (a.textContent || '').replace(/\s+/g,' ').trim().toLowerCase();
      if (!byKey.has(key)) byKey.set(key, li);
    });

    // build new order: wanted first (if present), then the rest in original order
    const picked = new Set();
    const out = [];
    WANT.forEach(k => {
      const li = byKey.get(k);
      if (li) { out.push(li); picked.add(li); }
    });
    lis.forEach(li => { if (!picked.has(li)) out.push(li); });

    // apply by appending in the new order (moves nodes)
    out.forEach(li => ul.appendChild(li));
  });
});
