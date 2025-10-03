document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('#reviews');
  if (!section) return;

  // Ensure a UL we control
  let ul = section.querySelector('ul.list-unstyled');
  if (!ul) {
    ul = document.createElement('ul');
    ul.className = 'list-unstyled';
    section.appendChild(ul);
  }

  // Ensure a "Show all" button
  let toggleBtn = Array.from(section.querySelectorAll('[data-reviews-toggle],button,a'))
    .find(el => /show all/i.test((el.textContent||'')));
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn-primary btn-sm mt-2';
    toggleBtn.textContent = 'Show all';
    toggleBtn.setAttribute('data-reviews-toggle','all');
    section.appendChild(toggleBtn);
  }

  const stars = n => {
    const v = Math.max(0, Math.min(5, Number(n)||0));
    return '★'.repeat(v) + '☆'.repeat(5 - v);
  };
  const loading = (msg='Loading reviews…') => {
    ul.innerHTML = ''; const li = document.createElement('li');
    li.className='text-muted'; li.textContent = msg; ul.appendChild(li);
  };
  const error = (msg="Couldn't load reviews.") => {
    ul.innerHTML = ''; const li = document.createElement('li');
    li.className='text-danger'; li.textContent = msg; ul.appendChild(li);
  };

  function render(list, expanded=false){
    const INITIAL=3; ul.innerHTML='';
    (expanded ? list : list.slice(0, INITIAL)).forEach(r=>{
      const li=document.createElement('li'); li.className='mb-3';
      const st=document.createElement('div'); st.style.color='#f59e0b'; st.style.letterSpacing='.1rem'; st.textContent=stars(r.rating);
      const strong=document.createElement('strong'); strong.textContent=String(r.name ?? '');
      const dash=document.createTextNode(' — ');
      const span=document.createElement('span'); span.textContent=String(r.text ?? '');
      li.append(st, strong, dash, span); ul.appendChild(li);
    });
    const needsToggle = list.length > INITIAL;
    toggleBtn.style.display = needsToggle ? '' : 'none';
    toggleBtn.textContent = expanded ? 'Show less' : 'Show all';
  }

  function loadFromGlobal(){
    return Array.isArray(window.SHARPENSWEET_REVIEWS)
      ? Promise.resolve(window.SHARPENSWEET_REVIEWS)
      : Promise.reject('no global');
  }
  function loadByScript(){
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/js/reviews.data.js?v=' + Date.now();
      s.async = true;
      s.onload = () => Array.isArray(window.SHARPENSWEET_REVIEWS)
        ? resolve(window.SHARPENSWEET_REVIEWS)
        : reject('script loaded but no data');
      s.onerror = () => reject('script error');
      document.head.appendChild(s);
    });
  }
  function loadByFetch(){
    return fetch('/reviews.json?v=' + Date.now(), {cache:'no-store'})
      .then(r => r.ok ? r.json() : Promise.reject('http '+r.status));
  }

  loading();
  Promise.resolve()
    .then(loadFromGlobal)
    .catch(loadByScript)
    .catch(loadByFetch)
    .then(list => {
      if (!Array.isArray(list)) throw new Error('bad data');
      const all = list.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
      let expanded=false; render(all, expanded);
      toggleBtn.onclick = () => { expanded=!expanded; render(all, expanded); };
    })
    .catch(() => error());
});
