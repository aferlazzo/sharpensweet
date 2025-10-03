document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('#reviews'); if (!section) return;

  // Ensure a UL we control
  var ul = section.querySelector('ul.list-unstyled');
  if (!ul) { ul = document.createElement('ul'); ul.className='list-unstyled'; section.appendChild(ul); }

  // Ensure a "Show all" button
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
  function showMsg(cls, msg){
    ul.innerHTML=''; var li=document.createElement('li');
    li.className=cls; li.textContent=msg; ul.appendChild(li);
  }
  function render(list, expanded){
    var INITIAL = 3;
    ul.innerHTML='';
    (expanded ? list : list.slice(0, INITIAL)).forEach(function(r){
      var li=document.createElement('li'); li.className='mb-3';
      var st=document.createElement('div'); st.style.color='#f59e0b'; st.style.letterSpacing='.1rem'; st.textContent=stars(r.rating);
      var strong=document.createElement('strong'); strong.textContent=String(r.name||'');
      var text=document.createTextNode(' — ' + String(r.text||''));
      li.appendChild(st); li.appendChild(strong); li.appendChild(text);
      ul.appendChild(li);
    });
    var hasMore = list.length > INITIAL;
    toggleBtn.style.display = hasMore ? '' : 'none';
    toggleBtn.textContent = expanded ? 'Show less' : 'Show all';
  }

  function loadData(){
    // 1) If the global is already present, use it.
    if (Array.isArray(window.SHARPENSWEET_REVIEWS)) return Promise.resolve(window.SHARPENSWEET_REVIEWS);

    // 2) Try to load the JS bundle with a cache-busting version.
    var viaScript = new Promise(function(resolve, reject){
      var s = document.createElement('script');
      s.src = '/js/reviews.data.js?v=' + Date.now();
      s.async = true;
      s.onload = function(){ Array.isArray(window.SHARPENSWEET_REVIEWS) ? resolve(window.SHARPENSWEET_REVIEWS) : reject(new Error('data-global-missing')); };
      s.onerror = function(){ reject(new Error('script-load-failed')); };
      document.head.appendChild(s);
    });

    // 3) Fallback to JSON fetch (works if server allows it)
    function viaFetch(){
      return fetch('/reviews.json?v=' + Date.now(), {cache:'no-store'})
        .then(function(r){ return r.ok ? r.json() : Promise.reject(new Error('http-'+r.status)); });
    }

    return viaScript.catch(viaFetch);
  }

  showMsg('text-muted','Loading reviews…');

  loadData()
    .then(function(list){
      if (!Array.isArray(list) || !list.length) throw new Error('bad-data');
      list = list.slice().sort(function(a,b){
        return String(b.date||'').localeCompare(String(a.date||''));
      });
      var expanded = false;
      render(list, expanded);
      toggleBtn.addEventListener('click', function(){ expanded = !expanded; render(list, expanded); });
    })
    .catch(function(){
      showMsg('text-danger',"Couldn't load reviews. Please try again later.");
    });
});
