var __EN = document.documentElement.lang === 'en';   /* textes en anglais sur les pages /en/ (voir outils/assembler/anglais.py) */
/* Réalisations · Avant / Après piloté par la molette (repris de labo/pages/apres-boite-2) */
(function(){
  'use strict';
  var R = document.documentElement;
  var sec = document.getElementById('ab'), scene = document.getElementById('scene'), intro = sec.querySelector('.ab-intro');
  var zone = document.getElementById('zone'), duo = document.getElementById('duo'), cadre = document.getElementById('cadre');
  var casEl = [].slice.call(cadre.querySelectorAll('.cas'));
  var traits = [].slice.call(document.querySelectorAll('.ind .trait'));
  var noms = [].slice.call(document.querySelectorAll('.ind-nom > span'));
  var legGroupes = [].slice.call(document.querySelectorAll('.legendes')).map(function(g){ return [].slice.call(g.querySelectorAll('.leg')); });
  var ecrans = [].slice.call(document.querySelectorAll('#vitre .ecran'));
  var vitre = document.getElementById('vitre'), telBoite = document.getElementById('telBoite');
  var ligne = document.getElementById('ligne'), poignee = document.getElementById('poignee'), recon = document.getElementById('recon');
  var motAv = document.getElementById('motAv'), motAp = document.getElementById('motAp');
  var cta = document.getElementById('cta');

  var N = casEl.length;
  var A = .14, B = .80;            // dans chaque projet : palier sur l'avant, traversée, palier sur l'après
  var X0 = .92, X1 = .08;          // position de la barre au début / à la fin
  var FIN = .9;                    // longueur (en projets) réservée à l'appel à l'action
  var CLAIR = [0, 0, 1];
  var reduit = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fige = false;          // (les réglages de test ?pos= / ?projet= du labo sont retirés)

  var cas = casEl.map(function(el){
    var img = el.querySelector('.fen img'); if (el.dataset.fxa) img.style.setProperty('--fx', el.dataset.fxa + '%');
    return { sc: el.querySelector('.scene'), fen: el.querySelector('.fen'), img: img, fx: +el.dataset.fx / 10 || 0 };
  });

  var hb = 0, W = 1, H = 1, pw = 140, seg = 600;
  var actif = 0, xDisp = X0, xCible = X0, manuel = false, pManuel = 0, gele = false, visible = true, enFin = false;
  var tourne = false, tPrec = 0, tic = false, tire = false;

  function clamp(v, a, b){ return v < a ? a : v > b ? b : v; }
  function lisse(t){ t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function uDe(f){ return lisse((f - A) / (B - A)); }
  function xDe(u){ return X0 + (X1 - X0) * u; }
  function uDeX(x){ return clamp((X0 - x) / (X0 - X1), 0, 1); }

  /* ---------- tailles : au chargement et au redimensionnement seulement ---------- */
  var largeurPrec = 0;
  function mesurer(){
    hb = 0;
    var mobile = window.innerWidth <= 860;
    if (!mobile) duo.style.setProperty('--lc', clamp(Math.round((window.innerHeight - 350) * 1.6), 600, 880) + 'px');
    W = cadre.clientWidth || 1; H = cadre.clientHeight || 1; pw = poignee.offsetWidth || 140;
    var k = mobile ? clamp((window.innerHeight - hb - 88 - 36 - H - 14 - 44) / 722, .4, .56) : clamp((H + 46) / 722, .62, .84);
    telBoite.style.setProperty('--k', k.toFixed(3));
    cas.forEach(function(c){
      var s = Math.max(W / 1200, H / 750), tx = (W - 1200 * s) * c.fx, ty = (H - 750 * s) * .5;
      c.sc.style.transform = 'translate3d(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
    });
    // hauteur de la section : recalculée seulement si la largeur change (pas de saut quand la barre d'adresse du téléphone bouge)
    if (!reduit && (window.innerWidth !== largeurPrec || !sec.style.height)) {
      largeurPrec = window.innerWidth;
      seg = Math.max(440, Math.round(window.innerHeight * .8));          // ≈ 0,8 écran de défilement par projet
      sec.style.height = (intro.offsetHeight + scene.offsetHeight + (N + FIN) * seg) + 'px';
    }
  }

  /* ---------- progression : 0 → N (projets) → N + FIN (appel à l'action) ---------- */
  function debut(){ return sec.getBoundingClientRect().top + intro.offsetHeight; }
  function progression(){ return clamp((hb - debut()) / seg, 0, N + FIN); }

  /* ---------- dessin : uniquement transform / opacity ---------- */
  function peindre(){
    var c = cas[actif], px = xDisp * W, u = uDeX(xDisp);
    c.fen.style.transform = 'translate3d(' + px.toFixed(1) + 'px,0,0)';
    c.img.style.transform = 'translate3d(' + (-px).toFixed(1) + 'px,0,0)';
    if (!gele) {
      ligne.style.transform = 'translate3d(' + px.toFixed(1) + 'px,0,0)';
      poignee.style.transform = 'translate3d(' + (clamp(px, pw / 2 + 10, W - pw / 2 - 10) - pw / 2).toFixed(1) + 'px,0,0)';
    }
    recon.style.opacity = clamp((px - 230) / 80, 0, 1).toFixed(3);
    motAv.style.opacity = (.38 + .62 * clamp((.66 - u) / .32, 0, 1)).toFixed(3);
    motAp.style.opacity = (.38 + .62 * clamp((u - .34) / .32, 0, 1)).toFixed(3);
    legGroupes.forEach(function(g){ g[actif].classList.toggle('cote-ap', u > .5); });
    traits[actif].style.setProperty('--f', u.toFixed(3));
    poignee.setAttribute('aria-valuenow', Math.round(u * 100));
    poignee.setAttribute('aria-valuetext', u < .5 ? (__EN ? 'Before' : 'Avant') : (__EN ? 'After' : 'Après'));
  }

  /* ---------- amorti : rAF seulement tant que la barre bouge ---------- */
  function boucle(t){
    var dt = tPrec ? Math.min(64, t - tPrec) : 16; tPrec = t;
    xDisp += (xCible - xDisp) * (1 - Math.exp(-dt / (tire ? 45 : 110)));
    if (Math.abs(xCible - xDisp) * W < .25) { xDisp = xCible; tourne = false; tPrec = 0; peindre(); return; }
    peindre(); requestAnimationFrame(boucle);
  }
  function demarrer(){ if (!tourne) { tourne = true; tPrec = 0; requestAnimationFrame(boucle); } }

  /* ---------- changement de projet : fondu + léger glissement (cadre, téléphone, légende, nom) ---------- */
  var minBascule = null;
  function basculer(i, instant){
    if (i === actif) return;
    var sens = i > actif ? 'avant' : 'arriere';
    cadre.dataset.sens = sens; duo.dataset.sens = sens;
    traits.forEach(function(b, j){ b.setAttribute('aria-selected', String(j === i)); if (j !== i) b.style.setProperty('--f', j < i ? 1 : 0); });
    actif = i;
    casEl.forEach(function(el, j){ el.classList.toggle('on', j === i); });
    [noms, ecrans].concat(legGroupes).forEach(function(l){ l.forEach(function(el, j){ el.classList.toggle('on', j === i); }); });
    vitre.dataset.clair = String(CLAIR[i]);
    xDisp = xCible;                       // le nouveau projet arrive déjà à sa place (il est encore invisible)
    if (instant) { gele = false; peindre(); return; }
    cadre.classList.add('bascule'); gele = true; peindre();
    clearTimeout(minBascule);
    minBascule = setTimeout(function(){ gele = false; peindre(); cadre.classList.remove('bascule'); }, 260);
  }
  function fin(oui){
    if (oui === enFin) return;
    enFin = oui; zone.classList.toggle('fin', oui);
    duo.setAttribute('aria-hidden', String(oui));
    cta.setAttribute('aria-hidden', String(!oui));
  }

  /* ---------- défilement : écoute passive, un seul calcul par image, rien hors écran ---------- */
  function majDefil(){
    tic = false;
    if (fige || reduit) return;
    var P = progression(), i = Math.min(N - 1, Math.floor(P));
    if (manuel && Math.abs(P - pManuel) > .015) manuel = false;
    xCible = manuel ? xCible : xDe(uDe(Math.min(1, P - i)));
    if (i !== actif) basculer(i);
    fin(P > N + .12);
    demarrer();
  }
  function auDefil(){ if (!visible || tic) return; tic = true; requestAnimationFrame(majDefil); }
  window.addEventListener('scroll', auDefil, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ visible = e[0].isIntersecting; if (visible) auDefil(); }).observe(sec);

  /* ---------- poignée : souris, doigt, clavier ---------- */
  var depart = null;
  function xPointeur(e){ var r = cadre.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1); }
  function prendre(e){
    tire = true; manuel = true; pManuel = (reduit || fige) ? 0 : progression();
    cadre.classList.add('tire');
    try { cadre.setPointerCapture(e.pointerId); } catch(_){}
    xCible = xPointeur(e); demarrer();
  }
  cadre.addEventListener('pointerdown', function(e){
    if (e.button && e.button !== 0) return;
    if (e.pointerType === 'mouse' || e.target.closest('#poignee')) prendre(e);
    else depart = { x: e.clientX, y: e.clientY, id: e.pointerId };     // au doigt : on attend un geste horizontal
  });
  cadre.addEventListener('pointermove', function(e){
    if (tire) { xCible = xPointeur(e); demarrer(); return; }
    if (depart && e.pointerId === depart.id) {
      var dx = e.clientX - depart.x, dy = e.clientY - depart.y;
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { depart = null; prendre(e); }
      else if (Math.abs(dy) > 10) depart = null;
    }
  });
  function lacher(){ tire = false; depart = null; cadre.classList.remove('tire'); }
  cadre.addEventListener('pointerup', lacher);
  cadre.addEventListener('pointercancel', lacher);
  poignee.addEventListener('keydown', function(e){
    var d = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!d) return;
    e.preventDefault(); manuel = true; pManuel = (reduit || fige) ? 0 : progression();
    xCible = clamp(xCible + d * .06, 0, 1); demarrer();
  });

  /* ---------- clic sur un trait : on défile jusqu'au début de ce projet ---------- */
  traits.forEach(function(b){
    b.addEventListener('click', function(){
      var i = +b.dataset.i;
      if (reduit || fige) { basculer(i, true); xDisp = xCible = reduit ? .5 : xCible; peindre(); return; }
      manuel = false;
      window.scrollTo({ top: Math.max(0, window.scrollY + debut() - hb + (i + A * .6) * seg + 1), behavior: 'smooth' });
    });
  });

  /* ---------- démarrage ---------- */
  window.addEventListener('resize', function(){ mesurer(); if (!fige && !reduit) majDefil(); else peindre(); });
  if (reduit) { sec.classList.add('reduit'); xDisp = xCible = .5; }
  cta.setAttribute('aria-hidden', 'true');
  mesurer();
  if (!reduit) majDefil();
  else peindre();
  if (document.fonts) document.fonts.ready.then(function(){ mesurer(); peindre(); });
})();
