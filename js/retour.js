/* Bouton « Retour » en haut à gauche des pages de service : ramène là où on était (sinon à l'accueil) */
(function(){
  if (document.querySelector('.retour-onlee')) return;
  var st = document.createElement('style');
  st.textContent = '.retour-onlee{position:fixed;left:18px;top:22px;z-index:9000;display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 16px 0 12px;border:0;border-radius:999px;' +
    'background:rgba(255,255,255,.94);color:#0E0F13;font:600 14px Inter,-apple-system,sans-serif;cursor:pointer;text-decoration:none;' +
    'box-shadow:0 0 0 1px rgba(14,15,19,.08),0 10px 26px -12px rgba(14,15,19,.4);transition:transform .25s cubic-bezier(.16,1,.3,1),box-shadow .25s}' +
    '.retour-onlee:hover{transform:translateX(-2px);box-shadow:0 0 0 1px rgba(14,15,19,.14),0 14px 30px -12px rgba(14,15,19,.45)}' +
    '.retour-onlee svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '@media(max-width:1340px){.retour-onlee{top:auto;bottom:18px;width:46px;height:46px;padding:0;justify-content:center;font-size:0;gap:0}.retour-onlee svg{width:19px;height:19px}.opied-bas{padding-bottom:84px}}';
  document.head.appendChild(st);
  var b = document.createElement('a'); b.className = 'retour-onlee'; b.href = '/'; b.setAttribute('aria-label', 'Retour à la page précédente');
  b.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 12H6M11 6l-6 6 6 6"/></svg>Retour';
  b.addEventListener('click', function(e){
    var memeSite = document.referrer && document.referrer.indexOf(location.origin) === 0;
    if (memeSite && history.length > 1){ e.preventDefault(); history.back(); }
  });
  (document.body || document.documentElement).appendChild(b);
})();
