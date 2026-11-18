/* Prise de rendez-vous réelle (cal.com) : s'ouvre par-dessus la page.
   Chargée seulement quand elle sert : survol d'un bouton, clic, ou 3 s après l'ouverture (la page s'affiche plus vite) ;
   la page de réservation est ensuite préchargée (4,5 s) pour que l'agenda s'ouvre vite au clic.
   Tous les boutons « Réserver un appel » du site portent :
   data-cal-namespace="rdv30" data-cal-link="leeroy-benaich/30min" data-cal-config='{"layout":"month_view","theme":"light"}' data-onlee-express
   À charger AVANT /js/cta-express.js. */
(function(){
  var calCharge = false;
  function chargerCal(){ if (calCharge) return; calCharge = true;
    (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
    Cal("init", "rdv30", { origin: "https://app.cal.com" });
    Cal.ns.rdv30("ui", { cssVarsPerTheme: { light: { "cal-brand": "#0055FF" } }, hideEventTypeDetails: false, layout: "month_view" });
  }
  window.onleeChargerCal = chargerCal;
  document.addEventListener('pointerover', function(e){ if (e.target.closest && e.target.closest('[data-cal-link]')) chargerCal(); }, { passive: true });
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('[data-cal-link]'); if (!b || (window.Cal && window.Cal.loaded && window.__calPret)) return; chargerCal(); e.preventDefault(); e.stopPropagation(); var cfg = {}; try { cfg = JSON.parse(b.getAttribute('data-cal-config') || '{}'); } catch(er){} Cal.ns.rdv30('modal', { calLink: b.getAttribute('data-cal-link'), config: cfg }); }, true);
  /* la page de réservation elle-même est préchargée en arrière-plan : au clic, l'agenda s'ouvre presque tout de suite */
  var prechargee = false;
  function precharger(){ if (prechargee) return; prechargee = true; chargerCal();
    /* 18/11 : type 'modal' = cal.com prépare l'agenda entier (créneaux compris) en arrière-plan ; au clic il s'affiche aussitôt.
       Sans type, seuls les fichiers étaient préchargés : l'agenda mettait ~15 s à apparaître. */
    try { Cal.ns.rdv30('preload', { calLink: 'leeroy-benaich/30min', type: 'modal', options: { backgroundSlotsFetch: true } }); } catch (er) {} }
  document.addEventListener('touchstart', function(e){ if (e.target.closest && e.target.closest('[data-cal-link]')) precharger(); }, { passive: true, capture: true });
  document.addEventListener('pointerover', function(e){ if (e.target.closest && e.target.closest('[data-cal-link]')) precharger(); }, { passive: true });
  setTimeout(function(){ ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(function(){ chargerCal(); setTimeout(function(){ window.__calPret = true; }, 2500); }); }, 3000);
  setTimeout(function(){ ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(precharger, { timeout: 2000 }); }, 4500);
})();

/* onlee · suivi des demandes (18/11/2026, stratégie SEO v4, étape 2)
   Sans cookie et sans rien stocker : on ne lit que la page en cours.
   1. Chaque bouton « Réserver un appel » (cal.com) transmet, en données cachées de la réservation :
        page   = l'adresse de la page où la personne a cliqué (ex. /logiciels/)
        venu   = le site d'où elle est arrivée sur CETTE page, s'il est extérieur (ex. www.google.com)
        utm_*  = les étiquettes de campagne présentes dans l'adresse (liens LinkedIn, pubs…)
      Cal.com les reçoit dans « metadata » (visible dans la réservation et dans le webhook).
   2. Chaque lien WhatsApp pré-remplit un message qui dit de quelle page la personne écrit.
   À charger APRÈS /js/cal.js. */
(function () {
  'use strict';
  var EN = document.documentElement.lang === 'en';
  var chemin = location.pathname;

  /* nom lisible de la page : accueil, sinon le titre de l'onglet sans « · onlee » */
  function nomPage() {
    if (chemin === '/' ) return 'accueil';
    if (chemin === '/en/') return 'home';
    var t = (document.title || '').split(' · ')[0].trim();
    return t || chemin;
  }

  /* site d'origine, seulement s'il est extérieur à onlee.fr */
  function venuDe() {
    try {
      var h = new URL(document.referrer).hostname;
      return h && !/(^|\.)onlee\.fr$/.test(h) ? h : '';
    } catch (e) { return ''; }
  }

  /* 1. boutons cal.com : on ajoute les données cachées à leur configuration */
  var donnees = { 'metadata[page]': chemin };
  var v = venuDe();
  if (v) donnees['metadata[venu]'] = v;
  try {
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      var val = q.get(k);
      if (val) donnees['metadata[' + k + ']'] = val.slice(0, 80);
    });
  } catch (e) {}

  function enrichir(b) {
    var cfg = {};
    try { cfg = JSON.parse(b.getAttribute('data-cal-config') || '{}'); } catch (e) {}
    for (var k in donnees) cfg[k] = donnees[k];
    b.setAttribute('data-cal-config', JSON.stringify(cfg));
  }

  /* 2. liens WhatsApp : message qui dit de quelle page on écrit */
  var message = EN
    ? 'Hello onlee, I’m contacting you from the “' + nomPage() + '” page of your website.'
    : 'Bonjour onlee, je vous contacte depuis la page « ' + nomPage() + ' » de votre site.';

  function whatsapp(a) {
    /* encodeURIComponent : espaces en %20 (comme le lien d'origine), pas en « + » */
    a.href = a.href.split('?')[0] + '?text=' + encodeURIComponent(message);
  }

  function tout() {
    [].forEach.call(document.querySelectorAll('[data-cal-link]'), enrichir);
    [].forEach.call(document.querySelectorAll('a[href^="https://wa.me/"]'), whatsapp);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tout);
  else tout();
})();
