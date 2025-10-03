document.addEventListener('DOMContentLoaded', async () => {
  const esc = s => String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const root = document.querySelector('#reviews');
  if (!root) return;

  // find or create the UL we’ll control
  let ul = root.querySelector('ul.list-unstyled');
  if (!ul) {
    ul = document.createElement('ul');
    ul.className = 'list-unstyled';
    root.appendChild(ul);
  }

  try {
    const res = await fetch('/reviews.json', { cache: 'no-store' });
    if (!res.ok) return;
    const rows = await res.json();
    rows.sort((a,b) => String(b.date).localeCompare(String(a.date)));

    ul.innerHTML = '';
    const frag = document.createDocumentFragment();
    const MAX = 12; // show up to 12 (tweak if you like)
    rows.slice(0, MAX).forEach(r => {
      const ratingNum = Math.max(1, Math.min(5, Number(r.rating) || 0));
      const li = document.createElement('li');
      li.className = 'mb-3';
      li.innerHTML = `
        <div class="stars" aria-label="${ratingNum} out of 5 stars"
             style="color:#f59e0b;letter-spacing:.1rem;">${'★'.repeat(ratingNum)}${'☆'.repeat(5-ratingNum)}</div>
        <strong>${esc(r.name || 'Customer')}</strong>
        — ${esc(r.text || '')}
      `;
      frag.appendChild(li);
    });
    ul.appendChild(frag);
  } catch (_) {
    /* silent fail: keep whatever static HTML exists */
  }
});
