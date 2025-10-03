document.addEventListener('DOMContentLoaded', async () => {
  const section = document.querySelector('#reviews');
  if (!section) return;

  // UL we control
  let ul = section.querySelector('ul.list-unstyled');
  if (!ul) {
    ul = document.createElement('ul');
    ul.className = 'list-unstyled';
    section.appendChild(ul);
  }

  // "Show all" button (add if missing)
  let toggleBtn = Array.from(section.querySelectorAll('[data-reviews-toggle],button,a'))
    .find(el => /show all/i.test(el.textContent || ''));
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn-primary btn-sm mt-2';
    toggleBtn.textContent = 'Show all';
    toggleBtn.setAttribute('data-reviews-toggle', 'all');
    section.appendChild(toggleBtn);
  }

  // Helpers
  const esc = s => String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  // Loading state
  ul.innerHTML = '<li class="text-muted">Loading reviews…</li>';

  let all = [];
  try {
    // Load from the JS data bundle (avoids /reviews.json 403)
    await import('/js/reviews.data.js?v=' + Date.now());
    all = Array.isArray(window.SHARPENSWEET_REVIEWS) ? window.SHARPENSWEET_REVIEWS : [];
  } catch (err) {
    ul.innerHTML = `<li class="text-danger">Couldn’t load reviews. Please try again later.</li>`;
    console.error('[reviews] load failed:', err);
    return;
  }

  if (!Array.isArray(all) || all.length === 0) {
    ul.innerHTML = `<li class="text-muted">No reviews yet.</li>`;
    toggleBtn.style.display = 'none';
    return;
  }

  // Newest first
  all.sort((a,b) => String(b.date).localeCompare(String(a.date)));

  const render = (subset) => {
    ul.innerHTML = '';
    subset.forEach(r => {
      const n = Math.max(1, Math.min(5, Number(r.rating) || 0));
      const li = document.createElement('li');
      li.className = 'mb-3';
      li.innerHTML = `
        <div class="stars" aria-label="${n} out of 5 stars" style="color:#f59e0b;letter-spacing:.1rem;">
          ${stars(n)}
        </div>
        <strong>${esc(r.name || 'Customer')}</strong>
        — ${esc(r.text || '')}
      `;
      ul.appendChild(li);
    });
  };

  let expanded = false;
  const FIRST = 3;
  render(all.slice(0, FIRST));

  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    render(expanded ? all : all.slice(0, FIRST));
    toggleBtn.textContent = expanded ? 'Show less' : 'Show all';
  });
});
