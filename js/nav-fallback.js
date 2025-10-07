(function(){
  function toggle(){ document.body.classList.toggle("nav-open"); }
  document.addEventListener("click",function(ev){
    var btn=ev.target.closest(".navbar-toggler");
    if(btn){ ev.preventDefault(); toggle(); return; }
    var insideNav = ev.target.closest(".navbar");
    if(!insideNav && document.body.classList.contains("nav-open")){
      document.body.classList.remove("nav-open");
    }
  }, true);
})();
