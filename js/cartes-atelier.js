/* Cartes des services : dessins repris de l'atelier labo/cartes (v1 Affiche, v2 Écran, v3 Téléphone) */
/* =====================================================================
   CARTES ONLEE — 3 versions des 4 cartes de services, dessinées en canvas 2D
   Usage : window.CARTES_V[v](ctx, w, h, i, logos)
     · v = 1 | 2 | 3 (version), i = 0..3 (service)
     · canvas conseillé : 1200 × 1591 px (rapport 2,3 / 3,05), ombre et coins compris
     · logos = { wa, meta, fb, ig, google } (images chargées) ; logos.onlee optionnel
   Aides : CARTES_V.logosSVG (les SVG), CARTES_V.chargerLogos(cheminLogoOnlee) -> Promise(logos),
           CARTES_V.polices() -> Promise (charge les polices utilisées avant de dessiner)
   Aucune dépendance externe, aucune animation : on dessine une fois, c'est tout.
   ===================================================================== */
(function(){
  'use strict';
  var TITRE = '"Bricolage Grotesque", Inter, sans-serif',
      TEXTE = 'Inter, -apple-system, "Helvetica Neue", Arial, sans-serif',
      LARGE = 'Archivo, "Bricolage Grotesque", Inter, sans-serif';
  var BLEU = '#0055FF', NOIR = '#0E0F13', GRIS = '#5B6170', PI2 = Math.PI * 2;
  /* Vizor : ses vraies couleurs (barre prune, fond crème) */
  var PRUNE = '#2A1A38', LAVANDE = '#CDB8F5', VIOLET = '#8B5CF6', CREME = '#F6F3EE', CLAIRVUE = '#1F3D35';

  /* ---------- outils de dessin ---------- */
  function rr(x, X, Y, w, h, r){ r = Math.max(0, Math.min(r, w / 2, h / 2)); x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function bloc(x, X, Y, w, h, r, c){ x.fillStyle = c; rr(x, X, Y, w, h, r); x.fill(); }
  function cadreTrait(x, X, Y, w, h, r, c, ep){ x.strokeStyle = c; x.lineWidth = ep; rr(x, X, Y, w, h, r); x.stroke(); }
  function rond(x, X, Y, r, c){ x.fillStyle = c; x.beginPath(); x.arc(X, Y, r, 0, PI2); x.fill(); }
  function ligne(x, X1, Y1, X2, Y2, c, ep){ x.strokeStyle = c; x.lineWidth = ep; x.lineCap = 'round'; x.beginPath(); x.moveTo(X1, Y1); x.lineTo(X2, Y2); x.stroke(); }
  function ombre(x, c, flou, dy){ x.shadowColor = c; x.shadowBlur = flou; x.shadowOffsetX = 0; x.shadowOffsetY = dy || 0; }
  function police(x, taille, poids, fam, large){ x.font = poids + ' ' + (Math.round(taille * 10) / 10) + 'px ' + (fam || TEXTE); try { x.fontStretch = large ? 'expanded' : 'normal'; } catch(e){} }
  function esp(x, v){ try { x.letterSpacing = (v || 0) + 'px'; } catch(e){} }
  /* texte : o = { f: police, a: alignement, esp: interlettrage, max: largeur max (réduit la taille), large: Archivo large } */
  function T(x, s, X, Y, taille, poids, c, o){
    o = o || {}; x.save(); police(x, taille, poids, o.f, o.large); esp(x, o.esp);
    var l = x.measureText(s).width;
    if (o.max && l > o.max){ var k = o.max / l; police(x, taille * k, poids, o.f, o.large); esp(x, (o.esp || 0) * k); l = x.measureText(s).width; }
    x.textAlign = o.a || 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = c; x.fillText(s, X, Y); x.restore(); return l; }
  function largeur(x, s, taille, poids, fam, e){ x.save(); police(x, taille, poids, fam); esp(x, e); var l = x.measureText(s).width; x.restore(); return l; }
  function coupe(x, s, maxW, taille, poids, fam){ x.save(); police(x, taille, poids, fam); var mots = s.split(' '), l = '', out = [];
    mots.forEach(function(m){ var t = l ? l + ' ' + m : m; if (x.measureText(t).width > maxW && l){ out.push(l); l = m; } else l = t; }); if (l) out.push(l);
    var mw = 0; out.forEach(function(t){ mw = Math.max(mw, x.measureText(t).width); }); x.restore(); out.largeur = mw; return out; }
  function para(x, s, X, Y, maxW, taille, poids, c, lh, maxL, fam){ var L = coupe(x, s, maxW, taille, poids, fam);
    if (maxL && L.length > maxL){ L = L.slice(0, maxL); L[maxL - 1] = L[maxL - 1].replace(/\s*\S*$/, '') + '…'; }
    L.forEach(function(t, k){ T(x, t, X, Y + k * lh, taille, poids, c, { f: fam }); }); return L.length; }
  function image(x, im, X, Y, h){ if (!im || !im.naturalWidth) return 0; var w = h * im.naturalWidth / im.naturalHeight; x.drawImage(im, X, Y, w, h); return w; }
  function ratio(im){ return im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1; }

  /* ---------- petites icônes ---------- */
  function coeur(x, cx, cy, s, c, plein, ep){ x.beginPath(); x.moveTo(cx, cy + s * .42); x.bezierCurveTo(cx - s * .78, cy - s * .02, cx - s * .4, cy - s * .64, cx, cy - s * .2); x.bezierCurveTo(cx + s * .4, cy - s * .64, cx + s * .78, cy - s * .02, cx, cy + s * .42); x.closePath();
    if (plein){ x.fillStyle = c; x.fill(); } else { x.strokeStyle = c; x.lineWidth = ep; x.lineJoin = 'round'; x.stroke(); } }
  function bulleIc(x, cx, cy, s, c, ep){ var r = s * .42; x.strokeStyle = c; x.lineWidth = ep; x.lineJoin = 'round'; x.beginPath(); x.arc(cx, cy, r, Math.PI * .78, Math.PI * .68 + PI2, false); x.lineTo(cx - r * 1.02, cy + r * 1.02); x.closePath(); x.stroke(); }
  function envoiIc(x, cx, cy, s, c, ep){ var r = s * .45; x.strokeStyle = c; x.lineWidth = ep; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - r, cy - r * .8); x.lineTo(cx + r, cy - r * .8); x.lineTo(cx - r * .1, cy + r); x.closePath(); x.moveTo(cx - r * .55, cy - r * .1); x.lineTo(cx + r, cy - r * .8); x.stroke(); }
  function signetIc(x, cx, cy, s, c, ep){ var r = s * .42; x.strokeStyle = c; x.lineWidth = ep; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - r * .7, cy - r); x.lineTo(cx + r * .7, cy - r); x.lineTo(cx + r * .7, cy + r); x.lineTo(cx, cy + r * .45); x.lineTo(cx - r * .7, cy + r); x.closePath(); x.stroke(); }
  function loupe(x, cx, cy, s, c, ep){ x.strokeStyle = c; x.lineWidth = ep; x.lineCap = 'round'; x.beginPath(); x.arc(cx - s * .08, cy - s * .08, s * .3, 0, PI2); x.stroke(); ligne(x, cx + s * .15, cy + s * .15, cx + s * .4, cy + s * .4, c, ep); }
  function cadenas(x, cx, cy, s, c){ bloc(x, cx - s * .38, cy - s * .05, s * .76, s * .58, s * .1, c); x.strokeStyle = c; x.lineWidth = s * .14; x.beginPath(); x.arc(cx, cy - s * .08, s * .24, Math.PI, 0); x.stroke(); }
  function chevron(x, cx, cy, s, c, ep, sens){ var d = sens || 1; x.strokeStyle = c; x.lineWidth = ep; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - s * .2 * d, cy - s * .4); x.lineTo(cx + s * .2 * d, cy); x.lineTo(cx - s * .2 * d, cy + s * .4); x.stroke(); }
  function coche(x, cx, cy, s, c, ep){ x.strokeStyle = c; x.lineWidth = ep; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - s * .35, cy); x.lineTo(cx - s * .1, cy + s * .26); x.lineTo(cx + s * .38, cy - s * .28); x.stroke(); }
  function etoile(x, cx, cy, r, c){ x.beginPath(); for (var k = 0; k < 10; k++){ var a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * .45 : r; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); } x.closePath(); x.fillStyle = c; x.fill(); }
  function points3(x, cx, cy, s, c){ [-1, 0, 1].forEach(function(k){ rond(x, cx + k * s * .32, cy, s * .09, c); }); }
  function fleche(x, cx, cy, s, c, ep){ ligne(x, cx - s * .4, cy, cx + s * .38, cy, c, ep); x.strokeStyle = c; x.lineWidth = ep; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx + s * .08, cy - s * .3); x.lineTo(cx + s * .4, cy); x.lineTo(cx + s * .08, cy + s * .3); x.stroke(); }
  function feux(x, X, Y, u){ ['#FF5F57', '#FEBC2E', '#28C840'].forEach(function(c, k){ rond(x, X + k * 2.5 * u, Y, .8 * u, c); }); }
  function pastille(x, s, X, Y, taille, c, fond, droite){ var w = largeur(x, s, taille, 600) + taille * 1.3, h = taille * 1.75, X0 = droite ? X - w : X;
    bloc(x, X0, Y - h * .7, w, h, h / 2, fond); T(x, s, X0 + w / 2, Y + taille * .02, taille, 600, c, { a: 'center' }); return w; }
  /* initiales dans un rond */
  function avatar(x, cx, cy, r, c, ini, tc){ rond(x, cx, cy, r, c); T(x, ini, cx, cy + r * .34, r * .9, 700, tc || '#fff', { a: 'center' }); }


  /* hasard reproductible (même dessin à chaque fois) */
  function alea(s){ s = s || 7; return function(){ s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* matière : mèches de cheveux ou veinage du bois */
  function matiere(x, X, Y, w, h, c1, c2, fil, mode, graine){
    var r = alea(graine), bois = mode === 'bois';
    x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
    var g = x.createLinearGradient(X, Y, X + w * .4, Y + h); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(X, Y, w, h);
    var n = Math.round(w / (bois ? 7 : 4)); x.strokeStyle = fil; x.lineCap = 'round';
    for (var k = 0; k < n; k++){ var px = X + r() * w, a = (r() - .5) * w * (bois ? .06 : .3), b = (r() - .5) * w * (bois ? .06 : .3);
      x.globalAlpha = .12 + r() * .3; x.lineWidth = Math.max(1, w * (bois ? .007 : .005) * (.5 + r()));
      x.beginPath(); x.moveTo(px, Y - 4); x.bezierCurveTo(px + a, Y + h * .33, px + b, Y + h * .66, px + (a - b) * .5, Y + h + 4); x.stroke(); }
    if (bois){ x.globalAlpha = .3; x.lineWidth = Math.max(1, w * .008); var kx = X + w * (.3 + r() * .4), ky = Y + h * (.25 + r() * .5);
      for (var q = 1; q < 4; q++){ x.beginPath(); x.ellipse(kx, ky, w * .03 * q, h * .07 * q, 0, 0, PI2); x.stroke(); } }
    else { x.globalAlpha = .35; var gl = x.createLinearGradient(X, 0, X + w, 0); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(.45, 'rgba(255,255,255,.55)'); gl.addColorStop(.6, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(X, Y, w, h); }
    x.restore(); }

  /* planches de bois massif */
  function planches(x, X, Y, w, h){
    var tons = [['#D4A877', '#B98A5C'], ['#C49467', '#A87849'], ['#DDB487', '#C29468'], ['#BF8C5D', '#9E6E42'], ['#D0A273', '#B3845A']], n = tons.length, pw = w / n;
    tons.forEach(function(t, k){ matiere(x, X + k * pw, Y, pw + 1, h, t[0], t[1], '#6B4022', 'bois', 11 + k * 7); ligne(x, X + k * pw, Y, X + k * pw, Y + h, 'rgba(60,34,14,.35)', Math.max(1, w * .004)); }); }

  /* ciseaux de coiffeur */
  function ciseaux(x, cx, cy, L, c, ang){
    x.save(); x.translate(cx, cy); x.rotate(ang || 0);
    [-1, 1].forEach(function(sg){ x.save(); x.rotate(sg * .2);
      var lg = x.createLinearGradient(0, -L * .03, 0, L * .03); lg.addColorStop(0, '#E9ECF1'); lg.addColorStop(.5, '#A9B0BB'); lg.addColorStop(1, '#D5D9E0');
      x.fillStyle = lg; x.beginPath(); x.moveTo(-L * .05, -L * .028); x.lineTo(L * .6, -L * .004); x.quadraticCurveTo(L * .3, L * .034, -L * .05, L * .026); x.closePath(); x.fill();
      x.strokeStyle = c; x.lineCap = 'round'; x.lineWidth = L * .034; x.beginPath(); x.moveTo(-L * .02, 0); x.lineTo(-L * .2, 0); x.stroke();
      x.lineWidth = L * .036; x.beginPath(); x.ellipse(-L * .31, 0, L * .11, L * .078, 0, 0, PI2); x.stroke();
      x.restore(); });
    rond(x, 0, 0, L * .03, '#6B7280'); rond(x, 0, 0, L * .012, '#E9ECF1'); x.restore(); }
  /* peigne */
  function peigne(x, cx, cy, L, c, ang){
    x.save(); x.translate(cx, cy); x.rotate(ang || 0); bloc(x, -L / 2, -L * .06, L, L * .1, L * .03, c);
    for (var k = 0; k < 24; k++){ var tx = -L / 2 + L * .04 + k * (L * .92 / 23); bloc(x, tx - L * .007, L * .02, L * .014, L * (k < 10 ? .13 : .095), L * .006, c); }
    x.restore(); }

  /* bol de poke vu du dessus (pub du restaurant) */
  function bol(x, cx, cy, R){
    x.save(); ombre(x, 'rgba(70,45,20,.28)', R * .22, R * .07); rond(x, cx, cy, R, '#FFFFFF'); x.restore();
    rond(x, cx, cy, R * .95, '#EFEBE3');
    var r = R * .84; x.save(); x.beginPath(); x.arc(cx, cy, r, 0, PI2); x.clip(); rond(x, cx, cy, r, '#FBF8F1');
    var parts = ['saumon', 'avocat', 'mangue', 'chou', 'edamame'], coul = { saumon: '#F2876A', avocat: '#A5C96F', mangue: '#F6B735', chou: '#8E3B8C', edamame: '#6FAE4E' };
    parts.forEach(function(p, k){ var a0 = -Math.PI / 2 + k * PI2 / 5 + .04, a1 = a0 + PI2 / 5 - .08, am = (a0 + a1) / 2, q, rr2, aa;
      x.fillStyle = coul[p]; x.beginPath(); x.moveTo(cx + Math.cos(am) * r * .24, cy + Math.sin(am) * r * .24); x.arc(cx, cy, r * 1.02, a0, a1); x.closePath(); x.fill();
      if (p === 'saumon'){ x.strokeStyle = 'rgba(255,240,230,.75)'; x.lineWidth = r * .022; for (q = 0; q < 5; q++){ x.beginPath(); x.arc(cx, cy, r * (.36 + q * .13), am - .4, am + .4); x.stroke(); } }
      if (p === 'avocat'){ for (q = 0; q < 3; q++){ rr2 = r * (.42 + q * .19); x.save(); x.translate(cx + Math.cos(am) * rr2, cy + Math.sin(am) * rr2); x.rotate(am + Math.PI / 2);
        x.fillStyle = '#D4E59A'; x.beginPath(); x.ellipse(0, 0, r * .17, r * .065, 0, 0, PI2); x.fill(); x.fillStyle = '#3F6B26'; x.beginPath(); x.ellipse(0, r * .05, r * .17, r * .018, 0, 0, PI2); x.fill(); x.restore(); } }
      if (p === 'mangue'){ for (q = 0; q < 7; q++){ rr2 = r * (.36 + (q % 3) * .2); aa = am + (q - 3) * .13; x.save(); x.translate(cx + Math.cos(aa) * rr2, cy + Math.sin(aa) * rr2); x.rotate(q * .7);
        bloc(x, -r * .055, -r * .055, r * .11, r * .11, r * .02, q % 2 ? '#FFCB52' : '#EE9E1A'); x.restore(); } }
      if (p === 'chou'){ x.strokeStyle = '#C886C6'; x.lineWidth = r * .014; for (q = 0; q < 9; q++){ aa = am + (q - 4) * .07; x.beginPath(); x.moveTo(cx + Math.cos(aa) * r * .3, cy + Math.sin(aa) * r * .3); x.quadraticCurveTo(cx + Math.cos(aa + .08) * r * .6, cy + Math.sin(aa + .08) * r * .6, cx + Math.cos(aa + .03) * r * .98, cy + Math.sin(aa + .03) * r * .98); x.stroke(); } }
      if (p === 'edamame'){ for (q = 0; q < 9; q++){ rr2 = r * (.38 + (q % 3) * .19); aa = am + (q - 4) * .085; rond(x, cx + Math.cos(aa) * rr2, cy + Math.sin(aa) * rr2, r * .055, q % 2 ? '#8CC66B' : '#5C9C3D'); } }
    });
    rond(x, cx, cy, r * .25, '#FBF8F1'); var rs = alea(5); for (var s = 0; s < 40; s++){ var sa = rs() * PI2, sd = Math.sqrt(rs()) * r * .9; x.fillStyle = s % 3 ? '#FFFFFF' : '#2B2620'; x.beginPath(); x.ellipse(cx + Math.cos(sa) * sd, cy + Math.sin(sa) * sd, r * .016, r * .009, sa, 0, PI2); x.fill(); }
    x.restore();
    x.save(); ombre(x, 'rgba(70,45,20,.25)', R * .06, R * .03); ligne(x, cx + R * .15, cy - R * 1.12, cx + R * 1.05, cy + R * .05, '#3A2A1E', R * .045); ligne(x, cx + R * .32, cy - R * 1.16, cx + R * 1.12, cy - R * .08, '#3A2A1E', R * .045); x.restore(); }

  function creaBowl(x, X, Y, w, h){
    x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
    x.fillStyle = '#F4E6D4'; x.fillRect(X, Y, w, h);
    var g = x.createRadialGradient(X + w * .7, Y + h * .6, 0, X + w * .7, Y + h * .6, w * .7); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, w, h);
    var R = Math.min(w * .3, h * .34); bol(x, X + w * .66, Y + h * .64, R);
    T(x, 'Le nouveau bowl', X + w * .07, Y + w * .13, w * .072, 800, '#1E1712', { f: TITRE, esp: -w * .002 });
    T(x, 'Saumon, mangue, avocat.', X + w * .07, Y + w * .2, w * .044, 500, 'rgba(30,23,18,.72)');
    T(x, 'POKÉA', X + w * .07, Y + h - w * .05, w * .032, 800, '#C2410C', { esp: w * .005 });
    x.restore(); }

  /* tasse de café vue du dessus (pub du café) */
  function creaCafe(x, X, Y, w, h){
    x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
    x.fillStyle = '#E3EBE5'; x.fillRect(X, Y, w, h);
    var g = x.createRadialGradient(X + w * .62, Y + h * .6, 0, X + w * .62, Y + h * .6, w * .7); g.addColorStop(0, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(X, Y, w, h);
    var R = Math.min(w * .22, h * .27), cx = X + w * .6, cy = Y + h * .63;
    x.save(); ombre(x, 'rgba(30,50,40,.25)', R * .3, R * .1); rond(x, cx, cy, R * 1.45, '#FFFFFF'); x.restore(); rond(x, cx, cy, R * 1.18, '#F1F0EC');
    x.save(); ombre(x, 'rgba(30,50,40,.22)', R * .12, R * .04); bloc(x, cx + R * .85, cy - R * .16, R * .55, R * .32, R * .16, '#FFFFFF'); rond(x, cx, cy, R, '#FFFFFF'); x.restore();
    rond(x, cx, cy, R * .84, '#6B3F22');
    var cg = x.createRadialGradient(cx - R * .2, cy - R * .2, 0, cx, cy, R * .84); cg.addColorStop(0, '#B07A4A'); cg.addColorStop(.7, '#8A5530'); cg.addColorStop(1, '#5C3418'); x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, R * .82, 0, PI2); x.fill();
    coeur(x, cx, cy + R * .06, R * 1.05, '#F4E4CC', true); coeur(x, cx, cy + R * .02, R * .62, '#D9B48A', true); coeur(x, cx, cy, R * .34, '#F4E4CC', true);
    x.save(); x.translate(cx - R * 1.85, cy + R * .1); x.rotate(-.35); bloc(x, -R * .06, -R * .9, R * .12, R * 1.2, R * .06, '#C9CDD4'); x.beginPath(); x.ellipse(0, R * .55, R * .16, R * .26, 0, 0, PI2); x.fillStyle = '#D5D9E0'; x.fill(); x.restore();
    T(x, 'Le brunch du samedi', X + w * .07, Y + w * .13, w * .072, 800, '#14231C', { f: TITRE, esp: -w * .002 });
    T(x, 'Réserve ta table en ligne.', X + w * .07, Y + w * .2, w * .044, 500, 'rgba(20,35,28,.72)');
    T(x, 'CAFÉ MIRA', X + w * .07, Y + h - w * .05, w * .032, 800, '#2F6B4F', { esp: w * .005 });
    x.restore(); }

  /* image d'accueil du coiffeur : ciseaux + peigne sur fond rosé */
  function heroCoiffeur(x, X, Y, w, h){
    var g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, '#F3E1D8'); g.addColorStop(1, '#E4C4B6'); x.fillStyle = g; x.fillRect(X, Y, w, h);
    x.fillStyle = 'rgba(120,60,40,.08)'; x.fillRect(X, Y + h * .78, w, h * .22);
    var L = Math.min(w * .78, h * 1.25);
    x.save(); ombre(x, 'rgba(90,40,20,.25)', L * .05, L * .02); peigne(x, X + w * .5, Y + h * .72, L * .82, '#2B1B16', -.08); ciseaux(x, X + w * .52, Y + h * .4, L, '#1E1A18', -.32); x.restore(); }
  /* image d'accueil du menuisier : bois massif */
  function heroBois(x, X, Y, w, h){ planches(x, X, Y, w, h); var g = x.createLinearGradient(X, Y, X, Y + h); g.addColorStop(0, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(40,20,5,.18)'); x.fillStyle = g; x.fillRect(X, Y, w, h); }
  /* image d'accueil de l'institut : pots de crème et serviette */
  function heroSoins(x, X, Y, w, h){
    var g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, '#F6E6E2'); g.addColorStop(1, '#E9CFC9'); x.fillStyle = g; x.fillRect(X, Y, w, h);
    x.fillStyle = 'rgba(140,70,70,.08)'; x.fillRect(X, Y + h * .72, w, h * .28);
    var s = Math.min(w, h * 1.6);
    x.save(); ombre(x, 'rgba(110,50,50,.22)', s * .04, s * .015);
    bloc(x, X + w * .12, Y + h * .58, w * .36, h * .2, h * .04, '#FFFFFF'); bloc(x, X + w * .12, Y + h * .52, w * .36, h * .08, h * .03, '#F1E4E0');
    bloc(x, X + w * .55, Y + h * .26, w * .16, h * .52, w * .03, '#B5676B'); bloc(x, X + w * .59, Y + h * .16, w * .08, h * .11, w * .015, '#2B1B1E');
    bloc(x, X + w * .74, Y + h * .46, w * .16, h * .32, w * .04, '#FFFFFF'); bloc(x, X + w * .74, Y + h * .4, w * .16, h * .08, w * .03, '#D9B7A6');
    x.restore();
    T(x, 'MILA', X + w * .63, Y + h * .56, w * .03, 800, 'rgba(255,255,255,.9)', { a: 'center', esp: w * .006 }); }

  /* ---------- fenêtres et téléphone ---------- */
  function fenetre(x, X, Y, w, h, o, contenu){
    var u = w / 100, r = o.r != null ? o.r : 1.3 * u, hb;
    x.save(); ombre(x, o.ombre || 'rgba(6,10,40,.34)', 6 * u, 2 * u); bloc(x, X, Y, w, h, r, o.fond || '#FFFFFF'); x.restore();
    x.save(); rr(x, X, Y, w, h, r); x.clip();
    if (o.chrome){
      var ht = 4.8 * u, hu = 5.4 * u; hb = ht + hu;
      x.fillStyle = '#DEE1E6'; x.fillRect(X, Y, w, ht); feux(x, X + 2.6 * u, Y + ht / 2 + .3 * u, u);
      var tx = X + 10.5 * u, tw = 32 * u; bloc(x, tx, Y + 1 * u, tw, ht, 1.1 * u, '#FFFFFF'); x.fillStyle = '#FFFFFF'; x.fillRect(tx, Y + ht - 1 * u, tw, 1.2 * u);
      avatar(x, tx + 2.6 * u, Y + 3.3 * u, 1 * u, o.chrome.fav || CLAIRVUE, o.chrome.ini || 'C');
      T(x, o.chrome.onglet, tx + 4.6 * u, Y + 3.95 * u, 1.75 * u, 500, '#202124', { max: tw - 8 * u });
      T(x, '×', tx + tw - 2.4 * u, Y + 4 * u, 2 * u, 400, '#5F6368', { a: 'center' });
      x.fillStyle = '#FFFFFF'; x.fillRect(X, Y + ht, w, hu);
      chevron(x, X + 3 * u, Y + ht + hu / 2, 2 * u, '#5F6368', .3 * u, -1); chevron(x, X + 6.2 * u, Y + ht + hu / 2, 2 * u, '#BDC1C6', .3 * u, 1);
      bloc(x, X + 10 * u, Y + ht + .9 * u, w - 14 * u, hu - 1.8 * u, (hu - 1.8 * u) / 2, '#F1F3F4');
      cadenas(x, X + 12.4 * u, Y + ht + hu / 2 - .1 * u, 1.5 * u, '#5F6368');
      T(x, o.chrome.url, X + 14.6 * u, Y + ht + hu / 2 + .7 * u, 2 * u, 500, '#202124');
      ligne(x, X, Y + hb, X + w, Y + hb, 'rgba(0,0,0,.08)', .15 * u);
    } else {
      hb = o.hb || 5 * u; x.fillStyle = o.barre || '#F3F4F7'; x.fillRect(X, Y, w, hb); feux(x, X + 2.6 * u, Y + hb / 2, u);
      if (o.url){ var pw = 36 * u; bloc(x, X + w * .5 - pw / 2, Y + hb * .2, pw, hb * .6, hb * .3, o.pill || '#FFFFFF'); cadenas(x, X + w * .5 - pw / 2 + 2.2 * u, Y + hb / 2 - .1 * u, 1.3 * u, '#8A8F9C');
        T(x, o.url, X + w * .5 - pw / 2 + 4 * u, Y + hb / 2 + .65 * u, 1.85 * u, 500, '#5B6170', { max: pw - 6 * u }); }
      ligne(x, X, Y + hb, X + w, Y + hb, 'rgba(0,0,0,.07)', .15 * u);
    }
    contenu(X, Y + hb, w, h - hb, u);
    x.restore(); }

  function barreEtat(x, sx, sy, sw, u, c){
    T(x, '9:41', sx + 13 * u, sy + 8.2 * u, 4.2 * u, 600, c, { a: 'center' });
    var bx = sx + sw - 25 * u;
    for (var k = 0; k < 4; k++) bloc(x, bx + k * 1.5 * u, sy + 8 * u - (1.4 + k * .7) * u, 1 * u, (1.4 + k * .7) * u, .3 * u, c);
    x.strokeStyle = c; x.lineWidth = .6 * u; x.lineCap = 'round'; [2.6, 1.6].forEach(function(r){ x.beginPath(); x.arc(bx + 9.4 * u, sy + 8.1 * u, r * u, -Math.PI * .75, -Math.PI * .25); x.stroke(); }); rond(x, bx + 9.4 * u, sy + 7.7 * u, .45 * u, c);
    cadreTrait(x, bx + 13 * u, sy + 5.2 * u, 6 * u, 3 * u, .9 * u, c, .35 * u); x.globalAlpha = .9; bloc(x, bx + 13.6 * u, sy + 5.8 * u, 4.6 * u, 1.8 * u, .5 * u, c); x.globalAlpha = 1;
    bloc(x, bx + 19.3 * u, sy + 6.2 * u, .6 * u, 1 * u, .3 * u, c); }

  function telephone(x, X, Y, w, h, o, contenu){
    var R = w * .15, b = w * .032;
    x.save(); ombre(x, o.ombre || 'rgba(0,0,0,.55)', w * .09, w * .03); bloc(x, X, Y, w, h, R, '#2A2B31'); x.restore();
    var g = x.createLinearGradient(X, Y, X + w, Y + h); g.addColorStop(0, 'rgba(255,255,255,.38)'); g.addColorStop(.5, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(255,255,255,.22)');
    cadreTrait(x, X + 1.5, Y + 1.5, w - 3, h - 3, R, g, 3);
    bloc(x, X + b * .45, Y + b * .45, w - b * .9, h - b * .9, R - b * .45, '#050506');
    var sx = X + b, sy = Y + b, sw = w - 2 * b, sh = h - 2 * b, u = sw / 100;
    x.save(); rr(x, sx, sy, sw, sh, R - b); x.clip(); x.fillStyle = o.fond || '#FFFFFF'; x.fillRect(sx, sy, sw, sh);
    contenu(sx, sy, sw, sh, u);
    barreEtat(x, sx, sy, sw, u, o.etat || NOIR);
    bloc(x, sx + sw / 2 - 14 * u, sy + 2.6 * u, 28 * u, 7.6 * u, 3.8 * u, '#000');
    x.restore(); }

  /* notification façon iPhone */
  function notif(x, X, Y, w, o){
    var u = w / 100, h = o.h || 25 * u;
    x.save(); ombre(x, 'rgba(6,10,30,.38)', 8 * u, 2.5 * u); bloc(x, X, Y, w, h, 5 * u, 'rgba(250,250,252,.99)'); x.restore();
    if (o.icone) o.icone(X + 5 * u, Y + h / 2 - 5.5 * u, 11 * u);
    T(x, o.titre, X + 20 * u, Y + 9.6 * u, 4.6 * u, 700, NOIR, { max: w - 48 * u });
    T(x, o.heure || 'maintenant', X + w - 5 * u, Y + 9.4 * u, 3.6 * u, 400, '#8A8F9C', { a: 'right' });
    para(x, o.texte, X + 20 * u, Y + 15.8 * u, w - 26 * u, 4.1 * u, 400, '#2B2F3A', 5.4 * u, 2);
    return h; }
  function iconeImg(x, im){ return function(X, Y, s){ x.save(); rr(x, X, Y, s, s, s * .24); x.clip(); x.fillStyle = '#fff'; x.fillRect(X, Y, s, s);
    var r = ratio(im), lw = r >= 1 ? s * .8 : s * .8 * r, lh = lw / r; if (im && im.naturalWidth) x.drawImage(im, X + (s - lw) / 2, Y + (s - lh) / 2, lw, lh); x.restore(); cadreTrait(x, X, Y, s, s, s * .24, 'rgba(0,0,0,.08)', Math.max(1, s * .02)); }; }
  function iconeVizor(x){ return function(X, Y, s){ bloc(x, X, Y, s, s, s * .24, PRUNE); T(x, 'V', X + s / 2, Y + s * .7, s * .56, 800, '#fff', { a: 'center', f: TITRE }); rond(x, X + s * .76, Y + s * .26, s * .08, VIOLET); }; }

  /* ===================================================================
     LES APERÇUS (vrais écrans)
     =================================================================== */

  /* 01 — CRM sur ordinateur (pipeline) */
  function crmBureau(x, X, Y, w, h, L, o){
    o = o || {};
    fenetre(x, X, Y, w, h, { url: 'crm.ton-entreprise.fr' }, function(cx, cy, cw, ch, u){
      var SB = 25 * u;
      x.fillStyle = '#F7F8FA'; x.fillRect(cx, cy, SB, ch); ligne(x, cx + SB, cy, cx + SB, cy + ch, '#E6E8EE', .15 * u);
      bloc(x, cx + 2.6 * u, cy + 2.8 * u, 4.6 * u, 4.6 * u, 1.1 * u, BLEU); T(x, 'T', cx + 4.9 * u, cy + 6.2 * u, 2.8 * u, 800, '#fff', { a: 'center', f: TITRE });
      T(x, 'Ton CRM', cx + 8.6 * u, cy + 6 * u, 2.5 * u, 800, NOIR, { f: TITRE });
      [['Pipeline', 1], ['Clients'], ['Devis'], ['Agenda'], ['WhatsApp', 0, '2']].forEach(function(m, k){ var my = cy + 13.5 * u + k * 5.6 * u;
        if (m[1]) bloc(x, cx + 1.6 * u, my - 3.5 * u, SB - 3.2 * u, 5 * u, 1 * u, '#E6EEFF');
        if (m[2]) image(x, L.wa, cx + 2.9 * u, my - 2.25 * u, 2.4 * u); else bloc(x, cx + 3 * u, my - 2.1 * u, 2.2 * u, 2.2 * u, .55 * u, m[1] ? BLEU : '#C6CBD5');
        var mlw = T(x, m[0], cx + 6.8 * u, my - .2 * u, 2.15 * u, m[1] ? 700 : 500, m[1] ? BLEU : '#3D4250');
        /* pastille : au moins 1,2 u après la fin du mot (mesuré), sans dépasser la colonne */
        if (m[2]){ var pr = 1.45 * u, pcx = Math.max(cx + 6.8 * u + mlw + 1.2 * u + pr, cx + SB - 1.6 * u - pr); rond(x, pcx, my - .95 * u, pr, '#25D366'); T(x, m[2], pcx, my - .25 * u, 1.75 * u, 700, '#fff', { a: 'center' }); } });
      var mx = cx + SB + 3 * u, mw = cw - SB - 6 * u - (o.retrait || 0) * u;
      T(x, 'Pipeline', mx, cy + 7.4 * u, 4.2 * u, 800, NOIR, { f: TITRE, esp: -.06 * u });
      T(x, '7 clients en cours', mx + 20 * u, cy + 7.2 * u, 2 * u, 500, '#8A8F9C');
      var bw = 15 * u; bloc(x, mx + mw - bw, cy + 3.2 * u, bw, 5 * u, 2.5 * u, BLEU); T(x, '+ Nouveau', mx + mw - bw / 2, cy + 6.4 * u, 2.1 * u, 700, '#fff', { a: 'center' });
      var cols = [
        { n: 'Nouveau', c: '#8A8F9C', k: [['Garage Nova', 'Via WhatsApp', 'GN', '#F3772C', 1], ['Studio K', 'Appel à prévoir', 'SK', '#1FA855'], ['Fleur et Sens', 'Via le site', 'FS', '#E1306C']] },
        { n: 'Devis', c: BLEU, k: [['Café Mira', 'Devis vu hier', 'CM', '#2F6B4F'], ['Cabinet Arène', 'Relance demain', 'CA', '#0E7490', 1]] },
        { n: 'Signé', c: '#1FA855', k: [['Plomberie Roy', 'Chantier lundi', 'PR', BLEU], ['Atelier Brun', 'Facture envoyée', 'AB', '#B45309']] } ];
      var gap = 1.8 * u, colw = (mw - 2 * gap) / 3, ty = cy + 12 * u, hc = 13.2 * u;
      cols.forEach(function(col, ci){ var kx = mx + ci * (colw + gap);
        bloc(x, kx, ty, colw, ch - (ty - cy) + 4 * u, 1.4 * u, '#F3F4F7');
        rond(x, kx + 2.4 * u, ty + 3.3 * u, .8 * u, col.c); T(x, col.n, kx + 4.2 * u, ty + 4 * u, 2.1 * u, 700, NOIR, { max: colw - 9 * u });
        T(x, String(col.k.length), kx + colw - 2 * u, ty + 4 * u, 2 * u, 600, '#8A8F9C', { a: 'right' });
        col.k.forEach(function(k, j){ var ky = ty + 6.4 * u + j * (hc + 1.3 * u), kx2 = kx + 1.2 * u, kw = colw - 2.4 * u;
          var drag = o.glisse && ci === 0 && j === 0;
          x.save();
          if (drag){ x.translate(kx2 + kw / 2 + 3 * u, ky + hc / 2 - 1 * u); x.rotate(.045); x.translate(-(kx2 + kw / 2), -(ky + hc / 2)); ombre(x, 'rgba(6,10,40,.28)', 3 * u, 1.2 * u); }
          bloc(x, kx2, ky, kw, hc, 1 * u, '#FFFFFF'); x.shadowColor = 'transparent';
          cadreTrait(x, kx2, ky, kw, hc, 1 * u, drag ? BLEU : '#E3E6EC', drag ? .3 * u : .12 * u);
          T(x, k[0], kx2 + 1.8 * u, ky + 4 * u, 2.25 * u, 700, NOIR, { max: kw - 3.6 * u });
          T(x, k[1], kx2 + 1.8 * u, ky + 7.3 * u, 1.8 * u, 500, '#6B7080');
          avatar(x, kx2 + 3.2 * u, ky + hc - 3 * u, 1.6 * u, k[3], k[2]);
          if (k[4]) image(x, L.wa, kx2 + kw - 4.4 * u, ky + hc - 4.6 * u, 2.8 * u);
          x.restore(); }); });
    }); }


  /* les clients fictifs (un métier différent par écran ; Clairvue reste le client de Vizor) */
  var POKEA = { id: 'pokea.lyon', ini: 'P', c: '#C2410C', crea: creaBowl, cta: 'Commander', likes: '642 J’aime', leg: ' Le nouveau bowl est arrivé.', com: 'Voir les 38 commentaires' };
  var MIRA = { id: 'cafe.mira', ini: 'M', c: '#2F6B4F', crea: creaCafe, cta: 'Réserver', likes: '418 J’aime', leg: ' Brunch tous les samedis.', com: 'Voir les 24 commentaires' };
  var CHEVEUX = [['#6A4530', '#3B2416', '#1E120A'], ['#C0602F', '#8E3B1B', '#4E1C0A'], ['#E8CA98', '#C49A5E', '#7E5C30'], ['#4A4542', '#1E1B1A', '#000000']];
  var BOIS = [['#D8AD7E', '#B8865A', '#6B4022'], ['#8F5E40', '#6B4029', '#2E180B'], ['#EAD5B0', '#CDB088', '#8E6A3A'], ['#C68F5E', '#9C6B40', '#4E2E14']];
  var SITE_LOU = { onglet: 'Atelier Lou · Coiffeur à Lyon', url: 'atelierlou.fr', ini: 'L', fav: '#9A3B2E', marque: 'Atelier Lou', mc: '#9A3B2E', nav: ['Prestations', 'L’équipe', 'Le salon', 'Contact'], cta: 'Prendre RDV',
    sur: 'COIFFEUR · LYON 2E', l1: 'Ta coupe,', l2: 'sans attendre.', d1: 'Coupe, couleur et balayage,', d2: 'réserve ton créneau en ligne.', b1: 'Prendre rendez-vous', b2: 'Nos prestations', hero: heroCoiffeur,
    vign: ['Coupe', 'Couleur', 'Balayage', 'Soin'], mat: CHEVEUX, mode: 'cheveux' };
  var SITE_ROUX = { onglet: 'Roux Menuiserie · Villeurbanne', url: 'roux-menuiserie.fr', ini: 'R', fav: '#7A4B2A', marque: 'Roux Menuiserie', mc: '#5A3418', nav: ['Cuisines', 'Dressings', 'Escaliers', 'Réalisations'], cta: 'Demander un devis',
    sur: 'MENUISIER · VILLEURBANNE', l1: 'Du bois massif,', l2: 'fait sur mesure.', d1: 'Cuisines, dressings et escaliers,', d2: 'fabriqués dans notre atelier.', b1: 'Demander un devis', b2: 'Nos réalisations', hero: heroBois,
    note: ['4,9', '(58 avis)'] };
  var G_LOU = { q: 'coiffeur lyon 2', nom: 'Atelier Lou', url: 'https://atelierlou.fr', ini: 'L', c: '#9A3B2E', titre: 'Atelier Lou – Coiffeur à Lyon 2e', note: '4,8', avis: '(164 avis) · Coiffeur',
    d1: 'Coupe, couleur et balayage. Prends rendez-vous', d2: 'en ligne en deux clics, rue Mercière.' };
  var G_MILA = { q: 'esthéticienne lyon 6', nom: 'Institut Mila', url: 'https://institutmila.fr', ini: 'M', c: '#B5676B', titre: 'Institut Mila – Esthéticienne à Lyon 6e', note: '4,9', avis: '(97 avis) · Institut de beauté',
    d1: 'Soins du visage, épilation et massages. Prends', d2: 'rendez-vous en ligne, ouvert le samedi.' };

  /* 02 — post Instagram sponsorisé (unités = largeur du post) */
  function igPost(x, X, Y, w, h, o){
    o = o || {}; var m = o.m || POKEA, u = w / 100, hh = 15 * u, foot = 45 * u, ih = Math.min(o.ih || w * 1.05, h - hh - foot);
    x.save(); if (o.ombre !== false){ ombre(x, 'rgba(6,10,40,.34)', 6 * u, 2 * u); } bloc(x, X, Y, w, h, o.r != null ? o.r : 2.4 * u, '#FFFFFF'); x.restore();
    x.save(); rr(x, X, Y, w, h, o.r != null ? o.r : 2.4 * u); x.clip();
    var g = x.createLinearGradient(X + 3 * u, Y + 12 * u, X + 13 * u, Y + 2 * u); g.addColorStop(0, '#FFD776'); g.addColorStop(.45, '#F3772C'); g.addColorStop(.75, '#E1306C'); g.addColorStop(1, '#C13584');
    x.fillStyle = g; x.beginPath(); x.arc(X + 8 * u, Y + 7.5 * u, 5.2 * u, 0, PI2); x.fill(); rond(x, X + 8 * u, Y + 7.5 * u, 4.5 * u, '#fff'); avatar(x, X + 8 * u, Y + 7.5 * u, 3.9 * u, m.c, m.ini);
    T(x, m.id, X + 16 * u, Y + 6.8 * u, 4.2 * u, 700, NOIR);
    T(x, 'Sponsorisé', X + 16 * u, Y + 11.6 * u, 3.5 * u, 400, '#5B6170');
    points3(x, X + w - 6 * u, Y + 7.5 * u, 4 * u, NOIR);
    m.crea(x, X, Y + hh, w, ih);
    var fy = Y + hh + ih;
    x.fillStyle = '#26221E'; x.fillRect(X, fy, w, 10.5 * u);
    T(x, m.cta, X + 4.5 * u, fy + 6.8 * u, 4 * u, 600, '#fff'); chevron(x, X + w - 6 * u, fy + 5.25 * u, 3.6 * u, '#fff', .55 * u);
    var iy = fy + 18 * u, ep = .62 * u;
    coeur(x, X + 7 * u, iy, 6.4 * u, '#FF3040', true); bulleIc(x, X + 17.5 * u, iy, 6 * u, NOIR, ep); envoiIc(x, X + 28 * u, iy, 6 * u, NOIR, ep); signetIc(x, X + w - 7 * u, iy, 6 * u, NOIR, ep);
    T(x, m.likes, X + 4.5 * u, fy + 30 * u, 3.9 * u, 700, NOIR);
    var nl = T(x, m.id, X + 4.5 * u, fy + 37 * u, 3.8 * u, 700, NOIR);
    T(x, m.leg, X + 4.5 * u + nl, fy + 37 * u, 3.8 * u, 400, NOIR);
    T(x, m.com, X + 4.5 * u, fy + 42.6 * u, 3.6 * u, 400, '#8A8F9C');
    x.restore(); }

  /* interrupteur façon Meta */
  function bascule(x, X, Y, u, on){ bloc(x, X, Y, 5.2 * u, 2.8 * u, 1.4 * u, on ? '#1877F2' : '#C9CDD4'); rond(x, X + (on ? 3.8 : 1.4) * u, Y + 1.4 * u, 1.1 * u, '#fff'); }
  function enteteMeta(x, cx, cy, cw, u, L, decal, compte){
    x.fillStyle = '#fff'; x.fillRect(cx, cy, cw, 8 * u); ligne(x, cx, cy + 8 * u, cx + cw, cy + 8 * u, '#E3E6EC', .15 * u);
    var lw = image(x, L.meta, cx + decal, cy + 2.3 * u, 3.6 * u);
    T(x, 'Gestionnaire de publicités', cx + decal + 1.5 * u + lw, cy + 5.2 * u, 2.4 * u, 700, NOIR);
    if (compte){ var cw2 = largeur(x, compte, 1.9 * u, 600) + 7 * u; cadreTrait(x, cx + cw - 3 * u - cw2, cy + 1.8 * u, cw2, 4.4 * u, 1 * u, '#DADDE3', .15 * u);
      avatar(x, cx + cw - 3 * u - cw2 + 2.4 * u, cy + 4 * u, 1.3 * u, '#7B3FD3', 'B'); T(x, compte, cx + cw - 3 * u - cw2 + 4.6 * u, cy + 4.7 * u, 1.9 * u, 600, '#1C2B33'); } }

  /* 02 bis — Gestionnaire de publicités Meta : la liste des campagnes (version 1) */
  function adsBureau(x, X, Y, w, h, L){
    fenetre(x, X, Y, w, h, { url: 'adsmanager.facebook.com' }, function(cx, cy, cw, ch, u){
      x.fillStyle = '#F5F6F8'; x.fillRect(cx, cy, cw, ch);
      enteteMeta(x, cx, cy, cw, u, L, 24 * u);
      var tx = cx + 24 * u, tw = cw - 27 * u, sc = tx + tw * .56;
      bloc(x, tx, cy + 11 * u, tw, ch, 1.2 * u, '#fff'); cadreTrait(x, tx, cy + 11 * u, tw, ch, 1.2 * u, '#E3E6EC', .15 * u);
      T(x, 'CAMPAGNE', tx + 2.5 * u, cy + 16 * u, 1.6 * u, 700, '#8A8F9C', { esp: .12 * u }); T(x, 'DIFFUSION', sc, cy + 16 * u, 1.6 * u, 700, '#8A8F9C', { esp: .12 * u });
      var rows = [['Le nouveau bowl', 'Instagram · Lyon 5 km', 1], ['Menu du midi', 'Facebook + Instagram', 1], ['Livraison le soir', 'Instagram', 1], ['Brunch du dimanche', 'Facebook', 1], ['Avis clients', 'Facebook + Instagram', 0]];
      rows.forEach(function(r, k){ var ry = cy + 19 * u + k * 9.5 * u;
        ligne(x, tx, ry, tx + tw, ry, '#EEF0F3', .15 * u);
        bascule(x, tx + 2.5 * u, ry + 2.6 * u, u, r[2]);
        T(x, r[0], tx + 10 * u, ry + 4.4 * u, 2.2 * u, 700, '#1C2B33'); T(x, r[1], tx + 10 * u, ry + 7.4 * u, 1.75 * u, 500, '#6B7080');
        rond(x, sc + .8 * u, ry + 3.7 * u, .8 * u, r[2] ? '#31A24C' : '#A0A6B0'); T(x, r[2] ? 'Active' : 'En pause', sc + 2.6 * u, ry + 4.4 * u, 2.1 * u, 600, '#1C2B33'); });
      /* contacts reçus sur 7 jours (chiffres modestes) */
      var gy = cy + 19 * u + rows.length * 9.5 * u; ligne(x, tx, gy, tx + tw, gy, '#EEF0F3', .15 * u);
      T(x, 'Contacts reçus', tx + 2.5 * u, gy + 5.6 * u, 2.2 * u, 700, '#1C2B33'); T(x, '7 derniers jours', tx + 2.5 * u, gy + 8.6 * u, 1.75 * u, 500, '#6B7080');
      T(x, '41', sc, gy + 7.4 * u, 4.4 * u, 700, '#1C2B33');
      var bv = [4, 7, 5, 6, 8, 5, 6], bx0 = tx + 2.5 * u, bw = (tw - 5 * u) / 7, by0 = gy + 26 * u;
      bv.forEach(function(v, k){ var bh = v * 1.6 * u; bloc(x, bx0 + k * bw + bw * .2, by0 - bh, bw * .6, bh, .5 * u, k === 6 ? '#1877F2' : '#BFD6FB');
        T(x, ['L', 'M', 'M', 'J', 'V', 'S', 'D'][k], bx0 + k * bw + bw / 2, by0 + 2.6 * u, 1.6 * u, 600, '#8A8F9C', { a: 'center' }); });
    }); }

  /* 02 ter — Gestionnaire de publicités Meta : les statistiques d'une campagne (version 2) */
  function statsAds(x, X, Y, w, h, L){
    fenetre(x, X, Y, w, h, { url: 'adsmanager.facebook.com' }, function(cx, cy, cw, ch, u){
      x.fillStyle = '#F5F6F8'; x.fillRect(cx, cy, cw, ch);
      enteteMeta(x, cx, cy, cw, u, L, 3 * u, 'Boulangerie Léa');
      var mx = cx + 3 * u, mw = cw - 6 * u;
      bascule(x, mx, cy + 11.4 * u, u, true);
      T(x, 'Brioches du dimanche', mx + 7 * u, cy + 13.6 * u, 2.8 * u, 700, '#1C2B33', { f: TITRE });
      T(x, 'Facebook + Instagram · Villeurbanne 10 km', mx + 7 * u, cy + 16.8 * u, 1.75 * u, 500, '#6B7080');
      var pw = largeur(x, '7 derniers jours', 1.8 * u, 600) + 6 * u; bloc(x, mx + mw - pw, cy + 11 * u, pw, 4.4 * u, 1 * u, '#fff'); cadreTrait(x, mx + mw - pw, cy + 11 * u, pw, 4.4 * u, 1 * u, '#DADDE3', .15 * u);
      T(x, '7 derniers jours', mx + mw - pw + 2 * u, cy + 13.9 * u, 1.8 * u, 600, '#1C2B33'); chevron(x, mx + mw - 2 * u, cy + 13.2 * u, 1.4 * u, '#6B7080', .22 * u);
      var kp = [['Personnes touchées', '12 480'], ['Clics sur le lien', '836'], ['Contacts reçus', '47', 1]], kw = (mw - 3 * u) / 3;
      kp.forEach(function(k, j){ var kx = mx + j * (kw + 1.5 * u), ky = cy + 20 * u; bloc(x, kx, ky, kw, 10.5 * u, 1.2 * u, '#fff'); cadreTrait(x, kx, ky, kw, 10.5 * u, 1.2 * u, k[2] ? '#1877F2' : '#E3E6EC', k[2] ? .3 * u : .15 * u);
        T(x, k[0], kx + 2 * u, ky + 3.8 * u, 1.75 * u, 500, '#6B7080'); T(x, k[1], kx + 2 * u, ky + 8.6 * u, 3.6 * u, 700, '#1C2B33'); });
      var gx = mx, gy = cy + 32.5 * u, gw = mw, gh = 21 * u; bloc(x, gx, gy, gw, gh, 1.2 * u, '#fff'); cadreTrait(x, gx, gy, gw, gh, 1.2 * u, '#E3E6EC', .15 * u);
      T(x, 'Contacts reçus par jour', gx + 2 * u, gy + 3.8 * u, 1.9 * u, 700, '#1C2B33');
      var px0 = gx + 6 * u, px1 = gx + gw - 3 * u, py0 = gy + gh - 4.2 * u, py1 = gy + 6.4 * u, vals = [4, 6, 5, 8, 7, 9, 8], vmax = 10;
      [0, 5, 10].forEach(function(t){ var yy = py0 - (py0 - py1) * t / vmax; ligne(x, px0, yy, px1, yy, '#EEF0F3', .12 * u); T(x, String(t), px0 - 1.4 * u, yy + .6 * u, 1.4 * u, 500, '#8A8F9C', { a: 'right' }); });
      var pts = vals.map(function(v, k){ return [px0 + k * (px1 - px0) / 6, py0 - (py0 - py1) * v / vmax]; });
      x.beginPath(); x.moveTo(pts[0][0], py0); pts.forEach(function(p){ x.lineTo(p[0], p[1]); }); x.lineTo(pts[6][0], py0); x.closePath(); x.fillStyle = 'rgba(24,119,242,.12)'; x.fill();
      x.strokeStyle = '#1877F2'; x.lineWidth = .45 * u; x.lineJoin = 'round'; x.beginPath(); pts.forEach(function(p, k){ if (k) x.lineTo(p[0], p[1]); else x.moveTo(p[0], p[1]); }); x.stroke();
      pts.forEach(function(p, k){ rond(x, p[0], p[1], .75 * u, '#fff'); x.strokeStyle = '#1877F2'; x.lineWidth = .3 * u; x.beginPath(); x.arc(p[0], p[1], .75 * u, 0, PI2); x.stroke();
        T(x, ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][k], p[0], py0 + 2.6 * u, 1.4 * u, 500, '#8A8F9C', { a: 'center' }); });
    }); }

  /* 01 bis — fiche client + conversation WhatsApp dans le CRM (version 2) */
  function ficheClient(x, X, Y, w, h, L){
    fenetre(x, X, Y, w, h, { url: 'crm.ton-entreprise.fr/clients' }, function(cx, cy, cw, ch, u){
      var lw = 40 * u; x.fillStyle = '#FFFFFF'; x.fillRect(cx, cy, lw, ch); ligne(x, cx + lw, cy, cx + lw, cy + ch, '#E6E8EE', .15 * u);
      var bw2 = T(x, 'Clients', cx + 3.5 * u, cy + 5 * u, 1.75 * u, 500, '#8A8F9C'); chevron(x, cx + 5 * u + bw2, cy + 4.4 * u, 1.2 * u, '#B0B5C0', .2 * u); T(x, 'Fleur et Sens', cx + 6.6 * u + bw2, cy + 5 * u, 1.75 * u, 600, '#3D4250');
      avatar(x, cx + 7.5 * u, cy + 13 * u, 4 * u, '#E1306C', 'FS');
      T(x, 'Fleur et Sens', cx + 13.6 * u, cy + 12.6 * u, 3 * u, 800, NOIR, { f: TITRE, esp: -.05 * u }); T(x, 'Fleuriste · Lyon 7e', cx + 13.6 * u, cy + 16 * u, 1.85 * u, 500, '#6B7080');
      [['CONTACT', 'Inès Morel'], ['DEMANDE', 'Mariage · 14 juin'], ['DEVIS', 'n°118 · mis à jour']].forEach(function(f, k){ var fy = cy + 22.5 * u + k * 7 * u;
        ligne(x, cx + 3.5 * u, fy - 2.6 * u, cx + lw - 3.5 * u, fy - 2.6 * u, '#EEF0F3', .12 * u);
        T(x, f[0], cx + 3.5 * u, fy, 1.35 * u, 700, '#9AA0AC', { esp: .15 * u }); T(x, f[1], cx + 3.5 * u, fy + 3 * u, 2.05 * u, 600, NOIR); });
      var ey = cy + 43.5 * u; ligne(x, cx + 3.5 * u, ey - 2.6 * u, cx + lw - 3.5 * u, ey - 2.6 * u, '#EEF0F3', .12 * u);
      T(x, 'ÉTAPE', cx + 3.5 * u, ey, 1.35 * u, 700, '#9AA0AC', { esp: .15 * u }); T(x, 'Devis envoyé', cx + lw - 3.5 * u, ey, 1.6 * u, 700, BLEU, { a: 'right' });
      var sw2 = (lw - 7 * u - 1.8 * u) / 4; for (var k = 0; k < 4; k++) bloc(x, cx + 3.5 * u + k * (sw2 + .6 * u), ey + 2 * u, sw2, 1 * u, .5 * u, k < 2 ? BLEU : '#E3E6EC');
      /* la conversation WhatsApp */
      var wx = cx + lw, ww = cw - lw;
      x.fillStyle = '#EFE7DD'; x.fillRect(wx, cy, ww, ch);
      x.save(); x.globalAlpha = .05; for (var q = 0; q < 50; q++){ rond(x, wx + ((q * 73) % 100) / 100 * ww, cy + 8 * u + ((q * 37) % 100) / 100 * (ch - 8 * u), .5 * u, '#6B5B45'); } x.restore();
      x.fillStyle = '#F0F2F5'; x.fillRect(wx, cy, ww, 7.4 * u); ligne(x, wx, cy + 7.4 * u, wx + ww, cy + 7.4 * u, '#E1E3E6', .12 * u);
      avatar(x, wx + 4.2 * u, cy + 3.7 * u, 2.3 * u, '#5B6B7F', 'IM'); T(x, 'Inès Morel', wx + 8 * u, cy + 3.4 * u, 2 * u, 700, '#111B21'); T(x, 'en ligne', wx + 8 * u, cy + 5.9 * u, 1.55 * u, 400, '#667781');
      image(x, L.wa, wx + ww - 6 * u, cy + 1.9 * u, 3.6 * u);
      var y = cy + 11 * u;
      function bulle(t, sortant, heure){ var maxW = ww * .74, L2 = coupe(x, t, maxW - 4 * u, 1.85 * u, 400), bw = Math.max(L2.largeur + 4 * u + (sortant ? 6.5 : 5) * u * (L2.length === 1 ? 1 : 0), 14 * u), bh = L2.length * 2.6 * u + (L2.length === 1 ? 2.6 : 4.4) * u;
        var bx = sortant ? wx + ww - 2.5 * u - bw : wx + 2.5 * u;
        x.save(); ombre(x, 'rgba(0,0,0,.10)', .4 * u, .15 * u); bloc(x, bx, y, bw, bh, 1.1 * u, sortant ? '#D9FDD3' : '#FFFFFF'); x.restore();
        L2.forEach(function(l, k){ T(x, l, bx + 2 * u, y + 3 * u + k * 2.6 * u, 1.85 * u, 400, '#111B21'); });
        T(x, heure, bx + bw - (sortant ? 4 : 1.4) * u, y + bh - 1 * u, 1.3 * u, 400, '#667781', { a: 'right' });
        if (sortant){ coche(x, bx + bw - 2.6 * u, y + bh - 1.5 * u, 1.3 * u, '#53BDEB', .22 * u); coche(x, bx + bw - 2 * u, y + bh - 1.5 * u, 1.3 * u, '#53BDEB', .22 * u); }
        y += bh + 1.4 * u; }
      bulle('Bonjour ! On peut ajouter 10 boutonnières pour le mariage ?', false, '09:12');
      bulle('Bien sûr, je mets le devis à jour tout de suite.', true, '09:14');
      /* le devis envoyé dans la conversation */
      var dw = ww * .6, dx = wx + ww - 2.5 * u - dw; x.save(); ombre(x, 'rgba(0,0,0,.10)', .4 * u, .15 * u); bloc(x, dx, y, dw, 8.4 * u, 1.1 * u, '#D9FDD3'); x.restore();
      bloc(x, dx + 1 * u, y + 1 * u, dw - 2 * u, 6.4 * u, .8 * u, 'rgba(255,255,255,.7)'); bloc(x, dx + 2 * u, y + 2 * u, 3.4 * u, 4.4 * u, .5 * u, '#E5483B'); T(x, 'PDF', dx + 3.7 * u, y + 4.8 * u, 1.1 * u, 800, '#fff', { a: 'center' });
      T(x, 'Devis n°118.pdf', dx + 6.6 * u, y + 3.9 * u, 1.85 * u, 600, '#111B21'); T(x, '1 page · 84 ko', dx + 6.6 * u, y + 6.3 * u, 1.45 * u, 400, '#667781');
      y += 8.4 * u + 1.4 * u;
      bulle('Merci, c’est parfait.', false, '09:20');
    }); }

  /* 03 — un site vitrine dans Chrome (s = le client) */
  function siteBureau(x, X, Y, w, h, s, o){
    o = o || {};
    fenetre(x, X, Y, w, h, { chrome: { onglet: s.onglet, url: s.url, fav: s.fav, ini: s.ini } }, function(px, py, pw, ph, u){
      T(x, s.marque, px + 5 * u, py + 5.6 * u, 3.2 * u, 800, s.mc, { f: TITRE, esp: -.05 * u });
      var bw = largeur(x, s.cta, 1.85 * u, 600) + 5 * u;
      var mq = largeur(x, s.marque, 3.2 * u, 800, TITRE, -.05 * u), nx = px + pw - 9 * u - bw;
      for (var k = s.nav.length - 1; k >= 0; k--){ var nw = largeur(x, s.nav[k], 1.85 * u, 500); if (nx - nw < px + 5 * u + mq + 4 * u) break; nx -= nw; T(x, s.nav[k], nx, py + 5.3 * u, 1.85 * u, 500, '#3D4250'); nx -= 3.4 * u; }
      bloc(x, px + pw - 5 * u - bw, py + 2.2 * u, bw, 4.6 * u, 2.3 * u, NOIR); T(x, s.cta, px + pw - 5 * u - bw / 2, py + 5.1 * u, 1.85 * u, 600, '#fff', { a: 'center' });
      ligne(x, px, py + 9 * u, px + pw, py + 9 * u, '#EFEFEF', .12 * u);
      T(x, s.sur, px + 5 * u, py + 15.5 * u, 1.6 * u, 700, s.mc, { esp: .25 * u });
      T(x, s.l1, px + 5 * u, py + 22.5 * u, 5.4 * u, 800, NOIR, { f: TITRE, esp: -.15 * u });
      T(x, s.l2, px + 5 * u, py + 28.5 * u, 5.4 * u, 800, NOIR, { f: TITRE, esp: -.15 * u });
      T(x, s.d1, px + 5 * u, py + 33.5 * u, 1.9 * u, 400, '#5B6170');
      T(x, s.d2, px + 5 * u, py + 36.3 * u, 1.9 * u, 400, '#5B6170');
      var b1 = largeur(x, s.b1, 1.85 * u, 600) + 5 * u, b2 = largeur(x, s.b2, 1.85 * u, 600) + 5 * u;
      bloc(x, px + 5 * u, py + 39.5 * u, b1, 5 * u, 2.5 * u, s.mc); T(x, s.b1, px + 5 * u + b1 / 2, py + 42.7 * u, 1.85 * u, 600, '#fff', { a: 'center' });
      cadreTrait(x, px + 6.5 * u + b1, py + 39.5 * u, b2, 5 * u, 2.5 * u, '#C9CDD4', .15 * u); T(x, s.b2, px + 6.5 * u + b1 + b2 / 2, py + 42.7 * u, 1.85 * u, 600, NOIR, { a: 'center' });
      var ix = px + 50 * u, iw = pw - 55 * u, iy = py + 12 * u, ih = 34 * u;
      x.save(); rr(x, ix, iy, iw, ih, 1.4 * u); x.clip(); s.hero(x, ix, iy, iw, ih); x.restore();
      if (s.note){ var t0 = largeur(x, s.note[0], 2.1 * u, 700), aw2 = largeur(x, s.note[1], 1.75 * u, 500), nw = t0 + aw2 + 17 * u; bloc(x, ix + 2 * u, iy + ih - 7.4 * u, nw, 5.4 * u, 1.2 * u, '#fff');
        T(x, s.note[0], ix + 3.6 * u, iy + ih - 3.9 * u, 2.1 * u, 700, NOIR); for (var e = 0; e < 5; e++) etoile(x, ix + 5.4 * u + t0 + e * 2.3 * u, iy + ih - 4.7 * u, 1 * u, '#FBBC04');
        T(x, s.note[1], ix + 17.4 * u + t0, iy + ih - 3.9 * u, 1.75 * u, 500, '#5B6170'); }
      if (s.vign && !o.court) s.vign.forEach(function(n, k){ var tw = (pw - 10 * u - 3 * 2 * u) / 4, tx = px + 5 * u + k * (tw + 2 * u), ty = py + 50 * u, m = s.mat[k];
        x.save(); rr(x, tx, ty, tw, 15 * u, 1.2 * u); x.clip(); matiere(x, tx, ty, tw, 15 * u, m[0], m[1], m[2], s.mode, 3 + k * 5); x.restore();
        T(x, n, tx, ty + 18.6 * u, 1.9 * u, 600, NOIR); });
    }); }

  /* 03 bis — le résultat Google (g = le client) */
  function googleCarte(x, X, Y, w, L, g, o){
    o = o || {}; var u = w / 100, h = 53 * u;
    x.save(); ombre(x, o.ombre || 'rgba(6,10,40,.34)', 6 * u, 2 * u); bloc(x, X, Y, w, h, 2.4 * u, '#fff'); x.restore();
    image(x, L.google, X + 4 * u, Y + 4.4 * u, 5.4 * u);
    bloc(x, X + 13 * u, Y + 3 * u, w - 17 * u, 8.2 * u, 4.1 * u, '#fff'); cadreTrait(x, X + 13 * u, Y + 3 * u, w - 17 * u, 8.2 * u, 4.1 * u, '#DFE1E5', .25 * u);
    T(x, g.q, X + 17 * u, Y + 8.3 * u, 3.2 * u, 400, '#202124'); loupe(x, X + w - 8.6 * u, Y + 7.1 * u, 3.6 * u, '#4285F4', .5 * u);
    ['Tous', 'Maps', 'Images', 'Actualités'].forEach(function(t, k){ var tx = X + 13 * u + k * 12 * u; T(x, t, tx, Y + 16.6 * u, 2.5 * u, k ? 400 : 600, k ? '#5F6368' : '#1A73E8'); if (!k) bloc(x, tx, Y + 18.2 * u, 5.4 * u, .5 * u, .25 * u, '#1A73E8'); });
    ligne(x, X, Y + 18.7 * u, X + w, Y + 18.7 * u, '#EBEBEB', .15 * u);
    rond(x, X + 6.6 * u, Y + 25.4 * u, 2.6 * u, '#F1F3F4'); avatar(x, X + 6.6 * u, Y + 25.4 * u, 2 * u, g.c, g.ini);
    T(x, g.nom, X + 11 * u, Y + 24.6 * u, 2.7 * u, 500, '#202124'); T(x, g.url, X + 11 * u, Y + 28.3 * u, 2.3 * u, 400, '#4D5156');
    T(x, g.titre, X + 4 * u, Y + 35.6 * u, 4.1 * u, 500, '#1A0DAB');
    var nw = T(x, g.note, X + 4 * u, Y + 40.8 * u, 2.5 * u, 400, '#4D5156'); for (var s = 0; s < 5; s++) etoile(x, X + 5.6 * u + nw + s * 2.7 * u, Y + 40 * u, 1.15 * u, '#FBBC04');
    T(x, g.avis, X + 19.6 * u + nw, Y + 40.8 * u, 2.5 * u, 400, '#4D5156');
    T(x, g.d1, X + 4 * u, Y + 45.4 * u, 2.5 * u, 400, '#4D5156');
    T(x, g.d2, X + 4 * u, Y + 49 * u, 2.5 * u, 400, '#4D5156');
    return h; }

  /* 04 — Vizor sur ordinateur (le vrai client de Vizor : Maison Clairvue, opticien) */
  var DOSSIERS = [['Dupont Claire', 'Harmonie', '245,00 €', 'Payé'], ['Lacroix Paul', 'MGEN', '180,00 €', 'Relancé'], ['Ruiz Inès', 'Malakoff', '312,40 €', 'En attente'],
    ['Petit Marc', 'Swiss Life', '96,00 €', 'Rejeté'], ['Moreau Léa', 'Almerys', '158,90 €', 'Payé'], ['Garnier Hugo', 'Viamedis', '204,50 €', 'En attente']];
  var RAC = [['Dupont Claire', 'Progressifs', '120,00 €', 'Payé'], ['Lacroix Paul', 'Solaires', '85,00 €', 'Rappel envoyé'], ['Ruiz Inès', 'Lentilles', '42,50 €', 'À relancer'], ['Moreau Léa', 'Unifocaux', '64,00 €', 'En 3 fois']];
  var STATUT = { 'Payé': ['#15803D', '#DCFCE7'], 'Relancé': ['#C2410C', '#FFEDD5'], 'En attente': ['#4B5563', '#EEF0F3'], 'Rejeté': ['#B91C1C', '#FEE2E2'],
    'Rappel envoyé': ['#1D4ED8', '#DBEAFE'], 'À relancer': ['#C2410C', '#FFEDD5'], 'En 3 fois': ['#6D28D9', '#EDE9FE'] };
  /* le cadre de Vizor : barre prune à gauche + en-tête ; renvoie la zone principale */
  function vizorCadre(x, cx, cy, cw, ch, u, actif, sur, titre, retrait){
    x.fillStyle = CREME; x.fillRect(cx, cy, cw, ch);
    x.fillStyle = PRUNE; x.fillRect(cx, cy, 24 * u, ch);
    bloc(x, cx + 2.4 * u, cy + 2.6 * u, 4.8 * u, 4.8 * u, 1.1 * u, CLAIRVUE); T(x, 'MC', cx + 4.8 * u, cy + 5.7 * u, 1.7 * u, 700, '#fff', { a: 'center' });
    T(x, 'Maison Clairvue', cx + 8.4 * u, cy + 4.8 * u, 1.95 * u, 700, '#fff', { max: 14.5 * u }); T(x, 'VIZOR', cx + 8.4 * u, cy + 7.2 * u, 1.35 * u, 700, LAVANDE, { esp: .2 * u });
    var gr = x.createLinearGradient(cx + 2.4 * u, 0, cx + 18.6 * u, 0); gr.addColorStop(0, '#5EEAD4'); gr.addColorStop(.5, '#C4B5FD'); gr.addColorStop(1, '#FDBA74'); x.fillStyle = gr; x.fillRect(cx + 2.4 * u, cy + 9.2 * u, 19.2 * u, .3 * u);
    [['Accueil'], ['Suivi mutuelle', '3'], ['Reste à charge', '6'], ['Planning'], ['Fidélité'], ['Statistiques']].forEach(function(m, k){ var my = cy + 14.8 * u + k * 5.3 * u, on = k === actif;
      if (on) bloc(x, cx + 1.3 * u, my - 3.3 * u, 21.4 * u, 4.8 * u, 1 * u, 'rgba(255,255,255,.12)');
      cadreTrait(x, cx + 2.8 * u, my - 2 * u, 2 * u, 2 * u, .5 * u, on ? '#fff' : 'rgba(255,255,255,.55)', .2 * u);
      T(x, m[0], cx + 6.2 * u, my - .3 * u, 1.8 * u, on ? 700 : 500, on ? '#fff' : 'rgba(255,255,255,.78)');
      if (m[1]){ bloc(x, cx + 19.6 * u, my - 2.5 * u, 2.6 * u, 2.6 * u, .7 * u, VIOLET); T(x, m[1], cx + 20.9 * u, my - .55 * u, 1.55 * u, 700, '#fff', { a: 'center' }); } });
    var mx = cx + 27 * u, mw = cw - 30 * u - (retrait || 0) * u;
    T(x, sur, mx, cy + 5 * u, 1.45 * u, 700, '#8A8478', { esp: .2 * u });
    T(x, titre, mx, cy + 10.2 * u, 4 * u, 700, '#1C1424', { f: TITRE, esp: -.08 * u });
    var sw = 26 * u, sx = mx + mw - sw; bloc(x, sx, cy + 4.6 * u, sw, 5.4 * u, 2.7 * u, '#fff'); cadreTrait(x, sx, cy + 4.6 * u, sw, 5.4 * u, 2.7 * u, '#E5E0D8', .15 * u);
    bloc(x, sx + .6 * u, cy + 5.2 * u, 10.6 * u, 4.2 * u, 2.1 * u, PRUNE); T(x, 'Vizor', sx + 5.9 * u, cy + 8 * u, 1.85 * u, 700, '#fff', { a: 'center' }); T(x, 'AudioVizor', sx + 18.6 * u, cy + 8 * u, 1.85 * u, 600, '#6B6475', { a: 'center' });
    return { mx: mx, mw: mw }; }
  /* cases de chiffres : montant en 3,1 u, marge mesurée à droite, surlignage gardé dans la case */
  function casesVizor(x, mx, ty, mw, u, tiles){
    var gap = 1.6 * u, tw = (mw - (tiles.length - 1) * gap) / tiles.length;
    tiles.forEach(function(t, k){ var tx = mx + k * (tw + gap); bloc(x, tx, ty, tw, 11.4 * u, 1.2 * u, '#fff'); cadreTrait(x, tx, ty, tw, 11.4 * u, 1.2 * u, '#ECE7DF', .15 * u);
      if (t[2]) rond(x, tx + 2.4 * u, ty + 3.5 * u, .7 * u, t[2]); T(x, t[0], tx + (t[2] ? 3.8 : 1.8) * u, ty + 4.1 * u, 1.7 * u, 500, '#6B6475');
      var taille = 3.1 * u; while (largeur(x, t[1], taille, 700, TEXTE, -.04 * u) > tw - 3.2 * u - 1.2 * u && taille > 2.6 * u) taille -= .05 * u;
      var vw = largeur(x, t[1], taille, 700, TEXTE, -.04 * u);
      if (t[3]) bloc(x, tx + 1.3 * u, ty + 6.7 * u, Math.min(vw + 1 * u, tw - 2.6 * u), taille * .8, .4 * u, 'rgba(253,186,116,.7)');
      T(x, t[1], tx + 1.8 * u, ty + 9 * u, taille, 700, '#1C1424', { esp: -.04 * u }); }); }

  function vizorBureau(x, X, Y, w, h, o){
    o = o || {};
    fenetre(x, X, Y, w, h, { barre: '#EDE9E3' }, function(cx, cy, cw, ch, u){
      var z = vizorCadre(x, cx, cy, cw, ch, u, 1, 'TIERS PAYANT · NOVEMBRE 2026', 'Suivi mutuelle', o.retrait), mx = z.mx, mw = z.mw;
      bloc(x, mx, cy + 13.2 * u, mw, 5 * u, 1 * u, '#FCE7F3'); cadreTrait(x, mx, cy + 13.2 * u, mw, 5 * u, 1 * u, '#F9C8E0', .15 * u);
      x.fillStyle = '#9D174D'; x.beginPath(); x.moveTo(mx + 2.7 * u, cy + 14.4 * u); x.lineTo(mx + 3.9 * u, cy + 16.8 * u); x.lineTo(mx + 1.5 * u, cy + 16.8 * u); x.closePath(); x.fill();
      var aw = T(x, '2 dossiers rejetés', mx + 4.6 * u, cy + 16.4 * u, 1.9 * u, 700, '#9D174D'); T(x, ' à relancer · 460,09 €', mx + 4.6 * u + aw, cy + 16.4 * u, 1.9 * u, 500, '#9D174D');
      chevron(x, mx + mw - 2.4 * u, cy + 15.7 * u, 1.8 * u, '#9D174D', .25 * u);
      casesVizor(x, mx, cy + 20.4 * u, mw, u, [['Vendu ce mois', '8 139 €', null], ['Déjà réglé', '3 505,28 €', '#34D399'], ['Reste à encaisser', '4 633,72 €', '#FDBA74', 1]]);
      var by = cy + 34 * u; bloc(x, mx, by, mw, ch - (by - cy) + 4 * u, 1.2 * u, '#fff'); cadreTrait(x, mx, by, mw, ch - (by - cy) + 4 * u, 1.2 * u, '#ECE7DF', .15 * u);
      var c1 = mx + 2 * u, c2 = mx + mw * .36, c3 = mx + mw * .72, c4 = mx + mw - 2 * u;
      [['CLIENT', c1], ['ORGANISME', c2], ['MONTANT', c3, 'right']].forEach(function(hd){ T(x, hd[0], hd[1], by + 3.8 * u, 1.4 * u, 700, '#9A93A3', { esp: .15 * u, a: hd[2] }); });
      T(x, 'STATUT', c4, by + 3.8 * u, 1.4 * u, 700, '#9A93A3', { esp: .15 * u, a: 'right' });
      DOSSIERS.forEach(function(d, k){ var ry = by + 5.4 * u + k * 5.5 * u; if (ry + 4 * u > cy + ch) return; ligne(x, mx + 1.5 * u, ry, mx + mw - 1.5 * u, ry, '#F1EEE9', .12 * u);
        T(x, d[0], c1, ry + 3.6 * u, 1.95 * u, 600, '#1C1424'); T(x, d[1], c2, ry + 3.6 * u, 1.95 * u, 500, '#6B6475');
        T(x, d[2], c3, ry + 3.6 * u, 1.95 * u, 700, '#1C1424', { a: 'right' }); var st = STATUT[d[3]]; pastille(x, d[3], c4, ry + 3.35 * u, 1.6 * u, st[0], st[1], true); });
    }); }

  /* 04 bis — Vizor, la vue Reste à charge (version 2) : le tableau s'arrête avant le bas de l'écran */
  function vizorRAC(x, X, Y, w, h){
    fenetre(x, X, Y, w, h, { barre: '#EDE9E3' }, function(cx, cy, cw, ch, u){
      var z = vizorCadre(x, cx, cy, cw, ch, u, 2, 'RESTE À CHARGE · NOVEMBRE 2026', 'Reste à charge'), mx = z.mx, mw = z.mw;
      casesVizor(x, mx, cy + 13.6 * u, mw, u, [['À encaisser', '1 284,50 €', '#FDBA74', 1], ['Réglé ce mois', '2 960,00 €', '#34D399'], ['Rappels envoyés', '9', null]]);
      var by = cy + 27.4 * u, bh = 5.4 * u + RAC.length * 5.5 * u + 1.2 * u; bloc(x, mx, by, mw, bh, 1.2 * u, '#fff'); cadreTrait(x, mx, by, mw, bh, 1.2 * u, '#ECE7DF', .15 * u);
      var c1 = mx + 2 * u, c2 = mx + mw * .36, c3 = mx + mw * .66, c4 = mx + mw - 2 * u;
      [['CLIENT', c1], ['ÉQUIPEMENT', c2], ['RESTE', c3, 'right']].forEach(function(hd){ T(x, hd[0], hd[1], by + 3.8 * u, 1.4 * u, 700, '#9A93A3', { esp: .15 * u, a: hd[2] }); });
      T(x, 'STATUT', c4, by + 3.8 * u, 1.4 * u, 700, '#9A93A3', { esp: .15 * u, a: 'right' });
      RAC.forEach(function(d, k){ var ry = by + 5.4 * u + k * 5.5 * u; ligne(x, mx + 1.5 * u, ry, mx + mw - 1.5 * u, ry, '#F1EEE9', .12 * u);
        T(x, d[0], c1, ry + 3.6 * u, 1.95 * u, 600, '#1C1424'); T(x, d[1], c2, ry + 3.6 * u, 1.95 * u, 500, '#6B6475');
        T(x, d[2], c3, ry + 3.6 * u, 1.95 * u, 700, '#1C1424', { a: 'right' }); var st = STATUT[d[3]]; pastille(x, d[3], c4, ry + 3.35 * u, 1.6 * u, st[0], st[1], true); });
    }); }

  /* ---------- écrans de téléphone (version 3) ---------- */
  /* combiné de téléphone (icône d'appel iOS) */
  var COMBINE = typeof Path2D !== 'undefined' ? new Path2D('M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z') : null;
  function combine(x, cx, cy, s, c, ep){ if (!COMBINE) return; x.save(); x.translate(cx - s / 2, cy - s / 2); x.scale(s / 24, s / 24); x.strokeStyle = c; x.lineWidth = ep * 24 / s; x.lineJoin = 'round'; x.stroke(COMBINE); x.restore(); }
  function waMobile(x, sx, sy, sw, sh, u, L){
    x.fillStyle = '#EFE7DD'; x.fillRect(sx, sy, sw, sh);
    x.save(); x.globalAlpha = .05; for (var k = 0; k < 40; k++){ var a = (k * 73) % 100, b = (k * 37) % 170; rond(x, sx + a * u, sy + 30 * u + b * u, 1.2 * u, '#6B5B45'); } x.restore();
    x.fillStyle = '#F6F5F3'; x.fillRect(sx, sy, sw, 30 * u); ligne(x, sx, sy + 30 * u, sx + sw, sy + 30 * u, 'rgba(0,0,0,.08)', .25 * u);
    chevron(x, sx + 5 * u, sy + 21.5 * u, 5 * u, '#0A84FF', .75 * u, -1);
    avatar(x, sx + 17 * u, sy + 21.5 * u, 5.6 * u, '#5B6B7F', 'JM');
    T(x, 'Julien Martin', sx + 25 * u, sy + 20.4 * u, 4.6 * u, 700, NOIR); T(x, 'en ligne', sx + 25 * u, sy + 25.6 * u, 3.4 * u, 400, '#6B7080');
    x.strokeStyle = '#0A84FF'; x.lineWidth = .65 * u; x.lineJoin = 'round'; rr(x, sx + sw - 23 * u, sy + 18.8 * u, 7 * u, 5.4 * u, 1.2 * u); x.stroke(); x.beginPath(); x.moveTo(sx + sw - 16 * u, sy + 21.5 * u); x.lineTo(sx + sw - 13.2 * u, sy + 19.6 * u); x.lineTo(sx + sw - 13.2 * u, sy + 23.4 * u); x.closePath(); x.stroke();
    combine(x, sx + sw - 6.4 * u, sy + 21.5 * u, 6 * u, '#0A84FF', .62 * u);
    var y = sy + 37 * u; pastilleCentre(x, 'Aujourd’hui', sx + sw / 2, y + 1.5 * u, 3.3 * u, '#5B6170', 'rgba(255,255,255,.92)'); y += 7 * u;
    function bulle(t, sortant, heure, etiquette){ var maxW = sw * .72, L2 = coupe(x, t, maxW - 8 * u, 4.2 * u, 400), bw = Math.max(L2.largeur + 8 * u, 30 * u), bh = L2.length * 5.6 * u + 10 * u;
      var bx = sortant ? sx + sw - 4 * u - bw : sx + 4 * u;
      if (etiquette){ T(x, etiquette, sortant ? bx + bw : bx, y + 2.6 * u, 3 * u, 600, '#0E7A4B', { a: sortant ? 'right' : 'left' }); y += 4.6 * u; }
      x.save(); ombre(x, 'rgba(0,0,0,.12)', .8 * u, .3 * u); bloc(x, bx, y, bw, bh, 2.6 * u, sortant ? '#D9FDD3' : '#FFFFFF'); x.restore();
      L2.forEach(function(l, k){ T(x, l, bx + 4 * u, y + 6.4 * u + k * 5.6 * u, 4.2 * u, 400, '#111B21'); });
      T(x, heure, bx + bw - (sortant ? 8 : 3) * u, y + bh - 2.4 * u, 2.8 * u, 400, '#667781', { a: 'right' });
      if (sortant){ coche(x, bx + bw - 5.4 * u, y + bh - 3.3 * u, 2.6 * u, '#53BDEB', .45 * u); coche(x, bx + bw - 4.2 * u, y + bh - 3.3 * u, 2.6 * u, '#53BDEB', .45 * u); }
      y += bh + 3 * u; }
    bulle('Bonjour M. Martin, votre voiture est prête. Vous passez la récupérer quand ?', true, '17:02', 'Envoyé automatiquement');
    bulle('Super, je passe vers 18h.', false, '17:05');
    bulle('C’est noté pour 18h. À tout à l’heure !', true, '17:05', 'Envoyé automatiquement');
    var cw2 = sw * .82, cx2 = sx + (sw - cw2) / 2; bloc(x, cx2, y, cw2, 13 * u, 2.4 * u, '#FFF6D1');
    coche(x, cx2 + 6 * u, y + 6.5 * u, 4 * u, '#0E7A4B', .7 * u);
    T(x, 'Rendez-vous ajouté', cx2 + 11 * u, y + 5.6 * u, 3.8 * u, 700, '#3B3A30'); T(x, 'Agenda du garage · 18:00', cx2 + 11 * u, y + 10 * u, 3.3 * u, 400, '#5F5C4B');
    image(x, L.wa, cx2 + cw2 - 10 * u, y + 3 * u, 7 * u); }
  function pastilleCentre(x, s, cx, Y, taille, c, fond){ var w = largeur(x, s, taille, 500) + taille * 2.2, h = taille * 2; bloc(x, cx - w / 2, Y - h / 2, w, h, taille * .6, fond); T(x, s, cx, Y + taille * .36, taille, 500, c, { a: 'center' }); }

  function igMobile(x, sx, sy, sw, sh, u, L){
    x.fillStyle = '#fff'; x.fillRect(sx, sy, sw, sh);
    var top = sy + 13 * u; image(x, L.ig, sx + 5 * u, top + 1 * u, 7 * u); T(x, 'Pour toi', sx + 14.5 * u, top + 6.3 * u, 4.6 * u, 700, NOIR);
    coeur(x, sx + sw - 18 * u, top + 4.6 * u, 6.4 * u, NOIR, false, .6 * u); envoiIc(x, sx + sw - 7 * u, top + 4.6 * u, 6 * u, NOIR, .6 * u);
    var g = x.createLinearGradient(0, top + 12 * u, 0, top + 28 * u); g.addColorStop(0, '#C13584'); g.addColorStop(.5, '#F3772C'); g.addColorStop(1, '#FFD776');
    [['ta story', '#E9ECF1', '+'], ['pokea.lyon', '#C2410C', 'P'], ['atelierlou', '#9A3B2E', 'L'], ['lea.boulang', '#7B3FD3', 'BL'], ['studio.k', '#1FA855', 'SK']].forEach(function(s, k){ var cx = sx + 11 * u + k * 19.5 * u, cy = top + 20 * u;
      if (k){ x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 7.6 * u, 0, PI2); x.fill(); rond(x, cx, cy, 6.9 * u, '#fff'); avatar(x, cx, cy, 6.2 * u, s[1], s[2]); }
      else { rond(x, cx, cy, 7 * u, s[1]); T(x, '+', cx, cy + 2.4 * u, 7 * u, 400, '#5B6170', { a: 'center' }); }
      T(x, s[0], cx, cy + 12.2 * u, 2.8 * u, 400, '#262626', { a: 'center', max: 17 * u }); });
    ligne(x, sx, top + 36 * u, sx + sw, top + 36 * u, '#EFEFEF', .2 * u);
    igPost(x, sx, top + 37 * u, sw, sh - (top + 37 * u - sy), { ombre: false, r: 0, ih: sw * .74, m: MIRA }); }

  /* le site de l'institut sur mobile (Safari, barre d'adresse en haut) */
  function siteMobile(x, sx, sy, sw, sh, u){
    x.fillStyle = '#FFFFFF'; x.fillRect(sx, sy, sw, sh);
    var y = sy + 13 * u; x.fillStyle = '#F6F6F7'; x.fillRect(sx, sy, sw, y + 11 * u - sy);
    bloc(x, sx + 5 * u, y + 1 * u, sw - 10 * u, 8.4 * u, 2.6 * u, '#E9E9EC'); var uw = largeur(x, 'institutmila.fr', 3.6 * u, 500);
    cadenas(x, sx + sw / 2 - uw / 2 - 3 * u, y + 5 * u, 2.6 * u, '#3C3C43'); T(x, 'institutmila.fr', sx + sw / 2 + 1 * u, y + 6.4 * u, 3.6 * u, 500, '#1C1C1E', { a: 'center' });
    y += 11 * u; ligne(x, sx, y, sx + sw, y, 'rgba(0,0,0,.08)', .25 * u);
    T(x, 'Institut Mila', sx + 6 * u, y + 9.4 * u, 5 * u, 800, '#7A3E45', { f: TITRE, esp: -.15 * u });
    var bw = largeur(x, 'Prendre RDV', 3.3 * u, 600) + 6 * u, bx = sx + sw - 6 * u - 6 * u - 3 * u - bw;
    bloc(x, bx, y + 3.4 * u, bw, 7.6 * u, 3.8 * u, '#2B1B1E'); T(x, 'Prendre RDV', bx + bw / 2, y + 8.4 * u, 3.3 * u, 600, '#fff', { a: 'center' });
    for (var k = 0; k < 3; k++) ligne(x, sx + sw - 11 * u, y + 5 * u + k * 2.2 * u, sx + sw - 6 * u, y + 5 * u + k * 2.2 * u, '#2B1B1E', .6 * u);
    y += 14 * u;
    heroSoins(x, sx, y, sw, 28 * u); y += 28 * u;
    T(x, 'INSTITUT DE BEAUTÉ · LYON 6E', sx + 6 * u, y + 8 * u, 2.6 * u, 700, '#B5676B', { esp: .35 * u });
    T(x, 'Prends soin de toi,', sx + 6 * u, y + 17 * u, 7 * u, 800, NOIR, { f: TITRE, esp: -.25 * u });
    T(x, 'on s’occupe du reste.', sx + 6 * u, y + 25 * u, 7 * u, 800, NOIR, { f: TITRE, esp: -.25 * u });
    bloc(x, sx + 6 * u, y + 30 * u, sw - 12 * u, 11 * u, 5.5 * u, '#2B1B1E'); T(x, 'Prendre rendez-vous', sx + sw / 2, y + 37.2 * u, 4 * u, 600, '#fff', { a: 'center' });
    y += 50 * u; T(x, 'NOS SOINS', sx + 6 * u, y, 2.6 * u, 700, '#9A8F91', { esp: .35 * u });
    ['Soin du visage', 'Épilation', 'Massage relaxant'].forEach(function(t, k){ var ry = y + 4 * u + k * 11 * u; ligne(x, sx + 6 * u, ry, sx + sw - 6 * u, ry, '#EEE8E8', .25 * u);
      T(x, t, sx + 6 * u, ry + 7 * u, 4 * u, 600, NOIR); chevron(x, sx + sw - 8 * u, ry + 5.6 * u, 3.2 * u, '#9A8F91', .5 * u); }); }

  function vizorMobile(x, sx, sy, sw, sh, u){
    x.fillStyle = CREME; x.fillRect(sx, sy, sw, sh);
    x.fillStyle = PRUNE; x.fillRect(sx, sy, sw, 44 * u);
    T(x, 'MAISON CLAIRVUE · VIZOR', sx + 6 * u, sy + 20 * u, 2.9 * u, 700, LAVANDE, { esp: .3 * u });
    T(x, 'Suivi mutuelle', sx + 6 * u, sy + 28.5 * u, 7 * u, 700, '#fff', { f: TITRE, esp: -.15 * u });
    bloc(x, sx + 6 * u, sy + 32.5 * u, sw - 12 * u, 7.6 * u, 3.8 * u, 'rgba(255,255,255,.12)');
    bloc(x, sx + 6.8 * u, sy + 33.3 * u, (sw - 13.6 * u) / 2, 6 * u, 3 * u, '#fff');
    T(x, 'Vizor', sx + 6.8 * u + (sw - 13.6 * u) / 4, sy + 37.6 * u, 3.6 * u, 700, PRUNE, { a: 'center' }); T(x, 'AudioVizor', sx + sw - 6.8 * u - (sw - 13.6 * u) / 4, sy + 37.6 * u, 3.6 * u, 600, 'rgba(255,255,255,.8)', { a: 'center' });
    var cy = sy + 48 * u; x.save(); ombre(x, 'rgba(42,26,56,.12)', 3 * u, 1 * u); bloc(x, sx + 5 * u, cy, sw - 10 * u, 22 * u, 3 * u, '#fff'); x.restore();
    T(x, 'Reste à encaisser', sx + 10 * u, cy + 7.5 * u, 3.4 * u, 500, '#6B6475');
    var vw = largeur(x, '4 633,72 €', 7 * u, 700, TEXTE, -.1 * u); bloc(x, sx + 9.4 * u, cy + 11.6 * u, vw + 1.2 * u, 5 * u, .8 * u, 'rgba(253,186,116,.75)');
    T(x, '4 633,72 €', sx + 10 * u, cy + 16.5 * u, 7 * u, 700, '#1C1424', { esp: -.1 * u });
    var dx = sx + sw - 18 * u, dy = cy + 11 * u, dr = 6.5 * u; x.lineWidth = 2.4 * u; x.lineCap = 'butt';
    x.strokeStyle = '#FDBA74'; x.beginPath(); x.arc(dx, dy, dr, 0, PI2); x.stroke(); x.strokeStyle = '#34D399'; x.beginPath(); x.arc(dx, dy, dr, -Math.PI / 2, -Math.PI / 2 + PI2 * .43); x.stroke();
    T(x, '43 %', dx, dy + 1.3 * u, 3.4 * u, 700, '#1C1424', { a: 'center' });
    var ly = cy + 27 * u; T(x, 'DOSSIERS EN COURS', sx + 6 * u, ly + 2 * u, 2.8 * u, 700, '#9A93A3', { esp: .3 * u });
    ly += 5 * u; var rh = 13.6 * u; bloc(x, sx + 5 * u, ly, sw - 10 * u, 5 * rh, 3 * u, '#fff');
    DOSSIERS.slice(0, 5).forEach(function(d, k){ var ry = ly + k * rh - .8 * u; if (k) ligne(x, sx + 9 * u, ry, sx + sw - 9 * u, ry, '#F1EEE9', .25 * u);
      T(x, d[0], sx + 9 * u, ry + 6.6 * u, 4 * u, 600, '#1C1424'); T(x, d[1], sx + 9 * u, ry + 11.4 * u, 3.3 * u, 400, '#6B6475');
      T(x, d[2], sx + sw - 9 * u, ry + 6.6 * u, 4 * u, 700, '#1C1424', { a: 'right' }); var st = STATUT[d[3]]; pastille(x, d[3], sx + sw - 9 * u, ry + 11.6 * u, 2.9 * u, st[0], st[1], true); });
    var ty = ly + 5 * rh + 4 * u; x.save(); ombre(x, 'rgba(0,0,0,.25)', 3 * u, 1.2 * u); bloc(x, sx + 5 * u, ty, sw - 10 * u, 15 * u, 3.4 * u, PRUNE); x.restore();
    rond(x, sx + 12.5 * u, ty + 7.5 * u, 3.6 * u, '#34D399'); coche(x, sx + 12.5 * u, ty + 7.5 * u, 3.6 * u, PRUNE, .75 * u);
    T(x, 'Paiement reçu · 245,00 €', sx + 19 * u, ty + 6.4 * u, 3.7 * u, 700, '#fff'); T(x, 'Harmonie Mutuelle · Dupont Claire', sx + 19 * u, ty + 11 * u, 3.1 * u, 400, 'rgba(255,255,255,.7)'); }

  /* ===================================================================
     LES SERVICES
     =================================================================== */
  var S = [
    { n: '01', t1: 'Logiciels', t2: 'sur mesure', sous: 'CRM, applis, portails, IA', logos: ['wa'],
      phrase: 'Ton outil, pensé pour ta façon de bosser.', liste: ['CRM et devis', 'Applis métier', 'Portails clients', 'Messages WhatsApp'] },
    { n: '02', t1: 'Gestion', t2: 'des pubs', sous: 'Facebook et Instagram', logos: ['meta', 'fb', 'ig'],
      phrase: 'Tes pubs tournent, toi tu reçois les contacts.', liste: ['Facebook', 'Instagram', 'Visuels et vidéos', 'Suivi des contacts'] },
    { n: '03', t1: 'Sites internet', t2: 'et SEO', sous: 'Rapides et trouvés sur Google', logos: ['google'],
      phrase: 'Un site rapide, que tes clients trouvent.', liste: ['Site vitrine', 'Prise de rendez-vous', 'Google et IA', 'Hébergement'] },
    { n: '04', t1: 'Vizor et', t2: 'AudioVizor', sous: 'Nos logiciels pour opticiens et audios', logos: [],
      phrase: 'Le tiers payant suivi, sans tableau Excel.', liste: ['Suivi mutuelle', 'Reste à charge', 'Relances auto', 'Opticiens et audios'] }
  ];

  /* le support de carte : ombre + coins arrondis + découpe */
  function support(x, w, h, fond, bord, epBord){
    var m = Math.round(w * .04), X = m, Y = Math.round(m * .75), W = w - 2 * m, H = h - Math.round(m * 1.9), R = Math.round(w * .03);
    x.clearRect(0, 0, w, h);
    x.save(); ombre(x, 'rgba(14,15,19,.24)', m * .7, m * .25); bloc(x, X, Y, W, H, R, fond); x.restore();
    x.save(); rr(x, X, Y, W, H, R); x.clip();
    var e = epBord || 1.5;
    return { X: X, Y: Y, W: W, H: H, R: R, k: W / 1104, fin: function(){ x.restore(); if (bord) cadreTrait(x, X + e / 2, Y + e / 2, W - e, H - e, R, bord, e); } }; }

  /* logos alignés à droite (avec ou sans pastille blanche) */
  function rangLogos(x, s, L, droite, Y, t, pastilleB){
    var cx = droite, pad = pastilleB ? t * .26 : 0, gap = t * .3;
    if (!s.logos.length){ var lw = largeur(x, 'Vizor', t * .74, 800, TITRE), bw = lw + t * .9, bh = t + 2 * pad;
      if (pastilleB){ bloc(x, cx - bw, Y, bw, bh, bh * .24, '#fff'); T(x, 'Vizor', cx - bw / 2, Y + bh * .67, t * .74, 800, PRUNE, { a: 'center', f: TITRE }); }
      else { bloc(x, cx - bw, Y, bw, bh, bh * .24, PRUNE); T(x, 'Vizor', cx - bw / 2, Y + bh * .67, t * .74, 800, '#fff', { a: 'center', f: TITRE }); }
      return cx - bw; }
    for (var k = s.logos.length - 1; k >= 0; k--){ var im = L[s.logos[k]], lw2 = t * ratio(im), bw2 = lw2 + 2 * pad;
      cx -= bw2; if (pastilleB) bloc(x, cx, Y, bw2, t + 2 * pad, (t + 2 * pad) * .24, '#fff'); if (im && im.naturalWidth) x.drawImage(im, cx + pad, Y + pad, lw2, t); cx -= gap; }
    return cx + gap; }
  function iconeLettre(x, l, fond){ return function(X, Y, s){ bloc(x, X, Y, s, s, s * .24, fond); T(x, l, X + s / 2, Y + s * .7, s * .56, 800, '#fff', { a: 'center', f: TITRE }); }; }

  /* ===================================================================
     VERSION 1 — « Affiche » : carte blanche, titre géant noir,
     l'écran du service en grand sur un fond bleu, qui déborde
     =================================================================== */
  function v1(x, w, h, i, L){
    var s = S[i], c = support(x, w, h, '#FFFFFF', 'rgba(14,15,19,.10)'), X = c.X, Y = c.Y, W = c.W, H = c.H, p = 72;
    T(x, s.n, X + p, Y + 118, 46, 800, BLEU, { f: TITRE });
    var gl = rangLogos(x, s, L, X + W - p, Y + 82, 50, false);
    ligne(x, X + p + 82, Y + 104, gl - 30, Y + 104, NOIR, 3);
    T(x, s.t1, X + p - 6, Y + 318, 162, 800, NOIR, { f: TITRE, esp: -6, max: W - 2 * p });
    T(x, s.t2, X + p - 6, Y + 466, 162, 800, NOIR, { f: TITRE, esp: -6, max: W - 2 * p - 120 });
    T(x, s.sous, X + p, Y + 548, 38, 500, GRIS, { max: W - 2 * p - 150 });
    rond(x, X + W - p - 50, Y + 520, 50, NOIR); fleche(x, X + W - p - 50, Y + 520, 44, '#fff', 5);
    var py = Y + 616; x.fillStyle = BLEU; x.fillRect(X, py, W, H);
    if (i === 0) crmBureau(x, X + p, py + 74, W * 1.0, 880, L, { glisse: true, retrait: 6 });
    if (i === 1){ adsBureau(x, X + W * .4, py + 74, W * .74, 1000, L); igPost(x, X + p, py + 110, 560, 940, { ih: 560 * .76, m: POKEA }); }
    if (i === 2){ siteBureau(x, X + p, py + 74, W * 1.0, 880, SITE_LOU); googleCarte(x, X + p + 30, py + 540, 640, L, G_LOU); }
    if (i === 3) vizorBureau(x, X + p, py + 74, W * 1.0, 880, { retrait: 6 });
    c.fin(); }

  /* ===================================================================
     VERSION 2 — « Couleurs pleines » : bleu, noir, blanc ; grand numéro
     entier au-dessus de l'écran ; un écran différent de la V1 ; la
     notification se pose sur le bas vide de l'écran (aucun mot coupé)
     =================================================================== */
  var V2F = ['#0055FF', '#0E0F13', '#FFFFFF', '#0055FF'], V2C = ['#FFFFFF', '#FFFFFF', NOIR, '#FFFFFF'];
  function pivote(x, cx, cy, a, f){ x.save(); x.translate(cx, cy); x.rotate(a); x.translate(-cx, -cy); f(); x.restore(); }
  function v2(x, w, h, i, L){
    var s = S[i], fond = (window.CARTES_FONDS || V2F)[i], enc = (window.CARTES_TEXTES || V2C)[i], blanc = fond === '#FFFFFF';
    var c = support(x, w, h, fond, blanc ? 'rgba(14,15,19,.28)' : null, 3), X = c.X, Y = c.Y, W = c.W, H = c.H, p = 70;
    var pale = enc === '#FFFFFF' ? 'rgba(255,255,255,.2)' : 'rgba(0,85,255,.12)';
    T(x, s.n, X + p - 12, Y + 312, 300, 800, pale, { f: TITRE, esp: -12 });
    rangLogos(x, s, L, X + W - p, Y + p, 56, !blanc);
    var mw = W * .84, mx = X + (W - mw) / 2 + 16, my = Y + 352, mh = 640, ny = Y + 936, ang = -.03;
    var ecran = [ficheClient, statsAds, function(x2, a, b, cw2, ch2){ siteBureau(x2, a, b, cw2, ch2, SITE_ROUX, { court: true }); }, vizorRAC][i];
    pivote(x, mx + mw / 2, my + mh / 2, ang, function(){ ecran(x, mx, my, mw, mh, L); });
    var nt = [
      { icone: iconeImg(x, L.wa), titre: 'Inès · Fleur et Sens', texte: 'C’est validé pour le 14 juin, merci !' },
      { icone: iconeImg(x, L.meta), titre: 'Nouveau contact', texte: 'Sarah M. veut commander 2 brioches pour dimanche.' },
      { icone: iconeLettre(x, 'R', '#5A3418'), titre: 'Nouvelle demande de devis', texte: 'Via ton site : une cuisine sur mesure à Villeurbanne.' },
      { icone: iconeVizor(x), titre: 'Reste à charge réglé', texte: 'Paul Lacroix a réglé ses 85,00 € de solaires.' } ][i];
    notif(x, X + W * .17, ny, W * .72, nt);
    T(x, s.t1, X + p - 4, Y + H - 232, 140, 800, enc, { f: TITRE, esp: -5, max: W - 2 * p });
    T(x, s.t2, X + p - 4, Y + H - 104, 140, 800, enc, { f: TITRE, esp: -5, max: W - 2 * p });
    T(x, s.sous, X + p, Y + H - 44, 34, 500, enc === '#FFFFFF' ? 'rgba(255,255,255,.75)' : GRIS, { max: W - 2 * p });
    c.fin(); }

  /* ===================================================================
     VERSION 3 — « Noir comme la boîte » : noir uni #0E0F13, titre en
     capitales larges, le service sur un vrai téléphone, une phrase simple
     =================================================================== */
  function logoBlanc(x, L, X, Y, hh){
    if (!(L.onlee && L.onlee.naturalWidth)){ T(x, 'onlee', X, Y + hh * .8, hh * .62, 800, '#fff', { f: TITRE }); return; }
    var oc = document.createElement('canvas'); oc.width = L.onlee.naturalWidth; oc.height = L.onlee.naturalHeight; var ox = oc.getContext('2d'); ox.drawImage(L.onlee, 0, 0); ox.globalCompositeOperation = 'source-in'; ox.fillStyle = '#fff'; ox.fillRect(0, 0, oc.width, oc.height);
    x.globalAlpha = .92; x.drawImage(oc, X, Y, hh * oc.width / oc.height, hh); x.globalAlpha = 1; }
  function v3(x, w, h, i, L){
    var s = S[i], c = support(x, w, h, NOIR, 'rgba(255,255,255,.10)'), X = c.X, Y = c.Y, W = c.W, H = c.H, p = 70;
    T(x, s.n, X + p, Y + 112, 40, 800, BLEU, { f: LARGE, large: true });
    rangLogos(x, s, L, X + W - p, Y + 66, 46, true);
    T(x, s.t1.toUpperCase(), X + p - 4, Y + 278, 112, 800, '#FFFFFF', { f: LARGE, large: true, esp: -2, max: W - 2 * p });
    T(x, s.t2.toUpperCase(), X + p - 4, Y + 396, 112, 800, '#FFFFFF', { f: LARGE, large: true, esp: -2, max: W - 2 * p });
    bloc(x, X + p, Y + 440, 64, 8, 4, BLEU);
    T(x, s.sous, X + p + 84, Y + 452, 32, 500, 'rgba(255,255,255,.62)', { max: W - 2 * p - 90 });
    var tw = 590, tx = X + W - tw - 56, ty = Y + 530;
    var ecran = [waMobile, igMobile, siteMobile, vizorMobile][i];
    telephone(x, tx, ty, tw, tw * 2.08, { fond: '#fff', etat: i === 3 ? '#FFFFFF' : NOIR }, function(sx, sy, sw, sh, u){ ecran(x, sx, sy, sw, sh, u, L); });
    if (i === 2) googleCarte(x, tx - 28, Y + H - 334, 600, L, G_MILA, { ombre: 'rgba(0,0,0,.55)' });
    /* à gauche : une phrase au tutoiement, puis ce qui est inclus, en texte simple */
    var lx = X + p, lw = tx - lx - 44, ly = Y + 614;
    var n = para(x, s.phrase, lx, ly, lw, 44, 700, '#FFFFFF', 54, 5, TITRE);
    var yy = ly + (n - 1) * 54 + 66;
    s.liste.forEach(function(t, k){ ligne(x, lx, yy + k * 82, lx + lw, yy + k * 82, 'rgba(255,255,255,.14)', 2); T(x, t, lx, yy + k * 82 + 53, 30, 500, 'rgba(255,255,255,.78)', { max: lw }); });
    var fy = yy + s.liste.length * 82; ligne(x, lx, fy, lx + lw, fy, 'rgba(255,255,255,.14)', 2);
    logoBlanc(x, L, lx, Math.min(fy + 70, Y + H - 170), 84);
    T(x, 'ONLEE.FR', lx, Math.min(fy + 70, Y + H - 170) + 124, 22, 600, 'rgba(255,255,255,.45)', { esp: 4 });
    c.fin(); }

  /* ---------- logos (repris de boite.js) + chargements ---------- */
  var LOGO_SVG = {
    fb: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#0866FF"/><path d="M56 100V62h12l2-14H56v-9c0-4 1-7 7-7h7V20c-1 0-5-1-10-1-11 0-18 6-18 18v11H30v14h12v38z" fill="#fff"/></svg>',
    ig: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx=".3" cy="1.07" r="1.25"><stop offset="0" stop-color="#FFD776"/><stop offset=".3" stop-color="#F3772C"/><stop offset=".6" stop-color="#E1306C"/><stop offset="1" stop-color="#7B3FD3"/></radialGradient></defs><rect width="100" height="100" rx="24" fill="url(#g)"/><rect x="24" y="24" width="52" height="52" rx="15" fill="none" stroke="#fff" stroke-width="7"/><circle cx="50" cy="50" r="12" fill="none" stroke="#fff" stroke-width="7"/><circle cx="66" cy="34" r="4" fill="#fff"/></svg>',
    meta: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 100"><defs><linearGradient id="m" x1="0" x2="1"><stop offset="0" stop-color="#0064E1"/><stop offset="1" stop-color="#0082FB"/></linearGradient></defs><path d="M14 52c0-15 8-26 19-26 10 0 16 9 24 22l10 16c7 11 12 17 20 17 10 0 16-11 16-27S97 26 87 26c-8 0-13 6-20 18l-10 16c-8 13-14 21-24 21-11 0-19-11-19-29z" fill="none" stroke="url(#m)" stroke-width="11" stroke-linecap="round"/></svg>',
    google: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M95 51c0-3-.3-6.5-.8-9.5H50v18h25c-1 6-4.5 11-9.5 14.5v12h15.5C90 77.5 95 65.5 95 51z" fill="#4285F4"/><path d="M50 97c13 0 24-4.3 32-11.5L66.5 73.5C62 76.5 56.5 78.5 50 78.5c-12.5 0-23-8.5-27-20H7v12.5C15 86.5 31 97 50 97z" fill="#34A853"/><path d="M23 58.5c-1-3-1.5-6-1.5-9s.5-6 1.5-9V28H7C4 34.5 2 41.5 2 49.5S4 64.5 7 71z" fill="#FBBC05"/><path d="M50 20.5c7 0 13.5 2.5 18.5 7.5l14-14C74 6 63 2 50 2 31 2 15 12.5 7 28l16 12.5c4-11.5 14.5-20 27-20z" fill="#EA4335"/></svg>',
    wa: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#25D366"/><path d="M50 20a29 29 0 0 0-25 44l-4 15 15-4a29 29 0 1 0 14-55z" fill="#fff"/><path d="M39 35c1-1 1-1 2-1h2c1 0 1 0 2 1l3 6v2l-2 2c0 1 0 1 0 2 3 5 6 8 11 10 1 0 1 0 2-1l2-3c1-1 1-1 2 0l6 3c1 0 1 1 1 1 0 2-1 4-3 6-2 1-5 2-8 1-8-3-15-9-19-17-2-4-2-8 0-12z" fill="#25D366"/></svg>'
  };
  function chargerLogos(cheminOnlee){
    var L = {}, attente = Object.keys(LOGO_SVG).map(function(k){ return new Promise(function(r){ var im = new Image(); im.onload = r; im.onerror = r; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG[k]); L[k] = im; }); });
    if (cheminOnlee) attente.push(new Promise(function(r){ var im = new Image(); im.onload = r; im.onerror = r; im.src = cheminOnlee; L.onlee = im; }));
    return Promise.all(attente).then(function(){ return L; }); }
  function polices(){ if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(['800 100px "Bricolage Grotesque"', '700 100px "Bricolage Grotesque"', '400 20px Inter', '500 20px Inter', '600 20px Inter', '700 20px Inter', '800 20px Inter', '800 expanded 100px Archivo'].map(function(f){ return document.fonts.load(f).catch(function(){}); })); }

  window.CARTES_V = { 1: v1, 2: v2, 3: v3, logosSVG: LOGO_SVG, chargerLogos: chargerLogos, polices: polices, services: S };
})();
