var __EN = document.documentElement.lang === 'en';   /* textes en anglais sur les pages /en/ (voir outils/assembler/anglais.py) */
/* onlee · comportements communs : capsule (se range quand on descend), menu téléphone, ancres, année */
(function(){
  var nav = document.getElementById('n2');
  if (nav){
    var dernierY = window.scrollY, tic = false;
    function defile(){
      var y = window.scrollY;
      nav.classList.toggle('compact', y > 40);
      if (y > 160 && y > dernierY + 2) nav.classList.add('cache');
      else if (y < dernierY - 2 || y < 160) nav.classList.remove('cache');
      dernierY = y; tic = false;
    }
    window.addEventListener('scroll', function(){ if (!tic){ tic = true; requestAnimationFrame(defile); } }, { passive: true });
    defile();

    /* menu téléphone */
    var bouton = nav.querySelector('.onav-menu'), panneau = nav.querySelector('.onav-panneau');
    function ouvrir(o){
      nav.classList.toggle('ouvert', o);
      if (bouton){ bouton.setAttribute('aria-expanded', String(o)); bouton.setAttribute('aria-label', o ? (__EN ? 'Close menu' : 'Fermer le menu') : (__EN ? 'Open menu' : 'Ouvrir le menu')); }
      if (panneau) panneau.setAttribute('aria-hidden', String(!o));
    }
    if (bouton) bouton.addEventListener('click', function(){ ouvrir(!nav.classList.contains('ouvert')); });
    if (panneau) panneau.addEventListener('click', function(e){ if (e.target.closest('a,button')) ouvrir(false); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && nav.classList.contains('ouvert')){ ouvrir(false); if (bouton) bouton.focus(); } });
    document.addEventListener('click', function(e){ if (nav.classList.contains('ouvert') && !nav.contains(e.target)) ouvrir(false); });
    window.addEventListener('resize', function(){ if (window.innerWidth > 900 && nav.classList.contains('ouvert')) ouvrir(false); });
  }

  /* arrivée sur /#section depuis une autre page : on se recale une fois la page prête (les sections hautes calculent leur taille au chargement) */
  if (location.hash && location.hash.length > 1){
    var id = decodeURIComponent(location.hash.slice(1));
    window.addEventListener('load', function(){
      var el = document.getElementById(id); if (!el) return;
      setTimeout(function(){ el.scrollIntoView({ block: 'start' }); }, 60);
    });
  }

  var an = document.querySelectorAll('[data-annee]');
  for (var i = 0; i < an.length; i++) an[i].textContent = new Date().getFullYear();
})();

/* guides « bientôt » : le lien ne fait rien tant que l'article n'est pas publié (pas de saut en haut de page) */
document.addEventListener('click', function(e){ var a = e.target.closest && e.target.closest('a[aria-disabled="true"]'); if (a) e.preventDefault(); });

/* Vizor / AudioVizor : changer de langue garde le métier choisi (?metier=audio reste sur AudioVizor) */
document.addEventListener('click', function(e){
  var a = e.target.closest && e.target.closest('.onav-langue a[href]'); if (!a) return;
  var m = location.search.match(/[?&]metier=(opticien|audio)/), h = a.getAttribute('href').split('?')[0];
  if (m && /\/vizor\/$/.test(h)) a.setAttribute('href', h + '?metier=' + m[1]);
}, true);

/* mini-agenda du grand appel final : la semaine en cours et le prochain jour ouvré (plus de date écrite en dur) */
(function(){
  var ag = document.querySelectorAll('.ofin-agenda'); if (!ag.length) return;
  var J = __EN ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] : ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  var n = new Date(); n.setHours(12, 0, 0, 0);
  do { n.setDate(n.getDate() + 1); } while (n.getDay() === 0 || n.getDay() === 6);
  var lun = new Date(n); lun.setDate(n.getDate() - (n.getDay() + 6) % 7);
  for (var k = 0; k < ag.length; k++){
    var cases = ag[k].querySelectorAll('.sem > span');
    for (var i = 0; i < cases.length; i++){
      var x = new Date(lun); x.setDate(lun.getDate() + i);
      var b = cases[i].querySelector('b'); if (!b || !cases[i].firstChild) continue;
      cases[i].firstChild.nodeValue = J[x.getDay()]; b.textContent = x.getDate();
      cases[i].classList.toggle('j', x.getDate() === n.getDate());
    }
    var t = ag[k].querySelectorAll('.ent svg text');
    if (t.length > 1){ t[0].textContent = J[n.getDay()] + (__EN ? '' : '.'); t[1].textContent = n.getDate(); }
  }
})();
