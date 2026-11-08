/* Onlee — bandeau cookies (CNIL) pour les pages PUBLIQUES uniquement (aucune app).
   Rien n'est chargé avant « Accepter » : ni Microsoft Clarity, ni pixel Meta.
   Utilisation : <script src="/cookies.js"></script> en bas de page
   (sur l'accueil : (pas de pixel Meta sur onlee.fr)).
   Le choix est gardé 6 mois (clé localStorage « onlee_cookies », v2 = choix qui inclut Clarity). */
(function () {
  var CLARITY_ID = "zajq0euhof";
  var CLE = "onlee_cookies", VERSION = 2, DUREE = 1000 * 60 * 60 * 24 * 182;
  var moi = document.currentScript;
  var PIXEL_ID = (moi && moi.getAttribute("data-pixel")) || "";

  function lire() {
    try {
      var v = JSON.parse(localStorage.getItem(CLE) || "null");
      if (v && v.v === VERSION && Date.now() - v.le < DUREE) return v.choix;
    } catch (_) {}
    return null;
  }
  function ecrire(c) { try { localStorage.setItem(CLE, JSON.stringify({ choix: c, le: Date.now(), v: VERSION })); } catch (_) {} }

  // Champs de formulaire toujours masqués dans les enregistrements Clarity.
  function masquer() {
    var l = document.querySelectorAll("input, textarea, select, [contenteditable]");
    for (var i = 0; i < l.length; i++) l[i].setAttribute("data-clarity-mask", "true");
  }
  function surveiller() { // formulaires ajoutés plus tard (fenêtre « Ça vous intéresse ? »…)
    try { new MutationObserver(masquer).observe(document.body, { childList: true, subtree: true }); } catch (_) {}
  }

  var clarityCharge = false;
  function clarity() {
    if (clarityCharge || !CLARITY_ID) return; clarityCharge = true;
    masquer(); surveiller();
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", CLARITY_ID);
    window.clarity("consent");
  }

  var pixelCharge = false;
  function pixel() {
    if (pixelCharge || !PIXEL_ID) return; pixelCharge = true;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", PIXEL_ID); fbq("track", "PageView");
    document.addEventListener("click", function (ev) { var a = ev.target && ev.target.closest && ev.target.closest('a[href*="app.html#creer"]'); if (a && window.fbq) fbq("track", "Lead"); }, true);
  }

  function accepter() { clarity(); pixel(); }
  function effacer() {
    var dom = "." + location.hostname.split(".").slice(-2).join(".");
    ["_fbp", "_fbc", "_clck", "_clsk", "CLID", "MUID"].forEach(function (k) {
      document.cookie = k + "=; Max-Age=0; path=/; domain=" + dom;
      document.cookie = k + "=; Max-Age=0; path=/";
    });
  }

  var css = document.createElement("style");
  css.textContent = '#cookies-bandeau{position:fixed;left:24px;bottom:24px;z-index:9999;width:min(400px,calc(100vw - 32px));background:#fff;color:#0B1220;border:1px solid rgba(11,18,32,.12);border-radius:20px;box-shadow:0 1px 2px rgba(11,18,32,.06),0 18px 48px rgba(11,18,32,.16);padding:20px 20px 18px;font-family:\'Instrument Sans\',system-ui,-apple-system,\'Helvetica Neue\',sans-serif;font-size:14px;line-height:1.55;text-align:left;animation:cbIn .45s cubic-bezier(.2,.8,.2,1) both}@keyframes cbIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}#cookies-bandeau .cb-tete{display:flex;align-items:center;gap:10px;margin-bottom:8px}#cookies-bandeau .cb-logo{width:30px;height:30px;flex:none;border-radius:50%;background:rgba(0,85,255,.10);display:grid;place-items:center}#cookies-bandeau .cb-logo svg{width:20px;height:20px}#cookies-bandeau h2{font-family:\'Playfair Display\',Georgia,\'Times New Roman\',serif;font-weight:600;font-size:19px;letter-spacing:-.01em;margin:0;color:#0B1220}#cookies-bandeau p{margin:0 0 16px;color:#6B7180}#cookies-bandeau a{color:#0B1220;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(11,18,32,.25)}#cookies-bandeau a:hover{text-decoration-color:#0B1220}#cookies-bandeau .cb-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}#cookies-bandeau button{font:600 14px \'Instrument Sans\',system-ui,-apple-system,sans-serif;padding:11px 16px;border-radius:999px;cursor:pointer;border:1px solid rgba(11,18,32,.16);background:#FBFBFA;color:#0B1220;transition:background .15s ease,border-color .15s ease}#cookies-bandeau button:hover{background:rgba(0,85,255,.10);border-color:rgba(0,85,255,.35)}#cookies-bandeau button:focus-visible{outline:2px solid #0055FF;outline-offset:2px}@media(max-width:560px){#cookies-bandeau{left:16px;right:16px;bottom:16px;width:auto}}@media(prefers-reduced-motion:reduce){#cookies-bandeau{animation:none}}@media print{#cookies-bandeau{display:none}}';
  document.head.appendChild(css);

  function bandeau() {
    if (document.getElementById("cookies-bandeau")) return;
    var d = document.createElement("div");
    d.id = "cookies-bandeau"; d.setAttribute("role", "dialog"); d.setAttribute("aria-labelledby", "cb-titre");
    d.innerHTML = '<div class="cb-tete"><span class="cb-logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="#0055FF" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/></svg></span><h2 id="cb-titre">Vos cookies, votre choix</h2></div>' +
      '<p>Avec votre accord, nous utilisons Microsoft Clarity pour comprendre comment le site est parcouru (clics, défilement) et l\'améliorer. Sans accord, rien n\'est déposé. <a href="/mentions-legales/#cookies">En savoir plus</a></p>' +
      '<div class="cb-btns"><button type="button" data-c="non">Refuser</button><button type="button" data-c="oui">Accepter</button></div>';
    d.addEventListener("click", function (ev) {
      var c = ev.target && ev.target.getAttribute && ev.target.getAttribute("data-c");
      if (!c) return;
      var avant = lire(); ecrire(c); d.remove();
      if (c === "oui") accepter();
      else { if (window.clarity && clarityCharge) window.clarity("consent", false); effacer(); if (avant === "oui" || clarityCharge || pixelCharge) location.reload(); }
    });
    document.body.appendChild(d);
  }

  // Lien « Gérer les cookies » en bas de page : celui de la page s'il existe, sinon ajouté dans le pied de page.
  var lien = document.getElementById("cookies-gerer");
  if (!lien) {
    var pied = document.querySelector("footer");
    var liens = pied && pied.querySelectorAll("a");
    if (liens && liens.length) {
      lien = document.createElement("a"); lien.id = "cookies-gerer"; lien.href = "#cookies";
      liens[liens.length - 1].parentNode.appendChild(lien);
    }
  }
  if (lien) {
    lien.hidden = false; lien.textContent = "Gérer les cookies";
    lien.addEventListener("click", function (ev) { ev.preventDefault(); bandeau(); });
  }

  var c = lire();
  if (c === "oui") accepter(); else if (c !== "non") bandeau();
})();
