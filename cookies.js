var __EN = document.documentElement.lang === 'en';   /* textes en anglais sur les pages /en/ (voir outils/assembler/anglais.py) */
/* onlee — bandeau cookies (CNIL) · VERSION 1 « Un cookie dans la boîte ? »
   Prêt à remplacer site/cookies.js (même logique, même clé, même chargement de Clarity, même lien « Gérer les cookies »).
   Pour les pages PUBLIQUES uniquement (aucune app).
   Rien n'est chargé avant « Accepter » : ni Microsoft Clarity, ni pixel Meta.
   Utilisation : <script src="/cookies.js" defer></script> en bas de page.
   Le choix est gardé 6 mois (clé localStorage « onlee_cookies », v2 = choix qui inclut Clarity).

   Mise en scène : une carte au centre de l'écran (fenêtre modale : le reste de la page est inerte, Échap = refuser),
   et la mascotte = la boîte noire onlee en miniature (CSS 3D + un visage en SVG, aucune bibliothèque) qui sort de
   derrière la carte. Elle a des yeux qui suivent la souris et clignent, des sourcils, une bouche :
   contente quand on accepte, boudeuse quand on refuse, curieuse dans les réglages.
   Tout (style, animations, écouteurs) n'existe que pendant l'affichage : une fois le choix fait, tout est retiré.
   Attributs facultatifs du <script> : data-pixel="ID" (pixel Meta), data-logo="chemin du logo", data-demo (labo : rien n'est chargé). */
(function () {
  var CLARITY_ID = "zajq0euhof";
  var CLE = "onlee_cookies", VERSION = 2, DUREE = 1000 * 60 * 60 * 24 * 182;
  var moi = document.currentScript;
  var PIXEL_ID = (moi && moi.getAttribute("data-pixel")) || "";
  var DEMO = !!(moi && moi.hasAttribute("data-demo"));
  var LOGO = (moi && moi.getAttribute("data-logo")) || "/assets/onlee-logo-ink.png";
  var CALME = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var T = __EN ? {
    titre: "A cookie in the box?",
    texte: "With your consent, Microsoft Clarity measures how people browse the site (clicks, scrolling) so we can improve it. Without consent, nothing is loaded.",
    plus: "Learn more", lien: "/en/legal-notice/#cookies",
    non: "Decline", oui: "Accept", toutNon: "Decline all", toutOui: "Accept all", enreg: "Save my choices",
    perso: "Customise", masquer: "Hide settings", fermer: "Decline and close",
    merci: "Yum. Thanks!", boude: "Fine. It’s sulking a little.",
    reglages: "Cookie settings",
    nec: "Necessary", necTxt: "Remembers your cookie choice for 6 months. Visits are counted without cookies.", toujours: "Always on",
    mes: "Audience measurement", mesTxt: "Microsoft Clarity: how the site is browsed (clicks, scrolling). Typed text is masked. Off by default.",
    gerer: "Manage cookies"
  } : {
    titre: "Un cookie dans la boîte ?",
    texte: "Avec ton accord, Microsoft Clarity mesure comment le site est parcouru (clics, défilement) pour qu’on l’améliore. Sans ton accord, rien n’est chargé.",
    plus: "En savoir plus", lien: "/mentions-legales/#cookies",
    non: "Refuser", oui: "Accepter", toutNon: "Tout refuser", toutOui: "Tout accepter", enreg: "Enregistrer mes choix",
    perso: "Personnaliser", masquer: "Masquer les réglages", fermer: "Refuser et fermer",
    merci: "Miam. Merci !", boude: "D’accord. Elle boude un peu.",
    reglages: "Réglages des cookies",
    nec: "Nécessaires", necTxt: "Mémoriser ton choix de cookies pendant 6 mois. La fréquentation est comptée sans cookie.", toujours: "Toujours actifs",
    mes: "Mesure d’audience", mesTxt: "Microsoft Clarity : comment le site est parcouru (clics, défilement). Textes saisis masqués. Désactivée par défaut.",
    gerer: "Gérer les cookies"
  };

  /* ---------- Consentement (identique à l'ancien cookies.js) ---------- */
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
    /* seulement sur le vrai site : les aperçus locaux (localhost) faussaient les chiffres de Clarity (12/11) */
    if (!/(^|\.)onlee\.fr$/.test(location.hostname)) return;
    if (clarityCharge || !CLARITY_ID) return; clarityCharge = true;
    if (DEMO) { try { console.info("[labo] Clarity serait chargé ici (" + CLARITY_ID + ")"); } catch (_) {} return; }
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
    if (!/(^|\.)onlee\.fr$/.test(location.hostname)) return;   /* pas de Pixel sur les aperçus locaux */
    if (pixelCharge || !PIXEL_ID || DEMO) return; pixelCharge = true;
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

  /* ---------- Style (injecté au premier affichage) ---------- */
  var C = "cubic-bezier(.22,.8,.24,1)";          // sortie douce, façon Apple
  var R = "#cookies-bandeau.cb1";
  var H = function (h) { return R + "[data-humeur=" + h + "]"; };
  var css = [
    "@property --ouv{syntax:'<angle>';inherits:true;initial-value:24deg}",
    "@property --lev{syntax:'<length>';inherits:true;initial-value:-12px}",
    /* voile + carte au centre */
    R + "{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:200px 16px 24px;overflow-y:auto;background:rgba(240,244,252,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);font:400 14px/1.55 Inter,system-ui,-apple-system,'Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased;animation:cb1Voile .45s ease both}",
    R + " *{box-sizing:border-box}",
    "@keyframes cb1Voile{from{opacity:0}to{opacity:1}}",
    R + ".cb-part{opacity:0;transition:opacity .4s ease .1s}",
    R + ".cb-part .cb1-carte{transform:translateY(18px) scale(.97);opacity:0;transition:transform .4s ease,opacity .35s ease}",
    ".cb1-carte{position:relative;width:min(440px,100%);background:#fff;color:#0E0F13;border:1px solid rgba(14,15,19,.08);border-radius:26px;box-shadow:0 1px 2px rgba(14,15,19,.05),0 30px 80px -20px rgba(14,15,19,.28);padding:30px 26px 18px;text-align:center;outline:none;animation:cb1Monte .7s " + C + " .05s both}",
    "@keyframes cb1Monte{from{opacity:0;transform:translateY(36px)}to{opacity:1;transform:none}}",
    /* la scène : la boîte sort de derrière le haut de la carte */
    ".cb1-scene{position:absolute;left:50%;top:-152px;width:240px;height:172px;margin-left:-120px;pointer-events:none;clip-path:inset(-400px -400px 20px -400px);transform:scale(1.32);transform-origin:50% 152px}",
    ".cb1-monte{position:absolute;inset:0;perspective:700px;perspective-origin:50% 35%;animation:cb1Sort .8s cubic-bezier(.2,.9,.3,1.04) .35s both}",
    "@keyframes cb1Sort{from{transform:translateY(150px)}to{transform:none}}",
    ".cb1-pivot{position:absolute;left:120px;top:84px;transform-style:preserve-3d;transform:rotateX(-16deg) rotateY(-20deg);transition:transform .7s " + C + "}",
    ".cb1-boite,.cb1-lid{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}",
    ".cb1-boite{--W:132px;--D:84px;--H:56px;--LW:138px;--LD:90px;--LH:19px;transform-origin:0 56px}",
    ".cb1-f{position:absolute;left:0;top:0}",
    /* base */
    ".cb1-av{width:var(--W);height:var(--H);margin-left:calc(var(--W)/-2);transform:translateZ(calc(var(--D)/2));background:linear-gradient(180deg,#1F2127 0%,#15161B 100%)}",
        ".cb1-ar{width:calc(var(--W) + 3px);height:var(--H);margin-left:calc(var(--W)/-2 - 1.5px);transform:translateZ(calc(var(--D)/-2));background:linear-gradient(180deg,#0A0B0E,#16171C)}",
    ".cb1-dr,.cb1-ga{width:calc(var(--D) + 2px);height:var(--H);margin-left:calc(var(--D)/-2 - 1px);background:linear-gradient(180deg,#141519,#0D0E11)}",
    ".cb1-dr{transform:rotateY(90deg) translateZ(calc(var(--W)/2))}",
    ".cb1-ga{transform:rotateY(-90deg) translateZ(calc(var(--W)/2))}",
    ".cb1-fd{width:var(--W);height:var(--D);margin-left:calc(var(--W)/-2);top:calc(var(--H) - var(--D)/2);transform:rotateX(90deg);background:#0B0C0F}",
    /* couvercle (charnière à l'arrière) */
    ".cb1-lid{transform:translateY(-3px) translateZ(calc(var(--LD)/-2)) rotateX(var(--ouv)) translateZ(calc(var(--LD)/2));transition:--ouv .55s " + C + "}",
    ".cb1-dessus,.cb1-dessous{width:var(--LW);height:var(--LD);margin-left:calc(var(--LW)/-2);top:calc(var(--LD)/-2);backface-visibility:hidden;-webkit-backface-visibility:hidden}",
    ".cb1-dessus{transform:rotateX(90deg);background:linear-gradient(160deg,#2A2C33 0%,#1C1D22 55%,#17181C 100%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:3px}",
    ".cb1-dessus img{height:20px;filter:invert(1);opacity:.16}",
    ".cb1-dessus span{font:700 5px/1 Inter,sans-serif;letter-spacing:.3em;color:rgba(255,255,255,.16)}",
    ".cb1-dessous{transform:translateY(1px) rotateX(-90deg);background:#0E0F12}",
    ".cb1-jav,.cb1-jar{width:var(--LW);height:var(--LH);margin-left:calc(var(--LW)/-2);background:linear-gradient(180deg,#25272D,#1A1B20);border-bottom:2px solid #0055FF}",
    ".cb1-jav{transform:translateZ(calc(var(--LD)/2));display:flex;align-items:center;justify-content:space-between;padding:0 11px 0 12px;box-shadow:0 2px 6px -1px rgba(0,85,255,.55)}",
    ".cb1-jav img{height:9px;filter:invert(1);opacity:.95}",
    ".cb1-jav span{font:700 7.5px/1 Inter,sans-serif;letter-spacing:.22em;color:#fff}",
    ".cb1-jar{transform:translateZ(calc(var(--LD)/-2))}",
    ".cb1-jdr,.cb1-jga{width:var(--LD);height:var(--LH);margin-left:calc(var(--LD)/-2);background:linear-gradient(180deg,#1B1C21,#131418);border-bottom:2px solid #0047D6}",
    ".cb1-jdr{transform:rotateY(90deg) translateZ(calc(var(--LW)/2))}",
    ".cb1-jga{transform:rotateY(-90deg) translateZ(calc(var(--LW)/2))}",
    /* cookie */
    ".cb1-cookie{position:absolute;left:-27px;top:0;width:54px;height:54px;transform:translateY(var(--lev)) translateZ(-6px) rotate(-10deg);transition:--lev .55s " + C + "}",
    ".cb1-cookie svg,.cb1-visage{display:block;width:100%;height:100%}",
    /* visage */
    ".cb1-visage{position:absolute;inset:0;overflow:visible}",
    ".cb1-visage *{transform-box:fill-box;transform-origin:center}",
    ".cb1-oeil{animation:cb1Cligne 4.6s 1.6s infinite}",
    ".cb1-oeil+.cb1-oeil{animation-delay:1.64s}",
    "@keyframes cb1Cligne{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}",
    ".cb1-pup{transform:translate(var(--px,0px),var(--py,2.4px)) scale(var(--ps,1));transition:transform .16s ease-out}",
    ".cb1-pup .b2{opacity:0;transition:opacity .2s}",
    ".cb1-pau{fill:#1D1F25;transform:translateY(-10px);transition:transform .25s ease}",
    ".cb1-heureux,.cb1-m,.cb1-sourcils path{opacity:0;transition:opacity .18s ease,transform .3s " + C + "}",
    ".cb1-yeux{transition:opacity .15s}",
    ".cb1-joues{fill:#FF7A93;opacity:0;transition:opacity .3s}",
    ".cb1-pff{position:absolute;left:176px;top:46px;width:34px;height:22px;opacity:0}",
    /* humeurs : repos */
    H("attente") + " .m-repos{opacity:1}",
    H("attente") + " .cb1-boite{animation:cb1Guette 4.4s ease-in-out 1.3s infinite}",
    "@keyframes cb1Guette{0%,100%{transform:none;--ouv:24deg;--lev:-12px}30%{transform:scale(1.012,1.024)}55%{transform:none;--ouv:24deg;--lev:-12px}62%{--ouv:36deg;--lev:-26px}68%{--ouv:22deg;--lev:-10px}75%{--ouv:34deg;--lev:-23px}84%{--ouv:24deg;--lev:-12px}}",
    /* survol Accepter : envie */
    H("envie") + "{--ouv:50deg;--lev:-36px;--ps:1.28}",
    H("envie") + " .cb1-pivot{transform:translateY(-4px) rotateX(-18deg) rotateY(-16deg)}",
    H("envie") + " .m-envie{opacity:1}",
    H("envie") + " .cb1-pup .b2{opacity:1}",
    H("envie") + " .cb1-joues{opacity:.35}",
    H("envie") + " .cb1-sourcils path{opacity:1;transform:translateY(-2.4px)}",
    /* survol Refuser : inquiète */
    H("inquiet") + "{--ouv:8deg;--lev:0px;--ps:.78}",
    H("inquiet") + " .cb1-pivot{transform:translateY(2px) rotateX(-14deg) rotateY(-26deg)}",
    H("inquiet") + " .m-inquiet{opacity:1}",
    H("inquiet") + " .cb1-sourcils path{opacity:1}",
    H("inquiet") + " .cb1-sourcils .sg{transform:translateY(-1.5px) rotate(-16deg)}",
    H("inquiet") + " .cb1-sourcils .sd{transform:translateY(-1.5px) rotate(16deg)}",
    /* Personnaliser : curieuse, la tête penchée */
    H("reglages") + "{--ouv:30deg;--lev:-16px}",
    H("reglages") + " .cb1-pivot{transform:rotateZ(-9deg) rotateX(-20deg) rotateY(-10deg)}",
    H("reglages") + " .m-regl{opacity:1}",
    H("reglages") + " .cb1-sourcils path{opacity:1}",
    H("reglages") + " .cb1-sourcils .sg{transform:translateY(-3.2px) rotate(-8deg)}",
    H("reglages") + " .cb1-sourcils .sd{transform:translateY(.6px) rotate(5deg)}",
    H("reglages") + "[data-mesure=on] .m-regl{opacity:0}",
    H("reglages") + "[data-mesure=on] .m-envie{opacity:1}",
    H("reglages") + "[data-mesure=on] .cb1-joues{opacity:.4}",
    H("reglages") + "[data-mesure=on]{--ouv:40deg;--lev:-26px}",
    /* Accepter : contente */
    H("oui") + " .cb1-yeux{opacity:0}",
    H("oui") + " .cb1-heureux,"  + H("oui") + " .m-oui{opacity:1}",
    H("oui") + " .cb1-joues{opacity:.75}",
    H("oui") + " .cb1-boite{animation:cb1Ouvre 1.7s " + C + " both}",
    "@keyframes cb1Ouvre{0%{--ouv:50deg}12%,52%{--ouv:120deg}66%,100%{--ouv:0deg}}",
    H("oui") + " .cb1-cookie{animation:cb1Saut 1.7s both}",
    "@keyframes cb1Saut{0%{transform:translateY(-36px) translateZ(-6px) rotate(-10deg);animation-timing-function:cubic-bezier(.2,.7,.3,1)}24%{transform:translateY(-128px) translateZ(-6px) rotate(10deg) rotateY(180deg);animation-timing-function:cubic-bezier(.5,0,.8,.4)}32%{transform:translateY(-124px) translateZ(-6px) rotate(6deg) rotateY(300deg)}54%{transform:translateY(0px) translateZ(-6px) rotate(-6deg) rotateY(360deg)}100%{transform:translateY(2px) translateZ(-6px) rotate(-10deg) rotateY(360deg)}}",
    H("oui") + " .cb1-pivot{animation:cb1Joie 1.7s both}",
    "@keyframes cb1Joie{0%,62%{transform:rotateX(-16deg) rotateY(-16deg);animation-timing-function:cubic-bezier(.3,.6,.4,1)}70%{transform:translateY(-11px) rotateX(-16deg) rotateY(-16deg) rotateZ(-3deg);animation-timing-function:cubic-bezier(.6,0,.7,.5)}77%{transform:rotateX(-16deg) rotateY(-16deg);animation-timing-function:cubic-bezier(.3,.6,.4,1)}84%{transform:translateY(-7px) rotateX(-16deg) rotateY(-16deg) rotateZ(3deg);animation-timing-function:cubic-bezier(.6,0,.7,.5)}91%,100%{transform:rotateX(-16deg) rotateY(-16deg)}}",
    /* Refuser : elle boude */
    H("non") + "{--ouv:0deg;--lev:2px}",
    H("non") + " .cb1-lid{transition:--ouv .16s cubic-bezier(.7,0,1,.6)}",
    H("non") + " .cb1-pup{transform:translate(-2.6px,1.4px)}",
    H("non") + " .cb1-pau{transform:none}",
    H("non") + " .m-non{opacity:1}",
    H("non") + " .cb1-sourcils path{opacity:1}",
    H("non") + " .cb1-sourcils .sg{transform:translateY(2px) rotate(18deg)}",
    H("non") + " .cb1-sourcils .sd{transform:translateY(2px) rotate(-18deg)}",
    H("non") + " .cb1-boite{animation:cb1Soupir 1.1s .16s both}",
    "@keyframes cb1Soupir{0%{transform:none}22%{transform:scale(1.035,.92)}50%,100%{transform:scale(1.01,.965)}}",
    H("non") + " .cb1-pivot{transform:rotateX(-12deg) rotateY(-56deg) rotateZ(4deg);transition:transform .8s " + C + " .5s}",
    H("non") + " .cb1-pff{animation:cb1Pff 1s ease-out .3s both}",
    "@keyframes cb1Pff{0%{opacity:0;transform:translate(-6px,6px) scale(.5)}35%{opacity:.85}100%{opacity:0;transform:translate(14px,-16px) scale(1.15)}}",
    /* contenu de la carte */
    R + " h2{font:700 24px/1.12 'Bricolage Grotesque',Inter,system-ui,sans-serif;letter-spacing:-.03em;margin:0 0 8px;color:#0E0F13}",
    R + " p{margin:0 auto 18px;max-width:350px;color:#5B6170}",
    R + " a{color:#0E0F13;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(14,15,19,.28);border-radius:4px}",
    R + " p a{white-space:nowrap}" + R + " a:hover{text-decoration-color:#0E0F13}",
    ".cb1-x{position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:#8A8F9C;display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s}",
    ".cb1-x:hover{background:#F2F3F5;color:#0E0F13}",
    ".cb1-x svg{width:14px;height:14px}",
    ".cb1-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px}",
    ".cb1-btns button,.cb1-enreg{font:600 15px/1 Inter,system-ui,-apple-system,sans-serif;height:48px;padding:0 14px;border-radius:999px;cursor:pointer;border:0;color:#fff;transition:background .18s ease,transform .18s ease,box-shadow .18s ease}",
    ".cb1-btns button:hover,.cb1-enreg:hover{transform:translateY(-1px)}",
    ".cb1-btns button:active,.cb1-enreg:active{transform:scale(.98)}",
    ".cb1-btns .cb-non{background:#0E0F13}",
    ".cb1-btns .cb-non:hover{background:#2A2C33}",
    ".cb1-btns .cb-oui{background:#0055FF}",
    ".cb1-btns .cb-oui:hover{background:#0047D6}",
    ".cb1-enreg{width:100%;margin-top:10px;background:#fff;color:#0E0F13;border:1.5px solid #0E0F13}",
    ".cb1-enreg:hover{background:#F4F6FA}",
    ".cb1-perso{display:inline-block;margin:10px auto 0;border:0;background:none;padding:6px 10px;border-radius:8px;font:500 13px/1 Inter,system-ui,sans-serif;color:#5B6170;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:rgba(14,15,19,.22)}",
    ".cb1-perso:hover{color:#0E0F13;text-decoration-color:#0E0F13}",
    R + " button:focus-visible," + R + " a:focus-visible{outline:2px solid #0055FF;outline-offset:3px}",
    R + " [disabled]{cursor:default}",
    /* tiroirs Personnaliser */
    ".cb1-tiroir{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .5s " + C + ",visibility 0s .5s}",
    ".cb1-tiroir>div{overflow:hidden;min-height:0}",
    R + ".cb-reg .cb1-tiroir{grid-template-rows:1fr;visibility:visible;transition:grid-template-rows .5s " + C + ",visibility 0s}",
    ".cb1-regl{list-style:none;margin:0 0 16px;padding:0;text-align:left}",
    ".cb1-regl li{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:13px 2px;border-top:1px solid rgba(14,15,19,.09);opacity:0;transform:translateY(6px);transition:opacity .35s ease,transform .45s " + C + "}",
    ".cb1-regl li:last-child{border-bottom:1px solid rgba(14,15,19,.09)}",
    R + ".cb-reg .cb1-regl li{opacity:1;transform:none;transition-delay:.12s}",
    R + ".cb-reg .cb1-regl li+li{transition-delay:.2s}",
    ".cb1-regl b{display:block;font:600 14.5px/1.3 Inter,sans-serif;color:#0E0F13}",
    ".cb1-regl small{display:block;font-size:12.5px;line-height:1.45;color:#6B7180;margin-top:3px}",
    ".cb1-regl label{cursor:pointer}",
    ".cb1-inter{flex:none;position:relative;width:48px;height:28px;border-radius:999px;border:0;background:#D5D8DE;cursor:pointer;transition:background .25s ease;padding:0}",
    ".cb1-inter::after{content:'';position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(14,15,19,.25);transition:transform .32s cubic-bezier(.3,1.3,.5,1)}",
    ".cb1-inter[aria-checked=true]{background:#0055FF}",
    ".cb1-inter[aria-checked=true]::after{transform:translateX(20px)}",
    ".cb1-inter[aria-disabled=true]{opacity:.45;cursor:default}",
    /* téléphone */
    "@media(max-width:560px){" + R + "{padding:170px 16px 16px}.cb1-carte{padding:24px 18px 14px;border-radius:24px}" + R + " h2{font-size:22px}" + R + " p{font-size:13.5px;margin-bottom:16px}.cb1-scene{transform:scale(1.08)}.cb1-btns button,.cb1-enreg{height:50px}.cb1-regl li{padding:11px 0}}",
    "@media(max-height:620px){" + R + "{place-items:start center}}",
    /* mouvement réduit : expressions fixes, aucun déplacement */
    "@media(prefers-reduced-motion:reduce){" + R + "," + R + " *{animation:none!important;transition:none!important}}",
    "@media print{#cookies-bandeau{display:none}}"
  ].join("");

  /* ---------- Dessins ---------- */
  var COOKIE_SVG = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="cb1-pate" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#E7B676"/><stop offset=".6" stop-color="#CF9450"/><stop offset="1" stop-color="#B07434"/></radialGradient></defs>' +
    '<path d="M32 3.5c4.6 0 6.4 2.2 10.4 3.4 4.2 1.3 7.4.6 10.2 4 2.6 3.2 1.6 6.6 3.4 10.4 1.8 3.8 4.6 5.4 4.4 10.6-.2 5-3.4 6.6-4.6 10.6-1.2 4.2.2 7.4-3.2 10.4-3.4 3-6.8 1.6-10.6 3.4-3.8 1.8-5.2 4.4-10.2 4.4s-6.6-2.8-10.6-4.2c-4-1.4-7.2-.2-10.2-3.6-3-3.4-1.4-6.6-3.2-10.6C6.4 38.4 3.6 37 3.6 32s2.8-6.4 4.4-10.2C9.6 18 8.4 14.6 11.6 11.4 14.8 8.2 18.2 9.4 22 7.8c3.8-1.6 5.4-4.3 10-4.3z" fill="url(#cb1-pate)" stroke="#9A6127" stroke-opacity=".35" stroke-width="1.2"/>' +
    '<g fill="#3B2416"><path d="M19 17l6-1.6 2.4 5-4.6 3.2-4.4-2.4z"/><path d="M38 14.5l5.4.6.8 5.2-5.2 1.4-2.6-3.8z"/><path d="M44 30l5.6-.4 1.2 5.6-5 2.2-3.4-3.6z"/><path d="M26 33l5.2-1.4 2.6 4.6-3.8 3.8-4.6-2.2z"/><path d="M14 36.5l4.4.4.6 4.6-4.2.8-2-3.2z"/><path d="M34 45.5l5 .2 1.2 4.6-4.6 1.6-3-3.4z"/><path d="M21 49l3.6-.8 1.6 3.4-3 2.2-2.8-1.8z"/></g>' +
    '<g fill="#6A4128"><path d="M20.2 17.4l3.6-.9 1 2.2-2.6 1.3z"/><path d="M39 15.6l3 .4.3 2.2-2.6.4z"/><path d="M45.2 31l3-.2.5 2.4-2.6.8z"/><path d="M27.2 34l3-.8 1.1 2.2-2.4 1.2z"/></g>' +
    '<g fill="#F3CF97" opacity=".55"><circle cx="30" cy="12" r=".9"/><circle cx="50" cy="22" r=".8"/><circle cx="12" cy="27" r=".8"/><circle cx="40" cy="39" r=".9"/><circle cx="19" cy="44" r=".7"/><circle cx="48" cy="46" r=".8"/></g></svg>';

  function oeil(cx, id) {
    return '<g class="cb1-oeil"><ellipse cx="' + cx + '" cy="31" rx="6.6" ry="7.6" fill="#fff"/>' +
      '<g clip-path="url(#' + id + ')"><g class="cb1-pup"><circle cx="' + cx + '" cy="31" r="3.6" fill="#0E0F13"/>' +
      '<circle cx="' + (cx + 1.3) + '" cy="29.3" r="1.2" fill="#fff"/><circle class="b2" cx="' + (cx - 1.3) + '" cy="32.6" r=".7" fill="#fff"/></g>' +
      '<rect class="cb1-pau" x="' + (cx - 8) + '" y="22" width="16" height="9.4"/></g></g>';
  }
  var VISAGE = '<svg class="cb1-visage" viewBox="0 0 132 56" aria-hidden="true"><defs>' +
    '<clipPath id="cb1-cg"><ellipse cx="52" cy="31" rx="6.6" ry="7.6"/></clipPath><clipPath id="cb1-cd"><ellipse cx="80" cy="31" rx="6.6" ry="7.6"/></clipPath></defs>' +
    '<g transform="translate(66 37) scale(1.22) translate(-66 -34)"><g class="cb1-joues"><ellipse cx="41" cy="41.5" rx="5" ry="2.6"/><ellipse cx="91" cy="41.5" rx="5" ry="2.6"/></g>' +
    '<g class="cb1-yeux">' + oeil(52, "cb1-cg") + oeil(80, "cb1-cd") + '</g>' +
    '<g class="cb1-heureux" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M46 33 q6 -8 12 0"/><path d="M74 33 q6 -8 12 0"/></g>' +
    '<g class="cb1-sourcils" stroke="#fff" stroke-width="2.1" stroke-linecap="round"><path class="sg" d="M47 20.5 h10"/><path class="sd" d="M75 20.5 h10"/></g>' +
    '<g fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path class="cb1-m m-repos" d="M61 44.5 q5 3.6 10 0"/>' +
      '<path class="cb1-m m-inquiet" d="M59.5 46 q1.6 -1.7 3.25 0 t3.25 0 t3.25 0 t3.25 0"/>' +
      '<path class="cb1-m m-non" d="M61.5 47.5 q4.5 -3.4 9 0"/>' +
      '<path class="cb1-m m-regl" d="M62 46 q4 1.4 8.5 -1.4"/>' +
    '</g>' +
    '<g class="cb1-m m-envie"><path d="M59.5 43 h13 a6.5 5.6 0 0 1 -13 0 z" fill="#3A1018" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="66" cy="46.6" rx="3" ry="1.5" fill="#FF7A93"/></g>' +
    '<g class="cb1-m m-oui"><path d="M57.5 42 h17 a8.5 7.4 0 0 1 -17 0 z" fill="#3A1018" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><ellipse cx="66" cy="46.8" rx="4" ry="2" fill="#FF7A93"/></g>' +
    '</g></svg>';
  var PFF = '<svg class="cb1-pff" viewBox="0 0 34 22" aria-hidden="true"><g fill="#C9CDD6"><circle cx="9" cy="13" r="6"/><circle cx="18" cy="9" r="8"/><circle cx="26" cy="14" r="5.5"/></g></svg>';
  var XSVG = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M2.5 2.5l9 9M11.5 2.5l-9 9"/></svg>';

  function boite() {
    var logo = '<img src="' + LOGO + '" alt="">';
    return '<div class="cb1-scene" aria-hidden="true"><div class="cb1-monte">' + PFF + '<div class="cb1-pivot"><div class="cb1-boite">' +
      '<div class="cb1-f cb1-ar"></div><div class="cb1-f cb1-ga"></div><div class="cb1-f cb1-fd"></div>' +
      '<div class="cb1-cookie">' + COOKIE_SVG + '</div>' +
      '<div class="cb1-f cb1-dr"></div><div class="cb1-f cb1-av">' + VISAGE + '</div>' +
      '<div class="cb1-lid"><div class="cb1-f cb1-jar"></div><div class="cb1-f cb1-jga"></div><div class="cb1-f cb1-dessous"></div>' +
      '<div class="cb1-f cb1-dessus">' + logo + '<span>ONLEE.FR</span></div>' +
      '<div class="cb1-f cb1-jdr"></div><div class="cb1-f cb1-jav">' + logo + '<span>ONLEE.FR</span></div></div>' +
      '</div></div></div></div>';
  }

  /* ---------- Fenêtre ---------- */
  var styleMis = false, d = null;

  function bandeau() {
    if (d && document.body.contains(d)) { var cc = d.querySelector(".cb1-carte"); if (cc) cc.focus(); return; }
    if (!styleMis) { var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); styleMis = true; }
    var actuel = lire(), fini = false, retour = document.activeElement, inertes = [], ancienOverflow = document.documentElement.style.overflow;
    var rafId = 0, souris = null;

    d = document.createElement("div");
    d.id = "cookies-bandeau"; d.className = "cb1";
    d.setAttribute("data-humeur", "attente");
    d.setAttribute("data-mesure", actuel === "oui" ? "on" : "off");
    d.innerHTML = '<div class="cb1-carte" role="dialog" aria-modal="true" aria-labelledby="cb-titre" aria-describedby="cb-texte" tabindex="-1">' + boite() +
      '<h2 id="cb-titre">' + T.titre + '</h2>' +
      '<p id="cb-texte">' + T.texte + ' <a href="' + T.lien + '">' + T.plus + '</a></p>' +
      '<div class="cb1-tiroir" id="cb-reglages"><div><ul class="cb1-regl" aria-label="' + T.reglages + '">' +
        '<li><span><b id="cb-nec">' + T.nec + '</b><small id="cb-nec-t">' + T.necTxt + '</small></span>' +
        '<button type="button" class="cb1-inter" role="switch" aria-checked="true" aria-disabled="true" aria-labelledby="cb-nec" aria-describedby="cb-nec-t" title="' + T.toujours + '"></button></li>' +
        '<li class="cb1-li-mes"><label for="cb-inter-mes"><b id="cb-mes">' + T.mes + '</b><small id="cb-mes-t">' + T.mesTxt + '</small></label>' +
        '<button type="button" id="cb-inter-mes" class="cb1-inter" role="switch" aria-checked="' + (actuel === "oui") + '" aria-labelledby="cb-mes" aria-describedby="cb-mes-t" data-a="inter"></button></li>' +
      '</ul></div></div>' +
      '<div class="cb1-btns"><button type="button" class="cb-non" data-c="non">' + T.non + '</button><button type="button" class="cb-oui" data-c="oui">' + T.oui + '</button></div>' +
      '<div class="cb1-tiroir"><div><button type="button" class="cb1-enreg" data-c="enreg">' + T.enreg + '</button></div></div>' +
      '<button type="button" class="cb1-perso cb-perso" data-a="perso" aria-expanded="false" aria-controls="cb-reglages">' + T.perso + '</button>' +
      '<button type="button" class="cb1-x" data-c="non" aria-label="' + T.fermer + '">' + XSVG + '</button>' +
      '</div>';

    var carte = d.querySelector(".cb1-carte"), titre = d.querySelector("h2"), visage = d.querySelector(".cb1-visage");
    var bOui = d.querySelector(".cb-oui"), bNon = d.querySelector(".cb-non"), bPerso = d.querySelector(".cb1-perso");
    var inter = d.querySelector("#cb-inter-mes");
    function regl() { return d.classList.contains("cb-reg"); }
    function humeur(h) { if (!fini) d.setAttribute("data-humeur", h); }
    function repos() { humeur(regl() ? "reglages" : "attente"); }

    /* les yeux suivent la souris (et le bouton qui a le focus au clavier) */
    function regarder(x, y) {
      if (fini || CALME || !visage) return;
      var r = visage.getBoundingClientRect(), cx = r.left + r.width * .5, cy = r.top + r.height * .55;
      var dx = x - cx, dy = y - cy, dist = Math.sqrt(dx * dx + dy * dy) || 1, k = Math.min(1, dist / 140);
      d.style.setProperty("--px", (dx / dist * 2.7 * k).toFixed(2) + "px");
      d.style.setProperty("--py", (dy / dist * 2.5 * k).toFixed(2) + "px");
    }
    function bouge(ev) { souris = ev; if (!rafId) rafId = requestAnimationFrame(function () { rafId = 0; if (souris) regarder(souris.clientX, souris.clientY); }); }
    function focusIn(ev) { var r = ev.target.getBoundingClientRect && ev.target.getBoundingClientRect(); if (r) regarder(r.left + r.width / 2, r.top + r.height / 2); }

    /* fenêtre modale : le reste de la page est inerte, le focus reste dans la carte */
    function figerPage(oui) {
      if (oui) {
        [].forEach.call(document.body.children, function (el) { if (el !== d && !el.inert && el.tagName !== "SCRIPT" && el.tagName !== "STYLE" && !el.hasAttribute("data-cookies-libre")) { el.inert = true; inertes.push(el); } });
        document.documentElement.style.overflow = "hidden";
      } else {
        inertes.forEach(function (el) { el.inert = false; }); inertes = [];
        document.documentElement.style.overflow = ancienOverflow;
      }
    }
    function focusables() {
      return [].filter.call(carte.querySelectorAll("button,a[href]"), function (el) {
        return !el.disabled && el.getAttribute("aria-disabled") !== "true" && el.getClientRects().length && getComputedStyle(el).visibility !== "hidden";
      });
    }
    function clavier(ev) {
      if (ev.key === "Escape" || ev.key === "Esc") { ev.preventDefault(); choisir("non"); return; }
      if (ev.key !== "Tab") return;
      var f = focusables(); if (!f.length) { ev.preventDefault(); return; }
      var i = f.indexOf(document.activeElement);
      if (ev.shiftKey && (i <= 0)) { ev.preventDefault(); f[f.length - 1].focus(); }
      else if (!ev.shiftKey && (i === f.length - 1 || i === -1)) { ev.preventDefault(); f[0].focus(); }
    }

    function fermer(apres) {
      document.removeEventListener("keydown", clavier, true);
      document.removeEventListener("pointermove", bouge);
      if (rafId) cancelAnimationFrame(rafId);
      var fin = function () {
        if (d && d.parentNode) d.parentNode.removeChild(d); d = null;
        figerPage(false);
        if (retour && retour.focus && document.body.contains(retour)) try { retour.focus({ preventScroll: true }); } catch (_) {}
        if (apres) apres();
      };
      if (CALME) return fin();
      d.classList.add("cb-part"); setTimeout(fin, 460);
    }

    function choisir(c) {
      if (fini) return;
      var avant = lire(); ecrire(c);
      if (c === "oui") accepter();
      else { if (window.clarity && clarityCharge) window.clarity("consent", false); effacer(); }
      d.setAttribute("data-humeur", c); fini = true;
      titre.textContent = c === "oui" ? T.merci : T.boude;
      var bs = carte.querySelectorAll("button"); for (var i = 0; i < bs.length; i++) bs[i].disabled = true;
      carte.focus({ preventScroll: true });
      setTimeout(function () {
        fermer(function () { if (c !== "oui" && !DEMO && (avant === "oui" || clarityCharge || pixelCharge)) location.reload(); });
      }, CALME ? 1100 : (c === "oui" ? 1750 : 1650));
    }

    function basculer(ouvrir) {
      d.classList.toggle("cb-reg", ouvrir);
      bPerso.setAttribute("aria-expanded", String(ouvrir));
      bPerso.textContent = ouvrir ? T.masquer : T.perso;
      bOui.textContent = ouvrir ? T.toutOui : T.oui;
      bNon.textContent = ouvrir ? T.toutNon : T.non;
      repos();
      if (ouvrir) setTimeout(function () { if (d && regl()) inter.focus({ preventScroll: true }); }, CALME ? 0 : 320);
    }

    carte.addEventListener("click", function (ev) {
      var b = ev.target && ev.target.closest && ev.target.closest("[data-c],[data-a]");
      if (!b || b.disabled) return;
      var c = b.getAttribute("data-c"), a = b.getAttribute("data-a");
      if (c === "enreg") choisir(inter.getAttribute("aria-checked") === "true" ? "oui" : "non");
      else if (c) choisir(c);
      else if (a === "perso") basculer(!regl());
      else if (a === "inter") {
        var on = inter.getAttribute("aria-checked") !== "true";
        inter.setAttribute("aria-checked", String(on));
        d.setAttribute("data-mesure", on ? "on" : "off");   // elle sourit quand la mesure est activée
      }
    });
    function survol(el, h) { // la boîte réagit avant le clic
      var go = function () { if (!regl()) humeur(h); };
      el.addEventListener("mouseenter", go); el.addEventListener("focus", go);
      el.addEventListener("mouseleave", repos); el.addEventListener("blur", repos);
    }
    survol(bOui, "envie"); survol(bNon, "inquiet");

    document.addEventListener("keydown", clavier, true);
    if (!CALME) { document.addEventListener("pointermove", bouge, { passive: true }); carte.addEventListener("focusin", focusIn); }
    document.body.appendChild(d);
    figerPage(true);
    try { carte.focus({ preventScroll: true }); } catch (_) { carte.focus(); }
  }

  // Lien « Gérer les cookies » en bas de page : celui de la page s'il existe, sinon ajouté dans le pied de page.
  /* 12/11 : le script part maintenant dès le haut de la page -> le pied de page n'existe pas encore, on attend qu'il soit lu */
  function lienGerer() {
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
    lien.hidden = false; lien.textContent = T.gerer;
    lien.addEventListener("click", function (ev) { ev.preventDefault(); bandeau(); });
  }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lienGerer, { once: true }); else lienGerer();
  window.onleeCookies = { ouvrir: bandeau };

  var c = lire();
  if (c === "oui") accepter();
  else if (c !== "non") {
    /* 11/11 : la page s'affiche d'abord, la fenêtre cookies arrive ensuite (sinon voile blanc à l'arrivée sur téléphone) */
    var parti = false;
    var ouvrirTard = function () { if (parti) return; parti = true; bandeau(); };
    /* 12/11 : trop tardif sur téléphone (« les cookies mettent du temps à apparaître ») -> juste après le premier affichage,
       sans attendre les images ni la boîte 3D */
    /* le script part dès le haut de la page : on attend juste qu'une première image soit peinte (deux images d'animation), puis 0,25 s */
    var t0 = Date.now();
    (function attendre() {
      if (document.body || Date.now() - t0 > 2500) requestAnimationFrame(function () { requestAnimationFrame(function () { setTimeout(ouvrirTard, 250); }); });
      else setTimeout(attendre, 30);
    })();
    setTimeout(ouvrirTard, 2500);   // filet
  }
})();
