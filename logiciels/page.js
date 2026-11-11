/* =====================================================================
   Page « Logiciels sur mesure » — carrousel piloté par le défilement
   Hello Collection → Onlee Tournées → Ton logiciel (rendez-vous)
   · la section reste collée pendant qu'on passe d'une carte à l'autre
   · 1 coup de molette = 1 carte (ordinateur) ; onglets et flèches aussi
   · sur téléphone : les cartes se suivent simplement
   Aucune boucle d'animation : transitions CSS + écoute du défilement légère.
   ===================================================================== */
(function () {
  'use strict';

  var PROJETS = [
    {
      n: '01', nom: 'Hello Collection', type: 'Portail de commande pour professionnels', c: '#C82121',
      statut: 'Projet client · en ligne', lien: 'https://hellocollection-pro.fr', lienTxt: 'hellocollection-pro.fr',
      pourQui: 'Un fabricant et grossiste en mobilier qui vend à des magasins de meubles, en France et à l’étranger.',
      besoin: 'Que ses clients pros voient toute la collection et passent commande à toute heure, sans tout faire par téléphone.',
      construit: 'Un portail de commande : les vrais modèles en photo, le catalogue, un panier pro et plusieurs langues.',
      adresse: 'hellocollection-pro.fr',
      ecrans: [{ src: '/logiciels/img/hc-accueil.webp', nom: 'Accueil' }, { src: '/logiciels/img/hc-catalogue.webp', nom: 'Catalogue' }],
      mobiles: [{ src: '/logiciels/img/hc-mobile.webp', nom: 'Accueil sur téléphone' }, { src: '/logiciels/img/hc-mobile-produit.webp', nom: 'Fiche modèle' }],
      notif: { ic: 'HC', titre: 'Commande à valider', texte: 'Un magasin pro vient de commander la chambre Scarlet.' }
    },
    {
      n: '02', nom: 'Onlee Tournées', type: 'Tournées de livraison et abonnements', c: '#2B57C4',
      statut: 'Projet client · montré en démo, données fictives', lien: '', lienTxt: '',
      pourQui: 'Une entreprise de services aux commerces, avec des livreurs sur la route chaque jour et des centaines de clients sous contrat.',
      besoin: 'Savoir où passe chaque livreur, prouver que le passage a bien été fait, et retrouver l’historique d’un client en un clic.',
      construit: 'Le planning des tournées, l’appli du livreur avec photo et signature, les fiches clients et la preuve de passage.',
      adresse: 'Onlee Tournées · démo',
      ecrans: [
        { src: '/logiciels/img/tr-semaine.webp', nom: 'La semaine' },
        { src: '/logiciels/img/tr-jour.webp', nom: 'Aujourd’hui' },
        { src: '/logiciels/img/tr-fiche.webp', nom: 'Fiche client' },
        { src: '/logiciels/img/tr-preuve.webp', nom: 'Preuve de passage' },
        { src: '/logiciels/img/tr-tableau.webp', nom: 'Tableau de bord' }
      ],
      mobiles: [{ src: '/logiciels/img/tr-livreur.webp', nom: 'La tournée du livreur' }, { src: '/logiciels/img/tr-livreur-signature.webp', nom: 'Signature du client' }],
      notif: { ic: 'M', titre: 'Mehdi · arrêt fait', texte: 'Boulangerie Martin : photo et signature reçues.' }
    }
  ];
  var TOI = { n: '03', nom: 'Ton logiciel', type: 'Le prochain de la liste', c: '#0E0F13' };
  var TOUS = PROJETS.concat([TOI]), N = TOUS.length;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 900px)');
  var FLECHE_LIEN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9"/></svg>';
  var CAL = 'data-cal-namespace="rdv30" data-cal-link="leeroy-benaich/30min" data-cal-config=\'{"layout":"month_view","theme":"light"}\' data-onlee-express';

  /* ---------- morceaux d'une carte projet ---------- */
  function notif(p) {
    return '<div class="notif notif-scene"><span class="notif-ic" style="background:' + p.c + '">' + p.notif.ic + '</span>' +
      '<div class="notif-t"><p><b>' + p.notif.titre + '</b><small>maintenant</small></p><span>' + p.notif.texte + '</span></div></div>';
  }
  function navigateur(p, prio) {
    return '<div class="navig"><div class="navig-barre"><i></i><i></i><i></i><span>' + p.adresse + '</span></div><div class="navig-ecran">' +
      p.ecrans.map(function (e, k) {
        return '<img class="' + (k === 0 ? 'on' : '') + '" src="' + e.src + '" alt="' + p.nom + ' — ' + e.nom + ' (vraie capture)" ' +
          (prio && k === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" width="1600" height="1000" srcset="' + e.src.replace('.webp', '-800.webp') + ' 800w, ' + e.src + ' 1600w" sizes="(max-width: 760px) 80vw, 560px">';
      }).join('') + '</div></div>';
  }
  function telephone(p) {
    return '<div class="tel"><div class="tel-cadre"><div class="tel-ecran">' + p.mobiles.map(function (m, k) {
      return '<img class="' + (k === 0 ? 'on' : '') + '" src="' + m.src + '" alt="' + p.nom + ' — ' + m.nom + ' (vraie capture)" loading="lazy" decoding="async" srcset="' + m.src.replace('.webp', '-400.webp') + ' 400w, ' + m.src + ' 780w" sizes="(max-width: 760px) 20vw, 140px">';
    }).join('') + '</div></div><div class="tel-points">' + p.mobiles.map(function (m, k) {
      return '<button type="button" class="' + (k === 0 ? 'on' : '') + '" data-m="' + k + '" aria-label="' + m.nom + '"></button>';
    }).join('') + '</div></div>';
  }
  function carteProjet(p, i) {
    return '<article class="c3" data-i="' + i + '" style="--c:' + p.c + '">' +
      '<div class="c3-texte"><span class="num">' + p.n + '</span><h2>' + p.nom + '</h2><p class="statut">' + p.statut + '</p>' +
      '<dl class="trois"><div><dt>Pour qui</dt><dd>' + p.pourQui + '</dd></div><div><dt>Le besoin</dt><dd>' + p.besoin + '</dd></div>' +
      '<div><dt>Ce qu’on a construit</dt><dd>' + p.construit + '</dd></div></dl>' +
      '<div class="liens-p">' + (p.lien ? '<a class="lien-site" href="' + p.lien + '" target="_blank" rel="noopener">' + p.lienTxt + ' ' + FLECHE_LIEN + '</a>' : '<span class="lien-site muet">Démo privée, montrée en appel</span>') + '</div></div>' +
      '<div class="c3-scene"><div class="scene avec-tel"><div class="scene-pose">' + navigateur(p, i === 0) + telephone(p) + notif(p) + '</div>' +
      '<div class="ong-ecrans" role="tablist">' + p.ecrans.map(function (e, k) {
        return '<button type="button" role="tab" class="' + (k === 0 ? 'on' : '') + '" data-e="' + k + '">' + e.nom + '</button>';
      }).join('') + '</div></div></div></article>';
  }
  /* la 3e carte : « Ton logiciel », un écran vide qui se construit */
  function carteToi(i) {
    var os = function (cl, k) { return '<i class="os ' + cl + '" style="--k:' + k + '"></i>'; };
    var lignes = ''; for (var r = 0; r < 4; r++) lignes += os('os-ligne', 9 + r);
    return '<article class="c3 c3-toi" data-i="' + i + '" style="--c:' + TOI.c + '">' +
      '<div class="c3-texte"><span class="num">03</span><h2>Ton logiciel</h2>' +
      '<p class="phrase">Le prochain, c’est le tien.</p>' +
      '<ul class="etiquettes"><li>ton métier</li><li>tes clients</li><li>tes outils</li></ul>' +
      '<p class="toi-p">30 minutes au téléphone pour voir ensemble si un logiciel sur mesure a du sens pour toi.</p>' +
      '<button class="btn btn-bleu btn-gros" ' + CAL + '>Réserver un appel <span class="fleche">→</span></button></div>' +
      '<div class="c3-scene"><div class="scene"><div class="scene-pose">' +
        '<div class="navig navig-vide"><div class="navig-barre"><i></i><i></i><i></i><span>ton-logiciel.fr</span></div>' +
        '<div class="navig-ecran"><div class="chantier">' +
          '<div class="ch-cote">' + os('os-logo', 0) + os('os-menu', 1) + os('os-menu', 2) + os('os-menu', 3) + os('os-menu', 4) + '</div>' +
          '<div class="ch-corps">' + os('os-titre', 2) + '<div class="ch-chiffres">' + os('os-bloc', 4) + os('os-bloc', 5) + os('os-bloc', 6) + '</div>' +
          '<div class="ch-tableau">' + lignes + '</div></div>' +
        '</div><span class="ch-mot">Ton écran, à dessiner ensemble</span></div></div>' +
        '<div class="notif notif-scene"><span class="notif-ic" style="background:#0055FF">On</span><div class="notif-t"><p><b>Appel réservé</b><small>maintenant</small></p><span>Jeudi 10:00 · 30 min pour parler de ton projet.</span></div></div>' +
      '</div></div></div></article>';
  }

  /* ---------- rendu ---------- */
  var ong = $('#onglets3'), piste = $('#piste3'), defile = $('#defile'), collant = $('#collant');
  ong.innerHTML = TOUS.map(function (p, i) {
    return '<button type="button" role="tab" data-i="' + i + '" style="--c:' + p.c + '"><span class="o-n">' + p.n + '</span><span class="o-t"><b>' + p.nom + '</b><small>' + p.type + '</small></span></button>';
  }).join('');
  piste.innerHTML = PROJETS.map(carteProjet).join('') + carteToi(PROJETS.length);
  var cartes = $$('.c3', piste), courant = -1;

  /* onglets d'écrans + points du téléphone */
  piste.addEventListener('click', function (e) {
    var b = e.target.closest('.ong-ecrans button');
    if (b) {
      var sc = b.closest('.scene'), k = +b.dataset.e;
      $$('.ong-ecrans button', sc).forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.navig-ecran img', sc).forEach(function (im, j) { im.classList.toggle('on', j === k); });
      return;
    }
    var m = e.target.closest('.tel-points button');
    if (m) {
      var t = m.closest('.tel'), q = +m.dataset.m;
      $$('.tel-points button', t).forEach(function (x) { x.classList.toggle('on', x === m); });
      $$('.tel-ecran img', t).forEach(function (im, j) { im.classList.toggle('on', j === q); });
      return;
    }
    var c = e.target.closest('.c3');
    if (c && !c.classList.contains('actif') && !mobile.matches) { e.preventDefault(); aller(+c.dataset.i); }
  });

  /* ---------- afficher la carte i (position de la piste) ---------- */
  function placer() {
    if (mobile.matches) { piste.style.transform = ''; return; }
    var c = cartes[0], w = c.offsetWidth, gap = parseFloat(getComputedStyle(piste).columnGap) || 24;
    var x = (piste.parentNode.clientWidth - w) / 2 - courant * (w + gap);
    piste.style.transform = 'translate3d(' + x + 'px,0,0)';
  }
  function montrer(i) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === courant) return;
    courant = i;
    cartes.forEach(function (c, k) {
      c.classList.toggle('actif', k === i);
      if (k === i) c.classList.add('vu');
      if (!mobile.matches) c.setAttribute('aria-hidden', k === i ? 'false' : 'true'); else c.removeAttribute('aria-hidden');
    });
    $$('button', ong).forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', String(k === i)); });
    $('#fl3g').disabled = i === 0; $('#fl3d').disabled = i === N - 1;
    $('#avanceI').style.transform = 'scaleX(' + ((i + 1) / N) + ')';
    $('#avanceT').textContent = i < N - 1 ? TOUS[i].n + ' / 0' + N + ' · fais défiler pour la suite' : '03 / 0' + N;
    placer();
  }

  /* ---------- le défilement pilote le carrousel ----------
     ancres : haut de la section + k × pas (pas = 70 % de l'écran)       */
  var ancres = [], pas = 0, tic = false, verrou = 0;
  function mesurer() {
    if (mobile.matches) { ancres = []; defile.style.height = ''; return; }
    pas = Math.round(window.innerHeight * 0.7);
    defile.style.height = (window.innerHeight + pas * (N - 1)) + 'px';
    var y0 = defile.getBoundingClientRect().top + window.scrollY;
    ancres = []; for (var k = 0; k < N; k++) ancres.push(Math.round(y0 + k * pas));
  }
  function surDefile() {
    tic = false;
    document.getElementById('n2').classList.toggle('compact', window.scrollY > 40);
    if (mobile.matches || !ancres.length) return;
    montrer(Math.round((window.scrollY - ancres[0]) / pas));
  }
  window.addEventListener('scroll', function () { if (!tic) { tic = true; requestAnimationFrame(surDefile); } }, { passive: true });

  function aller(i) {
    i = Math.max(0, Math.min(N - 1, i));
    if (mobile.matches || !ancres.length) { montrer(i); cartes[i].scrollIntoView({ behavior: doux ? 'smooth' : 'auto', block: 'start' }); return; }
    window.scrollTo({ top: ancres[i], behavior: doux ? 'smooth' : 'auto' });
  }
  /* 1 coup de molette = 1 carte, seulement dans la zone collante */
  window.addEventListener('wheel', function (e) {
    if (mobile.matches || !ancres.length || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    var y = window.scrollY, m = 6, cible = null, k;
    if (e.deltaY > 0) {
      if (y >= ancres[N - 1] - m) return;               /* dernière carte : la page continue normalement */
      for (k = 0; k < N; k++) if (ancres[k] > y + m) { cible = ancres[k]; break; }
    } else {
      if (y > ancres[N - 1] + m || y <= ancres[0] + m) return;
      for (k = N - 1; k >= 0; k--) if (ancres[k] < y - m) { cible = ancres[k]; break; }
    }
    if (cible === null) return;
    e.preventDefault();
    var t = Date.now(); if (t < verrou) return;
    verrou = t + 900;
    window.scrollTo({ top: cible, behavior: doux ? 'smooth' : 'auto' });
  }, { passive: false });

  ong.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) aller(+b.dataset.i); });
  $('#fl3g').addEventListener('click', function () { aller(courant - 1); });
  $('#fl3d').addEventListener('click', function () { aller(courant + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input,textarea') || mobile.matches) return;
    var r = defile.getBoundingClientRect(); if (r.bottom < 200 || r.top > 200) return;
    if (e.key === 'ArrowRight') { aller(courant + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { aller(courant - 1); e.preventDefault(); }
  });

  /* langue : bascule visuelle pour l'aperçu */
  $$('.langue span').forEach(function (sp) { sp.addEventListener('click', function () { $$('span', sp.parentNode).forEach(function (x) { x.classList.toggle('on', x === sp); }); }); });

  /* sur téléphone : chaque carte « arrive » quand on la voit */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ent) { ent.forEach(function (en) { if (en.isIntersecting && mobile.matches) en.target.classList.add('vu', 'actif'); }); }, { threshold: 0.3 });
    cartes.forEach(function (c) { io.observe(c); });
  }

  function tout() { mesurer(); var c = courant; courant = -1; montrer(Math.max(c, 0)); surDefile(); }
  window.addEventListener('resize', function () { piste.style.transition = 'none'; tout(); void piste.offsetWidth; piste.style.transition = ''; });
  if (mobile.addEventListener) mobile.addEventListener('change', tout);
  piste.style.transition = 'none'; tout(); void piste.offsetWidth; piste.style.transition = '';
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(tout);
  window.addEventListener('load', tout);
  window.__page = { aller: aller, ancres: function () { return ancres; } };
})();
