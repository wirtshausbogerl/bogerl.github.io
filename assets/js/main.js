document.documentElement.classList.remove('no-js');

// ─── HEADER ───
// Auf Unterseiten ist der Header von Anfang an "scrolled" (gesetzt im Template).
(function() {
  var header = document.getElementById('header');
  if (!header || !document.body.classList.contains('page-home')) return;
  function aktualisieren() {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', aktualisieren, { passive: true });
  aktualisieren();
})();

// ─── MOBILE-NAV ───
// Beim Klick auf einen Link → Menü schließen UND zum Ziel scrollen.
// Den Standard-Sprung steuern wir selbst, damit er während der Schließ-Animation
// zuverlässig klappt (iOS Safari verschluckt sonst gerne den Scroll).
// Den Abstand zum fixierten Header regelt scroll-margin-top im CSS.
(function() {
  var toggle = document.getElementById('menuToggle');
  document.querySelectorAll('#mobileNav a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      toggle.checked = false;
      setTimeout(function() {
        target.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', href);
      }, 80);
    });
  });
})();

// ─── FADE-IN ON SCROLL ───
// Blendet alle .fade-in-Elemente ein, sobald sie ins Sichtfeld scrollen.
(function() {
  var fadeEls = document.querySelectorAll('.fade-in');
  if (!('IntersectionObserver' in window)) {
    fadeEls.forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var fadeObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  fadeEls.forEach(function(el) { fadeObserver.observe(el); });
})();

// ─── DATUMS-HILFE ───
// "2026-09-24" → lokale Mitternacht dieses Tages
function lokalesDatum(text) {
  if (!text) return null;
  var t = text.split('-');
  return new Date(+t[0], +t[1] - 1, +t[2]);
}

// ─── URLAUBSHINWEIS ───
// Vergangene Betriebsurlaube ausblenden, auch wenn die Seite seitdem nicht neu gebaut wurde.
(function() {
  var jetzt = new Date();
  document.querySelectorAll('.urlaub-hinweis[data-bis]').forEach(function(el) {
    if (jetzt >= lokalesDatum(el.getAttribute('data-bis'))) el.hidden = true;
  });
})();

// ─── EASTER EGG: DIALEKT-TOGGLE ───
(function() {
  var bierBtn = document.getElementById('bierEgg');
  var hinweis = document.getElementById('dialektHinweis');
  if (!bierBtn) return;
  var dialektAn = false;

  bierBtn.addEventListener('click', function() {
    dialektAn = !dialektAn;
    document.querySelectorAll('[data-dialekt]').forEach(function(el) {
      var dialekt = el.getAttribute('data-dialekt');
      if (!dialekt) return;
      // Beim ersten Umschalten: Original-HTML sichern
      if (!el.hasAttribute('data-original')) el.setAttribute('data-original', el.innerHTML);
      el.innerHTML = dialektAn ? dialekt : el.getAttribute('data-original');
    });
    bierBtn.classList.toggle('active', dialektAn);
    var titel = dialektAn ? 'Zruck zur Standardonsicht' : 'Auf Dialekt umschalten';
    bierBtn.setAttribute('aria-label', titel);
    bierBtn.setAttribute('title', titel);
    if (hinweis) {
      hinweis.classList.toggle('sichtbar', dialektAn);
      hinweis.setAttribute('aria-hidden', dialektAn ? 'false' : 'true');
    }
    // Nach oben scrollen, damit man die ganze Seite nochmal durchgehen kann
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ─── ESSENSFOTOS-SLIDESHOW ───
// Rotiert die drei Galerie-Flächen durch alle Bilder aus assets/images/galerie/.
(function() {
  var galerie = document.getElementById('essensSlideshow');
  if (!galerie) return;
  var bilder = JSON.parse(galerie.getAttribute('data-bilder') || '[]');
  var slots = galerie.querySelectorAll('.slide-slot');
  var anzahlSlots = slots.length;
  // Nur rotieren, wenn es mehr Bilder als Flächen gibt
  if (bilder.length <= anzahlSlots) return;
  // Bei System-Einstellung "Bewegung reduzieren" bleiben die ersten Bilder stehen
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var INTERVALL = 7000; // Millisekunden, die ein Bild stehen bleibt (größer = langsamer)
  var FADE_MS = 1600;   // muss zur CSS-Transition von .slide-overlay passen

  function bild(index) {
    return bilder[((index % bilder.length) + bilder.length) % bilder.length];
  }

  var zustand = [];
  slots.forEach(function(slot, i) {
    var offset = parseInt(slot.getAttribute('data-offset'), 10);
    if (isNaN(offset)) offset = i;
    zustand.push({
      base: slot.querySelector('.slide-base'),
      overlay: slot.querySelector('.slide-overlay'),
      offset: offset,
      schritt: 0
    });
  });

  // Weiches Crossfade: Die untere Ebene bleibt voll sichtbar, das neue Bild wird
  // darüber eingeblendet. Reihum wechselt immer nur EINE Fläche.
  function weiter(z) {
    z.overlay.classList.add('is-visible');
    setTimeout(function() {
      z.schritt++;
      z.base.src = z.overlay.src;
      // Overlay ohne Animation zurücksetzen …
      z.overlay.style.transition = 'none';
      z.overlay.classList.remove('is-visible');
      void z.overlay.offsetWidth; // Reflow erzwingen, damit der Reset sofort greift
      z.overlay.style.transition = '';
      // … und das übernächste Bild schon vorladen
      z.overlay.src = bild(z.offset + (z.schritt + 1) * anzahlSlots);
    }, FADE_MS);
  }

  var aktuellerSlot = 0;
  setInterval(function() {
    weiter(zustand[aktuellerSlot]);
    aktuellerSlot = (aktuellerSlot + 1) % anzahlSlots;
  }, Math.round(INTERVALL / anzahlSlots));
})();

// ─── INFO-POPUP ───
// Einträge kommen aus data/hinweise.yaml. Angezeigt wird der erste, dessen
// Zeitraum gerade läuft – einmal pro Browser-Sitzung.
(function() {
  var popup = document.getElementById('infoPopup');
  var daten = document.getElementById('infoPopupDaten');
  if (!popup || !daten) return;

  var jetzt = new Date();
  var eintrag = JSON.parse(daten.textContent).filter(function(e) {
    var von = lokalesDatum(e.von), bis = lokalesDatum(e.bis);
    return (!von || jetzt >= von) && (!bis || jetzt < bis);
  })[0];
  if (!eintrag) return;

  // Schlüssel hängt an Text+Datum -> bei neuem Anlass erscheint das Popup wieder
  var SPEICHER_KEY = 'bogerl_popup_' + (eintrag.text + '|' + eintrag.bis).replace(/\s+/g, '_').slice(0, 60);
  try { if (sessionStorage.getItem(SPEICHER_KEY)) return; } catch (e) {}

  var labelEl = document.getElementById('infoPopupLabel');
  labelEl.innerHTML = eintrag.label;
  labelEl.hidden = !eintrag.label;
  document.getElementById('infoPopupText').innerHTML = eintrag.text;
  popup.hidden = false;

  function schliessen() {
    popup.hidden = true;
    try { sessionStorage.setItem(SPEICHER_KEY, '1'); } catch (e) {}
  }
  popup.querySelectorAll('[data-popup-close]').forEach(function(el) {
    el.addEventListener('click', schliessen);
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !popup.hidden) schliessen();
  });
})();
