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
    try { Cal.ns.rdv30('preload', { calLink: 'leeroy-benaich/30min' }); } catch (er) {} }
  document.addEventListener('touchstart', function(e){ if (e.target.closest && e.target.closest('[data-cal-link]')) precharger(); }, { passive: true, capture: true });
  document.addEventListener('pointerover', function(e){ if (e.target.closest && e.target.closest('[data-cal-link]')) precharger(); }, { passive: true });
  setTimeout(function(){ ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(function(){ chargerCal(); setTimeout(function(){ window.__calPret = true; }, 2500); }); }, 3000);
  setTimeout(function(){ ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(precharger, { timeout: 2000 }); }, 4500);
})();
