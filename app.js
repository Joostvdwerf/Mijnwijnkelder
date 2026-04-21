// ============================================================
//  MIJN WIJNKELDER — app.js
//  Opslag via Netlify Blobs (server-side) — werkt op alle apparaten
// ============================================================

// ---- Grape SVG Sprite (hand-drawn style) -------------------
const GrapeSprite = {
  filled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="100%" height="100%">
    <defs>
      <radialGradient id="gf" cx="40%" cy="35%">
        <stop offset="0%" stop-color="#c0392b"/>
        <stop offset="100%" stop-color="#6d0f1e"/>
      </radialGradient>
    </defs>
    <line x1="16" y1="3" x2="16" y2="8" stroke="#5a3a1a" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="16" y1="5" x2="20" y2="3" stroke="#5a3a1a" stroke-width="1" stroke-linecap="round"/>
    <circle cx="16" cy="13" r="5" fill="url(#gf)"/>
    <circle cx="10" cy="18" r="4.5" fill="url(#gf)"/>
    <circle cx="22" cy="18" r="4.5" fill="url(#gf)"/>
    <circle cx="7"  cy="25" r="4" fill="url(#gf)"/>
    <circle cx="16" cy="24" r="4.5" fill="url(#gf)"/>
    <circle cx="25" cy="25" r="4" fill="url(#gf)"/>
    <circle cx="12" cy="31" r="3.8" fill="url(#gf)"/>
    <circle cx="20" cy="31" r="3.8" fill="url(#gf)"/>
    <circle cx="14" cy="11" r="1.5" fill="rgba(255,255,255,0.25)"/>
    <circle cx="8.5" cy="16.5" r="1.3" fill="rgba(255,255,255,0.2)"/>
    <circle cx="20.5" cy="16.5" r="1.3" fill="rgba(255,255,255,0.2)"/>
  </svg>`,

  empty: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" width="100%" height="100%">
    <line x1="16" y1="3" x2="16" y2="8" stroke="#8b7355" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="16" y1="5" x2="20" y2="3" stroke="#8b7355" stroke-width="1" stroke-linecap="round"/>
    <circle cx="16" cy="13" r="5" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="10" cy="18" r="4.5" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="22" cy="18" r="4.5" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="7"  cy="25" r="4" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="16" cy="24" r="4.5" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="25" cy="25" r="4" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="12" cy="31" r="3.8" fill="none" stroke="#8b7355" stroke-width="1.2"/>
    <circle cx="20" cy="31" r="3.8" fill="none" stroke="#8b7355" stroke-width="1.2"/>
  </svg>`
};

// ---- API wrapper (praat met Netlify Function) ---------------
const WijnKelder = {
  _base: '/api/wines',

  async getAll() {
    const res = await fetch(this._base);
    if (!res.ok) throw new Error('Laden mislukt');
    return res.json();
  },

  async getById(id) {
    const all = await this.getAll();
    return all.find(w => w.id === id) || null;
  },

  // Sla nieuwe wijn op — geeft het nieuwe ID terug
  async save(wijnData) {
    const res = await fetch(this._base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wijnData),
    });
    if (!res.ok) throw new Error('Opslaan mislukt');
    const { id } = await res.json();
    return id;
  },

  // Werk bestaande wijn bij
  async update(id, changes) {
    const res = await fetch(`${this._base}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    if (!res.ok) throw new Error('Bijwerken mislukt');
    return res.json();
  },

  // Verwijder wijn
  async delete(id) {
    const res = await fetch(`${this._base}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Verwijderen mislukt');
    return res.json();
  },
};

// ---- Rating helpers (initialiseren altijd correct) ----------

/**
 * Teken de druiven-rating voor een selector.
 * @param {string} containerId  - ID van de .rating-selector div
 * @param {number} val          - Huidige waarde (0-5)
 */
function drawRating(containerId, val) {
  document.querySelectorAll('#' + containerId + ' .rating-grape').forEach((g, i) => {
    g.innerHTML = i < val ? GrapeSprite.filled : GrapeSprite.empty;
    g.classList.toggle('filled', i < val);
  });
}

/**
 * Koppel klik/hover events aan een rating-selector.
 * @param {string}   containerId   - ID van de .rating-selector div
 * @param {string}   hiddenInputId - ID van de hidden input met de waarde
 * @param {Function} [onChange]    - Optionele callback(value) bij klik
 */
function initRatingSelector(containerId, hiddenInputId, onChange) {
  const grapes = document.querySelectorAll('#' + containerId + ' .rating-grape');
  const input  = document.getElementById(hiddenInputId);

  // Teken de beginstatus direct
  const initial = parseInt(input ? input.value : '0') || 0;
  drawRating(containerId, initial);

  grapes.forEach(function(g) {
    const val = parseInt(g.dataset.value);

    g.addEventListener('mouseenter', function() {
      drawRating(containerId, val);
    });
    g.addEventListener('mouseleave', function() {
      drawRating(containerId, parseInt(input ? input.value : '0') || 0);
    });
    g.addEventListener('click', function() {
      if (input) input.value = val;
      drawRating(containerId, val);
      if (onChange) onChange(val);
    });
  });
}
