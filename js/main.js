// Alternating header text: "Sharpen Sweet" <-> "Sharp and Sweet"
document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".site-title, header h1, h1");
  if (!el) return;
  const names = ["Sharpen Sweet", "Sharp and Sweet"];
  let i = names.findIndex(n => el.textContent.trim() === n);
  if (i < 0) i = 0;
  el.textContent = names[i];
  el.style.transition = "opacity .25s ease";
  setInterval(() => {
    el.style.opacity = "0";
    setTimeout(() => {
      i = (i + 1) % names.length;
      el.textContent = names[i];
      el.style.opacity = "1";
    }, 250);
  }, 3000);
});
/* NAV-AUTOHIDE+SCROLL v6 */
(function () {
  const navMenu = document.getElementById('navMenu');
  const toggler = document.querySelector('.navbar-toggler');
  const isMobile = () => !!(toggler && getComputedStyle(toggler).display !== 'none');

  function navHeight() {
    const nav = document.querySelector('.navbar');
    return nav ? nav.offsetHeight : 0;
  }

  // Make sure the document has enough room so the LAST section can sit under the navbar
  function ensureBottomRoom() {
    const pad = Math.max(120, navHeight() + 40); // dynamic room at bottom
    document.body.style.paddingBottom = pad + 'px';
  }

  function collapseMenu() {
    if (isMobile() && navMenu && typeof bootstrap !== 'undefined') {
      bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
    }
  }

  // Choose a snap element: heading inside the anchor if available, else the anchor itself
  function snapElementFor(id) {
    const root = document.getElementById(id);
    if (!root) return null;
    return root.querySelector('h1,h2,h3,h4,h5,h6') || root;
  }

  function scrollToId(id, replaceHistory) {
    ensureBottomRoom();
    const snap = snapElementFor(id);
    if (!snap) return;

    const desiredTop = () => snap.getBoundingClientRect().top + window.pageYOffset - navHeight();

    // smooth scroll to approx spot
    let target = desiredTop();
    window.scrollTo({ top: target, behavior: 'smooth' });

    // write hash
    const f = replaceHistory ? 'replaceState' : 'pushState';
    history[f](null, '', '#' + id);

    // corrective nudges until we're within 1px (handles mobile URL bars / font reflow)
    let tries = 0;
    function correct() {
      const delta = snap.getBoundingClientRect().top - navHeight();
      if (Math.abs(delta) > 1 && tries < 12) {
        window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
        tries++;
        requestAnimationFrame(correct);
      }
    }
    setTimeout(correct, 160);
  }

  // Handle clicks on nav hash links
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.nav-link, a.dropdown-item');
    if (!a) return;
    const href = (a.getAttribute('href') || '').trim();

    if (href.startsWith('#') && href.length > 1) {
      e.preventDefault();
      scrollToId(href.slice(1), false);
      setTimeout(collapseMenu, 120);
    } else if (href && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      collapseMenu();
    }
  });

  // Align with existing hash on load / hashchange / resize
  window.addEventListener('load',       () => { if (location.hash.length > 1) scrollToId(location.hash.slice(1), true); });
  window.addEventListener('hashchange', () => { if (location.hash.length > 1) scrollToId(location.hash.slice(1), true); });
  window.addEventListener('resize',     () => { if (location.hash.length > 1) scrollToId(location.hash.slice(1), true); ensureBottomRoom(); });

  // initial bottom room
  ensureBottomRoom();
})();
 /* /NAV-AUTOHIDE+SCROLL v6 */
