(function () {
  // ===== CONFIG =============================================================
  const FIELD_ID = null; // e.g., 4992033637535
  const LABELS = {
    offboard: 'Offboard',
    'new-hire': 'New Hire',
    sales_ops: 'SalesOps',
    general_it: 'General IT',
    hardware_request: 'Hardware Request',
    software_request: 'Software Request',
    google_group: 'Google Group'
  };
  // ===== UTILITIES ==========================================================
  const reqCache = new Map();
  function unique(arr) { return Array.from(new Set(arr)); }
  function getRequestIdFromNode(node) {
    const ph = node.querySelector?.('[data-request-id]');
    if (ph) return ph.getAttribute('data-request-id');
    const a = node.querySelector?.('a.striped-list-title, a[href*="/requests/"]');
    if (!a) return null;
    const m = a.getAttribute('href').match(/\/requests\/(\d+)/);
    return m ? m[1] : null;
  }
  async function fetchRequest(id) {
    if (!id) return null;
    if (reqCache.has(id)) return reqCache.get(id);
    const p = fetch(`/api/v2/requests/${id}.json`, { credentials: 'same-origin' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(j => j && j.request ? j.request : null)
      .catch(() => null);
    reqCache.set(id, p);
    return p;
  }
  function deriveTypeTag(req) {
    if (!req) return null;
    if (Array.isArray(req.tags)) {
      const hit = req.tags.find(t => LABELS[t]);
      if (hit) return hit;
    }
    if (FIELD_ID && Array.isArray(req.custom_fields)) {
      const cf = req.custom_fields.find(f => Number(f.id) === Number(FIELD_ID));
      if (cf && cf.value && LABELS[cf.value]) return cf.value;
    }
    return null;
  }
  function paintBadge(el, tag) {
    if (!el || !tag) return;
    el.dataset.type = tag;
    el.textContent = LABELS[tag] || tag;
    el.hidden = false;
  }
  // ===== DECORATORS =========================================================
  async function decoratePlaceholders(root) {
    const nodes = root.querySelectorAll?.('.badge--type[data-request-id]') || [];
    await Promise.all(Array.from(nodes).map(async el => {
      const id = el.getAttribute('data-request-id');
      const req = await fetchRequest(id);
      const tag = deriveTypeTag(req);
      paintBadge(el, tag);
    }));
  }
  async function decorateBetaTable(root) {
    const rows = root.querySelectorAll?.('table.requests-table tbody tr') || [];
    await Promise.all(Array.from(rows).map(async tr => {
      if (tr.querySelector('.badge--type')) return;
      const id = getRequestIdFromNode(tr);
      if (!id) return;
      const req = await fetchRequest(id);
      const tag = deriveTypeTag(req);
      if (!tag) return;
      const a = tr.querySelector('a.striped-list-title, a[href*="/requests/"]');
      if (!a) return;
      const span = document.createElement('span');
      span.className = 'badge badge--type';
      span.setAttribute('data-type', tag);
      span.textContent = LABELS[tag] || tag;
      a.insertAdjacentElement('afterend', span);
    }));
  }
  function setupTypeFilter(root) {
    const select = document.getElementById('request-type-filter');
    if (!select) return;
    const types = unique(Array.from(root.querySelectorAll('.badge--type:not([hidden])'))
      .map(b => b.getAttribute('data-type'))
      .filter(Boolean)).sort();
    const existing = new Set(Array.from(select.options).map(o => o.value));
    types.forEach(t => {
      if (existing.has(t)) return;
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = LABELS[t] || t;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => {
      const chosen = select.value;
      (root.querySelectorAll('table.requests-table tbody tr') || []).forEach(tr => {
        const b = tr.querySelector('.badge--type:not([hidden])');
        const t = b ? b.getAttribute('data-type') : null;
        tr.style.display = (!chosen || t === chosen) ? '' : 'none';
      });
    }, { once: true });
  }
  // ===== INIT + OBSERVER ====================================================
  const root = document.getElementById('main-content') || document;
  function runAll() {
    decoratePlaceholders(root)
      .then(() => decorateBetaTable(root))
      .then(() => setupTypeFilter(root));
  }
  runAll();
  const obs = new MutationObserver(() => runAll());
  obs.observe(root, { childList: true, subtree: true });
})();
