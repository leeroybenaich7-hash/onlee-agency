var __EN = document.documentElement.lang === 'en';   /* textes en anglais sur les pages /en/ (voir outils/assembler/anglais.py) */
/* Premier écran, version 1 « Une seule histoire » : la bulle raconte pub → contact → réponse → rendez-vous → logiciel,
   les widgets des côtés s'éclairent avec l'étape. Repris de labo/haut (version 1). */
(function(){
  var sec = document.getElementById('sect-haut'); if (!sec) return;
  var ile = sec.querySelector('#ile'); if (!ile) return;
  var ets = [].slice.call(sec.querySelectorAll('.et')), lis = [].slice.call(sec.querySelectorAll('.h-etapes li')), cotes = [].slice.call(sec.querySelectorAll('.cote'));
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches, s = 0;
  function aller(n){
    s = n; ile.setAttribute('data-s', n);
    ets.forEach(function(e){ e.classList.toggle('on', +e.getAttribute('data-s') === n); });
    lis.forEach(function(li, i){ li.classList.remove('on'); li.classList.toggle('fait', i < n - 1); });
    if (n > 0){ void lis[n - 1].offsetWidth; lis[n - 1].classList.add('on'); }
    cotes.forEach(function(c){ c.classList.toggle('actif', +c.getAttribute('data-s') === n); });
    sec.classList.toggle('tous', n === 5);
  }
  function suivant(){ aller(s >= 5 ? 1 : s + 1); }
  var barre = sec.querySelector('.h-etapes');
  barre.addEventListener('animationend', function(e){ if (e.animationName === 'remplit' && !reduit) suivant(); });
  ile.addEventListener('click', suivant);
  ile.addEventListener('pointerenter', function(e){ if (e.pointerType === 'mouse') sec.classList.add('pause'); });
  ile.addEventListener('pointerleave', function(){ sec.classList.remove('pause'); });
  [].slice.call(sec.querySelectorAll('.h-etapes button')).forEach(function(b){ b.addEventListener('click', function(){ aller(+b.getAttribute('data-s')); }); });
  /* pause quand le haut de page n'est plus à l'écran */
  new IntersectionObserver(function(es){ sec.classList.toggle('pause', !es[0].isIntersecting); }, { threshold: .2 }).observe(sec);
  aller(0);
  setTimeout(function(){ sec.classList.add('cotes-on'); }, 500);
  setTimeout(function(){ aller(1); }, reduit ? 0 : 1100);
})();
