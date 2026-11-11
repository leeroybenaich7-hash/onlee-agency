/* =====================================================================
   LA BOÎTE ONLEE — boîte noire premium, racontée en 4 chapitres au défilement
   · fermée : grande, face à toi, se pilote à la souris (on peut l'attraper)
   · on descend : le couvercle s'ouvre, « onlee vous propose »
   · puis UN service par chapitre : son nom s'imprime sur la boîte, sa carte sort en grand
     (avec un mini aperçu), ses explications apparaissent à côté ; la carte se range à droite
   · fin : les 4 cartes s'alignent, cliquables
   OPTIMISÉE : rendu à la demande (rien ne calcule quand rien ne bouge), pas d'ombres temps réel.
   ===================================================================== */
(function(){
  var TACTILE = !!(window.matchMedia && matchMedia('(hover: none)').matches);
  var hote = document.getElementById('boite3d'), sec = document.getElementById('boite-sec'), astuce = document.getElementById('astuce-b'),
      bulle = document.getElementById('infobulle'), propose = document.getElementById('propose'),
      panneaux = [].slice.call(document.querySelectorAll('.chap')), prog = [].slice.call(document.querySelectorAll('.chap-prog i'));
  if (!hote || !sec) return;
  /* 3D impossible (pas de WebGL, rendu logiciel, appareil très faible) : image fixe + chapitres lisibles */
  function sans3d(){ sec.classList.add('sans-3d'); }
  var faible = (navigator.deviceMemory && navigator.deviceMemory < 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 3);
  if (!window.THREE || faible) { sans3d(); return; }
  try { var essai = document.createElement('canvas'), gl = essai.getContext('webgl', { failIfMajorPerformanceCaveat: true }) || essai.getContext('experimental-webgl', { failIfMajorPerformanceCaveat: true });
    if (!gl) { sans3d(); return; } var perdu = gl.getExtension('WEBGL_lose_context'); if (perdu) perdu.loseContext(); } catch (er) { sans3d(); return; }
  var minis = [].slice.call(document.querySelectorAll('.mw'));
  var invite = document.createElement('div'); invite.className = 'invite-dos';
  invite.innerHTML = '<a class="iv-voir" href="#">Voir la page<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></a><button class="iv-suite" type="button">Continuer<svg viewBox="0 0 24 24"><path d="M12 5v13M6 13l6 6 6-6"/></svg></button>';
  sec.querySelector('.colle').appendChild(invite);
  var VP = new THREE.Vector3();
  var inviteCarte = null;
  invite.querySelector('.iv-suite').addEventListener('click', function(){ if (!inviteCarte) return; var i = inviteCarte.userData.i; allerA(i < 3 ? S0 + (i + 1) * LCH + LCH * .5 : S0 + 4 * LCH + .05); });
  /* widgets en couronne autour des cartes : on clique, ça réagit */
  document.querySelectorAll('.mw-c').forEach(function(w){ w.addEventListener('click', function(e){ var act = w.dataset.act, li = e.target.closest('li,.chip');
    if (act === 'ouvre') w.classList.toggle('ouvert');
    else if (act === 'bascule'){ w.classList.toggle('on'); var et = w.querySelector('.etat'), on = w.classList.contains('on'); if (et) et.innerHTML = (on ? 'Active' : 'En pause') + '<small>' + (on ? 'Diffusion en cours' : 'Touche pour relancer') + '</small>'; }
    else if (act === 'avance'){ var n = ((+w.dataset.n || 0) + 1) % 3; w.dataset.n = n;
      if (w.classList.contains('mw-suivi')){ var ls = w.querySelectorAll('li'), k = 2 + n; ls.forEach(function(l, j){ l.className = j < k ? 'ok' : j === k ? 'cur' : ''; }); } }
    else if (act === 'coche' && li) li.classList.toggle('fait');
    else if (act === 'choix' && li){ w.querySelectorAll('.chip').forEach(function(c){ c.classList.toggle('pris', c === li); }); w.classList.add('ok'); }
    else if (act === 'envoie') w.classList.toggle('envoye');
    else if (act === 'signe') w.classList.toggle('signe');
    else if (act === 'aime') w.classList.toggle('aime');
    else if (act === 'cherche') taper(w); }); });
  function taper(w){ var t = w.querySelector('.g-txt'), phrases = ['boulangerie près de moi', 'réserver coiffeur paris', 'opticien ouvert samedi'], ph = phrases[(+w.dataset.k || 0) % phrases.length], k = 0;
    w.dataset.k = (+w.dataset.k || 0) + 1; w.classList.remove('trouve'); t.textContent = '';
    (function lettre(){ if (k <= ph.length){ t.textContent = ph.slice(0, k++); setTimeout(lettre, 45); } else setTimeout(function(){ w.classList.add('trouve'); }, 250); })(); }
  var gw = document.querySelector('.mw-google'); if (gw) new MutationObserver(function(){ if (gw.closest('.mw').classList.contains('on') && !gw.dataset.fait){ gw.dataset.fait = 1; taper(gw); } }).observe(gw.closest('.mw'), { attributes: true, attributeFilter: ['class'] });
  var reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  var rendu; try { rendu = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (er) { sans3d(); return; }
  /* même rendu que sur ordinateur : lissage + résolution x2 (plafond pour ne pas faire chauffer les écrans x3) */
  rendu.setPixelRatio(Math.min(2, devicePixelRatio || 1)); rendu.outputEncoding = THREE.sRGBEncoding; rendu.toneMapping = THREE.NoToneMapping;
  hote.appendChild(rendu.domElement);
  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, 1, .1, 80);
  var lin = function(hex){ return new THREE.Color(hex).convertSRGBToLinear(); };
  var ANISO = rendu.capabilities.getMaxAnisotropy();

  /* studio : grands panneaux lumineux pour que le noir et le logo brillant prennent la lumière */
  (function(){ var pm = new THREE.PMREMGenerator(rendu), st = new THREE.Scene();
    st.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x6d7586, side: THREE.BackSide })));
    [[0, 12, 0, 16, 9, -Math.PI / 2, 0, 0xffffff], [-12, 5, 5, 7, 13, 0, Math.PI / 2, 0xffffff], [12, 5, 0, 3, 12, 0, -Math.PI / 2, 0xdfe8ff], [0, 3, -13, 18, 2.5, 0, 0, 0xffffff], [0, 6, 13, 10, 3, 0, Math.PI, 0xffffff]]
      .forEach(function(a){ var m = new THREE.Mesh(new THREE.PlaneGeometry(a[3], a[4]), new THREE.MeshBasicMaterial({ color: a[7], side: THREE.DoubleSide })); m.position.set(a[0], a[1], a[2]); m.rotation.x = a[5]; m.rotation.y = a[6]; st.add(m); });
    scene.environment = pm.fromScene(st, .03).texture; pm.dispose(); })();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7a8294, .28));
  var cle = new THREE.DirectionalLight(0xffffff, 1.15); cle.position.set(-4, 7, 6); scene.add(cle);
  var rim = new THREE.DirectionalLight(0xe4ecff, 1.1); rim.position.set(6, 4, -6); scene.add(rim);
  var eclat = new THREE.PointLight(0x5c8dff, 0, 7, 2); scene.add(eclat);

  var TITRE = '"Bricolage Grotesque", Inter, sans-serif', TEXTE = 'Inter, -apple-system, sans-serif';
  var logoImg = new Image(); logoImg.src = '/assets/onlee-logo-ink.png';
  function logoCouleur(c){ var cv = document.createElement('canvas'); cv.width = logoImg.naturalWidth || 10; cv.height = logoImg.naturalHeight || 10; var x = cv.getContext('2d');
    if (logoImg.naturalWidth){ x.drawImage(logoImg, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = c; x.fillRect(0, 0, cv.width, cv.height); } return cv; }
  function logo(x, c, X, Y, h){ if (!logoImg.naturalWidth) return 0; var w = h * logoImg.naturalWidth / logoImg.naturalHeight; x.drawImage(logoCouleur(c), X, Y, w, h); return w; }
  function toile(dessin, w, h){ var c = document.createElement('canvas'); c.width = w; c.height = h; dessin(c.getContext('2d'), w, h); return c; }
  function tex(c){ var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = ANISO; return t; }
  function arrondi(x, X, Y, w, h, r){ x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function bloc(x, X, Y, w, h, r, c){ x.fillStyle = c; arrondi(x, X, Y, w, h, r); x.fill(); }
  function espace(x, v){ try { x.letterSpacing = v; } catch(e){} }
  function texte(x, s, X, Y, taille, poids, c, police, esp){ x.fillStyle = c; x.font = poids + ' ' + Math.round(taille) + 'px ' + (police || TEXTE); espace(x, esp || '0px'); x.fillText(s, X, Y); espace(x, '0px'); }

  /* vrais logos */
  var LOGO_SVG = {
    fb:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#0866FF"/><path d="M56 100V62h12l2-14H56v-9c0-4 1-7 7-7h7V20c-1 0-5-1-10-1-11 0-18 6-18 18v11H30v14h12v38z" fill="#fff"/></svg>',
    ig:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx=".3" cy="1.07" r="1.25"><stop offset="0" stop-color="#FFD776"/><stop offset=".3" stop-color="#F3772C"/><stop offset=".6" stop-color="#E1306C"/><stop offset="1" stop-color="#7B3FD3"/></radialGradient></defs><rect width="100" height="100" rx="24" fill="url(#g)"/><rect x="24" y="24" width="52" height="52" rx="15" fill="none" stroke="#fff" stroke-width="7"/><circle cx="50" cy="50" r="12" fill="none" stroke="#fff" stroke-width="7"/><circle cx="66" cy="34" r="4" fill="#fff"/></svg>',
    meta:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 100"><defs><linearGradient id="m" x1="0" x2="1"><stop offset="0" stop-color="#0064E1"/><stop offset="1" stop-color="#0082FB"/></linearGradient></defs><path d="M14 52c0-15 8-26 19-26 10 0 16 9 24 22l10 16c7 11 12 17 20 17 10 0 16-11 16-27S97 26 87 26c-8 0-13 6-20 18l-10 16c-8 13-14 21-24 21-11 0-19-11-19-29z" fill="none" stroke="url(#m)" stroke-width="11" stroke-linecap="round"/></svg>',
    google:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M95 51c0-3-.3-6.5-.8-9.5H50v18h25c-1 6-4.5 11-9.5 14.5v12h15.5C90 77.5 95 65.5 95 51z" fill="#4285F4"/><path d="M50 97c13 0 24-4.3 32-11.5L66.5 73.5C62 76.5 56.5 78.5 50 78.5c-12.5 0-23-8.5-27-20H7v12.5C15 86.5 31 97 50 97z" fill="#34A853"/><path d="M23 58.5c-1-3-1.5-6-1.5-9s.5-6 1.5-9V28H7C4 34.5 2 41.5 2 49.5S4 64.5 7 71z" fill="#FBBC05"/><path d="M50 20.5c7 0 13.5 2.5 18.5 7.5l14-14C74 6 63 2 50 2 31 2 15 12.5 7 28l16 12.5c4-11.5 14.5-20 27-20z" fill="#EA4335"/></svg>',
    excel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#107C41"/><rect x="52" y="22" width="30" height="56" rx="4" fill="#21A366"/><path d="M52 36h30M52 50h30M52 64h30" stroke="#107C41" stroke-width="3"/><rect x="16" y="26" width="44" height="48" rx="5" fill="#185C37"/><path d="M26 37h8l4 8 4-8h8l-8 13 8 13h-8l-4-8-4 8h-8l8-13z" fill="#fff"/></svg>',
    agenda: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff"/><rect x="17" y="17" width="66" height="66" rx="9" fill="#fff" stroke="#4285F4" stroke-width="7"/><path d="M17 26a9 9 0 0 1 9-9h48a9 9 0 0 1 9 9v8H17z" fill="#4285F4"/><text x="50" y="72" text-anchor="middle" font-family="Arial,Helvetica" font-weight="700" font-size="32" fill="#1967D2">31</text></svg>',
    gmail: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#fff"/><path d="M20 74V34l30 22 30-22v40H68V50L50 63 32 50v24z" fill="#EA4335"/><path d="M20 34v40h12V43z" fill="#4285F4"/><path d="M68 43v31h12V34z" fill="#34A853"/><path d="M68 43l12-9v-4c0-5-6-8-10-5l-2 2z" fill="#FBBC04"/><path d="M32 43L20 34v-4c0-5 6-8 10-5l2 2z" fill="#C5221F"/></svg>',
    vizor: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#4C3175"/><path d="M30 30l20 40 20-40" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    audiovizor: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#0A6E8A"/><path d="M38 66c-6 0-8-5-8-10 0-14 9-26 22-26 11 0 18 8 18 18 0 9-6 12-10 16-3 3-3 8-9 8" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="48" r="5" fill="#fff"/></svg>',
    wa:  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#25D366"/><path d="M50 20a29 29 0 0 0-25 44l-4 15 15-4a29 29 0 1 0 14-55z" fill="#fff"/><path d="M39 35c1-1 1-1 2-1h2c1 0 1 0 2 1l3 6v2l-2 2c0 1 0 1 0 2 3 5 6 8 11 10 1 0 1 0 2-1l2-3c1-1 1-1 2 0l6 3c1 0 1 1 1 1 0 2-1 4-3 6-2 1-5 2-8 1-8-3-15-9-19-17-2-4-2-8 0-12z" fill="#25D366"/></svg>'
  };
  var LOGOS = {}, logosPrets = Promise.all(Object.keys(LOGO_SVG).map(function(k){ return new Promise(function(r){ var im = new Image(); im.onload = r; im.onerror = r; im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG[k]); LOGOS[k] = im; }); }));
  function pastilles(x, liste, droite, Y, t){ var pad = t * .2, gap = t * .22, cx = droite;
    for (var i = liste.length - 1; i >= 0; i--){ var im = LOGOS[liste[i]], ratio = im && im.naturalWidth ? im.naturalWidth / im.naturalHeight : 1, lw = t * ratio, bw = lw + pad * 2, bh = t + pad * 2;
      cx -= bw; bloc(x, cx, Y, bw, bh, bh * .24, '#ffffff'); if (im && im.naturalWidth) x.drawImage(im, cx + pad, Y + pad, lw, t); cx -= gap; } return cx; }

  /* ---------- la boîte : base + couvercle, arêtes vives ---------- */
  var W = 3.8, D = 2.4, H = 1.36, HL = .48, E = .04, J = .03;
  function rr(w, d, r){ var s = new THREE.Shape(), x = -w / 2, y = -d / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.lineTo(x + w, y + r); s.lineTo(x + w, y + d - r);
    s.lineTo(x + w - r, y + d); s.lineTo(x + r, y + d); s.lineTo(x, y + d - r); s.lineTo(x, y + r); s.closePath(); return s; }
  function extru(shape, haut){ var g = new THREE.ExtrudeGeometry(shape, { depth: haut, bevelEnabled: true, bevelThickness: .006, bevelSize: .006, bevelSegments: 2, curveSegments: 1 }); g.rotateX(-Math.PI / 2); return g; }
  function anneau(w, d, ep, haut){ var s = rr(w, d, .01); s.holes.push(rr(w - 2 * ep, d - 2 * ep, .005)); return extru(s, haut); }
  function mat(hex, rough, env){ return new THREE.MeshStandardMaterial({ color: lin(hex), roughness: rough, metalness: 0, envMapIntensity: env == null ? .6 : env }); }
  var matBase = mat(0x0a0a0b, .58), matCouv = mat(0x0c0c0e, .46, .7), matInt = mat(0x0055ff, .78, .3), matIntC = mat(0x0b0b0c, .9, .2), matLiseré = mat(0x0055ff, .4, .5);
  var racine = new THREE.Group(), pivot = new THREE.Group(), tourne = new THREE.Group(); scene.add(racine); racine.add(pivot); pivot.add(tourne);
  var base = new THREE.Group(); tourne.add(base);
  base.add(new THREE.Mesh(anneau(W, D, E, H - .01), matBase));
  base.add(new THREE.Mesh(extru(rr(W, D, .01), E), matBase));
  var interieur = new THREE.Mesh(anneau(W - 2 * E + .002, D - 2 * E + .002, .004, H - .03), matInt); interieur.position.y = .01; base.add(interieur);
  var fondInt = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * E, D - 2 * E), matInt); fondInt.rotation.x = -Math.PI / 2; fondInt.position.y = E + .012; base.add(fondInt);
  var soie = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * E - .08, D - 2 * E - .08, 44, 28), new THREE.MeshStandardMaterial({ color: lin(0xf4f5f7), roughness: .95, side: THREE.DoubleSide, envMapIntensity: .35 }));
  (function(){ var pa = soie.geometry.attributes.position, hw = (W - 2 * E - .08) / 2, hh = (D - 2 * E - .08) / 2;
    for (var i = 0; i < pa.count; i++){ var x = pa.getX(i), y = pa.getY(i), f = Math.max(Math.abs(x) / hw, Math.abs(y) / hh), bord = Math.max(0, (f - .78) / .22);
      pa.setZ(i, Math.sin(x * 5.5) * .03 + Math.cos(y * 6.5 + x) * .025 + bord * bord * (H * .62) + Math.sin(x * 9 + y * 4) * .04 * bord); }
    soie.geometry.computeVertexNormals(); })();
  soie.rotation.x = -Math.PI / 2; soie.position.y = E + .03; soie.visible = false; base.add(soie);
  var couv = new THREE.Group(), CW = W + 2 * J, CD = D + 2 * J, Y_COUV = H - HL + .02; couv.position.y = Y_COUV; tourne.add(couv);
  couv.add(new THREE.Mesh(anneau(CW, CD, E, HL), matCouv));
  var dessus = new THREE.Mesh(extru(rr(CW, CD, .01), E), matCouv); dessus.position.y = HL - E; couv.add(dessus);
  var dessous = new THREE.Mesh(new THREE.PlaneGeometry(CW - 2 * E, CD - 2 * E), matIntC); dessous.rotation.x = Math.PI / 2; dessous.position.y = HL - E - .004; couv.add(dessous);
  var lisere = new THREE.Mesh(anneau(CW + .006, CD + .006, .006, .03), matLiseré); lisere.position.y = .004; couv.add(lisere);

  /* ombre douce peinte */
  var ombre = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.8, D * 2.2), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false,
    map: tex(toile(function(x, w, h){ var g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, 'rgba(10,12,20,.45)'); g.addColorStop(.45, 'rgba(10,12,20,.2)'); g.addColorStop(1, 'rgba(10,12,20,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 256, 256)) }));
  ombre.rotation.x = -Math.PI / 2; ombre.position.y = .002; racine.add(ombre);

  /* impressions */
  function decal(w, h){ return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ transparent: true, roughness: .45, polygonOffset: true, polygonOffsetFactor: -2, envMapIntensity: .4 })); }
  var hB = Y_COUV;
  var imAvB = decal(W - .02, hB - .02); imAvB.position.set(0, hB / 2, D / 2 + .006); base.add(imAvB);
  var imDrB = decal(D - .02, hB - .02); imDrB.position.set(W / 2 + .006, hB / 2, 0); imDrB.rotation.y = Math.PI / 2; base.add(imDrB);
  var imGaB = decal(D - .02, hB - .02); imGaB.position.set(-W / 2 - .006, hB / 2, 0); imGaB.rotation.y = -Math.PI / 2; base.add(imGaB);
  var imAvC = decal(CW - .02, HL - .02); imAvC.position.set(0, HL / 2 + .015, CD / 2 + .006); couv.add(imAvC);
  var imCoC = decal(CD - .02, HL - .02); imCoC.position.set(CW / 2 + .006, HL / 2 + .015, 0); imCoC.rotation.y = Math.PI / 2; couv.add(imCoC);
  var imCoC2 = decal(CD - .02, HL - .02); imCoC2.position.set(-CW / 2 - .006, HL / 2 + .015, 0); imCoC2.rotation.y = -Math.PI / 2; couv.add(imCoC2);
  var imDes = decal(CW - .04, CD - .04); imDes.rotation.x = -Math.PI / 2; imDes.position.y = HL + .006; couv.add(imDes);
  /* logo brillant noir sur noir (vernis sélectif) sur le couvercle */
  var vernis = new THREE.Mesh(new THREE.PlaneGeometry(CW * .5, CW * .5 * .36), new THREE.MeshStandardMaterial({ color: lin(0x050506), roughness: .08, metalness: 0, envMapIntensity: 1.6, transparent: true, polygonOffset: true, polygonOffsetFactor: -3 }));
  vernis.rotation.x = -Math.PI / 2; vernis.position.set(0, HL + .008, -.12); couv.add(vernis);

  var SERVICES = [
    { nom:'Logiciels sur mesure', sous:'CRM · APPLIS · PORTAILS · IA', logos:['wa'], ref:'LOG-01' },
    { nom:'Gestion des pubs', sous:'FACEBOOK · INSTAGRAM', logos:['meta','fb','ig'], ref:'ADS-02' },
    { nom:'Sites internet et SEO', sous:'SITES · RÉFÉRENCEMENT GOOGLE', logos:['google'], ref:'WEB-03' },
    { nom:'Vizor et AudioVizor', sous:'OPTICIENS · AUDIOPROTHÉSISTES', logos:[], ref:'VIZ-04' }
  ];
  var PX = 900, BLEU = '#3D7BFF', impression = -2;
  function poser(mesh, c){ var m = mesh.material; if (m.map) m.map.dispose(); m.map = tex(c); m.needsUpdate = true; }
  /* i = -1 : impression « marque » (boîte fermée) ; 0..3 : le service du chapitre */
  function imprimer(i){ if (i === impression) return; impression = i; var th = SERVICES[i];
    var wB = Math.round((W - .02) * PX), hBp = Math.round((hB - .02) * PX);
    poser(imAvB, toile(function(x, w, h){
      if (!th){ logo(x, '#ffffff', w * .045, h * .25, h * .42);
        x.textAlign = 'right'; texte(x, 'LOGICIELS · PUBS · SITES', w * .955, h * .42, h * .075, 600, 'rgba(255,255,255,.6)', TEXTE, Math.round(h * .02) + 'px'); x.textAlign = 'left';
        pastilles(x, ['wa', 'meta', 'fb', 'ig', 'google'], w * .955, h * .52, h * .13); return; }
      x.fillStyle = BLEU; x.fillRect(w * .047, h * .2, h * .12, h * .022);
      texte(x, '0' + (i + 1) + ' / 04', w * .047 + h * .17, h * .235, h * .065, 600, 'rgba(255,255,255,.55)', TEXTE, Math.round(h * .01) + 'px');
      texte(x, th.nom, w * .045, h * .56, h * .3, 700, '#ffffff', TITRE, '-' + Math.round(h * .006) + 'px');
      texte(x, th.sous, w * .047, h * .78, h * .075, 600, 'rgba(255,255,255,.55)', TEXTE, Math.round(h * .022) + 'px');
      if (th.logos.length) pastilles(x, th.logos, w * .955, h * .42, h * .19);
      else logo(x, '#ffffff', w * .955 - h * .19 * 2.9, h * .44, h * .19); }, wB, hBp));
    poser(imDrB, toile(function(x, w, h){
      var lw = w * .54, lh = h * .64, lx = w * .4, ly = h * .18; bloc(x, lx, ly, lw, lh, h * .01, '#f4f4f2');
      texte(x, 'ONLEE', lx + lw * .07, ly + lh * .22, lh * .13, 700, '#0d0e12');
      texte(x, th ? th.nom.toUpperCase() : 'LOGICIELS · PUBS · SITES', lx + lw * .07, ly + lh * .38, lh * .08, 600, '#0d0e12');
      texte(x, 'RÉF. ' + (th ? th.ref : 'ONL-00') + '  ·  SUR MESURE', lx + lw * .07, ly + lh * .52, lh * .075, 500, 'rgba(13,14,18,.55)');
      for (var k = 0, bx = lx + lw * .07; bx < lx + lw * .9; k++){ var bw = (k * 7 % 5 === 0 ? 3 : k % 3 === 0 ? 2 : 1) * lh * .009; x.fillStyle = '#0d0e12'; x.fillRect(bx, ly + lh * .64, bw, lh * .22); bx += bw + lh * .011; }
      logo(x, '#ffffff', w * .06, h * .41, h * .17); }, Math.round((D - .02) * PX), hBp));
  }
  function imprimerFixe(){
    poser(imGaB, toile(function(x, w, h){ var lh = h * .36, lw = logoImg.naturalWidth ? lh * logoImg.naturalWidth / logoImg.naturalHeight : 0; logo(x, '#ffffff', (w - lw) / 2, (h - lh) / 2, lh); }, Math.round((D - .02) * PX), Math.round((hB - .02) * PX)));
    var wC = Math.round((CW - .02) * PX), hC = Math.round((HL - .02) * PX);
    poser(imAvC, toile(function(x, w, h){ logo(x, '#ffffff', w * .045, h * .25, h * .5);
      x.textAlign = 'right'; texte(x, 'ONLEE.FR', w * .955, h * .64, h * .36, 700, '#ffffff', TEXTE, Math.round(h * .05) + 'px'); }, wC, hC));
    [imCoC, imCoC2].forEach(function(mm){ poser(mm, toile(function(x, w, h){ x.textAlign = 'center'; texte(x, 'ONLEE.FR', w / 2, h * .62, h * .3, 700, '#ffffff', TEXTE, Math.round(h * .05) + 'px'); }, Math.round((CD - .02) * PX), hC)); });
    poser(imDes, toile(function(x, w, h){ x.fillStyle = BLEU; x.fillRect(w * .47, h * .7, w * .06, h * .008);
      x.textAlign = 'center'; texte(x, 'ONLEE.FR', w / 2, h * .82, h * .05, 600, 'rgba(255,255,255,.75)', TEXTE, Math.round(h * .018) + 'px'); }, Math.round((CW - .04) * 600), Math.round((CD - .04) * 600)));
    var cv = toile(function(x, w, h){ var lw = logoImg.naturalWidth ? h * logoImg.naturalWidth / logoImg.naturalHeight : 0; logo(x, '#ffffff', (w - lw) / 2, 0, h); }, 1400, 504);
    var t = new THREE.CanvasTexture(cv); t.anisotropy = ANISO; vernis.material.alphaMap = t; vernis.material.needsUpdate = true;
  }

  /* ---------- les 4 cartes, avec un mini aperçu de chaque service ---------- */
  var CARTES = [
    { t:'Logiciels', t2:'sur mesure', s:'CRM, applis, portails, IA', f:'#0055FF', c:'#ffffff', logos:['wa'], lien:'/logiciels/', apercu:'crm' },
    { t:'Gestion', t2:'des pubs', s:'Facebook et Instagram', f:'#ffffff', c:'#0d0e12', logos:['meta','fb','ig'], lien:'/publicites/', apercu:'pub' },
    { t:'Sites internet', t2:'et SEO', s:'Rapides et trouvés sur Google', f:'#F1F3F7', c:'#0d0e12', logos:['google'], lien:'/sites/', apercu:'site' },
    { t:'Vizor et', t2:'AudioVizor', s:'Nos logiciels métier', f:'#0d0e12', c:'#ffffff', logos:[], lien:'/vizor/?metier=opticien', apercu:'vizor' }
  ];
  var APERCUS = {
    crm: function(x, X, Y, w, h){ bloc(x, X, Y, w, h, w * .04, '#ffffff'); var u = w / 100;
      [0, 1, 2].forEach(function(k){ x.fillStyle = ['#FF5F57', '#FEBC2E', '#28C840'][k]; x.beginPath(); x.arc(X + 5 * u + k * 4 * u, Y + 5 * u, 1.3 * u, 0, 7); x.fill(); });
      bloc(x, X + 3 * u, Y + 10 * u, 22 * u, h - 13 * u, 2 * u, '#F2F4F8');
      ['Prospects', 'Devis', 'Relances', 'Agenda'].forEach(function(s, k){ if (!k) bloc(x, X + 4.5 * u, Y + 12 * u, 19 * u, 6 * u, 1.5 * u, '#E3EBFF'); texte(x, s, X + 6.5 * u, Y + 16.2 * u + k * 8 * u, 2.9 * u, k ? 500 : 700, k ? '#5b6170' : '#0055FF'); });
      texte(x, 'Prospects', X + 29 * u, Y + 16 * u, 4.2 * u, 700, '#0d0e12', TITRE);
      var L = [['Martin Optique', 'Signé', '#1FA855', '#E3F7EA'], ['Boulangerie Léa', 'Devis', '#0055FF', '#E3EBFF'], ['Garage Nova', 'À rappeler', '#C77700', '#FFF1DB'], ['Studio K', 'Nouveau', '#5b6170', '#EEF0F4']];
      L.forEach(function(r, k){ var ry = Y + 22 * u + k * 10.5 * u; if (ry + 8 * u > Y + h) return; x.fillStyle = '#EEF0F4'; x.fillRect(X + 29 * u, ry - 3 * u, w - 32 * u, .25 * u);
        x.fillStyle = ['#0055FF', '#7B3FD3', '#F3772C', '#1FA855'][k]; x.beginPath(); x.arc(X + 32 * u, ry + 2.5 * u, 2.6 * u, 0, 7); x.fill();
        texte(x, r[0], X + 37 * u, ry + 3.6 * u, 3.1 * u, 600, '#0d0e12'); x.font = '700 ' + Math.round(2.6 * u) + 'px ' + TEXTE; var pw = x.measureText(r[1]).width + 4 * u;
        bloc(x, X + w - 3 * u - pw, ry - .5 * u, pw, 6 * u, 3 * u, r[3]); texte(x, r[1], X + w - 1 * u - pw, ry + 3.4 * u, 2.6 * u, 700, r[2]); }); },
    pub: function(x, X, Y, w, h){ var u = w / 100; bloc(x, X, Y, w, h, w * .04, '#ffffff'); x.strokeStyle = 'rgba(13,14,18,.1)'; x.lineWidth = .4 * u; arrondi(x, X, Y, w, h, w * .04); x.stroke();
      x.fillStyle = '#0055FF'; x.beginPath(); x.arc(X + 7 * u, Y + 7 * u, 3.4 * u, 0, 7); x.fill(); logo(x, '#ffffff', X + 4.6 * u, Y + 5.6 * u, 2.6 * u);
      texte(x, 'onlee', X + 12.5 * u, Y + 6.6 * u, 3.2 * u, 700, '#0d0e12'); texte(x, 'Sponsorisé', X + 12.5 * u, Y + 10.4 * u, 2.6 * u, 500, '#7a8090');
      var iy = Y + 14 * u, ih = h - 30 * u, g = x.createLinearGradient(X, iy, X + w, iy + ih); g.addColorStop(0, '#0B1430'); g.addColorStop(1, '#0055FF'); x.fillStyle = g; x.fillRect(X, iy, w, ih);
      texte(x, 'Ton offre,', X + 7 * u, iy + ih * .45, 7 * u, 700, '#ffffff', TITRE); texte(x, 'au bon public.', X + 7 * u, iy + ih * .45 + 8 * u, 7 * u, 700, '#9DBBFF', TITRE);
      bloc(x, X + 4 * u, Y + h - 12 * u, w - 8 * u, 8 * u, 2 * u, '#EEF2FF'); texte(x, 'En savoir plus', X + 7 * u, Y + h - 6.8 * u, 3 * u, 700, '#0055FF'); texte(x, '›', X + w - 9 * u, Y + h - 6.6 * u, 3.6 * u, 700, '#0055FF'); },
    site: function(x, X, Y, w, h){ var u = w / 100; bloc(x, X, Y, w, h, w * .04, '#ffffff'); x.strokeStyle = 'rgba(13,14,18,.08)'; x.lineWidth = .4 * u; arrondi(x, X, Y, w, h, w * .04); x.stroke();
      [0, 1, 2].forEach(function(k){ x.fillStyle = ['#FF5F57', '#FEBC2E', '#28C840'][k]; x.beginPath(); x.arc(X + 5 * u + k * 4 * u, Y + 5 * u, 1.3 * u, 0, 7); x.fill(); });
      bloc(x, X + 20 * u, Y + 2.4 * u, w - 26 * u, 5.4 * u, 2.7 * u, '#F1F3F7'); texte(x, 'ton-commerce.fr', X + 24 * u, Y + 6.1 * u, 2.6 * u, 500, '#5b6170');
      texte(x, 'Bienvenue chez', X + 6 * u, Y + 20 * u, 5.4 * u, 700, '#0d0e12', TITRE); texte(x, 'ton commerce', X + 6 * u, Y + 26.5 * u, 5.4 * u, 700, '#0055FF', TITRE);
      x.fillStyle = '#c9ced8'; x.fillRect(X + 6 * u, Y + 31 * u, 34 * u, 1.3 * u); x.fillRect(X + 6 * u, Y + 34 * u, 26 * u, 1.3 * u);
      bloc(x, X + 6 * u, Y + 38 * u, 20 * u, 6 * u, 3 * u, '#0d0e12'); texte(x, 'Réserver', X + 9.5 * u, Y + 42 * u, 2.6 * u, 700, '#ffffff');
      var g = x.createLinearGradient(X + 52 * u, Y + 12 * u, X + 94 * u, Y + 46 * u); g.addColorStop(0, '#DDE6FF'); g.addColorStop(1, '#9DBBFF'); bloc(x, X + 52 * u, Y + 12 * u, 42 * u, 34 * u, 3 * u, g);
      [0, 1, 2].forEach(function(k){ var bx = X + 6 * u + k * 30 * u; if (Y + 50 * u + 14 * u < Y + h) { bloc(x, bx, Y + 51 * u, 26 * u, Math.min(14 * u, h - 53 * u), 2 * u, '#F1F3F7'); x.fillStyle = '#c9ced8'; x.fillRect(bx + 3 * u, Y + 55 * u, 14 * u, 1.3 * u); } }); },
    vizor: function(x, X, Y, w, h){ var u = w / 100; bloc(x, X, Y, w, h, w * .04, '#16181e');
      texte(x, 'VIZOR', X + 5 * u, Y + 8 * u, 3.2 * u, 800, '#ffffff', TEXTE, Math.round(.8 * u) + 'px'); texte(x, 'Tiers payant', X + 22 * u, Y + 8 * u, 3 * u, 500, 'rgba(255,255,255,.5)');
      var hs = [38, 52, 44, 66, 58, 80, 72], bw = (w - 14 * u) / 7; hs.forEach(function(v, k){ var bh = v / 100 * 22 * u, g = x.createLinearGradient(0, Y + 36 * u - bh, 0, Y + 36 * u); g.addColorStop(0, '#5B8CFF'); g.addColorStop(1, '#0055FF');
        bloc(x, X + 5 * u + k * bw + bw * .18, Y + 36 * u - bh, bw * .64, bh, 1 * u, g); });
      [['Dossier 2481', 'Payé', '#34C759'], ['Dossier 2480', 'Relancé', '#FF9F0A'], ['Dossier 2479', 'En attente', '#8a90a0']].forEach(function(r, k){ var ry = Y + 42 * u + k * 8.6 * u; if (ry + 6 * u > Y + h) return;
        x.fillStyle = 'rgba(255,255,255,.06)'; x.fillRect(X + 5 * u, ry - 3.6 * u, w - 10 * u, .25 * u); texte(x, r[0], X + 5 * u, ry + 2 * u, 3 * u, 600, '#ffffff');
        x.fillStyle = r[2]; x.beginPath(); x.arc(X + w - 24 * u, ry + 1 * u, 1.2 * u, 0, 7); x.fill(); texte(x, r[1], X + w - 21.5 * u, ry + 2 * u, 2.8 * u, 600, r[2]); }); }
  };
  var CL = 2.3, CHt = 3.05, cartes = [];
  function toileCarte(o, i, sansFond){ return toile(function(x, w, h){ var r = w * .028; x.save(); arrondi(x, 2, 2, w - 4, h - 4, r); x.clip(); if (!sansFond){ x.fillStyle = o.f; x.fillRect(0, 0, w, h); }
      var clair = o.c !== '#ffffff';
      texte(x, '0' + (i + 1), w * .08, h * .085, w * .045, 700, clair ? '#0055FF' : 'rgba(255,255,255,.7)', TEXTE, Math.round(w * .004) + 'px');
      if (o.logos.length) pastilles(x, o.logos, w * .92, h * .045, w * .07); else logo(x, o.c, w * .92 - w * .07 * 2.9, h * .052, w * .07);
      APERCUS[o.apercu](x, w * .08, h * .135, w * .84, h * .47);
      texte(x, o.t, w * .08, h * .735, w * .118, 700, o.c, TITRE, '-' + Math.round(w * .003) + 'px'); texte(x, o.t2, w * .08, h * .735 + w * .128, w * .118, 700, o.c, TITRE, '-' + Math.round(w * .003) + 'px');
      x.globalAlpha = .62; texte(x, o.s, w * .085, h * .935, w * .04, 500, o.c); x.globalAlpha = 1; x.restore();
      if (!sansFond && (o.f === '#ffffff' || o.f === '#F1F3F7')){ x.strokeStyle = 'rgba(14,15,19,.12)'; x.lineWidth = 3; arrondi(x, 2, 2, w - 4, h - 4, r); x.stroke(); } }, 1200, Math.round(1200 * CHt / CL)); }
  /* la pile : les 4 cartes rangées à plat dans la boîte (la carte 01 dessus) */
  var pile = CARTES.map(function(o, i){ var g = new THREE.Mesh(new THREE.BoxGeometry(CL, CHt, .018), [0, 0, 0, 0, 0, 0].map(function(){ return null; }));
    var cote = new THREE.MeshStandardMaterial({ color: lin(0xf2f2f0), roughness: .8 }), face = new THREE.MeshStandardMaterial({ roughness: .55, envMapIntensity: .4 });
    g.material = [cote, cote, cote, cote, face, cote]; var s = .9; g.scale.set(s, s, 1);
    g.rotation.set(-Math.PI / 2, 0, Math.PI / 2 + [.02, -.035, .04, -.015][i]); g.position.set([.04, -.06, .05, -.03][i], E + .05 + (3 - i) * .028, [.02, -.04, .04, 0][i]);
    base.add(g); return g; });
  var STYLE = 'ecran', RANG = 'haut', SITE = 'ambre';   /* style validé : cartes « Écran » */
  var SITES = { ambre: ['#F9AB00', '#0E0F13'], corail: ['#FF5A36', '#ffffff'], turquoise: ['#0A9396', '#ffffff'] };
  var ATELIER = { affiche: 1, ecran: 2, telephone: 3 }, LOGOS_AT = null;
  var logosAtelier = window.CARTES_V ? Promise.all([window.CARTES_V.chargerLogos('/assets/onlee-logo-ink.png'), window.CARTES_V.polices()]).then(function(r){ LOGOS_AT = r[0]; }) : Promise.resolve();
  function couleurs(){ return [{ f:'#0E0F13', c:'#ffffff' }, { f:'#0866FF', c:'#ffffff' }, { f:SITES[SITE][0], c:SITES[SITE][1] }, { f:'#4C3175', c:'#ffffff' }]; }
  var METAUX = [
    { st:['#4a2812', '#9a5a2c', '#e3a979', '#8a4f27', '#d0915a', '#5a3218'], c:'#ffffff', rough:.34, metal:1 },
    { st:['#7d848d', '#e6eaee', '#aab2bc', '#fbfcfd', '#8e96a0'], c:'#141920', rough:.26, metal:1 },
    { st:['#7a560c', '#e2b93f', '#b8891a', '#fbe6a0', '#9c7215'], c:'#2a1d02', rough:.24, metal:1 },
    { diamant:true, c:'#0b2433', rough:.05, metal:.55 }
  ];
  function toileMetal(M){ return toile(function(x, w, h){ var r = w * .028; x.save(); arrondi(x, 2, 2, w - 4, h - 4, r); x.clip();
      if (M.diamant){ x.fillStyle = '#e4edf5'; x.fillRect(0, 0, w, h);
        var cx = w * .5, cy = h * .4, N = 32, rIn = w * .2, rMid = w * .52, R = Math.hypot(w, h);
        for (var k = 0; k < N; k++){ var a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
          function P(a, r){ return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }
          var f = [[[cx, cy], P(a0, rIn), P(a1, rIn)], [P(a0, rIn), P(a0, rMid), P(am, rMid), P(a1, rIn)], [P(a1, rIn), P(am, rMid), P(a1, rMid)], [P(a0, rMid), P(a0, R), P(am, R), P(am, rMid)], [P(am, rMid), P(am, R), P(a1, R), P(a1, rMid)]];
          f.forEach(function(poly, n){ x.beginPath(); x.moveTo(poly[0][0], poly[0][1]); for (var q = 1; q < poly.length; q++) x.lineTo(poly[q][0], poly[q][1]); x.closePath();
            var hue = (195 + Math.sin(k * 1.3 + n) * 40 + (n > 2 ? k * 11 : 0)) % 360, lum = 70 + ((k + n) % 3) * 9 + Math.sin(k * 2.1 + n * 1.7) * 5;
            x.fillStyle = 'hsl(' + hue.toFixed(0) + ',' + (n > 2 ? 38 : 26) + '%,' + Math.min(97, lum).toFixed(0) + '%)'; x.fill();
            x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 1.4; x.stroke(); x.strokeStyle = 'rgba(40,70,110,.14)'; x.lineWidth = .6; x.stroke(); }); }
        var gl = x.createRadialGradient(cx, cy, 0, cx, cy, w * .7); gl.addColorStop(0, 'rgba(255,255,255,.55)'); gl.addColorStop(.5, 'rgba(255,255,255,.08)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gl; x.fillRect(0, 0, w, h);
        [[.22, .2, 1], [.78, .3, .8], [.3, .74, .7], [.82, .82, .9], [.55, .12, .6]].forEach(function(e){ var ex = e[0] * w, ey = e[1] * h, t = w * .06 * e[2];
          var gs = x.createRadialGradient(ex, ey, 0, ex, ey, t); gs.addColorStop(0, 'rgba(255,255,255,.95)'); gs.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gs; x.fillRect(ex - t, ey - t, t * 2, t * 2);
          x.fillStyle = '#fff'; x.beginPath(); x.moveTo(ex, ey - t); x.lineTo(ex + t * .08, ey); x.lineTo(ex, ey + t); x.lineTo(ex - t * .08, ey); x.closePath(); x.fill();
          x.beginPath(); x.moveTo(ex - t, ey); x.lineTo(ex, ey + t * .08); x.lineTo(ex + t, ey); x.lineTo(ex, ey - t * .08); x.closePath(); x.fill(); }); }
      else { var g2 = x.createLinearGradient(0, 0, w, h * .65); M.st.forEach(function(c, k){ g2.addColorStop(k / (M.st.length - 1), c); }); x.fillStyle = g2; x.fillRect(0, 0, w, h);
        for (var y = 0; y < h; y += 2){ x.fillStyle = 'rgba(255,255,255,' + (Math.random() * .07).toFixed(3) + ')'; x.fillRect(0, y, w, 1); x.fillStyle = 'rgba(0,0,0,' + (Math.random() * .06).toFixed(3) + ')'; x.fillRect(0, y + 1, w, 1); } }
      x.restore(); x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3; arrondi(x, 3, 3, w - 6, h - 6, r); x.stroke(); }, 600, 795); }
  CARTES.forEach(function(o, i){ var m = new THREE.Mesh(new THREE.PlaneGeometry(CL, CHt), new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide }));
    m.material.side = THREE.FrontSide;
    var fondM = new THREE.Mesh(m.geometry, new THREE.MeshStandardMaterial({ transparent: true, side: THREE.FrontSide, metalness: 1, roughness: .3, envMapIntensity: 1.35 })); fondM.position.z = -.006; fondM.visible = false; m.add(fondM);
    var dos = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ transparent: true, side: THREE.FrontSide })); dos.rotation.y = Math.PI; dos.position.z = -.012; m.add(dos);
    m.visible = false; m.userData = { o: o, i: i, lev: 0, rx: 0, ry: 0, etat: '', flip: 0, flipC: 0 }; scene.add(m); cartes.push(m); });
  var DOS = [
    { t:['Comment on', 'le construit'], e:['On écoute ton métier', 'Une maquette à valider ensemble', 'On construit et on branche tes outils', 'Formation, puis suivi'], o:'Se branche sur', apps:[['excel', 'Excel'], ['agenda', 'Agenda'], ['gmail', 'Gmail'], ['wa', 'WhatsApp']] },
    { t:['Comment on lance', 'tes pubs'], e:['Ta cible et ton offre', 'Visuels et vidéos', 'Lancement, puis réglages chaque semaine', 'Les contacts arrivent sur ton téléphone'], o:'Sur', apps:[['meta', 'Meta'], ['fb', 'Facebook'], ['ig', 'Instagram'], ['wa', 'WhatsApp']] },
    { t:['Comment on fait', 'ton site'], e:['Tes pages et ton style', 'Une maquette à valider', 'Rapide sur téléphone', 'SEO : Google, fiche et articles'], o:'Avec', apps:[['google', 'Google'], ['agenda', 'Réservation'], ['wa', 'WhatsApp'], ['gmail', 'Contact']] },
    { t:['Comment', 'tu démarres'], e:['Un appel pour voir ta façon de faire', 'On crée ton compte avec toi', 'On t’accompagne au début', 'Chaque dossier suivi jusqu’au paiement'], o:'Nos logiciels', apps:[['vizor', 'Vizor'], ['audiovizor', 'AudioVizor']] }
  ];
  /* texte qui rentre toujours : on réduit la taille si besoin */
  function ajuste(x, txt, taille, poids, police, largeurMax){ x.font = poids + ' ' + Math.round(taille) + 'px ' + police; var w = x.measureText(txt).width;
    if (w > largeurMax){ taille *= largeurMax / w; x.font = poids + ' ' + Math.round(taille) + 'px ' + police; } return taille; }
  function toileDos(i, f, c, base){ var d = DOS[i]; return toile(function(x, w, h){ var r = w * .028; x.save(); arrondi(x, 2, 2, w - 4, h - 4, r); x.clip();
      if (base) x.drawImage(base, 0, 0, w, h); else { x.fillStyle = f; x.fillRect(0, 0, w, h); }
      var blanc = c === '#ffffff', doux = blanc ? 'rgba(255,255,255,.66)' : 'rgba(0,0,0,.55)', cx = w / 2;
      x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      /* en-tête : logo onlee + nom du service */
      var lh = w * .055, lw = logoImg.naturalWidth ? lh * logoImg.naturalWidth / logoImg.naturalHeight : 0; logo(x, c, cx - lw / 2, h * .055, lh);
      var ts = ajuste(x, '0' + (i + 1) + '  ·  ' + CARTES[i].t + ' ' + CARTES[i].t2, w * .034, 600, TEXTE, w * .8); x.fillStyle = doux; x.fillText('0' + (i + 1) + '  ·  ' + CARTES[i].t + ' ' + CARTES[i].t2, cx, h * .145);
      /* titre */
      var tt = Math.min(ajuste(x, d.t[0], w * .1, 700, TITRE, w * .84), ajuste(x, d.t[1], w * .1, 700, TITRE, w * .84));
      x.font = '700 ' + Math.round(tt) + 'px ' + TITRE; x.fillStyle = c; x.fillText(d.t[0], cx, h * .25); x.fillText(d.t[1], cx, h * .25 + tt * 1.05);
      /* étapes : pastille numérotée + texte, bloc centré */
      var es = w * .042; d.e.forEach(function(et){ es = Math.min(es, ajuste(x, et, w * .042, 500, TEXTE, w * .66)); });
      x.font = '500 ' + Math.round(es) + 'px ' + TEXTE; var larg = 0; d.e.forEach(function(et){ larg = Math.max(larg, x.measureText(et).width); });
      var pr = es * .82, bx = cx - (larg + pr * 2 + es * .7) / 2, y0 = h * .43;
      d.e.forEach(function(et, k){ var y = y0 + k * es * 2.05;
        x.fillStyle = blanc ? 'rgba(255,255,255,.16)' : 'rgba(0,0,0,.08)'; x.beginPath(); x.arc(bx + pr, y - es * .34, pr, 0, 7); x.fill();
        x.textAlign = 'center'; x.font = '700 ' + Math.round(es * .78) + 'px ' + TEXTE; x.fillStyle = c; x.fillText(String(k + 1), bx + pr, y - es * .34 + es * .27);
        x.textAlign = 'left'; x.font = '500 ' + Math.round(es) + 'px ' + TEXTE; x.fillStyle = c; x.fillText(et, bx + pr * 2 + es * .7, y); });
      /* outils : vrais logos en couleur */
      x.textAlign = 'center'; var yo = h * .745; x.font = '700 ' + Math.round(w * .026) + 'px ' + TEXTE; espace(x, Math.round(w * .004) + 'px'); x.fillStyle = doux; x.fillText(d.o.toUpperCase(), cx, yo); espace(x, '0px');
      var n = d.apps.length, ic = w * .12, gap = w * .065, tot = n * ic + (n - 1) * gap, ax = cx - tot / 2, ay = yo + h * .025;
      d.apps.forEach(function(a, k){ var X = ax + k * (ic + gap), im = LOGOS[a[0]];
        x.save(); x.shadowColor = 'rgba(0,0,0,.22)'; x.shadowBlur = ic * .18; x.shadowOffsetY = ic * .06; bloc(x, X, ay, ic, ic, ic * .24, '#ffffff'); x.restore();
        if (im && im.naturalWidth){ var pad = (a[0] === 'wa' || a[0] === 'google' || a[0] === 'meta' || a[0] === 'fb' || a[0] === 'ig') ? ic * .16 : 0, iw = ic - pad * 2, ih = iw / (im.naturalWidth / im.naturalHeight);
          if (ih > ic - pad * 2){ ih = ic - pad * 2; iw = ih * im.naturalWidth / im.naturalHeight; }
          if (pad){ x.drawImage(im, X + (ic - iw) / 2, ay + (ic - ih) / 2, iw, ih); } else { x.save(); arrondi(x, X, ay, ic, ic, ic * .24); x.clip(); x.drawImage(im, X, ay, ic, ic); x.restore(); } }
        ajuste(x, a[1], w * .028, 600, TEXTE, ic + gap * .8); x.fillStyle = c; x.fillText(a[1], X + ic / 2, ay + ic + w * .045); });
      /* retourner */
      x.font = '600 ' + Math.round(w * .03) + 'px ' + TEXTE; x.fillStyle = doux; x.fillText('onlee.fr', cx, h * .955);
      x.restore(); }, 1000, Math.round(1000 * CHt / CL)); }
  function poserTex(mat, cv){ if (mat.map) mat.map.dispose(); mat.map = tex(cv); mat.needsUpdate = true; }
  function habillerCartes(){ cartes.forEach(function(m, i){ var o = m.userData.o, fondM = m.children[0], plat, partage = false;
      if (STYLE === 'metal'){ var M = METAUX[i], base = toileMetal(M), calque = toileCarte(Object.assign({}, o, { c: M.c }), i, true);
        poserTex(m.material, calque); poserTex(fondM.material, base); fondM.material.metalness = M.metal; fondM.material.roughness = M.rough; fondM.visible = true;
        plat = toile(function(x, w, h){ x.drawImage(base, 0, 0, w, h); x.drawImage(calque, 0, 0, w, h); }, 900, 1193); poserTex(m.children[1].material, toileDos(i, null, M.c, base)); }
      else if (ATELIER[STYLE] && window.CARTES_V && LOGOS_AT){ var CC = couleurs(); window.CARTES_FONDS = CC.map(function(k){ return k.f; }); window.CARTES_TEXTES = CC.map(function(k){ return k.c; });
        var K = innerWidth < 760 ? 1.4 : 1.75; plat = toile(function(x){ x.scale(K, K); window.CARTES_V[ATELIER[STYLE]](x, 1200, 1591, i, LOGOS_AT); }, Math.round(1200 * K), Math.round(1591 * K)); partage = true; poserTex(m.material, plat); fondM.visible = false;
        var dc = STYLE === 'ecran' ? CC[i] : STYLE === 'affiche' ? { f:'#ffffff', c:'#0E0F13' } : { f:'#0E0F13', c:'#ffffff' }; poserTex(m.children[1].material, toileDos(i, dc.f, dc.c)); }
      else { var oc = Object.assign({}, o, couleurs()[i]); plat = toileCarte(oc, i); poserTex(m.material, plat); fondM.visible = false; poserTex(m.children[1].material, toileDos(i, oc.f, oc.c)); }
      var pf = pile[i].material[4]; if (partage){ if (pf.map && pf.map !== m.material.map) pf.map.dispose(); pf.map = m.material.map; pf.needsUpdate = true; } else poserTex(pf, plat); });
    sec.dataset.cartes = STYLE === 'metal' ? 'metal' : 'couleurs';
    var c2 = document.querySelector('.chap[data-i="2"]'); if (c2){ if (STYLE === 'metal') c2.style.removeProperty('--cc'); else c2.style.setProperty('--cc', SITE === 'ambre' ? '#C98A00' : SITES[SITE][0]); }
    reveil(); }
  /* réglages en direct (pour choisir) */
  var reglages = document.createElement('div'); reglages.className = 'boite-reglages';
  reglages.innerHTML = '<span>Cartes</span><button data-k="cartes" data-v="ecran">Écran</button><button data-k="cartes" data-v="affiche">Affiche</button><button data-k="cartes" data-v="telephone">Téléphone</button><button data-k="cartes" data-v="couleurs">Simples</button><button data-k="cartes" data-v="metal">Métal</button>';
  /* style validé : Écran (les autres restent dispo avec ?cartes=affiche|telephone|couleurs|metal) */
  function majReglages(){ reglages.querySelectorAll('button').forEach(function(b){ b.setAttribute('aria-pressed', String((b.dataset.k === 'cartes' ? STYLE : SITE) === b.dataset.v)); }); }
  reglages.addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; if (b.dataset.k === 'cartes') STYLE = b.dataset.v; else SITE = b.dataset.v; habillerCartes();
    majReglages(); reveil(); try { var u = new URL(location.href); u.searchParams.set('cartes', STYLE); u.searchParams.set('sites', SITE); history.replaceState(null, '', u); } catch(er){} });
  sec.dataset.cartes = STYLE;   /* (boutons de réglage du labo retirés) */
  function emplacement(i){
    if (RANG === 'eventail') return { p: new THREE.Vector3((i - 1.5) * 1.05, racine.position.y + H + 1.05, -2.7), s: .5, rz: -(i - 1.5) * .16, ry: 0 };
    if (RANG === 'sol'){ var g = i % 2 ? 1 : -1, n = Math.floor(i / 2); return { p: new THREE.Vector3(g * (3.2 + n * 1.35), racine.position.y + CHt * .42 * .5 + .02, .5 - n * .4), s: .42, rz: 0, ry: -g * .35 }; }
    return { p: new THREE.Vector3(-1.65 + i * 1.1, 4.95, .2), s: .42, rz: 0, ry: 0 };
  }

  /* étincelles à l'ouverture */
  var NB = 90, posP = new Float32Array(NB * 3), velP = [], geoP = new THREE.BufferGeometry(); geoP.setAttribute('position', new THREE.BufferAttribute(posP, 3));
  var matP = new THREE.PointsMaterial({ size: .12, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0,
    map: tex(toile(function(x, w, h){ var g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); g.addColorStop(0, '#fff'); g.addColorStop(.4, 'rgba(120,170,255,.8)'); g.addColorStop(1, 'rgba(0,80,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 32)) });
  var points = new THREE.Points(geoP, matP); points.visible = false; scene.add(points); var tEclat = -1;
  function eclater(){ if (reduit) return; tEclat = performance.now(); points.visible = true; velP = []; for (var i = 0; i < NB; i++){ posP[i * 3] = (Math.random() - .5) * W * .7; posP[i * 3 + 1] = H + racine.position.y; posP[i * 3 + 2] = (Math.random() - .5) * D * .7;
    var a = Math.random() * Math.PI * 2, v = .015 + Math.random() * .035; velP.push([Math.cos(a) * v, .05 + Math.random() * .07, Math.sin(a) * v]); } geoP.attributes.position.needsUpdate = true; }

  /* ---------- le scénario ---------- */
  var S0 = .15, LCH = .17, NCH = 4, FIN0 = S0 + NCH * LCH;   /* chapitres .15 → .83, puis vue d'ensemble tenue jusqu'à la fin */   /* chapitres de .17 à .93, puis récapitulatif */
  var CAM_F = { p: new THREE.Vector3(0, 2.3, 9.4), c: new THREE.Vector3(0, .72, 0) }, CAM_O = { p: new THREE.Vector3(0, 3.4, 15.8), c: new THREE.Vector3(0, 1.95, 0) };
  var VUE_F = CAM_F.p.clone().sub(CAM_F.c), LARGEUR_VUE = .27;
  var cible = CAM_F.c.clone(); cam.position.copy(CAM_F.p);
  var clamp = function(v){ return Math.max(0, Math.min(1, v)); }, ph = function(q, a, b){ return clamp((q - a) / (b - a)); }, sortie = function(t){ return 1 - Math.pow(1 - t, 3); }, lisse = function(t){ return t * t * (3 - 2 * t); };
  function mix(a, b, t){ return a + (b - a) * t; }
  var p = 0, pAff = 0, entree = 0, ouvertAvant = false, survol = null, saut = null, cibleImp = -1, etroit = false;
  var drag = false, x0 = 0, y0 = 0, rotY = 0, rotX = 0, bouge = 0, mx = 0, my = 0, dragY = 0, dragX = 0;
  function progression(){ var r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight; p = total > 0 ? clamp(-r.top / total) : 0; entree = clamp((innerHeight * .78 - r.top) / (innerHeight * .5)); }  /* la boîte n'apparaît qu'après 2-3 coups de molette */
  function allerA(q){ var y = sec.offsetTop + q * (sec.offsetHeight - innerHeight); if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else scrollTo({ top: y, behavior: 'smooth' }); }

  /* petit saut de la boîte quand l'impression change */
  function sauter(){ var t0 = performance.now(), fait = false; saut = function(now){ var t = Math.min(1, (now - t0) / (reduit ? 1 : 560)), s = Math.sin(t * Math.PI);
      tourne.position.y = s * .22; tourne.rotation.y = s * .12; tourne.scale.set(1 + s * .015, 1 - s * .03, 1 + s * .015);
      if (!fait && t > .45){ fait = true; imprimer(cibleImp); } if (t >= 1){ tourne.position.y = 0; tourne.rotation.y = 0; tourne.scale.set(1, 1, 1); saut = null; } }; }

  function places(){
    if (etroit) return { feat: new THREE.Vector3(0, 2.9, 1.2), fs: .82, park: null, ps: .3,
      fin: function(i){ return new THREE.Vector3((i % 2 ? .62 : -.62) * CL * .8, 4.2 - Math.floor(i / 2) * 2.6, .4); }, fis: .76 };
    return { feat: new THREE.Vector3(0, 2.5, 1.6), fs: 1.02, park: null, ps: .3,
      fin: function(i){ return new THREE.Vector3((i - 1.5) * 2.6, 2.75, .7 - Math.abs(i - 1.5) * .25); }, fis: .98 };
  }
  var V = new THREE.Vector3(), V2 = new THREE.Vector3();

  /* ---------- souris ---------- */
  var ray = new THREE.Raycaster(), pt = new THREE.Vector2();
  function viser(e){ var r = hote.getBoundingClientRect(); pt.x = (e.clientX - r.left) / r.width * 2 - 1; pt.y = -(e.clientY - r.top) / r.height * 2 + 1; ray.setFromCamera(pt, cam); return r; }
  hote.addEventListener('pointerdown', function(e){ drag = true; bouge = 0; x0 = e.clientX; y0 = e.clientY; hote.setPointerCapture(e.pointerId); reveil(); });
  hote.addEventListener('pointermove', function(e){ var r = viser(e), surBoite = false; mx = pt.x; my = pt.y;
    if (drag){ var dx = e.clientX - x0, dy = e.clientY - y0; bouge = Math.max(bouge, Math.abs(dx) + Math.abs(dy)); dragY = dx / 160; dragX = Math.max(-.45, Math.min(.3, dy / 300)); }
    survol = null; var h = ray.intersectObjects(cartes.filter(function(m){ return m.visible; }), true)[0]; if (h){ var ob = h.object; while (ob && cartes.indexOf(ob) < 0) ob = ob.parent; survol = ob; } else if (pAff < S0) surBoite = ray.intersectObject(tourne, true).length > 0;
    hote.style.cursor = drag ? 'grabbing' : survol ? 'pointer' : surBoite ? 'grab' : '';
    if (survol){ var et = survol.userData.etat; bulle.textContent = et === 'range' ? 'Revoir · ' + survol.userData.o.t + ' ' + survol.userData.o.t2 : 'Voir la page · ' + survol.userData.o.t + ' ' + survol.userData.o.t2;
      bulle.style.left = (e.clientX - r.left) + 'px'; bulle.style.top = (e.clientY - r.top) + 'px'; bulle.classList.add('on'); } else bulle.classList.remove('on');
    reveil(); });
  function lacher(){ if (!drag) return; drag = false; dragY = dragX = 0;
    if (bouge < 6 && survol){ var ud = survol.userData; if (ud.etat === 'range') allerA(S0 + ud.i * LCH + LCH * .5); else location.href = ud.o.lien; }
    reveil(); }
  hote.addEventListener('pointerup', lacher); hote.addEventListener('pointercancel', lacher);
  hote.addEventListener('pointerleave', function(){ mx = my = 0; survol = null; bulle.classList.remove('on'); reveil(); });
  panneaux.forEach(function(pn, i){ var a = pn.querySelector('.chap-suiv'); if (a) a.addEventListener('click', function(e){ e.preventDefault(); allerA(i < NCH - 1 ? S0 + (i + 1) * LCH + LCH * .5 : FIN0 + .05); }); });
  prog.forEach(function(b, i){ b.addEventListener('click', function(){ allerA(S0 + i * LCH + LCH * .5); }); });

  /* ---------- rendu à la demande ---------- */
  var visible = false, enCours = false;
  new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if (visible) reveil(); }, { threshold: 0 }).observe(sec);
  addEventListener('scroll', function(){ progression(); reveil(); }, { passive: true });
  var tailleW = 0, tailleH = 0;
  function taille(){ var w = hote.clientWidth, h = hote.clientHeight; if (!w || !h) return; if (w === tailleW && h === tailleH) return; tailleW = w; tailleH = h; rendu.setSize(w, h, false); cam.aspect = w / h; etroit = w < 900; cam.fov = w < 760 ? 44 : 28; cam.updateProjectionMatrix(); var recul = Math.max(1, LARGEUR_VUE / (Math.tan(cam.fov * Math.PI / 360) * cam.aspect)); CAM_F.p.copy(CAM_F.c).addScaledVector(VUE_F, recul); reveil(); }
  addEventListener('resize', taille);
  function reveil(){ if (enCours || !visible || document.hidden) return; enCours = true; requestAnimationFrame(image); }
  document.addEventListener('visibilitychange', reveil);

  var chapAvant = -9;
  function image(now){
    enCours = false; var encore = false;
    var dp = p - pAff; if (Math.abs(dp) > .0003){ pAff += dp * (reduit ? 1 : .1); encore = true; } else pAff = p;
    var q = pAff, fin = sortie(ph(q, FIN0, FIN0 + .05));
    /* apparition, ouverture */
    var a = q > 0 ? 1 : sortie(entree); racine.position.y = -2 * (1 - a);
    var u1 = sortie(ph(q, .05, .1)), u2 = lisse(ph(q, .08, .14));
    couv.position.set(0, Y_COUV + 1 * u1 - .42 * u2, -(D * .5 + HL * .5 + .34) * u2);
    couv.rotation.x = -1.38 * u2; couv.rotation.z = .05 * u1 * (1 - u2);
    var ouvert = q > .09; if (ouvert && !ouvertAvant) eclater(); ouvertAvant = ouvert;
    eclat.position.set(0, H + racine.position.y + .3, 0); eclat.intensity = 3 * ph(q, .07, .13) * (1 - .6 * fin);
    var c = lisse(ph(q, .07, .16)); cam.position.lerpVectors(CAM_F.p, CAM_O.p, c); cible.lerpVectors(CAM_F.c, CAM_O.c, c);
    racine.position.y -= 1.3 * c; ombre.material.opacity = 1 - .3 * u1;
    if (propose) propose.classList.toggle('on', (q > .1 && q < S0 + .02) || fin > .6);
    sec.classList.toggle('ouverte', q > .06); reglages.classList.toggle('on', q > S0 - .01);
    /* quel chapitre ? impression de la boîte */
    var k = (q - S0) / LCH, chap = q < S0 - .01 ? -1 : Math.min(NCH - 1, Math.max(0, Math.floor(k)));
    if (chap !== chapAvant){ chapAvant = chap; cibleImp = chap; if (impression !== -2) sauter(); }
    panneaux.forEach(function(pn, i){ var ci = (q - S0 - i * LCH) / LCH, on = ci > .22 && (i < NCH - 1 ? ci < .8 : fin < .05); pn.classList.toggle('on', on); if (minis[i]){ minis[i].classList.toggle('on', on); if (on) minis[i].style.setProperty('--d', ((ci - .51) / .29).toFixed(3)); } });
    prog.forEach(function(b, i){ var ci = clamp((q - S0 - i * LCH) / LCH); b.style.setProperty('--r', ci.toFixed(3)); b.classList.toggle('actif', i === chap && fin < .05); });
    if (prog.length) prog[0].parentNode.classList.toggle('on', q > S0 - .01 && fin < .5);
    /* souris : la boîte reste face à toi */
    var ty = drag ? dragY : mx * .32 * (1 - c), tx = drag ? dragX : -my * .1 * (1 - c), kr = drag ? .25 : .08;
    rotY += (ty - rotY) * kr; rotX += (tx - rotX) * kr; if (Math.abs(ty - rotY) > .0006 || Math.abs(tx - rotX) > .0006) encore = true;
    pivot.rotation.y = rotY; pivot.rotation.x = rotX;
    if (saut){ saut(now); encore = true; }
    /* cartes : sortent une par une, restent le temps de les explorer, se rangent à droite */
    var P = places(), bouche = V2.set(0, racine.position.y + E + .3, 0), carteInvite = null;
    cartes.forEach(function(m, i){ var ud = m.userData, ci = (q - S0 - i * LCH) / LCH;
      var monte = sortie(ph(ci, 0, .3)), range = i < NCH - 1 ? lisse(ph(ci, .78, 1)) : 0;
      m.visible = monte > .002; pile[i].visible = !m.visible; if (!m.visible){ ud.etat = ''; return; }
      ud.etat = fin > .5 ? 'fin' : range > .5 ? 'range' : 'vedette';
      var E2 = emplacement(i); V.copy(bouche).lerp(P.feat, monte); V.lerp(E2.p, range); V.lerp(P.fin(i), fin);
      var sc = mix(mix(mix(.3, P.fs, monte), E2.s, range), P.fis, fin);
      var vedette = monte > .98 && range < .02 && fin < .02, fl = (m === survol && !drag) ? 1 : 0; if (!vedette && fin < .98) ud.flipC = 0;
      /* retournement piloté par le défilement (plus de minuteur) : en descendant, la carte montre son dos puis revient de face ;
         impossible de passer à côté, même en défilant vite (téléphone) */
      if (vedette){ var fp = ci < .5 ? lisse(ph(ci, .34, .45)) : 1 - lisse(ph(ci, .58, .67)); ud.flipC = fp; if (ci > .5) ud.vu = true; }
      var tease = 0;
      if (vedette && ud.vu && ud.flipC < .01 && ud.flip < .05){ carteInvite = m; }
      var df = ud.flipC - ud.flip; ud.flip += df * .12; if (Math.abs(df) > .002) encore = true; else ud.flip = ud.flipC;
      var trx = vedette ? -my * .18 : 0, tr = vedette ? mx * .3 : 0; ud.rx += (trx - ud.rx) * .1; ud.ry += (tr - ud.ry) * .1; ud.lev += (fl - ud.lev) * .16;
      if (Math.abs(trx - ud.rx) > .001 || Math.abs(tr - ud.ry) > .001 || Math.abs(fl - ud.lev) > .004) encore = true;
      V.y += Math.sin(monte * Math.PI) * .9 + Math.sin(range * Math.PI) * .45 * (1 - fin) + ud.lev * (fin > .5 ? .22 : .08); V.z += ud.lev * .2;
      m.position.copy(V); m.scale.setScalar(sc * (1 + ud.lev * .04));
      var bascule = (1 - monte) * -1.25;
      m.rotation.set(bascule + ud.rx, ud.flip * Math.PI + tease + ud.ry * (1 - 2 * ud.flip) + (fin > 0 ? -P.fin(i).x * .05 * fin : 0) + (1 - monte) * (i % 2 ? .5 : -.5) + E2.ry * range * (1 - fin), (1 - monte) * (i % 2 ? -.25 : .25) + E2.rz * range * (1 - fin)); });
    if (carteInvite){ VP.set(carteInvite.position.x, carteInvite.position.y - CHt * carteInvite.scale.y * .5, carteInvite.position.z).project(cam); invite.querySelector('.iv-voir').href = carteInvite.userData.o.lien;
      invite.style.left = ((VP.x + 1) / 2 * hote.clientWidth) + 'px'; invite.style.top = ((1 - VP.y) / 2 * hote.clientHeight) + 'px'; invite.classList.add('on'); inviteCarte = carteInvite; } else { invite.classList.remove('on'); inviteCarte = null; }
    /* la pile debout : la prochaine carte dépasse nettement du bord quand la boîte est ouverte */
    var prochaine = -1; for (var j = 0; j < NCH; j++) if (pile[j].visible){ prochaine = j; break; }
    if (tEclat > 0){ var age = (now - tEclat) / 1000; matP.opacity = Math.max(0, 1 - age / 1.5);
      for (var j = 0; j < NB; j++){ posP[j * 3] += velP[j][0]; posP[j * 3 + 1] += velP[j][1]; posP[j * 3 + 2] += velP[j][2]; velP[j][1] -= .0016; }
      geoP.attributes.position.needsUpdate = true; if (age > 1.6){ tEclat = -1; points.visible = false; } else encore = true; }
    if (astuce) astuce.textContent = q < .05 ? (TACTILE ? 'Touche la boîte · descends pour l’ouvrir' : 'Bouge la souris · attrape la boîte · descends pour l’ouvrir') : fin > .5 ? (TACTILE ? 'Touche une carte' : 'Clique sur une carte') : '';
    cam.lookAt(cible); rendu.render(scene, cam);
    if (encore) reveil();
  }

  taille(); progression();
  Promise.all([logosPrets, logosAtelier, document.fonts ? document.fonts.ready : 0, new Promise(function(r){ if (logoImg.complete) r(); else { logoImg.onload = r; logoImg.onerror = r; } })]).then(function(){
    imprimerFixe(); impression = -2; imprimer(cibleImp); habillerCartes(); reveil(); });
  /* « Services » (capsule, menu, autre page) : on arrive directement au premier chapitre de la boîte, pas sur la boîte fermée */
  function versServices(immediat){ var q = S0 + LCH * .5;
    if (!immediat) return allerA(q);
    var y = sec.offsetTop + q * (sec.offsetHeight - innerHeight); if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true }); else scrollTo(0, y); progression(); pAff = p; reveil(); }
  if (location.hash === '#services'){ var allerServices = function(){ setTimeout(function(){ versServices(true); }, 400); };
    if (document.readyState === 'complete') allerServices(); else addEventListener('load', allerServices); }
  document.addEventListener('click', function(e){ var a = e.target.closest && e.target.closest('a[href="/#services"],a[href="#services"],a[href="/en/#services"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); if (history.replaceState) history.replaceState(null, '', '#services'); versServices(false); });
})();
