/* =====================================================================
   onlee · bouton « Réserver un appel » EXPRESS + décor autour de cal.com
   Fichier autonome. À charger APRÈS le script d'intégration cal.com.

   Sur les boutons (déjà présents sur le site) :
     data-cal-namespace="rdv30" data-cal-link="leeroy-benaich/30min" data-cal-config='{"layout":"month_view","theme":"light"}'
     → c'est cal.com lui-même qui ouvre l'agenda, immédiatement (aucune attente ajoutée).
   À ajouter pour les micro-étapes dans le bouton :
     data-onlee-express
   Sur la balise <script> de ce fichier (chemins des images) :
     data-logo="assets/onlee-logo-ink.png" data-photo="assets/leeroy.jpg"

   Ce que fait ce fichier :
   1. survol / focus / doigt posé sur un bouton → cal.com se précharge ;
   2. clic → l'agenda part tout de suite (cal.com), et PENDANT son chargement le bouton
      fait défiler 3 micro-étapes (Fiche ✓ → Agenda ✓ → WhatsApp ✓), ≤ 1 s ;
   3. quand la fenêtre cal.com est ouverte → un décor onlee apparaît AUTOUR (dessous,
      jamais par-dessus, aucun clic bloqué) ; il repart quand la fenêtre se ferme ;
   4. si cal.com ne charge pas → l'agenda s'ouvre dans un nouvel onglet.
   ===================================================================== */
(function () {
  'use strict';
  var script = document.currentScript;
  var LOGO = (script && script.getAttribute('data-logo')) || 'assets/onlee-logo-ink.png';
  var PHOTO = (script && script.getAttribute('data-photo')) || '/assets/leeroy-mini.webp';
  var COURBE = 'cubic-bezier(.16,1,.3,1)';
  var reduit = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- logos (ceux du site) ---------- */
  var SVG = {
    onlee: '<svg viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#fff"/><text x="20" y="25.5" text-anchor="middle" font-size="13" font-weight="800" fill="#0055FF" font-family="Bricolage Grotesque,Helvetica" letter-spacing="-.5">onlee</text></svg>',
    agenda: '<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff"/><rect x="17" y="17" width="66" height="66" rx="9" fill="#fff" stroke="#4285F4" stroke-width="7"/><path d="M17 26a9 9 0 0 1 9-9h48a9 9 0 0 1 9 9v8H17z" fill="#4285F4"/><text x="50" y="72" text-anchor="middle" font-family="Arial,Helvetica" font-weight="700" font-size="32" fill="#1967D2">31</text></svg>',
    wa: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#25D366"/><path d="M50 20a29 29 0 0 0-25 44l-4 15 15-4a29 29 0 1 0 14-55z" fill="#fff"/><path d="M39 35c1-1 1-1 2-1h2c1 0 1 0 2 1l3 6v2l-2 2c0 1 0 1 0 2 3 5 6 8 11 10 1 0 1 0 2-1l2-3c1-1 1-1 2 0l6 3c1 0 1 1 1 1 0 2-1 4-3 6-2 1-5 2-8 1-8-3-15-9-19-17-2-4-2-8 0-12z" fill="#25D366"/></svg>',
    meta: '<svg viewBox="0 0 130 100"><path d="M14 52c0-15 8-26 19-26 10 0 16 9 24 22l10 16c7 11 12 17 20 17 10 0 16-11 16-27S97 26 87 26c-8 0-13 6-20 18l-10 16c-8 13-14 21-24 21-11 0-19-11-19-29z" fill="none" stroke="#0070F0" stroke-width="11" stroke-linecap="round"/></svg>',
    google: '<svg viewBox="0 0 100 100"><path d="M95 51c0-3-.3-6.5-.8-9.5H50v18h25c-1 6-4.5 11-9.5 14.5v12h15.5C90 77.5 95 65.5 95 51z" fill="#4285F4"/><path d="M50 97c13 0 24-4.3 32-11.5L66.5 73.5C62 76.5 56.5 78.5 50 78.5c-12.5 0-23-8.5-27-20H7v12.5C15 86.5 31 97 50 97z" fill="#34A853"/><path d="M23 58.5c-1-3-1.5-6-1.5-9s.5-6 1.5-9V28H7C4 34.5 2 41.5 2 49.5S4 64.5 7 71z" fill="#FBBC05"/><path d="M50 20.5c7 0 13.5 2.5 18.5 7.5l14-14C74 6 63 2 50 2 31 2 15 12.5 7 28l16 12.5c4-11.5 14.5-20 27-20z" fill="#EA4335"/></svg>',
    vizor: '<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#4C3175"/><path d="M30 30l20 40 20-40" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    visio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5l6-3.5v10l-6-3.5"/></svg>'
  };
  function creer(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function px(n) { return Math.round(n) + 'px'; }

  /* ---------- infos cal.com d'un bouton ---------- */
  function infos(btn) {
    var cfg = {};
    try { cfg = JSON.parse(btn.getAttribute('data-cal-config') || '{}'); } catch (e) {}
    return { ns: btn.getAttribute('data-cal-namespace') || '', lien: btn.getAttribute('data-cal-link'), cfg: cfg };
  }
  function apiCal(ns) { var C = window.Cal; if (!C) return null; return ns ? (C.ns && C.ns[ns]) : C; }

  /* ---------- repli si cal.com ne charge pas ---------- */
  var calEnPanne = false;
  function surveillerScript() {
    var s = document.querySelector('script[src*="cal.com/embed/embed.js"]');
    if (s && !s.__onlee) { s.__onlee = true; s.addEventListener('error', function () { calEnPanne = true; }); }
  }
  function ouvrirOnglet(lien) {
    var url = 'https://cal.com/' + lien, w = window.open(url, '_blank');
    if (w) { try { w.opener = null; } catch (e) {} } else location.href = url;
  }

  /* ---------- 1) préchargement au survol ---------- */
  var precharges = {};
  function precharger(btn) {
    var i = infos(btn), api = apiCal(i.ns);
    if (!i.lien || precharges[i.lien] || !api || calEnPanne) return;
    precharges[i.lien] = true;
    try { api('preload', { calLink: i.lien }); } catch (e) {}
  }
  ['pointerenter', 'focusin', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      var b = e.target && e.target.closest && e.target.closest('[data-cal-link]');
      if (b) { surveillerScript(); precharger(b); }
    }, { passive: true, capture: true });
  });

  /* ---------- 2) clic : l'agenda part (cal.com), le bouton joue ses micro-étapes ---------- */
  var dernierClic = 0, vuDepuisClic = false;
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('[data-cal-link]');
    if (!b) return;
    surveillerScript();
    var i = infos(b);
    if (calEnPanne || !window.Cal) { e.preventDefault(); e.stopImmediatePropagation(); ouvrirOnglet(i.lien); return; }
    dernierClic = performance.now(); vuDepuisClic = false;
    // filet de sécurité : si la fenêtre n'est jamais apparue au bout de 4 s, nouvel onglet
    setTimeout(function () { if (!vuDepuisClic && performance.now() - dernierClic >= 3900) ouvrirOnglet(i.lien); }, 4000);
    if (b.hasAttribute('data-onlee-express') && !reduit) microEtapes(b);
  }, true);

  function microEtapes(btn) {
    var r = btn.getBoundingClientRect(), cs = getComputedStyle(btn);
    var calque = creer('<div class="oc-xp" aria-hidden="true"></div>');
    var coque = creer('<div class="oc-coque"></div>');
    coque.style.cssText = 'left:' + px(r.left) + ';top:' + px(r.top) + ';width:' + px(r.width) + ';height:' + px(r.height) +
      ';border-radius:' + cs.borderRadius + ';background:' + cs.backgroundColor + ';color:' + cs.color + ';font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize + ';box-shadow:' + cs.boxShadow;
    var clone = btn.cloneNode(true);
    clone.removeAttribute('id'); clone.removeAttribute('data-cal-link'); clone.removeAttribute('data-onlee-express');
    clone.className += ' oc-clone'; clone.tabIndex = -1;
    var enveloppe = creer('<span class="oc-xc"></span>'); enveloppe.appendChild(clone); coque.appendChild(enveloppe);
    calque.appendChild(coque);
    var mention = creer('<span class="oc-mention">Exemple d’automatisation · rien n’est envoyé</span>');
    mention.style.left = px(Math.max(130, Math.min(innerWidth - 130, r.left + r.width / 2))); mention.style.top = px(r.bottom + 9);
    calque.appendChild(mention);
    document.body.appendChild(calque);
    var A = function (el, kf, o) { return el.animate(kf, Object.assign({ fill: 'both', easing: COURBE }, o)); };
    A(enveloppe, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], { duration: 170, easing: 'cubic-bezier(.5,0,.75,0)' });
    [['onlee', 'Fiche'], ['agenda', 'Agenda'], ['wa', 'WhatsApp']].forEach(function (e, i) {
      var x = creer('<span class="oc-etape">' + SVG[e[0]] + e[1] + '<i class="oc-ok">' + SVG.ok + '</i></span>');
      coque.appendChild(x);
      var t = 120 + i * 240;
      A(x, [{ transform: 'translateY(100%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 200, delay: t });
      A(x.querySelector('.oc-ok'), [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 170, delay: t + 80 });
      if (i < 2) A(x, [{ transform: 'none', opacity: 1 }, { transform: 'translateY(-100%)', opacity: 0 }], { duration: 160, delay: t + 210, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' });
    });
    A(mention, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, delay: 150, easing: 'ease-out' });
    // fin : on rend la main au bouton (le décor est déjà là, derrière l'agenda)
    setTimeout(function () {
      calque.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-in', fill: 'forwards' });
      setTimeout(function () { calque.remove(); }, 280);
    }, 1050);
  }

  /* ---------- 3) le décor autour de la fenêtre cal.com ---------- */
  var decor = null, dessus = null, cartes = [], boite = null, ouvert = false;
  function construireDecor() {
    decor = creer('<div class="oc-decor" aria-hidden="true">' +
      '<span class="oc-fond"></span><span class="oc-forme oc-f1"></span><span class="oc-forme oc-f2"></span><span class="oc-forme oc-f3"></span>' +
      '<span class="oc-filigrane"></span>' +
      '<div class="oc-carte oc-c1" style="--rot:-2deg"><span class="oc-ic oc-ic-meet"><svg class="oc-meet" viewBox="0 0 87.5 72"><path fill="#00832d" d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"/><path fill="#0066da" d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"/><path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z"/><path fill="#2684fc" d="M20.5 20.5H0v31h20.5z"/><path fill="#00ac47" d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"/><path fill="#ffba00" d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"/></svg></span><span><b>30 min · en visio</b><small>Google Meet · le lien arrive par mail</small></span></div>' +
      '<div class="oc-carte oc-c2" style="--rot:1.5deg"><span class="oc-av"></span><span><b>Leeroy t’écoute</b><small>Sans engagement</small></span></div>' +
      '<div class="oc-carte oc-c3" style="--rot:1.5deg"><span class="oc-logos">' + SVG.wa.replace('<svg', '<svg class="oc-plein"') + SVG.meta + SVG.google + SVG.vizor.replace('<svg', '<svg class="oc-plein"') + '</span><span><b>On branche tes outils</b><small>WhatsApp, pubs Meta, Google…</small></span></div>' +
      '<div class="oc-carte oc-c4" style="--rot:-1.5deg"><span class="oc-onlee"></span><span><b>Logiciels · Pubs · Sites</b><small>Faits pour ton métier</small></span></div>' +
      '</div>');
    decor.style.setProperty('--oc-logo', 'url("' + LOGO + '")');
    decor.style.setProperty('--oc-photo', 'url("' + PHOTO + '")');
    document.body.appendChild(decor);   // ajouté tôt : les micro-étapes du bouton passent au-dessus
    cartes = Array.prototype.slice.call(decor.querySelectorAll('.oc-carte'));
    dessus = creer('<div class="oc-dessus" aria-hidden="true"></div>'); cartes.forEach(function (c) { dessus.appendChild(c); }); dessus.style.setProperty('--oc-photo', 'url("' + PHOTO + '")'); dessus.style.setProperty('--oc-logo', 'url("' + LOGO + '")'); document.body.appendChild(dessus);
  }

  /* place les cartes là où il reste de la place autour de l'agenda (jamais en dessous de lui) */
  function placer() {
    if (!decor) return;
    var vw = innerWidth, vh = innerHeight;
    cartes.forEach(function (c) { c.classList.remove('oc-place', 'oc-ligne'); c.style.left = c.style.top = c.style.width = ''; });
    if (vw < 760) return;                                   // téléphone / petite tablette : fond et formes seulement
    var ifr = boite && boite.querySelector('iframe'), ri = ifr && ifr.getBoundingClientRect();
    var L = Math.min(1040, vw - 32), Hh = Math.min(620, vh - 120);
    var bw = ri ? Math.min(ri.width, 1000) : 0, bl = ri ? ri.left + (ri.width - bw) / 2 : 0;  /* la fenêtre visible de cal.com fait ~1000 px de large, centrée dans sa zone */
    var R = (ri && ri.height > 200 && ri.width > 300) ? { l: bl, t: ri.top, r: bl + bw, b: Math.min(ri.bottom, vh - 20, ri.top + 472) } : { l: (vw - L) / 2, t: (vh - Hh) / 2, r: (vw + L) / 2, b: (vh + Hh) / 2 };
    var Wb = R.r - R.l, Hb = R.b - R.t;
    var bords = [
      function (c) { return { x: R.l - c.offsetWidth * .55, y: R.t + Hb * .6, rot: -2.5 }; },                       /* à gauche, sous les infos */
      function (c) { return { x: R.l + Wb * .5 - c.offsetWidth / 2, y: R.t - c.offsetHeight * .55, rot: 1.5 }; },  /* en haut, au centre */
      function (c) { return { x: R.r - c.offsetWidth * .32, y: R.t + Hb * .28, rot: 2.5 }; },                       /* à droite, en haut des créneaux */
      function (c) { return { x: R.l + Wb * .44 - c.offsetWidth / 2, y: R.b - c.offsetHeight * .45, rot: -1.5 }; }  /* en bas, sous le calendrier */
    ];
    var visibles = [];
    cartes.forEach(function (c, k) { c.classList.add('oc-place'); c.classList.remove('oc-ligne'); c.style.width = '';
      var P = bords[k % 4](c), x = Math.max(10, Math.min(vw - c.offsetWidth - 10, P.x)), y = Math.max(10, Math.min(vh - c.offsetHeight - 10, P.y));
      c.style.left = px(x); c.style.top = px(y); c.style.setProperty('--rot', P.rot + 'deg'); visibles.push(c); });
    visibles.forEach(function (c, i) { c.style.setProperty('--i', i); });
  }

  /* le fond sombre de cal.com devient transparent : c'est notre décor clair qu'on voit derrière l'agenda */
  function habillerBoite(b) {
    var sr = b.shadowRoot;
    if (!sr || sr.querySelector('style[data-onlee]')) return;
    var st = document.createElement('style'); st.setAttribute('data-onlee', '');
    st.textContent = '.my-backdrop{background-color:transparent!important}' +
      '.close{color:#0E0F13!important;background:#fff!important;width:42px!important;height:42px!important;border-radius:50%!important;border:0!important;' +
      'display:grid!important;place-items:center!important;font-size:24px!important;line-height:1!important;padding:0!important;opacity:1!important;' +
      'box-shadow:0 0 0 1px rgba(14,15,19,.08),0 10px 24px -12px rgba(14,15,19,.45)!important;cursor:pointer}';
    sr.appendChild(st); b.__onleeStyle = st;
  }

  /* (labo uniquement) <html data-onlee-sans-decor> coupe le décor ; sur le vrai site, rien à faire */
  function decorActif() { return !document.documentElement.hasAttribute('data-onlee-sans-decor'); }
  function estVisible(b) { return b.isConnected && b.style.visibility !== 'hidden' && b.getAttribute('state') !== 'closed'; }
  function suivreBoite(b) {
    if (b.__onlee) return; b.__onlee = true;
    habillerBoite(b);
    new MutationObserver(function () { habillerBoite(b); maj(b); }).observe(b, { attributes: true, attributeFilter: ['style', 'state'] });
    var ifr = b.querySelector('iframe');
    if (ifr && window.ResizeObserver) new ResizeObserver(function () { if (ouvert) placer(); }).observe(ifr);
    new MutationObserver(function () {                      // l'iframe peut arriver un peu après
      var f = b.querySelector('iframe');
      if (f && !f.__onlee && window.ResizeObserver) { f.__onlee = true; new ResizeObserver(function () { if (ouvert) placer(); }).observe(f); }
    }).observe(b, { childList: true, subtree: true });
    maj(b);
  }
  function maj(b) {
    var vis = estVisible(b);
    if (vis) { boite = b; vuDepuisClic = true; }
    if (b.__onleeStyle) b.__onleeStyle.media = decorActif() ? 'all' : 'not all';
    vis = vis && decorActif();
    if (vis && ouvert && b === boite) { cartesSiPret(b); return; }   // l'agenda vient de finir de charger
    if (vis === ouvert || (!vis && b !== boite)) return;
    ouvert = vis;
    if (!decor) construireDecor();
    clearTimeout(minuteCartes);
    if (vis) { document.body.appendChild(dessus); placer(); void decor.offsetWidth; decor.classList.add('oc-ouvert'); cartesSiPret(b); }
    else { decor.classList.remove('oc-ouvert'); dessus.classList.remove('oc-ouvert'); }
  }
  /* les cartes autour de l'agenda n'arrivent qu'une fois la page de réservation affichée (state="loaded"), jamais avant */
  var minuteCartes;
  function cartesSiPret(b) {
    if (dessus.classList.contains('oc-ouvert') || b.getAttribute('state') !== 'loaded') return;
    clearTimeout(minuteCartes);
    minuteCartes = setTimeout(function () {
      if (!ouvert) return;
      placer(); dessus.classList.add('oc-ouvert'); setTimeout(placer, 500); setTimeout(placer, 1400);
    }, 900);   // le temps que cal.com dessine la page (profil, jours, créneaux)
  }

  function demarrer() {
    construireDecor();
    surveillerScript();
    document.querySelectorAll('cal-modal-box').forEach(suivreBoite);
    new MutationObserver(function (muts) {
      muts.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeName === 'CAL-MODAL-BOX') suivreBoite(n); }); });
    }).observe(document.body, { childList: true });
    window.addEventListener('resize', function () { if (ouvert) placer(); });
  }
  /* petite porte pour le labo : rejouer les micro-étapes sans ouvrir l'agenda */
  window.onleeCTA = { rejouer: function (btn) { if (btn && !reduit) microEtapes(btn); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrer); else demarrer();
})();
