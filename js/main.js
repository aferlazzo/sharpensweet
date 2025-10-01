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
