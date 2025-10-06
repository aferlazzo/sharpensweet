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
// REVIEWS v1
(function(){
  const REV_URL = '/reviews.json';
  function stars(n){ n=Math.max(0,Math.min(5,Number(n)||0)); return '★'.repeat(n)+'☆'.repeat(5-n); }
  function el(tag, attrs={}, ...kids){
    const e=document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){ if(k==='class') e.className=v; else e.setAttribute(k,v); }
    for(const k of kids){ if(k) e.append(k.nodeType? k : document.createTextNode(k)); }
    return e;
  }
  function render(list, limit=3){
    const grid=document.getElementById('reviews-list'); if(!grid) return;
    grid.innerHTML='';
    list.slice(0,limit).forEach(r=>{
      const card=el('article', {class:'review-card', itemprop:'review', itemscope:'', itemtype:'https://schema.org/Review'},
        el('div', {class:'review-stars', itemprop:'reviewRating', itemscope:'', itemtype:'https://schema.org/Rating'},
          el('span', {class:'stars'}, stars(r.rating)),
          el('meta', {itemprop:'ratingValue', content:String(r.rating)})
        ),
        el('p', {class:'mt-2', itemprop:'reviewBody'}, r.text),
        el('div', {class:'review-name', itemprop:'author', itemscope:'', itemtype:'https://schema.org/Person'},
          el('span', {itemprop:'name'}, r.name)
        ),
        el('div', {class:'review-date'}, new Date(r.date).toLocaleDateString())
      );
      grid.append(card);
    });
    const moreBtn=document.getElementById('reviews-more');
    if(moreBtn){
      if(list.length>limit){ moreBtn.style.display='inline-block'; moreBtn.onclick=()=>render(list, list.length); }
      else { moreBtn.style.display='none'; }
    }
  }
  function injectLD(average, count){
    try{
      const ld = {
        "@context":"https://schema.org",
        "@type":"LocalBusiness",
        "name":"Sharpen Sweet",
        "url":location.origin,
        "aggregateRating":{"@type":"AggregateRating","ratingValue":average.toFixed(1),"reviewCount":String(count)}
      };
      const s=document.createElement('script'); s.type='application/ld+json'; s.textContent=JSON.stringify(ld);
      document.head && document.head.appendChild(s);
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    fetch(REV_URL).then(r=>r.json()).then(list=>{
      // newest first if dates present
      list.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      render(list, 3);
      // compute average
      const sum=list.reduce((s,r)=>s+(Number(r.rating)||0),0);
      injectLD(list.length? sum/list.length : 0, list.length);
    }).catch(console.error);
  });
})();
