document.addEventListener('DOMContentLoaded', () => {
  const btn  = document.getElementById('reviews-more');
  const list = document.querySelector('#reviews ul.reviews');
  if (!btn || !list) return;

  const items = Array.from(list.querySelectorAll('li'));
  const SHOW_N = 2;   // default visible; toggle reveals/restores the rest
  let expanded = false;

  function apply() {
    items.forEach((li, i) => {
      if (!expanded && i >= SHOW_N) li.classList.add('is-hidden');
      else li.classList.remove('is-hidden');
    });
    btn.style.display = (items.length > SHOW_N) ? '' : 'none';
    btn.textContent = expanded ? 'Show less' : 'Show all';
    btn.setAttribute('aria-expanded', String(expanded));
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    expanded = !expanded;
    apply();
  });

  apply();
});
