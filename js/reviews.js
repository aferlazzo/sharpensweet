document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('#reviews');
  if (!section) return;

  // Ensure UL container we control
  let ul = section.querySelector('ul.list-unstyled');
  if (!ul) { ul = document.createElement('ul'); ul.className='list-unstyled'; section.appendChild(ul); }

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

  const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const stars = n => '★'.repeat(+n||0)+'☆'.repeat(Math.max(0,5-(+n||0)));

  function showLoading(){ ul.innerHTML=''; const li=document.createElement('li'); li.className='text-muted'; li.textContent='Loading reviews…'; ul.appendChild(li); }
  function showError(){ ul.innerHTML=''; const li=document.createElement('li'); li.className='text-danger'; li.textContent="Couldn't load reviews. Please try again later."; ul.appendChild(li); }

  function render(list, expanded){
    const INITIAL=3; ul.innerHTML='';
    (expanded?list:list.slice(0,INITIAL)).forEach(r=>{
      const li=document.createElement('li'); li.className='mb-3';
      const st=document.createElement('div'); st.style.color='#f59e0b'; st.style.letterSpacing='.1rem'; st.textContent=stars(r.rating);
      const strong=document.createElement('strong'); strong.textContent=esc(r.name);
      li.appendChild(st); li.appendChild(strong); li.append(' — ', esc(r.text)); ul.appendChild(li);
    });
    toggleBtn.textContent = expanded ? 'Show less' : 'Show all';
    toggleBtn.style.display = list.length>3 ? '' : 'none';
  }

  function loadFromScript(){
    return new Promise((resolve,reject)=>{
      if (Array.isArray(window.SHARPENSWEET_REVIEWS)) return resolve(window.SHARPENSWEET_REVIEWS);
      const s=document.createElement('script');
      s.src='/js/reviews.data.js?v='+Date.now(); s.async=true;
      s.onload=()=> Array.isArray(window.SHARPENSWEET_REVIEWS) ? resolve(window.SHARPENSWEET_REVIEWS) : reject(new Error('no global'));
      s.onerror=()=>reject(new Error('script error'));
      document.head.appendChild(s);
    });
  }
  async function loadData(){
    try { return await loadFromScript(); }
    catch(_){
      const res=await fetch('/reviews.json?v='+Date.now(),{cache:'no-store',headers:{Accept:'application/json'}});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const json=await res.json(); window.SHARPENSWEET_REVIEWS=json; return json;
    }
  }

  showLoading();
  let all=[]; let expanded=false;
  loadData()
    .then(list=>{ all=(Array.isArray(list)?list:[]).slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))); render(all,expanded); })
    .catch(()=>showError());

  toggleBtn.addEventListener('click', ()=>{ expanded=!expanded; render(all,expanded); });
});
