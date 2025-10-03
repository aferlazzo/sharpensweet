document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('#reviews'); if (!section) return;

  var ul = section.querySelector('ul.list-unstyled');
  if (!ul) { ul = document.createElement('ul'); ul.className='list-unstyled'; section.appendChild(ul); }

  var toggleBtn = Array.from(section.querySelectorAll('button,a'))
    .find(function (el){ return /show all/i.test((el.textContent||'')); });
  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'btn btn-primary btn-sm mt-2';
    toggleBtn.textContent = 'Show all';
    toggleBtn.setAttribute('data-reviews-toggle','all');
    section.appendChild(toggleBtn);
  }

  function stars(n){
    n = Number(n)||0; if(n<0)n=0; if(n>5)n=5;
    return '\u2605'.repeat(n) + '\u2606'.repeat(5-n); // ★☆
  }

  function showLoading(){
    ul.innerHTML=''; var li=document.createElement('li');
    li.className='text-muted'; li.textContent='Loading reviews...'; ul.appendChild(li);
  }
  function showError(){
    ul.innerHTML=''; var li=document.createElement('li');
    li.className='text-danger'; li.textContent="Couldn't load reviews. Please try again later.";
    ul.appendChild(li);
  }

  function loadData(){
    // 1) Global already present
    if (Array.isArray(window.SHARPENSWEET_REVIEWS)) return Promise.resolve(window.SHARPENSWEET_REVIEWS);

    // 2) Try loading /js/reviews.data.js (cache-busted)
    var viaScript = new Promise(function(resolve, reject){
      var s=document.createElement('script');
      s.src='/js/reviews.data.js?v='+Date.now(); s.async=true;
      s.onload=function(){
        if (Array.isArray(window.SHARPENSWEET_REVIEWS)) resolve(window.SHARPENSWEET_REVIEWS);
        else reject(new Error('data-global-missing'));
      };
      s.onerror=function(){ reject(new Error('script-load-failed')); };
      document.head.appendChild(s);
    });

    // 3) Fallback: fetch /reviews.json directly
    var viaFetch = function(){
      return fetch('/reviews.json?v='+Date.now(), {cache:'no-store'})
        .then(function(r){ if(!r.ok) throw new Error(String(r.status)); return r.json(); });
    };

    return viaScript.catch(viaFetch);
  }

  function render(list, expanded){
    var INITIAL=3; ul.innerHTML='';
    (expanded ? list : list.slice(0,INITIAL)).forEach(function(r){
      var li=document.createElement('li'); li.className='mb-3';
      var st=document.createElement('div'); st.style.letterSpacing='.1rem'; st.textContent=stars(r.rating);
      var strong=document.createElement('strong'); strong.appendChild(document.createTextNode(r.name||''));
      var text=document.createTextNode(' — '+(r.text||''));
      li.appendChild(st); li.appendChild(strong); li.appendChild(text); ul.appendChild(li);
    });
    var hasMore = list.length > INITIAL;
    toggleBtn.style.display = hasMore ? '' : 'none';
    toggleBtn.textContent = expanded ? 'Show less' : 'Show all';
  }

  showLoading();
  loadData().then(function(list){
    list = list.slice().sort(function(a,b){
      var da=String(a.date||''), db=String(b.date||''); return da.localeCompare(db);
    }).reverse(); // newest first
    var expanded=false; render(list, expanded);
    toggleBtn.addEventListener('click', function(){ expanded=!expanded; render(list, expanded); });
  }).catch(showError);
});
