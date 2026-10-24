/* Portfolio : tous les textes viennent de textes.json. Les articles s'ouvrent dans le panneau de droite (#jarvis, #offres…). */
'use strict';
const COULEURS = { jarvis: '#b5561f', offres: '#2f6b3d', gardien: '#3a4a8c', boutique: '#b5561f', securite: '#a33a2f', artag: '#a8791a' };
const ICONES = {
  offres: '<rect x="10" y="6" width="32" height="44" rx="3"/><path d="M17 16h18M17 24h18M17 32h10"/><circle cx="42" cy="42" r="9"/><path d="M48.5 48.5L58 58"/>',
  gardien: '<path d="M32 4l22 8v16c0 14-10 24-22 30C20 52 10 42 10 28V12z"/><path d="M22 32l7 7 14-15"/>',
  boutique: '<path d="M6 10h8l6 30h30l6-22H17"/><circle cx="24" cy="50" r="4"/><circle cx="46" cy="50" r="4"/>',
  securite: '<rect x="14" y="28" width="36" height="28" rx="3"/><path d="M22 28v-8a10 10 0 0 1 20 0v8"/><path d="M32 39v7"/>',
  artag: '<rect x="8" y="18" width="34" height="24" rx="4"/><circle cx="25" cy="30" r="7"/><path d="M42 26l14-8v24l-14-8"/><rect x="18" y="48" width="14" height="10"/>'
};
const ARBRE = '<svg class="arbre" aria-hidden="true" width="100%" height="100%" viewBox="0 0 780 400" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#fdfcf8" stroke-width="2"><path d="M390 70v50M390 160v40H110v50M390 200H670v50M250 200v50M390 200v50M530 200v50"/></g><circle cx="390" cy="56" r="16" fill="#fdfcf8"/><rect x="320" y="120" width="140" height="40" fill="#fdfcf8"/><rect x="75" y="250" width="70" height="30" fill="#fdfcf8"/><rect x="215" y="250" width="70" height="30" fill="#fdfcf8"/><rect x="355" y="250" width="70" height="30" fill="#fdfcf8"/><rect x="495" y="250" width="70" height="30" fill="#fdfcf8"/><rect x="635" y="250" width="70" height="30" fill="#fdfcf8"/></svg>';
const LECTURE = '<span class="rond" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>';
const $ = s => document.querySelector(s);
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const lire = (o, chemin) => chemin.split('.').reduce((x, k) => (x == null ? x : x[k]), o);
let T = null, origine = null;

/* Une vidéo prête : le vrai lecteur (pause, son, plein écran, sans lecture automatique) ; sinon l'affiche « bientôt ». */
function video(fichier, pret, aria, bientot, affiche) {
  if (pret) {
    const v = el('video', 'lecteur');
    Object.assign(v, { controls: true, preload: 'none', playsInline: true, poster: 'media/' + (affiche || 'affiche.jpg') });
    v.setAttribute('aria-label', aria);
    const s = el('source'); s.src = 'media/' + fichier; s.type = 'video/mp4'; v.append(s);
    return v;
  }
  const d = el('div', 'ecran');
  d.setAttribute('role', 'img'); d.setAttribute('aria-label', bientot);
  d.innerHTML = ARBRE + LECTURE;
  d.append(el('span', 'bientot', bientot));
  return d;
}

function ouvrir(id, depuis) {
  const p = T.panneaux[id];
  if (!p) return;
  origine = depuis || document.activeElement;
  $('#panneau-rubrique').textContent = p.rubrique;
  $('#panneau-rubrique').style.color = COULEURS[id];
  $('#panneau-titre').textContent = p.titre;
  const c = $('#panneau-corps'); c.replaceChildren();
  if (id === 'jarvis') {
    const f = el('figure');
    f.append(video('jarvis-tour.mp4', T.une.video_tour_prete, p.video_aria, T.une.video_bientot, 'affiche-tour.jpg'), el('figcaption', '', p.video_legende));
    c.append(f);
  } else if (p.capture) {
    const i = el('img', 'capture'); i.src = p.capture.src; i.alt = p.capture.alt; i.loading = 'lazy';
    c.append(i);
  } else if (p.schema) {
    const s = el('div', 'schema', '[' + p.schema + ']'); s.setAttribute('role', 'img'); s.setAttribute('aria-label', p.schema);
    c.append(s);
  }
  for (const b of p.blocs || []) { const q = el('p', 'bloc'); q.append(el('b', '', b.t + ' '), b.x); c.append(q); }
  if (p.gardefous) {
    const g = el('div', 'gardes'), ul = el('ul');
    g.append(el('span', 'sur-titre', p.gardefous_titre));
    for (const x of p.gardefous) ul.append(el('li', '', '• ' + x));
    g.append(ul); c.append(g);
  }
  c.append(el('span', 'outils', (p.technos || []).join(' · ')));
  if (p.citation) c.append(el('p', 'cite', p.citation));
  if ((p.liens || []).length) {
    const l = el('div', 'liens');
    for (const x of p.liens) { const a = el('a', '', x.texte + ' →'); a.href = x.url; l.append(a); }
    c.append(l);
  }
  $('#fond-panneau').hidden = false;
  document.body.style.overflow = 'hidden';
  if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  $('.panneau').scrollTop = 0;
  $('.panneau').focus();
}

function fermer() {
  if ($('#fond-panneau').hidden) return;
  $('#fond-panneau').hidden = true;
  document.body.style.overflow = '';
  $('#panneau-corps').querySelectorAll('video').forEach(v => v.pause());
  if (T.panneaux[location.hash.slice(1)]) history.pushState(null, '', location.pathname + location.search);
  if (origine && origine.focus) origine.focus();
}

function selonAdresse() {
  const id = location.hash.slice(1);
  if (T.panneaux[id]) ouvrir(id, $(`[data-ouvre="${id}"]`)); else fermer();
}

function remplir() {
  document.title = T.titre_page;
  document.querySelector('meta[name="description"]').content = T.description;
  document.querySelectorAll('[data-t]').forEach(e => { e.textContent = lire(T, e.dataset.t); });
  document.querySelectorAll('[data-h]').forEach(e => { e.innerHTML = lire(T, e.dataset.h); });  // textes à nous (textes.json), pas d'Internet
  document.querySelectorAll('[data-alt]').forEach(e => { e.alt = lire(T, e.dataset.alt); });
  const d = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  $('#date').textContent = d;
  const une = video('jarvis-1min.mp4', T.une.video_prete, T.une.video_aria, T.une.video_bientot, 'affiche.jpg');
  $('#video-une').replaceWith(une);
  const zone = $('#articles');
  for (const a of T.articles) {
    const b = el('button', 'carte art'); b.type = 'button'; b.dataset.ouvre = a.id;
    const c = COULEURS[a.id];
    const v = el('span', 'vignette'); v.setAttribute('aria-hidden', 'true');
    v.style.background = `radial-gradient(circle, ${c}55 1.1px, transparent 1.3px) 0 0/6px 6px, ${c}1f`;
    v.innerHTML = `<svg width="56" height="56" viewBox="0 0 64 64" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="opacity:.85">${ICONES[a.id]}</svg>`;
    const r = el('span', 'rub', a.rubrique); r.style.color = c;
    const s = el('span', 'suite', T.suite); s.style.color = c;
    b.append(v, r, el('h3', '', a.titre), el('span', 'resume', a.resume), s);
    zone.append(b);
  }
  document.querySelector('.fermer').setAttribute('aria-label', T.boutons.fermer);
}

(window.TEXTES ? Promise.resolve(window.TEXTES) : fetch('textes.json').then(r => r.json())).then(t => {
  T = t;
  remplir();
  document.addEventListener('click', e => {
    const o = e.target.closest('[data-ouvre]');
    if (o) { ouvrir(o.dataset.ouvre, o); return; }
    if (e.target.closest('[data-ferme]')) fermer();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fermer(); });
  addEventListener('popstate', selonAdresse);
  selonAdresse();
});
