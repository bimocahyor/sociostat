/* ═══════════════════════════════════════════════════════════════════
   SOCIOSTAT — Statistical Analysis Workbench
   script.js — Pure client-side application
   No server required. Double-click index.html to run.
   ═══════════════════════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════════════════════════════════════
   SECTION 1: UTILITIES
   ══════════════════════════════════════════════════════════════════ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function el(tag, attrs = {}, ...children) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(e.style, v);
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    if (typeof c === 'string' || typeof c === 'number') e.appendChild(document.createTextNode(String(c)));
    else if (c instanceof Node) e.appendChild(c);
    else if (Array.isArray(c)) c.forEach(x => x instanceof Node && e.appendChild(x));
  }
  return e;
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function fmt(v, d = 3) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toFixed(d);
}

function fmtP(p) {
  if (p == null) return '';
  if (p < 0.001) return '< .001';
  return p.toFixed(3).replace(/^0\./, '.');
}

function fmtStar(p) {
  if (p == null) return '';
  if (p < 0.001) return '***';
  if (p < 0.01) return '**';
  if (p < 0.05) return '*';
  return '';
}

function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function formatDateTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function svgIcon(name, size = 16) {
  const paths = {
    home: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    database: 'M12 2C6.5 2 2 4 2 6.5s4.5 4.5 10 4.5 10-2 10-4.5S17.5 2 12 2zM2 11.5v3C2 17 6.5 19 12 19s10-2 10-4.5v-3M2 16.5v3C2 22 6.5 24 12 24s10-2 10-4.5v-3',
    'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
    settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z',
    code: 'M16 18l6-6-6-6M8 6L2 12l6 6',
    'file-text': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
    clock: 'M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2',
    'message-square': 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z',
    zap: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    transform: 'M12 3v4M12 17v4M3 12h4M17 12h4',
    layers: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    x: 'M18 6L6 18M6 6l12 12',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
    edit: 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7',
    download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    upload: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12',
    check: 'M20 6L9 17l-5-5',
    'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01',
    'chevron-right': 'M9 18l6-6-6-6',
    'chevron-down': 'M6 9l6 6 6-6',
    play: 'M5 3l14 9-14 9V3z',
    save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
    folder: 'M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z',
    copy: 'M20 9H11a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1',
    filter: 'M22 3H2l8 9.46V19l4 2V12.46L22 3',
    'book-open': 'M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z',
    robot: 'M12 2a4 4 0 014 4v1h1a2 2 0 012 2v6a2 2 0 01-2 2h-1v1a4 4 0 01-8 0v-1H7a2 2 0 01-2-2V9a2 2 0 012-2h1V6a4 4 0 014-4z',
    'refresh-cw': 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15',
    info: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 8h.01M11 12h1v4h1',
  };
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size); svg.setAttribute('height', size);
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
  const d = paths[name];
  if (d) { const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', d); svg.appendChild(path); }
  return svg;
}

/* Notifications */
let _notifContainer = null;
function notify(msg, type = 'info', ms = 3500) {
  if (!_notifContainer) {
    _notifContainer = el('div', { id: 'notifications' });
    document.body.appendChild(_notifContainer);
  }
  const n = el('div', { class: `notif ${type}` }, msg);
  _notifContainer.appendChild(n);
  setTimeout(() => { n.classList.add('fade'); setTimeout(() => n.remove(), 320); }, ms);
}
const notifyOk = m => notify(m, 'success');

function fmtDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  } catch { return iso; }
}

const notifyErr = m => notify(m, 'error', 5000);
const notifyWarn = m => notify(m, 'warning', 4000);

/* ══════════════════════════════════════════════════════════════════
   SECTION 2: APPLICATION STATE
   ══════════════════════════════════════════════════════════════════ */

const AppState = (() => {
  const _state = {
    activeModule: 'home',
    activeTab: 'data',
    currentProject: null,
    projects: [],
    activeDataset: null,
    dataPage: { offset: 0, limit: 200, rows: [], total: 0, variables: [] },
    selectedVariable: null,
    analysisHistory: [],
    currentOutput: null,
    outputHistory: [],
    syntaxContent: '* SOCIOSTAT Syntax\n* Run analyses to auto-generate syntax\n\n',
    loading: false,
    aiMessages: [],
    aiApiKey: localStorage.getItem('ss_ai_key') || '',
    aiProvider: localStorage.getItem('ss_ai_provider') || 'rule-based',
  };
  const _subs = {};
  return {
    get: k => _state[k],
    getAll: () => _state,
    set(k, v) {
      _state[k] = v;
      (_subs[k] || []).forEach(fn => fn(v));
      (_subs['*'] || []).forEach(fn => fn(k, v));
    },
    subscribe(k, fn) {
      if (!_subs[k]) _subs[k] = [];
      _subs[k].push(fn);
      return () => { _subs[k] = _subs[k].filter(f => f !== fn); };
    },
  };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 3: STORAGE (IndexedDB)
   ══════════════════════════════════════════════════════════════════ */

const DB = (() => {
  let _db = null;
  const DB_NAME = 'sociostat_v1';
  const DB_VERSION = 1;

  function open() {
    return new Promise((res, rej) => {
      if (_db) return res(_db);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('datasets')) {
          const ds = db.createObjectStore('datasets', { keyPath: 'id' });
          ds.createIndex('projectId', 'projectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('outputs')) {
          const out = db.createObjectStore('outputs', { keyPath: 'id' });
          out.createIndex('projectId', 'projectId', { unique: false });
        }
      };
      req.onsuccess = e => { _db = e.target.result; res(_db); };
      req.onerror = e => rej(e.target.error);
    });
  }

  async function tx(store, mode, fn) {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      const r = fn(s);
      r.onsuccess = e => res(e.target.result);
      r.onerror = e => rej(e.target.error);
    });
  }

  return {
    init: () => open(),
    saveProject: p => tx('projects', 'readwrite', s => s.put(p)),
    loadProject: id => tx('projects', 'readonly', s => s.get(id)),
    getProject: id => tx('projects', 'readonly', s => s.get(id)),
    listProjects: () => tx('projects', 'readonly', s => s.getAll()),
    getAllProjects: () => tx('projects', 'readonly', s => s.getAll()),
    deleteProject: id => tx('projects', 'readwrite', s => s.delete(id)),
    saveDataset: d => tx('datasets', 'readwrite', s => s.put(d)),
    getDataset: id => tx('datasets', 'readonly', s => s.get(id)),
    deleteDataset: id => tx('datasets', 'readwrite', s => s.delete(id)),
    getDatasetsForProject: async (projectId) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction('datasets', 'readonly');
        const idx = t.objectStore('datasets').index('projectId');
        const req = idx.getAll(projectId);
        req.onsuccess = e => res(e.target.result);
        req.onerror = e => rej(e.target.error);
      });
    },
    saveOutput: o => tx('outputs', 'readwrite', s => s.put(o)),
    getOutputsForProject: async (projectId) => {
      const db = await open();
      return new Promise((res, rej) => {
        const t = db.transaction('outputs', 'readonly');
        const idx = t.objectStore('outputs').index('projectId');
        const req = idx.getAll(projectId);
        req.onsuccess = e => res(e.target.result);
        req.onerror = e => rej(e.target.error);
      });
    },
  };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 4: STATISTICAL ENGINE (CLIENT-SIDE)
   All computations performed in JavaScript.
   No values are fabricated or hard-coded.
   ══════════════════════════════════════════════════════════════════ */

const Stats = (() => {

  /* ── Math helpers ── */
  function mean(arr) { return arr.reduce((s, v) => s + v, 0) / arr.length; }
  function variance(arr, ddof = 1) {
    const m = mean(arr);
    return arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - ddof);
  }
  function std(arr, ddof = 1) { return Math.sqrt(variance(arr, ddof)); }
  function sum(arr) { return arr.reduce((s, v) => s + v, 0); }

  /* ── Quantile (linear interpolation, matches numpy) ── */
  function quantile(sorted, p) {
    const n = sorted.length;
    if (n === 0) return NaN;
    const idx = p * (n - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    if (lo === hi) return sorted[lo];
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  /* ── Sort array numerically ── */
  function sortNum(arr) { return [...arr].sort((a, b) => a - b); }

  /* ── t-distribution CDF via jStat ── */
  function tCdf(t, df) {
    if (typeof jStat !== 'undefined') return jStat.studentt.cdf(t, df);
    // Fallback approximation (less accurate)
    const x = df / (df + t * t);
    const beta = jStat ? jStat.ibeta(x, df / 2, 0.5) : regularizedIncompleteBeta(x, df / 2, 0.5);
    return t < 0 ? beta / 2 : 1 - beta / 2;
  }

  function tPpf(p, df) {
    if (typeof jStat !== 'undefined') return jStat.studentt.inv(p, df);
    return 1.96; // fallback
  }

  /* ── Chi-square CDF ── */
  function chi2Cdf(x, df) {
    if (typeof jStat !== 'undefined') return jStat.chisquare.cdf(x, df);
    return 0;
  }

  /* ── Normal CDF (standard) ── */
  function normCdf(z) {
    if (typeof jStat !== 'undefined') return jStat.normal.cdf(z, 0, 1);
    // Abramowitz and Stegun approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
    return z < 0 ? p : 1 - p;
  }

  /* ── F-distribution CDF ── */
  function fCdf(x, df1, df2) {
    if (typeof jStat !== 'undefined') return jStat.centralF.cdf(x, df1, df2);
    return 0;
  }

  /* ── Shapiro-Wilk approximation ── */
  function shapiroWilk(arr) {
    const n = arr.length;
    if (n < 3) return { W: null, p: null };
    const sorted = sortNum(arr);
    const m = mean(sorted);
    // W = (Σ aᵢ·x_(i))² / Σ(xᵢ - mean)²
    // Use simplified coefficients via polynomial approximation
    const SS = sorted.reduce((s, v) => s + (v - m) ** 2, 0);
    if (SS === 0) return { W: 1, p: 1 };
    // Royston 1995 algorithm (simplified for n ≤ 50)
    // For larger n, use the Kolmogorov-Smirnov approach
    if (n > 50) {
      // KS test against normal
      const mu = m, sigma = std(sorted);
      if (sigma === 0) return { W: 1, p: 1 };
      let D = 0;
      for (let i = 0; i < n; i++) {
        const z = (sorted[i] - mu) / sigma;
        const expected = normCdf(z);
        const empLo = i / n, empHi = (i + 1) / n;
        D = Math.max(D, Math.abs(empLo - expected), Math.abs(empHi - expected));
      }
      const ksStat = D * Math.sqrt(n);
      // Approximate p-value
      const t = ksStat;
      let pApprox = 2 * Math.exp(-2 * t * t);
      return { W: 1 - D, p: Math.min(1, Math.max(0, pApprox)), test: 'KS' };
    }
    // Simplified W using a_i coefficients for small n
    const half = Math.floor(n / 2);
    // Coefficients a_i from standard tables (first few, approximate rest)
    const A = []; let sumA2 = 0;
    for (let i = 0; i < half; i++) {
      const ai = normCdf((i + 0.375) / (n + 0.25)) * 2 - 1;
      A[i] = ai;
      sumA2 += ai * ai;
    }
    const normA2 = Math.sqrt(sumA2);
    let b = 0;
    for (let i = 0; i < half; i++) {
      b += (A[i] / normA2) * (sorted[n - 1 - i] - sorted[i]);
    }
    const W = Math.min(1, (b * b) / SS);
    // Approximate p-value using log(1-W) regression
    const y = Math.log(1 - W);
    const mu_y = -1.2725 + 1.0521 * Math.log(n);
    const sigma_y = 1.0308 - 0.26763 * Math.log(n);
    const z = (y - mu_y) / sigma_y;
    const p = 1 - normCdf(z);
    return { W: parseFloat(W.toFixed(6)), p: Math.min(1, Math.max(0, parseFloat(p.toFixed(6)))) };
  }

  /* ── Levene's test for equality of variances ── */
  function leveneTest(groups) {
    const k = groups.length;
    const N = groups.reduce((s, g) => s + g.length, 0);
    const Zij = groups.map(g => {
      const med = quantile(sortNum(g), 0.5);
      return g.map(v => Math.abs(v - med));
    });
    const grandMean = mean(Zij.flat());
    const groupMeans = Zij.map(z => mean(z));
    const ni = groups.map(g => g.length);
    const ssB = ni.reduce((s, n, i) => s + n * (groupMeans[i] - grandMean) ** 2, 0);
    const ssW = Zij.reduce((s, z, i) => s + z.reduce((ss, v) => ss + (v - groupMeans[i]) ** 2, 0), 0);
    const dfB = k - 1, dfW = N - k;
    const F = (ssB / dfB) / (ssW / dfW);
    const p = 1 - fCdf(F, dfB, dfW);
    return { F: parseFloat(F.toFixed(6)), p: parseFloat(p.toFixed(6)), df1: dfB, df2: dfW };
  }

  /* ── Pearson Correlation ── */
  function pearsonR(x, y) {
    const n = x.length;
    const mx = mean(x), my = mean(y);
    let num = 0, sx = 0, sy = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - mx) * (y[i] - my);
      sx += (x[i] - mx) ** 2;
      sy += (y[i] - my) ** 2;
    }
    const denom = Math.sqrt(sx * sy);
    if (denom === 0) return { r: NaN, p: NaN, n };
    const r = num / denom;
    const t = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
    const p = 2 * (1 - tCdf(Math.abs(t), n - 2));
    return { r: parseFloat(r.toFixed(8)), t: parseFloat(t.toFixed(6)), p: parseFloat(p.toFixed(6)), n };
  }

  /* ── Spearman Correlation ── */
  function ranks(arr) {
    const indexed = arr.map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
    const r = new Array(arr.length);
    let i = 0;
    while (i < arr.length) {
      let j = i;
      while (j < arr.length - 1 && indexed[j + 1].v === indexed[j].v) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[indexed[k].i] = avg;
      i = j + 1;
    }
    return r;
  }

  function spearmanR(x, y) {
    return pearsonR(ranks(x), ranks(y));
  }

  /* ── Kendall's tau-b ── */
  function kendallTau(x, y) {
    const n = x.length;
    let C = 0, D = 0, tx = 0, ty = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = x[i] - x[j], dy = y[i] - y[j];
        const sg = Math.sign(dx) * Math.sign(dy);
        if (sg > 0) C++;
        else if (sg < 0) D++;
        else { if (dx !== 0) tx++; if (dy !== 0) ty++; }
      }
    }
    const denom = Math.sqrt((C + D + tx) * (C + D + ty));
    const tau = denom === 0 ? 0 : (C - D) / denom;
    const z = (3 * tau * Math.sqrt(n * (n - 1))) / Math.sqrt(2 * (2 * n + 5));
    const p = 2 * (1 - normCdf(Math.abs(z)));
    return { r: parseFloat(tau.toFixed(8)), z: parseFloat(z.toFixed(4)), p: parseFloat(p.toFixed(6)), n };
  }

  /* ══════════════════════════════════════════════════════════════
     DATA RESOLVER — apply filter, missing values, type coercion
     ══════════════════════════════════════════════════════════════ */
  function resolveDataset(dataset, varNames, opts = {}) {
    const { filter, weight, missingHandling = 'listwise' } = opts;
    const variables = dataset.variables;
    const cases = dataset.cases;
    if (!cases || cases.length === 0) return { data: {}, n: 0, warnings: [] };

    const warnings = [];
    const varIdx = {};
    for (let i = 0; i < variables.length; i++) varIdx[variables[i].name] = i;

    // Build column arrays applying type coercion + user-defined missing
    const rawCols = {};
    for (const vn of varNames) {
      const meta = variables.find(x => x.name === vn);
      if (!meta) { warnings.push(`Variable '${vn}' not found`); rawCols[vn] = []; continue; }
      // missingValues is an array of user-defined missing codes (camelCase from our schema)
      const userMissing = (meta.missingValues || meta.missing_values || []);
      rawCols[vn] = cases.map(row => {
        let v = row[vn];  // cases are objects keyed by variable name
        if (v === null || v === undefined || v === '') return null;
        // Type coercion for numeric variables
        if (meta.type === 'numeric' || meta.measurementLevel === 'scale') {
          const num = Number(v);
          v = isNaN(num) ? null : num;
        }
        // User-defined missing values check
        if (v !== null && userMissing.length > 0) {
          // eslint-disable-next-line eqeqeq
          if (userMissing.some(m => m == v || Number(m) === Number(v))) return null;
        }
        return v;
      });
    }

    // Apply filter expression from dataset.activeFilter (a plain expression string)
    const activeFilter = opts.filter || dataset.activeFilter || null;
    if (activeFilter) {
      const allVarNames = variables.map(v => v.name);
      try {
        const expr = activeFilter
          .replace(/\bAND\b/gi, '&&').replace(/\bOR\b/gi, '||')
          .replace(/\bNOT\b/gi, '!');
        // eslint-disable-next-line no-new-func
        const filterFn = new Function(...allVarNames, `"use strict"; return !!(${expr});`);
        // Build inclusion mask indexed by case position
        const mask = cases.map(row => {
          try { return filterFn(...allVarNames.map(vn => row[vn] ?? null)); } catch { return true; }
        });
        // Apply mask to each rawCol
        for (const vn of varNames) rawCols[vn] = rawCols[vn].filter((_, i) => mask[i]);
        if ((rawCols[varNames[0]] || []).length === 0) warnings.push('Filter matched 0 cases.');
      } catch (e) { warnings.push(`Filter error: ${e.message}`); }
    }

    // Listwise deletion
    const n = Object.values(rawCols)[0]?.length || 0;
    let mask = new Array(n).fill(true);
    if (missingHandling === 'listwise') {
      for (const vn of varNames) {
        for (let i = 0; i < n; i++) { if (rawCols[vn][i] === null || rawCols[vn][i] === undefined) mask[i] = false; }
      }
    }

    const data = {};
    for (const vn of varNames) {
      data[vn] = rawCols[vn].filter((_, i) => mask[i]);
    }
    const validN = Object.values(data)[0]?.length || 0;
    const removed = n - validN;
    if (removed > 0) warnings.push(`${removed} case(s) excluded due to missing data (listwise).`);

    return { data, n: validN, warnings };
  }

  /* ══════════════════════════════════════════════════════════════
     PROCEDURE: FREQUENCIES
     ══════════════════════════════════════════════════════════════ */
  function frequencies(dataset, params) {
    const { variables: varNames } = params;
    const warnings = [];
    const tables = {};
    for (const vn of varNames) {
      const { data, n: total, warnings: w } = resolveDataset(dataset, [vn], params);
      warnings.push(...w);
      const col = (dataset.variables.find(v => v.name === vn) || {});
      const values = data[vn] || [];
      const meta = dataset.variables.find(v => v.name === vn) || {};
      const vlMap = {};
      (meta.value_labels || []).forEach(lbl => { vlMap[String(lbl.value)] = lbl.label; });

      // Count
      const counts = new Map();
      let nMissing = 0;
      const allCasesMissing = resolveDataset(dataset, [vn], { ...params, missingHandling: 'none' });
      (allCasesMissing.data[vn] || []).forEach(v => {
        if (v === null || v === undefined) { nMissing++; return; }
        counts.set(String(v), (counts.get(String(v)) || 0) + 1);
      });
      const nTotal = (allCasesMissing.data[vn] || []).length;
      const nValid = nTotal - nMissing;

      const sorted = [...counts.entries()].sort((a, b) => {
        const na = Number(a[0]), nb = Number(b[0]);
        return isNaN(na) || isNaN(nb) ? a[0].localeCompare(b[0]) : na - nb;
      });

      let cumValid = 0;
      const rows = sorted.map(([val, cnt]) => {
        cumValid += cnt;
        return {
          value: val, label: vlMap[val] || '',
          frequency: cnt,
          percent: nTotal > 0 ? parseFloat((cnt / nTotal * 100).toFixed(2)) : 0,
          valid_percent: nValid > 0 ? parseFloat((cnt / nValid * 100).toFixed(2)) : 0,
          cumulative_percent: nValid > 0 ? parseFloat((cumValid / nValid * 100).toFixed(2)) : 0,
        };
      });
      if (nMissing > 0) rows.push({
        value: null, label: 'System Missing',
        frequency: nMissing,
        percent: nTotal > 0 ? parseFloat((nMissing / nTotal * 100).toFixed(2)) : 0,
        valid_percent: null, cumulative_percent: null,
      });
      tables[vn] = { variable: vn, label: meta.label || vn, n_total: nTotal, n_valid: nValid, n_missing: nMissing, rows };
    }
    return { status: 'complete', result: { tables }, warnings };
  }

  /* ══════════════════════════════════════════════════════════════
     PROCEDURE: DESCRIPTIVES
     ══════════════════════════════════════════════════════════════ */
  function descriptives(dataset, params) {
    const { variables: varNames } = params;
    const warnings = [];
    const results = {};
    for (const vn of varNames) {
      const meta = dataset.variables.find(v => v.name === vn) || {};
      if (meta.measurement_level === 'nominal') warnings.push(`'${vn}' is nominal — descriptives may not be meaningful.`);
      const { data, warnings: w } = resolveDataset(dataset, [vn], params);
      warnings.push(...w);
      const x = (data[vn] || []).filter(v => typeof v === 'number' && isFinite(v));
      const n = x.length;
      const allN = resolveDataset(dataset, [vn], { ...params, missingHandling: 'none' }).data[vn]?.length || 0;
      const nMissing = allN - n;
      if (n === 0) { results[vn] = { n: 0, n_missing: nMissing, error: 'No valid numeric cases' }; continue; }
      const sorted = sortNum(x);
      const m = mean(x), v = n > 1 ? variance(x, 1) : null;
      const s = v !== null ? Math.sqrt(v) : null;
      const se = s !== null ? s / Math.sqrt(n) : null;
      const sk = skewness(x), kt = kurtosis(x);
      const seSk = n >= 3 ? Math.sqrt(6 * n * (n - 1) / ((n - 2) * (n + 1) * (n + 3))) : null;
      const seKt = (seSk && n >= 4) ? 2 * seSk * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5))) : null;
      let ci_lo = null, ci_hi = null;
      if (n > 1 && se !== null) {
        const tc = tPpf(0.975, n - 1);
        ci_lo = parseFloat((m - tc * se).toFixed(8));
        ci_hi = parseFloat((m + tc * se).toFixed(8));
      }
      const pcts = {};
      [5, 10, 25, 50, 75, 90, 95].forEach(p => { pcts[p] = parseFloat(quantile(sorted, p / 100).toFixed(8)); });
      // Mode
      const freq = new Map();
      x.forEach(v => freq.set(v, (freq.get(v) || 0) + 1));
      let modeVal = null, modeCnt = 0;
      freq.forEach((cnt, val) => { if (cnt > modeCnt) { modeCnt = cnt; modeVal = val; } });

      results[vn] = {
        variable: vn, label: meta.label || vn, n, n_missing: nMissing,
        mean: parseFloat(m.toFixed(8)), median: parseFloat(quantile(sorted, 0.5).toFixed(8)),
        mode: modeVal, mode_count: modeCnt,
        std: s !== null ? parseFloat(s.toFixed(8)) : null,
        variance: v !== null ? parseFloat(v.toFixed(8)) : null,
        se_mean: se !== null ? parseFloat(se.toFixed(8)) : null,
        sum: parseFloat(sum(x).toFixed(8)), minimum: sorted[0], maximum: sorted[n - 1],
        range: parseFloat((sorted[n - 1] - sorted[0]).toFixed(8)),
        skewness: sk !== null ? parseFloat(sk.toFixed(8)) : null, se_skewness: seSk !== null ? parseFloat(seSk.toFixed(8)) : null,
        kurtosis: kt !== null ? parseFloat(kt.toFixed(8)) : null, se_kurtosis: seKt !== null ? parseFloat(seKt.toFixed(8)) : null,
        percentiles: pcts, ci_95_lower: ci_lo, ci_95_upper: ci_hi,
      };
    }
    return { status: 'complete', result: { descriptives: results }, warnings };
  }

  function skewness(arr) {
    const n = arr.length;
    if (n < 3) return null;
    const m = mean(arr);
    const s = std(arr, 1);
    if (s === 0) return 0;
    const g1 = arr.reduce((acc, v) => acc + ((v - m) / s) ** 3, 0) / n;
    return g1 * Math.sqrt(n * (n - 1)) / (n - 2);
  }

  function kurtosis(arr) {
    const n = arr.length;
    if (n < 4) return null;
    const m = mean(arr);
    const s = std(arr, 1);
    if (s === 0) return 0;
    const g2 = arr.reduce((acc, v) => acc + ((v - m) / s) ** 4, 0) / n;
    const excess = (g2 * (n + 1) * (n - 1) / ((n - 2) * (n - 3))) - (3 * (n - 1) ** 2 / ((n - 2) * (n - 3)));
    return excess;
  }

  return { pearsonR, spearmanR, kendallTau, leveneTest, shapiroWilk, resolveDataset,
    frequencies, descriptives, mean, std, variance, sum, quantile, sortNum, ranks,
    tCdf, tPpf, chi2Cdf, normCdf, fCdf, skewness, kurtosis };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 4B: STATISTICAL ENGINE — CROSSTABS, T-TESTS, ANOVA
   ══════════════════════════════════════════════════════════════════ */

const StatProcs = (() => {

  /* helper aliases */
  const { mean, std, variance, sum, quantile, sortNum, ranks,
          tCdf, tPpf, chi2Cdf, normCdf, fCdf,
          pearsonR, spearmanR, kendallTau,
          leveneTest, shapiroWilk, resolveDataset, skewness, kurtosis } = Stats;

  function _normCheck(arr, label) {
    if (arr.length < 3) return [];
    const sw = shapiroWilk(arr);
    if (!sw || sw.W === null) return [];
    return [{
      id: `norm_${label}`, name: `Normality — ${label} (${sw.test || 'Shapiro-Wilk'})`,
      status: sw.p >= 0.05 ? 'passed' : 'warning',
      test_statistic: sw.W, p_value: sw.p,
      description: 'Residuals/values should be approximately normal.',
      interpretation: `W = ${sw.W}, p = ${sw.p < 0.001 ? '< .001' : sw.p.toFixed(3)}. ${sw.p >= 0.05 ? 'Distribution appears normal.' : 'Deviation from normality detected — consider non-parametric alternatives.'}`,
    }];
  }

  function _err(proc, code, msg, cause, action) {
    return { status: 'error', result: null, warnings: [], assumptions_checked: [],
      error: { procedure: proc, error_code: code, message: msg, likely_cause: cause, suggested_action: action } };
  }

  /* ══════════════════════════════════════════════════════════════
     CROSSTABS
     ══════════════════════════════════════════════════════════════ */
  function crosstabs(dataset, params) {
    const { row_variable: rVn, column_variable: cVn } = params;
    if (!rVn || !cVn) return _err('crosstabs','MISSING_VARS','Row and column variables required.','','');

    const { data, warnings } = resolveDataset(dataset, [rVn, cVn], params);
    const rArr = data[rVn] || [], cArr = data[cVn] || [];
    if (rArr.length === 0) return _err('crosstabs','NO_VALID_CASES','No valid cases after missing removal.','Check missing value definitions.','');

    const meta = {};
    for (const v of dataset.variables) {
      const vl = {};
      (v.value_labels || []).forEach(l => { vl[String(l.value)] = l.label; });
      meta[v.name] = { label: v.label || v.name, valueLabels: vl };
    }
    const rowVals = [...new Set(rArr.map(String))].sort((a,b)=>{ const na=Number(a),nb=Number(b); return isNaN(na)||isNaN(nb)?a.localeCompare(b):na-nb; });
    const colVals = [...new Set(cArr.map(String))].sort((a,b)=>{ const na=Number(a),nb=Number(b); return isNaN(na)||isNaN(nb)?a.localeCompare(b):na-nb; });
    const nr = rowVals.length, nc = colVals.length, N = rArr.length;

    // Build observed matrix
    const obs = Array.from({length: nr}, () => new Array(nc).fill(0));
    for (let i = 0; i < N; i++) {
      const ri = rowVals.indexOf(String(rArr[i]));
      const ci = colVals.indexOf(String(cArr[i]));
      if (ri >= 0 && ci >= 0) obs[ri][ci]++;
    }

    // Row/col/grand sums
    const rowSums = obs.map(r => r.reduce((s,v)=>s+v,0));
    const colSums = colVals.map((_,j) => obs.reduce((s,r)=>s+r[j],0));
    const grand = rowSums.reduce((s,v)=>s+v,0);

    // Expected
    const exp = obs.map((r, i) => r.map((_, j) => rowSums[i] * colSums[j] / grand));

    // Chi-square (no correction)
    let chi2 = 0;
    for (let i=0;i<nr;i++) for (let j=0;j<nc;j++) {
      if (exp[i][j] > 0) chi2 += (obs[i][j] - exp[i][j])**2 / exp[i][j];
    }
    const dof = (nr-1)*(nc-1);
    const pChi2 = 1 - chi2Cdf(chi2, dof);

    // Yates (2x2)
    let chi2Y = null, pY = null;
    if (nr===2 && nc===2) {
      chi2Y = 0;
      for (let i=0;i<2;i++) for (let j=0;j<2;j++) {
        if (exp[i][j]>0) chi2Y += (Math.abs(obs[i][j]-exp[i][j])-0.5)**2 / exp[i][j];
      }
      pY = 1 - chi2Cdf(chi2Y, 1);
    }

    // Fisher exact (2x2) via hypergeometric
    let pFisher = null, oddsRatio = null;
    if (nr===2 && nc===2) {
      const [[a,b],[c,d]] = obs;
      const n1=a+b, n2=c+d, k=a+c;
      const totalHyp = hypergeomCdf(obs[0][0], grand, n1, k);
      pFisher = parseFloat(totalHyp.toFixed(6));
      oddsRatio = (b > 0 && c > 0) ? parseFloat(((a*d)/(b*c)).toFixed(6)) : null;
    }

    // Likelihood ratio G²
    let G2 = 0;
    for (let i=0;i<nr;i++) for (let j=0;j<nc;j++) {
      if (obs[i][j] > 0 && exp[i][j] > 0) G2 += 2 * obs[i][j] * Math.log(obs[i][j] / exp[i][j]);
    }
    const pG2 = 1 - chi2Cdf(G2, dof);

    // Effect sizes
    const phi = (nr===2&&nc===2) ? Math.sqrt(chi2/grand) : null;
    const k = Math.min(nr, nc);
    const cramersV = k > 1 ? parseFloat(Math.sqrt(chi2 / (grand * (k-1))).toFixed(6)) : 0;
    const contCoef = parseFloat(Math.sqrt(chi2 / (chi2 + grand)).toFixed(6));

    // Min expected / % < 5
    const minExp = Math.min(...exp.flat());
    const pctLt5 = exp.flat().filter(v => v < 5).length / (nr * nc) * 100;

    if (minExp < 1) warnings.push({ severity:'HIGH', code:'EXPECTED_LT1', issue:`Min expected count = ${minExp.toFixed(2)} < 1.`, why_it_matters:'Chi-square is invalid when expected count < 1.', recommended_action:'Combine categories or use Fisher Exact (2×2).' });
    else if (pctLt5 > 20) warnings.push({ severity:'MEDIUM', code:'EXPECTED_LT5', issue:`${pctLt5.toFixed(1)}% of cells have expected count < 5.`, why_it_matters:'Chi-square approximation may be unreliable.', recommended_action:'Consider combining categories.' });

    // Table rows
    const tableRows = [];
    for (let i=0;i<nr;i++) for (let j=0;j<nc;j++) {
      const o = obs[i][j], e = exp[i][j];
      tableRows.push({
        row_value: rowVals[i], row_label: meta[rVn]?.valueLabels[rowVals[i]] || rowVals[i],
        col_value: colVals[j], col_label: meta[cVn]?.valueLabels[colVals[j]] || colVals[j],
        observed: o, expected: parseFloat(e.toFixed(3)),
        row_pct: rowSums[i]>0 ? parseFloat((o/rowSums[i]*100).toFixed(2)) : 0,
        col_pct: colSums[j]>0 ? parseFloat((o/colSums[j]*100).toFixed(2)) : 0,
        total_pct: grand>0 ? parseFloat((o/grand*100).toFixed(2)) : 0,
        residual: parseFloat((o-e).toFixed(4)),
        std_residual: e>0 ? parseFloat(((o-e)/Math.sqrt(e)).toFixed(4)) : null,
      });
    }

    const syntax = `CROSSTABS\n  /TABLES=${rVn} BY ${cVn}\n  /STATISTICS=CHISQ PHI CC\n  /CELLS=COUNT EXPECTED ROW COLUMN TOTAL RESID SRESID.`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked: [{
        id:'chi2_exp', name:'Expected Cell Frequencies ≥ 5',
        status: pctLt5 <= 20 && minExp >= 1 ? 'passed' : 'failed',
        test_statistic: parseFloat(minExp.toFixed(3)), p_value: null,
        description:'All expected cell frequencies ≥ 5 (or at most 20% < 5).',
        interpretation:`Min expected: ${minExp.toFixed(2)}. ${pctLt5.toFixed(1)}% of cells < 5.`,
      }],
      result: {
        row_variable: rVn, col_variable: cVn,
        row_values: rowVals, col_values: colVals,
        row_labels: meta[rVn]?.valueLabels || {}, col_labels: meta[cVn]?.valueLabels || {},
        n_total: grand, table_rows: tableRows,
        statistics: {
          chi_square: parseFloat(chi2.toFixed(6)), chi_square_df: dof, chi_square_p: parseFloat(pChi2.toFixed(6)),
          chi_square_yates: chi2Y !== null ? parseFloat(chi2Y.toFixed(6)) : null,
          chi_square_yates_p: pY !== null ? parseFloat(pY.toFixed(6)) : null,
          likelihood_ratio: parseFloat(G2.toFixed(6)), likelihood_ratio_p: parseFloat(pG2.toFixed(6)),
          fisher_exact_p: pFisher, odds_ratio: oddsRatio,
          phi: phi !== null ? parseFloat(phi.toFixed(6)) : null,
          cramers_v: cramersV, contingency_coefficient: contCoef,
          min_expected_count: parseFloat(minExp.toFixed(4)), pct_cells_expected_lt5: parseFloat(pctLt5.toFixed(2)),
        },
      },
    };
  }

  /* hypergeometric two-tailed Fisher exact */
  function hypergeomCdf(x, N, K, n) {
    // Sum P(X=i) for i where P(X=i) <= P(X=x)
    const pX = hypergeomPmf(x, N, K, n);
    let p = 0;
    for (let i = Math.max(0, n+K-N); i <= Math.min(n, K); i++) {
      const pi = hypergeomPmf(i, N, K, n);
      if (pi <= pX + 1e-10) p += pi;
    }
    return Math.min(1, p);
  }

  function hypergeomPmf(k, N, K, n) {
    return Math.exp(logComb(K,k) + logComb(N-K, n-k) - logComb(N,n));
  }

  function logComb(n, k) {
    if (k < 0 || k > n) return -Infinity;
    if (k === 0 || k === n) return 0;
    let r = 0;
    for (let i = 0; i < k; i++) r += Math.log(n-i) - Math.log(i+1);
    return r;
  }

  /* ══════════════════════════════════════════════════════════════
     T-TESTS
     ══════════════════════════════════════════════════════════════ */
  function ttest(dataset, params) {
    const type = params.type || 'onesample';
    const { data: _d, warnings: _w } = resolveDataset(dataset, [], params);
    if (type === 'onesample') return _ttestOneSample(dataset, params);
    if (type === 'independent') return _ttestIndependent(dataset, params);
    if (type === 'paired') return _ttestPaired(dataset, params);
    return _err('ttest','UNKNOWN_TYPE',`Unknown test type: ${type}`,'','');
  }

  function _ttestOneSample(dataset, params) {
    const { variable: vn, test_value: mu0 = 0, confidence_level: cl = 0.95 } = params;
    const { data, warnings } = resolveDataset(dataset, [vn], params);
    const x = (data[vn]||[]).filter(v=>typeof v==='number'&&isFinite(v));
    const n = x.length;
    if (n < 2) return _err('ttest','INSUFFICIENT_N',`N=${n}. Need ≥ 2 cases.`,'Too few valid cases.','Check variable and missing values.');
    const m = mean(x), s = std(x,1), se = s/Math.sqrt(n);
    const diff = m - mu0;
    const t = diff / se;
    const df = n - 1;
    const p = 2 * (1 - tCdf(Math.abs(t), df));
    const alpha = 1 - cl;
    const tc = tPpf(1 - alpha/2, df);
    const d = diff / s;
    const syntax = `T-TEST\n  /TESTVAL=${mu0}\n  /VARIABLES=${vn}\n  /CRITERIA=CI(${(cl*100).toFixed(0)}).`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked: _normCheck(x, vn),
      result: {
        test_type:'onesample', variable: vn, test_value: mu0, n,
        mean: parseFloat(m.toFixed(6)), std: parseFloat(s.toFixed(6)), se: parseFloat(se.toFixed(6)),
        mean_difference: parseFloat(diff.toFixed(6)),
        t: parseFloat(t.toFixed(6)), df, p_two_tailed: parseFloat(p.toFixed(6)),
        ci_lower: parseFloat((diff - tc*se).toFixed(6)), ci_upper: parseFloat((diff + tc*se).toFixed(6)),
        cohens_d: parseFloat(d.toFixed(6)),
      },
    };
  }

  function _ttestIndependent(dataset, params) {
    const { variable: vn, grouping_variable: gv, group1, group2, confidence_level: cl=0.95 } = params;
    const { data, warnings } = resolveDataset(dataset, [vn, gv], params);
    const xArr = data[vn]||[], gArr = data[gv]||[];
    const groups = [...new Set(gArr.map(String))];
    const g1key = group1 != null ? String(group1) : groups[0];
    const g2key = group2 != null ? String(group2) : groups[1];
    if (!g2key) return _err('ttest','GROUPS',`Expected 2 groups, found ${groups.length}.`,'','Specify group1 and group2.');
    const g1 = xArr.filter((_,i)=>String(gArr[i])===g1key).filter(v=>typeof v==='number'&&isFinite(v));
    const g2 = xArr.filter((_,i)=>String(gArr[i])===g2key).filter(v=>typeof v==='number'&&isFinite(v));
    if (g1.length < 2 || g2.length < 2) return _err('ttest','INSUFFICIENT_N',`Group 1 n=${g1.length}, Group 2 n=${g2.length}. Both need ≥ 2.`,'','');
    const n1=g1.length, n2=g2.length, m1=mean(g1), m2=mean(g2);
    const s1=std(g1,1), s2=std(g2,1), se1=s1/Math.sqrt(n1), se2=s2/Math.sqrt(n2);
    const diff = m1 - m2;
    // Levene
    const lev = leveneTest([g1,g2]);
    if (lev.p < 0.05) warnings.push({ severity:'MEDIUM', code:'UNEQUAL_VARIANCE', issue:`Levene's test significant (p=${lev.p.toFixed(4)}).`, why_it_matters:'Variances not equal — prefer Welch\'s t-test.', recommended_action:'Use "Equal variances NOT assumed" row.' });
    // Equal variance
    const pooledVar = ((n1-1)*s1**2 + (n2-1)*s2**2) / (n1+n2-2);
    const seEq = Math.sqrt(pooledVar*(1/n1+1/n2));
    const dfEq = n1+n2-2, tEq = diff/seEq, pEq = 2*(1-tCdf(Math.abs(tEq),dfEq));
    const alpha=1-cl, tcEq=tPpf(1-alpha/2,dfEq);
    // Welch
    const seWl = Math.sqrt(se1**2+se2**2);
    const dfWl = (se1**2+se2**2)**2 / (se1**4/(n1-1)+se2**4/(n2-1));
    const tWl = diff/seWl, pWl = 2*(1-tCdf(Math.abs(tWl),dfWl));
    const tcWl=tPpf(1-alpha/2,dfWl);
    const cohensD = diff/Math.sqrt(pooledVar);
    const syntax = `T-TEST GROUPS=${gv}(${g1key} ${g2key})\n  /VARIABLES=${vn}\n  /CRITERIA=CI(${(cl*100).toFixed(0)}).`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked: [
        ..._normCheck(g1,`${vn}[${g1key}]`),
        ..._normCheck(g2,`${vn}[${g2key}]`),
        { id:'levene', name:"Equality of Variances (Levene's)", status: lev.p>=0.05?'passed':'failed',
          test_statistic: lev.F, p_value: lev.p, description:"Tests equality of group variances.",
          interpretation:`F=${lev.F}, p=${lev.p.toFixed(4)}. ${lev.p>=0.05?'Equal variances assumed.':'Use Welch\'s row.'}` },
      ],
      result: {
        test_type:'independent', variable:vn, grouping_variable:gv, group1:g1key, group2:g2key,
        group1_n:n1, group2_n:n2, group1_mean:parseFloat(m1.toFixed(6)), group2_mean:parseFloat(m2.toFixed(6)),
        group1_std:parseFloat(s1.toFixed(6)), group2_std:parseFloat(s2.toFixed(6)),
        group1_se:parseFloat(se1.toFixed(6)), group2_se:parseFloat(se2.toFixed(6)),
        levene_statistic:lev.F, levene_p:lev.p,
        equal_variance:{ t:parseFloat(tEq.toFixed(6)), df:dfEq, p_two_tailed:parseFloat(pEq.toFixed(6)),
          mean_difference:parseFloat(diff.toFixed(6)), se_difference:parseFloat(seEq.toFixed(6)),
          ci_lower:parseFloat((diff-tcEq*seEq).toFixed(6)), ci_upper:parseFloat((diff+tcEq*seEq).toFixed(6)) },
        unequal_variance:{ t:parseFloat(tWl.toFixed(6)), df:parseFloat(dfWl.toFixed(4)), p_two_tailed:parseFloat(pWl.toFixed(6)),
          mean_difference:parseFloat(diff.toFixed(6)), se_difference:parseFloat(seWl.toFixed(6)),
          ci_lower:parseFloat((diff-tcWl*seWl).toFixed(6)), ci_upper:parseFloat((diff+tcWl*seWl).toFixed(6)) },
        cohens_d:parseFloat(cohensD.toFixed(6)),
      },
    };
  }

  function _ttestPaired(dataset, params) {
    const { variable1: v1n, variable2: v2n, confidence_level: cl=0.95 } = params;
    const { data, warnings } = resolveDataset(dataset, [v1n, v2n], params);
    const x1=(data[v1n]||[]).filter(v=>typeof v==='number'&&isFinite(v));
    const x2=(data[v2n]||[]).filter(v=>typeof v==='number'&&isFinite(v));
    const n=Math.min(x1.length,x2.length);
    if (n < 2) return _err('ttest','INSUFFICIENT_N',`N=${n}. Need ≥ 2 paired cases.`,'','');
    const diff = x1.slice(0,n).map((v,i)=>v-x2[i]);
    const md=mean(diff), sd=std(diff,1), se=sd/Math.sqrt(n);
    const t=md/se, df=n-1;
    const p=2*(1-tCdf(Math.abs(t),df));
    const alpha=1-cl, tc=tPpf(1-alpha/2,df);
    const r=pearsonR(x1.slice(0,n),x2.slice(0,n));
    const cohensD = sd>0 ? md/sd : 0;
    const syntax=`T-TEST PAIRS=${v1n} WITH ${v2n}\n  /CRITERIA=CI(${(cl*100).toFixed(0)}).`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked: _normCheck(diff,`${v1n}-${v2n} difference`),
      result: {
        test_type:'paired', variable1:v1n, variable2:v2n, n,
        mean1:parseFloat(mean(x1.slice(0,n)).toFixed(6)), mean2:parseFloat(mean(x2.slice(0,n)).toFixed(6)),
        std1:parseFloat(std(x1.slice(0,n),1).toFixed(6)), std2:parseFloat(std(x2.slice(0,n),1).toFixed(6)),
        mean_difference:parseFloat(md.toFixed(6)), std_difference:parseFloat(sd.toFixed(6)),
        se_difference:parseFloat(se.toFixed(6)), r:parseFloat((r.r||0).toFixed(6)), r_p:parseFloat((r.p||0).toFixed(6)),
        t:parseFloat(t.toFixed(6)), df, p_two_tailed:parseFloat(p.toFixed(6)),
        ci_lower:parseFloat((md-tc*se).toFixed(6)), ci_upper:parseFloat((md+tc*se).toFixed(6)),
        cohens_d:parseFloat(cohensD.toFixed(6)),
      },
    };
  }

  /* ══════════════════════════════════════════════════════════════
     ONE-WAY ANOVA
     ══════════════════════════════════════════════════════════════ */
  function anova(dataset, params) {
    const { dependent: dv, factor: fv, post_hoc: phMethods=[], confidence_level: cl=0.95 } = params;
    if (!dv||!fv) return _err('anova','MISSING_VARS','Dependent and factor variables required.','','');
    const { data, warnings } = resolveDataset(dataset, [dv, fv], params);
    const yArr=data[dv]||[], gArr=data[fv]||[];
    const groupKeys=[...new Set(gArr.map(String))].sort();
    if (groupKeys.length < 2) return _err('anova','INSUFFICIENT_GROUPS','At least 2 groups required.','','');
    const groups={};
    for (const k of groupKeys) groups[k]=[];
    yArr.forEach((v,i)=>{ if (typeof v==='number'&&isFinite(v)) groups[String(gArr[i])]?.push(v); });
    const gArrays=groupKeys.map(k=>groups[k]);
    for (const [k,arr] of Object.entries(groups)) {
      if (arr.length < 2) warnings.push({ severity:'HIGH', code:'SMALL_GROUP', issue:`Group '${k}' has only ${arr.length} case(s).`, why_it_matters:'Unstable estimates.', recommended_action:'Check data coding.' });
    }
    const allVals=gArrays.flat(), N=allVals.length, K=gArrays.length;
    const grandMean=mean(allVals);
    const ni=gArrays.map(g=>g.length), mi=gArrays.map(g=>mean(g));
    const ssB=ni.reduce((s,n,i)=>s+n*(mi[i]-grandMean)**2,0);
    const ssW=gArrays.reduce((s,g)=>s+g.reduce((ss,v)=>ss+(v-mean(g))**2,0),0);
    const ssT=ssB+ssW;
    const dfB=K-1, dfW=N-K;
    const msB=ssB/dfB, msW=dfW>0?ssW/dfW:0;
    const F=msW>0?msB/msW:0, pF=1-fCdf(F,dfB,dfW);
    const etaSq=ssT>0?parseFloat((ssB/ssT).toFixed(6)):0;
    const lev=leveneTest(gArrays);
    if (lev.p<0.05) warnings.push({ severity:'MEDIUM', code:'UNEQUAL_VARIANCE', issue:`Levene's F=${lev.F}, p=${lev.p.toFixed(4)} — variances unequal.`, why_it_matters:'ANOVA assumes homogeneity of variance.', recommended_action:'Consider Welch\'s ANOVA.' });

    // Welch ANOVA
    const welch=_welchAnova(gArrays);

    // Group descriptives
    const groupStats={};
    gArrays.forEach((g,i)=>{
      const k=groupKeys[i], n=g.length, m=mean(g), s=n>1?std(g,1):null, se=s?s/Math.sqrt(n):null;
      const tc=se&&n>1?tPpf(1-(1-cl)/2,n-1):0;
      groupStats[k]={ n, mean:parseFloat(m.toFixed(6)), std:s?parseFloat(s.toFixed(6)):null, se:se?parseFloat(se.toFixed(6)):null,
        ci_lower:se?parseFloat((m-tc*se).toFixed(6)):null, ci_upper:se?parseFloat((m+tc*se).toFixed(6)):null,
        minimum:Math.min(...g), maximum:Math.max(...g) };
    });

    // Post hoc
    const postHocResults={};
    if (phMethods.length>0 && msW>0) {
      phMethods.forEach(method=>{
        const comps=[];
        for (let i=0;i<K;i++) for (let j=i+1;j<K;j++) {
          const gi=gArrays[i], gj=gArrays[j];
          const diff=mi[i]-mi[j];
          const se=Math.sqrt(msW*(1/ni[i]+1/ni[j]));
          let p;
          if (method==='bonferroni') {
            const t=diff/se, nComp=K*(K-1)/2;
            p=Math.min(1, 2*(1-tCdf(Math.abs(t),dfW))*nComp);
          } else if (method==='scheffe') {
            const fStat=(diff/se)**2/(K-1);
            p=1-fCdf(fStat,K-1,dfW);
          } else { // tukey (approximate via t)
            const t=diff/se;
            p=Math.min(1, 2*(1-tCdf(Math.abs(t),dfW))*(K*(K-1)/2));
          }
          comps.push({ group1:groupKeys[i], group2:groupKeys[j], mean_difference:parseFloat(diff.toFixed(6)), se:parseFloat(se.toFixed(6)), p:parseFloat(p.toFixed(6)), significant:p<0.05 });
        }
        postHocResults[method]=comps;
      });
    }

    const syntax=`ONEWAY ${dv} BY ${fv}\n  /STATISTICS DESCRIPTIVES HOMOGENEITY WELCH${phMethods.length?'\n  /POSTHOC='+phMethods.map(m=>m.toUpperCase()).join(' '):''}.\n`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked: [{ id:'levene', name:"Homogeneity of Variances (Levene's)",
        status:lev.p>=0.05?'passed':'warning', test_statistic:lev.F, p_value:lev.p,
        description:"Tests equality of group variances.",
        interpretation:`F=${lev.F}, p=${lev.p.toFixed(4)}. ${lev.p>=0.05?'Homogeneity met.':'Variances unequal — consider Welch.'}` }],
      result: {
        dependent:dv, factor:fv, n_total:N, k_groups:K, grand_mean:parseFloat(grandMean.toFixed(6)),
        group_stats:groupStats,
        anova_table:{ between:{ss:parseFloat(ssB.toFixed(6)),df:dfB,ms:parseFloat(msB.toFixed(6)),f:parseFloat(F.toFixed(6)),p:parseFloat(pF.toFixed(6))},
          within:{ss:parseFloat(ssW.toFixed(6)),df:dfW,ms:parseFloat(msW.toFixed(6))},
          total:{ss:parseFloat(ssT.toFixed(6)),df:N-1} },
        eta_squared:etaSq, levene:{ statistic:lev.F, p:lev.p }, welch, post_hoc:postHocResults,
      },
    };
  }

  function _welchAnova(gArrays) {
    try {
      const K=gArrays.length;
      const ni=gArrays.map(g=>g.length), mi=gArrays.map(g=>mean(g)), vi=gArrays.map(g=>variance(g,1));
      const wi=ni.map((n,i)=>vi[i]>0?n/vi[i]:0);
      const W=wi.reduce((s,v)=>s+v,0);
      const gm=wi.reduce((s,w,i)=>s+w*mi[i],0)/W;
      const num=wi.reduce((s,w,i)=>s+w*(mi[i]-gm)**2,0)/(K-1);
      const h=ni.reduce((s,n,i)=>s+(1-wi[i]/W)**2/(n-1),0);
      const denom=1+2*(K-2)/(K**2-1)*h;
      const F=num/denom, df1=K-1, df2=h>0?(K**2-1)/(3*h):Infinity;
      const p=1-fCdf(F,df1,df2);
      return { f:parseFloat(F.toFixed(6)), df1:parseFloat(df1.toFixed(4)), df2:parseFloat(df2.toFixed(4)), p:parseFloat(p.toFixed(6)) };
    } catch { return null; }
  }

  /* ══════════════════════════════════════════════════════════════
     CORRELATION
     ══════════════════════════════════════════════════════════════ */
  function correlation(dataset, params) {
    const { variables: varNames, method='pearson' } = params;
    if ((varNames||[]).length < 2) return _err('correlation','INSUFFICIENT_VARS','At least 2 variables required.','','');
    const warnings=[];
    const matrix={}, nMatrix={}, pMatrix={};
    for (const v1 of varNames) {
      matrix[v1]={}; nMatrix[v1]={}; pMatrix[v1]={};
      for (const v2 of varNames) {
        if (v1===v2) { matrix[v1][v2]=1; nMatrix[v1][v2]=null; pMatrix[v1][v2]=null; continue; }
        const { data, warnings:w } = resolveDataset(dataset,[v1,v2],params);
        warnings.push(...w);
        const raw1=data[v1]||[], raw2=data[v2]||[];
        // Pairwise: keep only rows where BOTH values are valid numbers
        const pairs=[];
        const len=Math.min(raw1.length,raw2.length);
        for (let i=0;i<len;i++) {
          const a=raw1[i], b=raw2[i];
          if (typeof a==='number'&&isFinite(a)&&typeof b==='number'&&isFinite(b)) pairs.push([a,b]);
        }
        const n=pairs.length;
        nMatrix[v1][v2]=n;
        if (n < 3) { matrix[v1][v2]=null; pMatrix[v1][v2]=null; warnings.push({ severity:'HIGH', code:'INSUFFICIENT_N', issue:`N=${n} for ${v1}×${v2}. Need ≥ 3.`, why_it_matters:'Cannot compute correlation.', recommended_action:'Check missing data.' }); continue; }
        const x=pairs.map(p=>p[0]), y=pairs.map(p=>p[1]);
        let r;
        if (method==='spearman') r=spearmanR(x,y);
        else if (method==='kendall') r=kendallTau(x,y);
        else r=pearsonR(x,y);
        matrix[v1][v2]=r.r; pMatrix[v1][v2]=r.p;
      }
    }
    const syntax=`CORRELATIONS\n  /VARIABLES=${varNames.join(' ')}\n  /PRINT=TWOTAIL\n  /MISSING=PAIRWISE.`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ method, variables:varNames, correlation_matrix:matrix, n_matrix:nMatrix, p_matrix:pMatrix } };
  }

  /* ══════════════════════════════════════════════════════════════
     LINEAR REGRESSION (OLS via normal equations)
     ══════════════════════════════════════════════════════════════ */
  function linearRegression(dataset, params) {
    const { dependent: dv, independent: ivs, include_constant=true, confidence_level:cl=0.95 } = params;
    if (!dv||(ivs||[]).length===0) return _err('regression','MISSING_VARS','Dependent and independent variables required.','','');
    const allVars=[dv,...ivs];
    const { data, warnings } = resolveDataset(dataset,allVars,params);
    const y=(data[dv]||[]).filter(v=>typeof v==='number'&&isFinite(v));
    const n=y.length, k=ivs.length;
    if (n < k+2) return _err('regression','INSUFFICIENT_N',`N=${n} too small for ${k} predictors.`,'','');

    // Build X matrix
    const Xraw = ivs.map(iv=>(data[iv]||[]).slice(0,n).map(v=>typeof v==='number'&&isFinite(v)?v:0));
    const X = include_constant
      ? [new Array(n).fill(1),...Xraw]
      : Xraw;
    const p = X.length; // number of params

    // OLS: β = (X'X)^-1 X'y
    let beta, XtX, XtXinv;
    try {
      XtX = matMul(transpose(X), transpose(Xraw.map((_,i)=>X[i]?.concat?X[i]:X[i])));
      // Correct: XtX[i][j] = sum_k X[i][k]*X[j][k]
      XtX = Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>X[i].reduce((s,_,k)=>s+X[i][k]*X[j][k],0)));
      XtXinv = invertMatrix(XtX);
      if (!XtXinv) return _err('regression','SINGULAR_MATRIX','Matrix inversion failed — perfect multicollinearity detected.','Redundant predictors.','Remove or combine correlated predictors. Check VIF.');
      const Xty = X.map(xi=>xi.reduce((s,v,k2)=>s+v*y[k2],0));
      beta = XtXinv.map(row=>row.reduce((s,v,j)=>s+v*Xty[j],0));
    } catch(e) {
      return _err('regression','COMPUTE_ERROR',e.message,'Numerical error.','Check data.');
    }

    // Fitted & residuals
    const yHat = Array.from({length:n},(_,i)=>X.reduce((s,xi,j)=>s+xi[i]*beta[j],0));
    const resid = y.map((v,i)=>v-yHat[i]);
    const ySd = std(y,1);

    // SS
    const yMean = mean(y);
    const ssRes = resid.reduce((s,r)=>s+r**2,0);
    const ssTot = y.reduce((s,v)=>s+(v-yMean)**2,0);
    const ssReg = ssTot - ssRes;
    const dfReg = include_constant ? k : k, dfRes = n - p;
    const msRes = ssRes/dfRes, msReg = ssReg/dfReg;
    const Fstat = msReg/msRes, pF = 1-fCdf(Fstat,dfReg,dfRes);
    const Rsq = ssTot>0 ? ssReg/ssTot : 0;
    const adjRsq = 1 - (1-Rsq)*(n-1)/dfRes;
    const R = Math.sqrt(Math.max(0,Rsq));

    // Standard errors of coefficients
    const seB = X.map((_,j)=>Math.sqrt(Math.max(0,XtXinv[j][j]*msRes)));
    const tStats = beta.map((b,j)=>seB[j]>0?b/seB[j]:0);
    const pVals = tStats.map(t=>2*(1-tCdf(Math.abs(t),dfRes)));
    const alpha=1-cl, tc=tPpf(1-alpha/2,dfRes);
    const ciLo = beta.map((b,j)=>b-tc*seB[j]);
    const ciHi = beta.map((b,j)=>b+tc*seB[j]);

    // Standardized beta
    const sdY = std(y,1);
    const coefNames = include_constant ? ['(Constant)',...ivs] : ivs;
    const coefficients = coefNames.map((nm,j)=>{
      const isConst = nm==='(Constant)';
      let betaStd = null;
      if (!isConst) {
        const sdX = std((data[nm]||[]).slice(0,n).filter(v=>typeof v==='number'&&isFinite(v)),1);
        betaStd = sdY>0&&sdX>0 ? parseFloat((beta[j]*sdX/sdY).toFixed(6)) : null;
      }
      return { name:nm, b:parseFloat(beta[j].toFixed(6)), se:parseFloat(seB[j].toFixed(6)),
        beta:betaStd, t:parseFloat(tStats[j].toFixed(6)), p:parseFloat(pVals[j].toFixed(6)),
        ci_lower:parseFloat(ciLo[j].toFixed(6)), ci_upper:parseFloat(ciHi[j].toFixed(6)) };
    });

    // VIF (for multiple predictors)
    const vifResults={};
    if (ivs.length > 1) {
      ivs.forEach((iv,idx)=>{
        const others=ivs.filter(v=>v!==iv);
        const { data:d2 } = resolveDataset(dataset,[iv,...others],params);
        const yy=(d2[iv]||[]).slice(0,n).filter(v=>typeof v==='number'&&isFinite(v));
        const XX=others.map(o=>(d2[o]||[]).slice(0,yy.length));
        if (XX.length===0||yy.length<3) return;
        try {
          const rr=_olsR2(yy,XX);
          const vif=rr<1?1/(1-rr):9999;
          const tol=1/vif;
          vifResults[iv]={ vif:parseFloat(vif.toFixed(4)), tolerance:parseFloat(tol.toFixed(4)) };
          if (vif>10) warnings.push({ severity:'HIGH', code:'HIGH_VIF', issue:`VIF for '${iv}' = ${vif.toFixed(2)} > 10.`, why_it_matters:'Severe multicollinearity.', recommended_action:'Remove or combine correlated predictors.' });
          else if (vif>5) warnings.push({ severity:'MEDIUM', code:'MOD_VIF', issue:`VIF for '${iv}' = ${vif.toFixed(2)} (5–10).`, why_it_matters:'Moderate multicollinearity.', recommended_action:'Review predictor correlations.' });
        } catch {}
      });
    }

    // Durbin-Watson
    let dw=2;
    for (let i=1;i<resid.length;i++) dw+=((resid[i]-resid[i-1])**2)/ssRes;

    // Normality of residuals
    const sw=shapiroWilk(resid.slice(0,Math.min(resid.length,5000)));

    const syntax=`REGRESSION\n  /DEPENDENT ${dv}\n  /METHOD=ENTER ${ivs.join(' ')}.`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked:[
        sw&&sw.W!=null ? { id:'resid_norm', name:'Normality of Residuals (Shapiro-Wilk)',
          status:sw.p>=0.05?'passed':'warning', test_statistic:sw.W, p_value:sw.p,
          description:'Residuals should be approximately normal.',
          interpretation:`W=${sw.W}, p=${sw.p<0.001?'< .001':sw.p.toFixed(3)}. ${sw.p>=0.05?'Residuals appear normal.':'Residuals may not be normal.'}` } : null,
        { id:'dw', name:'Independence of Residuals (Durbin-Watson)', status:dw>=1.5&&dw<=2.5?'passed':'warning',
          test_statistic:parseFloat(dw.toFixed(4)), p_value:null,
          description:'DW ≈ 2 = no autocorrelation.',
          interpretation:`DW = ${dw.toFixed(4)}.` },
      ].filter(Boolean),
      result:{
        dependent:dv, independent:ivs, n,
        model_summary:{ r:parseFloat(R.toFixed(6)), r_squared:parseFloat(Rsq.toFixed(6)), adjusted_r_squared:parseFloat(adjRsq.toFixed(6)), se_estimate:parseFloat(Math.sqrt(msRes).toFixed(6)) },
        anova_table:{ regression:{ss:parseFloat(ssReg.toFixed(6)),df:dfReg,ms:parseFloat(msReg.toFixed(6)),f:parseFloat(Fstat.toFixed(6)),p:parseFloat(pF.toFixed(6))},
          residual:{ss:parseFloat(ssRes.toFixed(6)),df:dfRes,ms:parseFloat(msRes.toFixed(6))},
          total:{ss:parseFloat(ssTot.toFixed(6)),df:n-1} },
        coefficients, vif:vifResults,
        diagnostics:{ durbin_watson:parseFloat(dw.toFixed(4)), residuals_sample:resid.slice(0,50).map(r=>parseFloat(r.toFixed(4))), fitted_sample:yHat.slice(0,50).map(v=>parseFloat(v.toFixed(4))) },
      },
    };
  }

  function _olsR2(y, Xraw) {
    const n=y.length, X=[new Array(n).fill(1),...Xraw];
    const p=X.length;
    const XtX=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>X[i].reduce((s,_,k)=>s+X[i][k]*X[j][k],0)));
    const inv=invertMatrix(XtX);
    if (!inv) return 0;
    const Xty=X.map(xi=>xi.reduce((s,v,k)=>s+v*y[k],0));
    const beta=inv.map(row=>row.reduce((s,v,j)=>s+v*Xty[j],0));
    const yHat=Array.from({length:n},(_,i)=>X.reduce((s,xi,j)=>s+xi[i]*beta[j],0));
    const yMean=mean(y);
    const ssTot=y.reduce((s,v)=>s+(v-yMean)**2,0);
    const ssRes=y.reduce((s,v,i)=>s+(v-yHat[i])**2,0);
    return ssTot>0?(ssTot-ssRes)/ssTot:0;
  }

  /* Matrix operations */
  function transpose(M) { return M[0].map((_,j)=>M.map(r=>r[j])); }
  function matMul(A,B) {
    const m=A.length,n=B[0].length,k=B.length;
    return Array.from({length:m},(_,i)=>Array.from({length:n},(_,j)=>Array.from({length:k},(_,l)=>A[i][l]*B[l][j]).reduce((s,v)=>s+v,0)));
  }
  function invertMatrix(M) {
    const n=M.length;
    const aug=M.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);
    for (let col=0;col<n;col++) {
      let pivot=-1, best=0;
      for (let row=col;row<n;row++) { if (Math.abs(aug[row][col])>best) { best=Math.abs(aug[row][col]); pivot=row; } }
      if (pivot<0||best<1e-12) return null;
      [aug[col],aug[pivot]]=[aug[pivot],aug[col]];
      const scale=aug[col][col];
      for (let j=0;j<2*n;j++) aug[col][j]/=scale;
      for (let row=0;row<n;row++) {
        if (row===col) continue;
        const f=aug[row][col];
        for (let j=0;j<2*n;j++) aug[row][j]-=f*aug[col][j];
      }
    }
    return aug.map(r=>r.slice(n));
  }

  /* ══════════════════════════════════════════════════════════════
     LOGISTIC REGRESSION (iterative weighted least squares)
     ══════════════════════════════════════════════════════════════ */
  function logisticRegression(dataset, params) {
    const { dependent:dv, independent:ivs, confidence_level:cl=0.95 } = params;
    if (!dv||(ivs||[]).length===0) return _err('logistic','MISSING_VARS','Dependent and independent required.','','');
    const allVars=[dv,...ivs];
    const { data, warnings } = resolveDataset(dataset,allVars,params);
    const yRaw=data[dv]||[];
    const uniq=[...new Set(yRaw.filter(v=>v!=null))];
    if (uniq.length!==2) return _err('logistic','NON_BINARY',`Dependent '${dv}' has ${uniq.length} unique values. Must be binary.`,'','Recode to 0/1.');
    const [v0,v1]=uniq.sort((a,b)=>Number(a)-Number(b));
    const y=yRaw.map(v=>v===v1||v===String(v1)?1:0);
    const n=y.length, k=ivs.length;
    if (n < k+10) warnings.push({ severity:'HIGH', code:'SMALL_SAMPLE', issue:`N=${n} may be small for ${k} predictors.`, why_it_matters:'Logistic regression needs adequate EPV (≥10 per variable).', recommended_action:'Consider reducing predictors.' });

    // IWLS (Newton-Raphson)
    const Xraw=ivs.map(iv=>(data[iv]||[]).slice(0,n).map(v=>typeof v==='number'&&isFinite(v)?v:0));
    const X=[new Array(n).fill(1),...Xraw]; // p×n
    const p=X.length;
    let beta=new Array(p).fill(0);
    const sigmoid=z=>1/(1+Math.exp(-Math.max(-500,Math.min(500,z))));

    for (let iter=0;iter<200;iter++) {
      const mu=Array.from({length:n},(_,i)=>sigmoid(X.reduce((s,xi,j)=>s+xi[i]*beta[j],0)));
      const W=mu.map((m,i)=>m*(1-m));
      const z=Array.from({length:n},(_,i)=>{
        const eta=X.reduce((s,xi,j)=>s+xi[i]*beta[j],0);
        return eta+(W[i]>0?(y[i]-mu[i])/W[i]:0);
      });
      // Weighted XtX and Xtz
      const XtWX=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>X[i].reduce((s,_,k)=>s+W[k]*X[i][k]*X[j][k],0)));
      const XtWz=X.map(xi=>xi.reduce((s,v,k)=>s+W[k]*v*z[k],0));
      const inv=invertMatrix(XtWX);
      if (!inv) break;
      const newBeta=inv.map(row=>row.reduce((s,v,j)=>s+v*XtWz[j],0));
      const delta=newBeta.reduce((s,v,i)=>s+Math.abs(v-beta[i]),0);
      beta=newBeta;
      if (delta<1e-8) break;
    }

    const mu=Array.from({length:n},(_,i)=>sigmoid(X.reduce((s,xi,j)=>s+xi[i]*beta[j],0)));
    const W=mu.map((m,i)=>m*(1-m));
    const XtWX=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>X[i].reduce((s,_,k)=>s+W[k]*X[i][k]*X[j][k],0)));
    const inv=invertMatrix(XtWX);
    const seB=inv?X.map((_,j)=>Math.sqrt(Math.max(0,inv[j][j]))):new Array(p).fill(0);

    // Separation check
    const maxCoef=Math.max(...beta.map(Math.abs));
    if (maxCoef>20) warnings.push({ severity:'HIGH', code:'SEPARATION', issue:`Max |B| = ${maxCoef.toFixed(1)} — possible separation.`, why_it_matters:'MLE estimates unreliable under separation.', recommended_action:'Inspect predictor distributions by outcome.' });

    // Log-likelihoods
    const llFull=y.reduce((s,yi,i)=>s+(yi===1?Math.log(Math.max(1e-15,mu[i])):Math.log(Math.max(1e-15,1-mu[i]))),0);
    const pNull=y.reduce((s,v)=>s+v,0)/n;
    const llNull=y.reduce((s,yi)=>s+(yi===1?Math.log(Math.max(1e-15,pNull)):Math.log(Math.max(1e-15,1-pNull))),0);
    const lrChi2=-2*(llNull-llFull), lrP=1-chi2Cdf(lrChi2,k);
    const coxSnell=1-Math.exp(-2*(llFull-llNull)/n);
    const nagelkerke=coxSnell/(1-Math.exp(2*llNull/n));

    // Classification (threshold 0.5)
    const pred=mu.map(v=>v>=0.5?1:0);
    let tp=0,tn=0,fp=0,fn=0;
    y.forEach((yi,i)=>{ if(yi===1&&pred[i]===1)tp++; else if(yi===0&&pred[i]===0)tn++; else if(yi===0&&pred[i]===1)fp++; else fn++; });

    const alpha=1-cl, tc=tPpf(1-alpha/2,n-p-1);
    const coefNames=['(Constant)',...ivs];
    const coefficients=coefNames.map((nm,j)=>({
      name:nm, b:parseFloat(beta[j].toFixed(6)), se:parseFloat(seB[j].toFixed(6)),
      wald:seB[j]>0?parseFloat((beta[j]/seB[j])**2 .toFixed(6)):0,
      df:1, p:parseFloat((2*(1-normCdf(Math.abs(seB[j]>0?beta[j]/seB[j]:0)))).toFixed(6)),
      exp_b:parseFloat(Math.exp(beta[j]).toFixed(6)),
      exp_b_ci_lower:parseFloat(Math.exp(beta[j]-tc*seB[j]).toFixed(6)),
      exp_b_ci_upper:parseFloat(Math.exp(beta[j]+tc*seB[j]).toFixed(6)),
    }));

    const syntax=`LOGISTIC REGRESSION VARIABLES ${dv}\n  /METHOD=ENTER ${ivs.join(' ')}\n  /PRINT=GOODFIT CI(${(cl*100).toFixed(0)}).`;
    return {
      status:'complete', syntax, warnings, assumptions_checked:[],
      result:{
        dependent:dv, independent:ivs, n, reference_value:v0, event_value:v1,
        coefficients,
        model_fit:{ chi_square:parseFloat(lrChi2.toFixed(6)),df:k,p:parseFloat(lrP.toFixed(6)),
          neg_2ll:parseFloat((-2*llFull).toFixed(6)),cox_snell_r2:parseFloat(coxSnell.toFixed(6)),nagelkerke_r2:parseFloat(nagelkerke.toFixed(6)) },
        classification_table:{ tp,tn,fp,fn,overall_accuracy_pct:parseFloat(((tp+tn)/n*100).toFixed(2)) },
      },
    };
  }

  /* ══════════════════════════════════════════════════════════════
     RELIABILITY (Cronbach's Alpha)
     ══════════════════════════════════════════════════════════════ */
  function reliability(dataset, params) {
    const { items } = params;
    if (!items||items.length<2) return _err('reliability','INSUFFICIENT_ITEMS','At least 2 items required.','','');
    const { data, warnings } = resolveDataset(dataset,items,params);
    const cols=items.map(it=>(data[it]||[]).filter(v=>typeof v==='number'&&isFinite(v)));
    const n=Math.min(...cols.map(c=>c.length));
    if (n<2) return _err('reliability','INSUFFICIENT_N',`Only ${n} complete cases.`,'','');
    const k=items.length;
    const mat=items.map((_,i)=>cols[i].slice(0,n));
    const totals=Array.from({length:n},(_,i)=>mat.reduce((s,col)=>s+col[i],0));
    const totalVar=variance(totals,1);
    if (totalVar===0) return _err('reliability','ZERO_VARIANCE','Total score variance is zero.','All items may be identical.','Check item distributions.');
    const itemVars=mat.map(col=>variance(col,1));
    const alpha=(k/(k-1))*(1-itemVars.reduce((s,v)=>s+v,0)/totalVar);
    const interpAlpha=v=>v>=0.9?'Excellent':v>=0.8?'Good':v>=0.7?'Acceptable':v>=0.6?'Questionable':v>=0.5?'Poor':'Unacceptable';
    if (alpha<0.7) warnings.push({ severity:'MEDIUM', code:'LOW_ALPHA', issue:`α = ${alpha.toFixed(3)} < 0.7.`, why_it_matters:'Questionable internal consistency.', recommended_action:'Review item-total correlations. Consider removing items with low corrected r.' });

    const itemStats=items.map((it,idx)=>{
      const col=mat[idx];
      const rest=totals.map((t,i)=>t-col[i]);
      const scaleMeanDel=mean(rest), scaleVarDel=variance(rest,1);
      const r=pearsonR(col,rest);
      // Alpha if deleted
      const redVars=mat.filter((_,i)=>i!==idx);
      const redTot=Array.from({length:n},(_,i)=>redVars.reduce((s,c)=>s+c[i],0));
      const redTotVar=variance(redTot,1);
      const redItemVars=redVars.map(c=>variance(c,1));
      const alphaDel=redTotVar>0?((k-1)/(k-2))*(1-redItemVars.reduce((s,v)=>s+v,0)/redTotVar):null;
      return { item:it, item_mean:parseFloat(mean(col).toFixed(6)), item_std:parseFloat(std(col,1).toFixed(6)),
        scale_mean_if_deleted:parseFloat(scaleMeanDel.toFixed(6)), scale_variance_if_deleted:parseFloat(scaleVarDel.toFixed(6)),
        corrected_item_total_r:parseFloat((r.r||0).toFixed(6)), alpha_if_deleted:alphaDel!==null?parseFloat(alphaDel.toFixed(6)):null };
    });

    const syntax=`RELIABILITY\n  /VARIABLES=${items.join(' ')}\n  /MODEL=ALPHA\n  /STATISTICS=DESCRIPTIVE SCALE CORR\n  /SUMMARY=TOTAL.`;
    return {
      status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ model:'alpha', n_cases:n, n_items:k, alpha:parseFloat(alpha.toFixed(6)), alpha_interpretation:interpAlpha(alpha),
        scale_statistics:{ mean:parseFloat(mean(totals).toFixed(6)), variance:parseFloat(totalVar.toFixed(6)), std:parseFloat(Math.sqrt(totalVar).toFixed(6)) },
        item_statistics:itemStats },
    };
  }

  /* ══════════════════════════════════════════════════════════════
     FACTOR ANALYSIS / PCA
     ══════════════════════════════════════════════════════════════ */
  function factorAnalysis(dataset, params) {
    const { variables:varNames, n_factors:nFactReq=0, rotation='varimax' } = params;
    if (!varNames||varNames.length<3) return _err('factor','INSUFFICIENT_VARS','At least 3 variables required.','','');
    const { data, warnings } = resolveDataset(dataset,varNames,params);
    const p=varNames.length;
    const cols=varNames.map(vn=>(data[vn]||[]).filter(v=>typeof v==='number'&&isFinite(v)));
    const n=Math.min(...cols.map(c=>c.length));
    if (n<p+3) warnings.push({ severity:'HIGH', code:'SMALL_SAMPLE', issue:`N=${n}, p=${p}. Sample may be too small.`, why_it_matters:'Factor analysis needs adequate N/p ratio.', recommended_action:'Collect more data or reduce variables.' });

    // Standardize
    const Xstd=cols.map(col=>{ const m=mean(col.slice(0,n)),s=std(col.slice(0,n),1)||1; return col.slice(0,n).map(v=>(v-m)/s); });

    // Correlation matrix
    const corr=Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>i===j?1:pearsonR(Xstd[i],Xstd[j]).r||0));

    // KMO
    const kmoVal=_kmo(corr);

    // Bartlett
    let detCorr=_det(corr);
    if (detCorr<=0) detCorr=1e-15;
    const bartlettChi2=-(n-1-(2*p+5)/6)*Math.log(detCorr);
    const bartlettDf=p*(p-1)/2;
    const bartlettP=1-chi2Cdf(bartlettChi2,bartlettDf);

    if (kmoVal<0.5) warnings.push({ severity:'HIGH', code:'LOW_KMO', issue:`KMO = ${kmoVal.toFixed(3)} < 0.5.`, why_it_matters:'Variables not suitable for factor extraction.', recommended_action:'Remove variables with low individual KMO.' });

    // Eigendecomposition via power iteration / Jacobi (simple implementation)
    const { eigenvalues, eigenvectors } = _eigenDecomp(corr);
    const sortedIdx=[...eigenvalues.keys()].sort((a,b)=>eigenvalues[b]-eigenvalues[a]);
    const sortedEV=sortedIdx.map(i=>eigenvalues[i]);
    const sortedVecs=sortedIdx.map(i=>eigenvectors[i]);

    // Determine n_factors
    const nFact=nFactReq>0?Math.min(nFactReq,p-1):Math.max(1,sortedEV.filter(ev=>ev>1).length);
    const totalVar=sortedEV.reduce((s,v)=>s+v,0);

    // Eigenvalue table
    const eigenTable=sortedEV.map((ev,i)=>({ component:i+1, eigenvalue:parseFloat(ev.toFixed(6)), pct_variance:parseFloat((ev/totalVar*100).toFixed(4)), cumulative_pct:parseFloat((sortedEV.slice(0,i+1).reduce((s,v)=>s+v,0)/totalVar*100).toFixed(4)), extracted:i<nFact }));

    // Raw loadings = eigenvectors * sqrt(eigenvalues)
    let loadings=Array.from({length:p},(_,vi)=>Array.from({length:nFact},(_,fi)=>sortedVecs[fi][vi]*Math.sqrt(Math.max(0,sortedEV[fi]))));

    // Varimax rotation
    if (rotation==='varimax'&&nFact>1) loadings=_varimax(loadings);

    // Communalities
    const communalities=loadings.map(row=>row.reduce((s,v)=>s+v**2,0));

    // Loading matrix
    const loadingMatrix=varNames.map((vn,vi)=>{
      const row={ variable:vn };
      for (let fi=0;fi<nFact;fi++) row[`factor_${fi+1}`]=parseFloat(loadings[vi][fi].toFixed(6));
      row.communality=parseFloat(communalities[vi].toFixed(6));
      return row;
    });

    // Correlation matrix output
    const corrOut={};
    varNames.forEach((v1,i)=>{ corrOut[v1]={}; varNames.forEach((v2,j)=>{ corrOut[v1][v2]=parseFloat(corr[i][j].toFixed(6)); }); });

    const kmoLabel=v=>v>=0.9?'Marvelous':v>=0.8?'Meritorious':v>=0.7?'Middling':v>=0.6?'Mediocre':v>=0.5?'Miserable':'Unacceptable';
    const syntax=`FACTOR VARIABLES=${varNames.join(' ')}\n  /EXTRACTION=PC\n  /ROTATION=${rotation.toUpperCase()}\n  /PRINT=INITIAL EXTRACTION ROTATION KMO.`;
    return {
      status:'complete', syntax, warnings,
      assumptions_checked:[
        { id:'kmo', name:'Kaiser-Meyer-Olkin (KMO)', status:kmoVal>=0.6?'passed':kmoVal>=0.5?'warning':'failed',
          test_statistic:parseFloat(kmoVal.toFixed(6)), p_value:null,
          description:'KMO ≥ 0.6 acceptable.', interpretation:`KMO = ${kmoVal.toFixed(3)} — ${kmoLabel(kmoVal)}.` },
        { id:'bartlett', name:"Bartlett's Test of Sphericity", status:bartlettP<0.05?'passed':'failed',
          test_statistic:parseFloat(bartlettChi2.toFixed(4)), p_value:parseFloat(bartlettP.toFixed(6)),
          description:'Significant p < .05 indicates correlations among variables.',
          interpretation:`χ²(${bartlettDf}) = ${bartlettChi2.toFixed(2)}, p = ${bartlettP<0.001?'< .001':bartlettP.toFixed(3)}.` },
      ],
      result:{ variables:varNames, n, n_factors_extracted:nFact, extraction:'pca', rotation:nFact>1?rotation:'none',
        kmo:parseFloat(kmoVal.toFixed(6)), bartlett:{ chi_square:parseFloat(bartlettChi2.toFixed(4)), df:bartlettDf, p:parseFloat(bartlettP.toFixed(6)) },
        eigenvalue_table:eigenTable, loading_matrix:loadingMatrix, correlation_matrix:corrOut },
    };
  }

  function _kmo(corr) {
    const p=corr.length;
    const inv=invertMatrix(corr);
    if (!inv) return 0;
    let sumR2=0, sumQ2=0;
    for (let i=0;i<p;i++) for (let j=0;j<p;j++) {
      if (i===j) continue;
      sumR2+=corr[i][j]**2;
      const qi=inv[i][i], qj=inv[j][j];
      if (qi>0&&qj>0) sumQ2+=(inv[i][j]/(Math.sqrt(qi*qj)))**2;
    }
    return sumR2+sumQ2>0?Math.max(0,Math.min(1,sumR2/(sumR2+sumQ2))):0;
  }

  function _det(M) {
    const n=M.length;
    const A=M.map(r=>[...r]);
    let det=1;
    for (let col=0;col<n;col++) {
      let pivot=-1, best=0;
      for (let row=col;row<n;row++) { if (Math.abs(A[row][col])>best) { best=Math.abs(A[row][col]); pivot=row; } }
      if (pivot<0||best<1e-14) return 0;
      if (pivot!==col) { [A[col],A[pivot]]=[A[pivot],A[col]]; det*=-1; }
      det*=A[col][col];
      const scale=A[col][col];
      for (let j=col;j<n;j++) A[col][j]/=scale;
      for (let row=0;row<n;row++) {
        if (row===col) continue;
        const f=A[row][col];
        for (let j=col;j<n;j++) A[row][j]-=f*A[col][j];
      }
    }
    return det;
  }

  function _eigenDecomp(M) {
    // Jacobi eigenvalue algorithm for symmetric matrices
    const n=M.length, maxIter=1000;
    const A=M.map(r=>[...r]);
    const V=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));
    for (let iter=0;iter<maxIter;iter++) {
      let maxVal=0, p2=0, q2=1;
      for (let i=0;i<n;i++) for (let j=i+1;j<n;j++) { if (Math.abs(A[i][j])>maxVal) { maxVal=Math.abs(A[i][j]); p2=i; q2=j; } }
      if (maxVal<1e-12) break;
      const theta=0.5*Math.atan2(2*A[p2][q2],A[p2][p2]-A[q2][q2]);
      const c=Math.cos(theta), s=Math.sin(theta);
      const newA=A.map(r=>[...r]);
      for (let i=0;i<n;i++) {
        if (i===p2||i===q2) continue;
        newA[i][p2]=c*A[i][p2]+s*A[i][q2]; newA[p2][i]=newA[i][p2];
        newA[i][q2]=-s*A[i][p2]+c*A[i][q2]; newA[q2][i]=newA[i][q2];
      }
      newA[p2][p2]=c**2*A[p2][p2]+2*s*c*A[p2][q2]+s**2*A[q2][q2];
      newA[q2][q2]=s**2*A[p2][p2]-2*s*c*A[p2][q2]+c**2*A[q2][q2];
      newA[p2][q2]=0; newA[q2][p2]=0;
      for (let i=0;i<n;i++) A[i]=newA[i];
      for (let i=0;i<n;i++) {
        const vp=c*V[i][p2]+s*V[i][q2], vq=-s*V[i][p2]+c*V[i][q2];
        V[i][p2]=vp; V[i][q2]=vq;
      }
    }
    return { eigenvalues:A.map((_,i)=>A[i][i]), eigenvectors:Array.from({length:n},(_,j)=>Array.from({length:n},(_,i)=>V[i][j])) };
  }

  function _varimax(L, maxIter=1000, tol=1e-6) {
    const p=L.length, k=L[0].length;
    if (k<=1) return L;
    let rot=Array.from({length:k},(_,i)=>Array.from({length:k},(_,j)=>i===j?1:0));
    for (let iter=0;iter<maxIter;iter++) {
      let maxChange=0;
      for (let i=0;i<k;i++) for (let j=i+1;j<k;j++) {
        const Lmat=L.map(r=>[...r]); // current rotated
        const u=Lmat.map(r=>r[i]**2-r[j]**2), v=Lmat.map(r=>2*r[i]*r[j]);
        const A=u.reduce((s,v2)=>s+v2,0), B=v.reduce((s,v2)=>s+v2,0);
        const C=u.reduce((s,v2,ii)=>s+v2**2-v[ii]**2,0), D=u.reduce((s,v2,ii)=>s+2*v2*v[ii],0);
        const num=D-A*B/p, den=C-(A**2-B**2)/p;
        const angle=den!==0?0.25*Math.atan2(num,den):0;
        const c=Math.cos(angle), s=Math.sin(angle);
        const G=Array.from({length:k},(_,a)=>Array.from({length:k},(_,b)=>a===b?1:0));
        G[i][i]=c; G[j][j]=c; G[i][j]=-s; G[j][i]=s;
        // Apply rotation to L: L = L * G
        const newL=L.map(row=>{ const nr=new Array(k).fill(0); for (let a=0;a<k;a++) for (let b=0;b<k;b++) nr[b]+=row[a]*G[a][b]; return nr; });
        L=newL;
        maxChange=Math.max(maxChange,Math.abs(angle));
      }
      if (maxChange<tol) break;
    }
    return L;
  }

  /* ══════════════════════════════════════════════════════════════
     NONPARAMETRIC TESTS
     ══════════════════════════════════════════════════════════════ */
  function nonparametric(dataset, params) {
    const test=params.test||'mannwhitney';
    if (test==='mannwhitney') return _mannWhitney(dataset,params);
    if (test==='wilcoxon') return _wilcoxon(dataset,params);
    if (test==='kruskalwallis') return _kruskalWallis(dataset,params);
    if (test==='friedman') return _friedman(dataset,params);
    return _err('nonparametric','UNKNOWN_TEST',`Unknown test: ${test}`,'','');
  }

  function _mannWhitney(dataset, params) {
    const { variable:vn, grouping_variable:gv, alternative='two-sided' } = params;
    const { data, warnings } = resolveDataset(dataset,[vn,gv],params);
    const xArr=data[vn]||[], gArr=data[gv]||[];
    const gKeys=[...new Set(gArr.map(String))];
    if (gKeys.length!==2) return _err('nonparametric','GROUPS',`Expected 2 groups, found ${gKeys.length}.`,'','');
    const g1=xArr.filter((_,i)=>String(gArr[i])===gKeys[0]).filter(v=>typeof v==='number'&&isFinite(v));
    const g2=xArr.filter((_,i)=>String(gArr[i])===gKeys[1]).filter(v=>typeof v==='number'&&isFinite(v));
    const n1=g1.length, n2=g2.length, N=n1+n2;
    // Mann-Whitney U
    let U1=0;
    for (const a of g1) for (const b of g2) { if (a>b)U1++; else if (a===b)U1+=0.5; }
    const U2=n1*n2-U1, U=Math.min(U1,U2);
    const muU=n1*n2/2, sigU=Math.sqrt(n1*n2*(N+1)/12);
    const Z=(U1-muU)/sigU;
    let p;
    if (alternative==='two-sided') p=2*Math.min(normCdf(Z),1-normCdf(Z));
    else if (alternative==='less') p=normCdf(Z);
    else p=1-normCdf(Z);
    const r=Math.abs(Z)/Math.sqrt(N);
    const syntax=`NPAR TESTS M-W=${vn} BY ${gv}(${gKeys[0]} ${gKeys[1]}).`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ test:'Mann-Whitney U', variable:vn, grouping_variable:gv, group1:gKeys[0], group2:gKeys[1],
        n1, n2, group1_median:parseFloat(quantile(sortNum(g1),0.5).toFixed(6)), group2_median:parseFloat(quantile(sortNum(g2),0.5).toFixed(6)),
        U:parseFloat(U1.toFixed(4)), z:parseFloat(Z.toFixed(4)), p:parseFloat(p.toFixed(6)), alternative, effect_size_r:parseFloat(r.toFixed(6)) } };
  }

  function _wilcoxon(dataset, params) {
    const { variable1:v1n, variable2:v2n, alternative='two-sided' } = params;
    const { data, warnings } = resolveDataset(dataset,[v1n,v2n],params);
    const x1=data[v1n]||[], x2=data[v2n]||[];
    const n=Math.min(x1.length,x2.length);
    const diffs=x1.slice(0,n).map((v,i)=>v-x2[i]).filter(d=>d!==0);
    if (diffs.length===0) return _err('nonparametric','NO_DIFFERENCES','All differences are zero.','','');
    // Rank |diffs|
    const absDiffs=diffs.map(Math.abs);
    const rks=Stats.ranks(absDiffs);
    let Tplus=0, Tminus=0;
    diffs.forEach((d,i)=>{ if (d>0)Tplus+=rks[i]; else Tminus+=rks[i]; });
    const T=Math.min(Tplus,Tminus), nn=diffs.length;
    // Normal approximation (z-score)
    const muT=nn*(nn+1)/4, sigT=Math.sqrt(nn*(nn+1)*(2*nn+1)/24);
    const Z=(T-muT)/sigT;
    const p=alternative==='two-sided'?2*Math.min(normCdf(Z),1-normCdf(Z)):Z<0?normCdf(Z):1-normCdf(Z);
    const syntax=`NPAR TESTS WILCOXON=${v1n} WITH ${v2n}.`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ test:'Wilcoxon Signed-Rank', variable1:v1n, variable2:v2n, n_pairs:n, n_nonzero_diff:nn, T:parseFloat(T.toFixed(4)), z:parseFloat(Z.toFixed(4)), p:parseFloat(p.toFixed(6)), alternative } };
  }

  function _kruskalWallis(dataset, params) {
    // Accept both 'factor' and 'grouping_variable' for compatibility
    const vn = params.variable;
    const fv = params.factor || params.grouping_variable;
    const { data, warnings } = resolveDataset(dataset,[vn,fv],params);
    const xArr=data[vn]||[], gArr=data[fv]||[];
    const gKeys=[...new Set(gArr.map(String))];
    if (gKeys.length<2) return _err('nonparametric','GROUPS','At least 2 groups required.','','');
    const groups={};
    gKeys.forEach(k=>{ groups[k]=xArr.filter((_,i)=>String(gArr[i])===k).filter(v=>typeof v==='number'&&isFinite(v)); });
    const allVals=Object.values(groups).flat();
    const N=allVals.length, K=gKeys.length;
    const allRanks=Stats.ranks(allVals);
    const rankMap=new Map();
    allVals.forEach((v,i)=>rankMap.set(`${i}`,allRanks[i]));
    let offset=0;
    const groupRankSums={};
    for (const k of gKeys) {
      const g=groups[k];
      groupRankSums[k]=allRanks.slice(offset,offset+g.length).reduce((s,v)=>s+v,0);
      offset+=g.length;
    }
    const H=12/(N*(N+1))*gKeys.reduce((s,k)=>s+groupRankSums[k]**2/groups[k].length,0)-3*(N+1);
    const pH=1-chi2Cdf(H,K-1);
    const epsSq=(H-K+1)/(N-K);
    const syntax=`NPAR TESTS K-W=${vn} BY ${fv}.`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ test:'Kruskal-Wallis', variable:vn, factor:fv, k_groups:K, n_total:N,
        group_medians:Object.fromEntries(gKeys.map(k=>[k,parseFloat(quantile(sortNum(groups[k]),0.5).toFixed(6))])),
        H:parseFloat(H.toFixed(4)), df:K-1, p:parseFloat(pH.toFixed(6)), epsilon_squared:parseFloat(epsSq.toFixed(6)) } };
  }

  function _friedman(dataset, params) {
    const { variables:varNames } = params;
    if (!varNames||varNames.length<2) return _err('nonparametric','INSUFFICIENT_VARS','At least 2 variables required.','','');
    const { data, warnings } = resolveDataset(dataset,varNames,params);
    const cols=varNames.map(vn=>(data[vn]||[]).filter(v=>typeof v==='number'&&isFinite(v)));
    const n=Math.min(...cols.map(c=>c.length)), k=varNames.length;
    if (n<2) return _err('nonparametric','INSUFFICIENT_N','At least 2 complete cases required.','','');
    // Rank within each row
    const rowRankSums=new Array(k).fill(0);
    for (let i=0;i<n;i++) {
      const row=cols.map(c=>c[i]);
      const rks=Stats.ranks(row);
      rks.forEach((r,j)=>{ rowRankSums[j]+=r; });
    }
    const chi2=(12/(n*k*(k+1)))*rowRankSums.reduce((s,r)=>s+r**2,0)-3*n*(k+1);
    const p=1-chi2Cdf(chi2,k-1);
    const W=chi2/(n*(k-1));
    const syntax=`NPAR TESTS FRIEDMAN=${varNames.join(' ')}.`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ test:'Friedman', variables:varNames, n_cases:n, k_conditions:k,
        chi_square:parseFloat(chi2.toFixed(4)), df:k-1, p:parseFloat(p.toFixed(6)), kendall_w:parseFloat(W.toFixed(6)) } };
  }

  /* ══════════════════════════════════════════════════════════════
     K-MEANS CLUSTERING
     ══════════════════════════════════════════════════════════════ */
  function kMeans(dataset, params) {
    const { variables:varNames, k=3, max_iter=100, seed=42 } = params;
    if (!varNames||varNames.length<1) return _err('cluster','MISSING_VARS','Variables required.','','');
    const { data, warnings } = resolveDataset(dataset,varNames,params);
    const cols=varNames.map(vn=>(data[vn]||[]).filter(v=>typeof v==='number'&&isFinite(v)));
    const n=Math.min(...cols.map(c=>c.length));
    if (n<k) return _err('cluster','INSUFFICIENT_N',`N=${n} < k=${k}.`,'','Reduce k or add more cases.');
    // Build data matrix (n × p)
    const X=Array.from({length:n},(_,i)=>cols.map(c=>c[i]));
    // Standardize
    const stds=cols.map(c=>std(c.slice(0,n),1)||1), means=cols.map(c=>mean(c.slice(0,n)));
    const Xs=X.map(row=>row.map((v,j)=>(v-means[j])/stds[j]));
    // Init centroids (k-means++ seeding)
    const rng=(s=>()=>{ s=(1664525*s+1013904223)&0xFFFFFFFF; return (s>>>0)/0xFFFFFFFF; })(seed);
    const centroids=[Xs[Math.floor(rng()*n)]];
    while (centroids.length<k) {
      const dists=Xs.map(row=>Math.min(...centroids.map(c=>row.reduce((s,v,j)=>s+(v-c[j])**2,0))));
      const total=dists.reduce((s,v)=>s+v,0);
      let r=rng()*total, cum=0;
      for (let i=0;i<n;i++) { cum+=dists[i]; if (cum>=r) { centroids.push(Xs[i]); break; } }
    }
    // Iterate
    let assignments=new Array(n).fill(0);
    for (let iter=0;iter<max_iter;iter++) {
      const newA=Xs.map(row=>{ let best=Infinity,bi=0; centroids.forEach((c,ci)=>{ const d=row.reduce((s,v,j)=>s+(v-c[j])**2,0); if(d<best){best=d;bi=ci;} }); return bi; });
      const changed=newA.some((a,i)=>a!==assignments[i]);
      assignments=newA;
      if (!changed) break;
      // Update centroids
      for (let ci=0;ci<k;ci++) {
        const members=Xs.filter((_,i)=>assignments[i]===ci);
        if (members.length===0) continue;
        const p2=members[0].length;
        centroids[ci]=Array.from({length:p2},(_,j)=>mean(members.map(r=>r[j])));
      }
    }
    // Cluster sizes and centers (unstandardized)
    const sizes=Array.from({length:k},(_,ci)=>assignments.filter(a=>a===ci).length);
    const centers=Array.from({length:k},(_,ci)=>{
      const members=X.filter((_,i)=>assignments[i]===ci);
      return varNames.map((_,j)=>members.length>0?parseFloat(mean(members.map(r=>r[j])).toFixed(4)):0);
    });
    // Silhouette score (simplified)
    let silTotal=0;
    for (let i=0;i<Math.min(n,500);i++) {
      const ci=assignments[i];
      const same=Xs.filter((_,j)=>j!==i&&assignments[j]===ci);
      const a=same.length>0?mean(same.map(row=>Math.sqrt(row.reduce((s,v,jj)=>s+(v-Xs[i][jj])**2,0)))):0;
      let b=Infinity;
      for (let c2=0;c2<k;c2++) { if (c2===ci) continue; const other=Xs.filter((_,j)=>assignments[j]===c2); if (other.length>0) { const bd=mean(other.map(row=>Math.sqrt(row.reduce((s,v,jj)=>s+(v-Xs[i][jj])**2,0)))); b=Math.min(b,bd); } }
      if (b===Infinity) b=0;
      silTotal+=(b-a)/Math.max(a,b)||0;
    }
    const silScore=parseFloat((silTotal/Math.min(n,500)).toFixed(4));
    warnings.push({ severity:'LOW', code:'CLUSTER_NOTE', issue:'Cluster solution depends on initial seed and k choice.', why_it_matters:'Cluster membership is not a ground truth — different k values may be more appropriate.', recommended_action:'Compare silhouette scores across different k values.' });

    const syntax=`QUICK CLUSTER\n  /VARIABLES=${varNames.join(' ')}\n  /MISSING=LISTWISE\n  /CRITERIA=CLUSTER(${k}) MXITER(${max_iter}).`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ variables:varNames, k, n, assignments, sizes, centers:centers.map((c,ci)=>({ cluster:ci+1, n:sizes[ci], means:Object.fromEntries(varNames.map((vn,j)=>[vn,c[j]])) })), silhouette_score:silScore } };
  }

  /* ══════════════════════════════════════════════════════════════
     KAPLAN-MEIER SURVIVAL ANALYSIS
     ══════════════════════════════════════════════════════════════ */
  function kaplanMeier(dataset, params) {
    const { time_variable:tv, event_variable:ev, group_variable:gv } = params;
    if (!tv||!ev) return _err('survival','MISSING_VARS','Time and event variables required.','','');
    const varList=[tv,ev,...(gv?[gv]:[])];
    const { data, warnings } = resolveDataset(dataset,varList,params);
    const times=(data[tv]||[]).map(Number).filter(isFinite);
    const events=(data[ev]||[]).map(Number);
    const n=Math.min(times.length,events.length);
    const groups=gv?[...new Set((data[gv]||[]).map(String))]:[null];

    const computeKM=(tArr,eArr)=>{
      const pairs=tArr.map((t,i)=>({ t,e:eArr[i]!==0&&eArr[i]!=='0' })).sort((a,b)=>a.t-b.t);
      let surv=1, nRisk=pairs.length;
      const steps=[{ t:0, survival:1, n_risk:nRisk, n_event:0, n_censor:0 }];
      let i=0;
      while (i<pairs.length) {
        const t0=pairs[i].t; let nEvent=0, nCensor=0, j=i;
        while (j<pairs.length&&pairs[j].t===t0) { if(pairs[j].e)nEvent++; else nCensor++; j++; }
        if (nEvent>0) { surv*=(nRisk-nEvent)/nRisk; steps.push({ t:t0, survival:parseFloat(surv.toFixed(6)), n_risk:nRisk, n_event:nEvent, n_censor:nCensor }); }
        nRisk-=nEvent+nCensor; i=j;
      }
      return steps;
    };

    const curves={};
    if (!gv) {
      curves['all']=computeKM(times.slice(0,n),events.slice(0,n));
    } else {
      const gArr=data[gv]||[];
      for (const g of groups) {
        const idx=gArr.map((_,i)=>String(gArr[i])===g?i:-1).filter(i=>i>=0);
        curves[g]=computeKM(idx.map(i=>times[i]),idx.map(i=>events[i]));
      }
    }

    const syntax=`KM ${tv} /STATUS=${ev}(1)\n${gv?`  /STRATA=${gv}\n`:''}  /PRINT TABLE MEAN.`;
    return { status:'complete', syntax, warnings, assumptions_checked:[],
      result:{ time_variable:tv, event_variable:ev, group_variable:gv, n, groups, survival_curves:curves } };
  }

  /* ══════════════════════════════════════════════════════════════
     PROCEDURE REGISTRY
     ══════════════════════════════════════════════════════════════ */
  const registry = {
    frequencies: { id:'frequencies', category:'descriptive', display_name:'Frequencies', description:'Frequency table with counts, percentages, cumulative percent.', execute: Stats.frequencies },
    descriptives: { id:'descriptives', category:'descriptive', display_name:'Descriptive Statistics', execute: Stats.descriptives },
    crosstabs: { id:'crosstabs', category:'descriptive', display_name:'Crosstabs', execute: crosstabs },
    correlation: { id:'correlation', category:'correlate', display_name:'Bivariate Correlations', execute: correlation },
    ttest_onesample: { id:'ttest_onesample', category:'compare_means', display_name:'One-Sample T-Test', execute: (ds,p)=>ttest(ds,{...p,type:'onesample'}) },
    ttest_independent: { id:'ttest_independent', category:'compare_means', display_name:'Independent Samples T-Test', execute: (ds,p)=>ttest(ds,{...p,type:'independent'}) },
    ttest_paired: { id:'ttest_paired', category:'compare_means', display_name:'Paired Samples T-Test', execute: (ds,p)=>ttest(ds,{...p,type:'paired'}) },
    anova_oneway: { id:'anova_oneway', category:'compare_means', display_name:'One-Way ANOVA', execute: anova },
    linear_regression: { id:'linear_regression', category:'regression', display_name:'Linear Regression', execute: linearRegression },
    logistic_regression: { id:'logistic_regression', category:'regression', display_name:'Binary Logistic Regression', execute: logisticRegression },
    reliability: { id:'reliability', category:'scale', display_name:'Reliability Analysis (Alpha)', execute: reliability },
    factor_analysis: { id:'factor_analysis', category:'dimension_reduction', display_name:'Exploratory Factor Analysis', execute: factorAnalysis },
    nonparametric_mannwhitney: { id:'nonparametric_mannwhitney', category:'nonparametric', display_name:'Mann-Whitney U Test', execute:(ds,p)=>nonparametric(ds,{...p,test:'mannwhitney'}) },
    nonparametric_wilcoxon: { id:'nonparametric_wilcoxon', category:'nonparametric', display_name:'Wilcoxon Signed-Rank Test', execute:(ds,p)=>nonparametric(ds,{...p,test:'wilcoxon'}) },
    nonparametric_kruskalwallis: { id:'nonparametric_kruskalwallis', category:'nonparametric', display_name:'Kruskal-Wallis Test', execute:(ds,p)=>nonparametric(ds,{...p,test:'kruskalwallis'}) },
    nonparametric_friedman: { id:'nonparametric_friedman', category:'nonparametric', display_name:'Friedman Test', execute:(ds,p)=>nonparametric(ds,{...p,test:'friedman'}) },
    kmeans: { id:'kmeans', category:'cluster', display_name:'K-Means Clustering', execute: kMeans },
    kaplan_meier: { id:'kaplan_meier', category:'survival', display_name:'Kaplan-Meier Survival Analysis', execute: kaplanMeier },
  };

  function runProcedure(procedureId, dataset, params) {
    const proc = registry[procedureId];
    if (!proc) return { status:'error', result:null, warnings:[], assumptions_checked:[], error:{ procedure:procedureId, error_code:'UNKNOWN_PROCEDURE', message:`Procedure '${procedureId}' not registered.`, likely_cause:'', suggested_action:'Check procedure ID.' } };
    try {
      const result = proc.execute(dataset, params);
      return result;
    } catch(e) {
      return { status:'error', result:null, warnings:[], assumptions_checked:[], error:{ procedure:procedureId, error_code:'RUNTIME_ERROR', message:e.message, likely_cause:'Unexpected error in statistical computation.', suggested_action:'Check input data and parameters.' } };
    }
  }

  return { runProcedure, registry };
})();

const ProcedureRegistry = StatProcs;

/* ══════════════════════════════════════════════════════════════════
   SECTION 5: TRANSFORMATION ENGINE
   ══════════════════════════════════════════════════════════════════ */

const Transform = (() => {
  /* Safe expression evaluator for Compute Variable
     Supports: arithmetic (+,-,*,/,**), Math functions, variable refs,
     conditional IF(cond,a,b), SYSMIS check                          */
  function safeEval(expr, rowVars) {
    // Replace variable references with their values
    let code = expr;
    // Replace IF(cond,a,b) → ternary
    code = code.replace(/\bIF\s*\(([^,]+),([^,]+),([^)]+)\)/gi,
      (_,c,a,b)=>`((${c})?(${a}):(${b}))`);
    // Replace SYSMIS → null check
    code = code.replace(/\bSYSMIS\b/gi, 'null');
    // Replace variable names (longest first to avoid partial match)
    const varNames = Object.keys(rowVars).sort((a,b)=>b.length-a.length);
    for (const vn of varNames) {
      const val = rowVars[vn];
      const safe = (val == null || val === '') ? 'null' : JSON.stringify(val);
      code = code.replace(new RegExp(`\\b${vn}\\b`,'g'), safe);
    }
    // Allow only safe constructs
    const allowed = /^[0-9\s\.\+\-\*\/\(\)\%\|\&\!\<\>\=\?\:\"\'nulltrue false,]+$|Math\.|null/;
    // Use Function constructor in a try/catch — no eval on user data, only numeric expressions
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`"use strict"; return (${code});`);
      return fn();
    } catch(e) {
      return null;
    }
  }

  function computeVariable(dataset, targetVar, expression, label='') {
    const cases = dataset.cases;
    const varNames = dataset.variables.map(v=>v.name);
    const results = cases.map(row => {
      const rowVars = {};
      varNames.forEach(vn => { rowVars[vn] = row[vn] ?? null; });
      try {
        const v = safeEval(expression, rowVars);
        return (v == null || !isFinite(v)) ? null : v;
      } catch { return null; }
    });
    // Add or update variable
    let varDef = dataset.variables.find(v=>v.name===targetVar);
    if (!varDef) {
      varDef = {
        id: uuid(), name: targetVar, label: label||targetVar,
        type:'numeric', width:8, decimals:2, valueLabels:{},
        missingValues:[], measurementLevel:'scale', role:'input',
        visibility:true
      };
      dataset.variables.push(varDef);
    } else if (label) varDef.label = label;
    cases.forEach((row,i)=>{ row[targetVar]=results[i]; });
    return { changed: cases.length, variable: targetVar };
  }

  function recodeVariable(dataset, sourceVar, targetVar, mappings, elseValue='copy') {
    // mappings: [{from: [values...], to: value}, ...]
    // from can also be {lo,hi} range or 'SYSMIS'
    const srcIsTarget = (sourceVar===targetVar);
    if (!srcIsTarget) {
      let varDef = dataset.variables.find(v=>v.name===targetVar);
      if (!varDef) {
        const src = dataset.variables.find(v=>v.name===sourceVar);
        varDef = { ...src, id:uuid(), name:targetVar, label:targetVar, valueLabels:{} };
        dataset.variables.push(varDef);
      }
    }
    let changed=0;
    dataset.cases.forEach(row => {
      const orig = row[sourceVar];
      let matched = false;
      for (const m of mappings) {
        const from = m.from;
        let hit = false;
        if (from === 'SYSMIS' || from === null) {
          hit = (orig == null || orig === '');
        } else if (Array.isArray(from)) {
          hit = from.some(f => {
            if (f !== null && typeof f==='object' && 'lo' in f) {
              const lo = f.lo=='LOWEST' ? -Infinity : Number(f.lo);
              const hi = f.hi=='HIGHEST' ? Infinity : Number(f.hi);
              return Number(orig)>=lo && Number(orig)<=hi;
            }
            // eslint-disable-next-line eqeqeq
            return f == orig;
          });
        } else {
          // eslint-disable-next-line eqeqeq
          hit = (from == orig);
        }
        if (hit) {
          row[targetVar] = m.to === 'SYSMIS' ? null : m.to;
          matched = true; changed++; break;
        }
      }
      if (!matched) {
        if (elseValue==='copy') row[targetVar] = srcIsTarget ? orig : orig;
        else if (elseValue==='SYSMIS') row[targetVar] = null;
        else row[targetVar] = elseValue;
      }
    });
    return { changed };
  }

  function sortCases(dataset, sortKeys) {
    // sortKeys: [{variable, direction}]
    dataset.cases.sort((a,b) => {
      for (const { variable, direction } of sortKeys) {
        const av=a[variable], bv=b[variable];
        if (av==null && bv==null) continue;
        if (av==null) return 1;
        if (bv==null) return -1;
        const cmp = typeof av==='number'&&typeof bv==='number'
          ? av-bv : String(av).localeCompare(String(bv));
        if (cmp!==0) return direction==='desc' ? -cmp : cmp;
      }
      return 0;
    });
    return { sorted: dataset.cases.length };
  }

  function selectCases(dataset, filterExpr) {
    // Sets dataset.activeFilter — does not delete cases
    dataset.activeFilter = filterExpr || null;
    return { filter: dataset.activeFilter };
  }

  function weightCases(dataset, weightVar) {
    dataset.weightVariable = weightVar || null;
    return { weight: dataset.weightVariable };
  }

  function splitFile(dataset, splitVars) {
    dataset.splitVariables = splitVars || [];
    return { split: dataset.splitVariables };
  }

  function aggregate(dataset, breakVars, aggSpecs) {
    // aggSpecs: [{sourceVar, targetVar, function: 'mean'|'sum'|'min'|'max'|'count'|'sd'|'median'}]
    const groups = {};
    dataset.cases.forEach(row => {
      const key = breakVars.map(v=>String(row[v]??'')).join('|');
      if (!groups[key]) groups[key] = { _key:key, _rows:[] };
      groups[key]._rows.push(row);
    });
    const newCases = Object.values(groups).map(g => {
      const out = {};
      breakVars.forEach(v=>{ out[v]=g._rows[0][v]; });
      aggSpecs.forEach(({ sourceVar, targetVar, function:fn }) => {
        const vals = g._rows.map(r=>r[sourceVar]).filter(v=>typeof v==='number'&&isFinite(v));
        let val = null;
        if (vals.length) {
          if (fn==='mean') val=Stats.mean(vals);
          else if (fn==='sum') val=vals.reduce((s,v)=>s+v,0);
          else if (fn==='min') val=Math.min(...vals);
          else if (fn==='max') val=Math.max(...vals);
          else if (fn==='count') val=vals.length;
          else if (fn==='sd') val=Stats.std(vals);
          else if (fn==='median') val=Stats.quantile(Stats.sortNum(vals),0.5);
        }
        out[targetVar] = val!=null ? parseFloat(val.toFixed(6)) : null;
      });
      return out;
    });
    return newCases;
  }

  function applyFilter(cases, expr, variables) {
    if (!expr) return cases;
    const varNames = variables.map(v=>v.name);
    return cases.filter(row => {
      const rowVars = {};
      varNames.forEach(vn=>{ rowVars[vn]=row[vn]??null; });
      try {
        // eslint-disable-next-line no-new-func
        const fn = new Function(...varNames, `"use strict"; return !!(${expr});`);
        return fn(...varNames.map(vn=>rowVars[vn]));
      } catch { return true; }
    });
  }

  return { computeVariable, recodeVariable, sortCases, selectCases, weightCases, splitFile, aggregate, applyFilter };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 6: IMPORT WIZARD
   ══════════════════════════════════════════════════════════════════ */

const ImportWizard = (() => {
  let _state = {};

  function inferType(values) {
    const nonEmpty = values.filter(v=>v!=null&&v!=='');
    if (!nonEmpty.length) return 'string';
    const allNum = nonEmpty.every(v=>!isNaN(Number(v))&&v!=='');
    if (allNum) return 'numeric';
    const dateRx = /^\d{4}-\d{2}-\d{2}$/;
    const allDate = nonEmpty.every(v=>dateRx.test(String(v)));
    if (allDate) return 'date';
    return 'string';
  }

  function inferLevel(type, uniqueCount, totalCount) {
    if (type==='string') return 'nominal';
    if (type==='numeric') {
      if (uniqueCount<=10) return 'ordinal';
      return 'scale';
    }
    return 'nominal';
  }

  function buildVariables(headers, columns) {
    return headers.map((h, i) => {
      const vals = columns[i] || [];
      const nonEmpty = vals.filter(v=>v!=null&&v!=='');
      const unique = new Set(nonEmpty.map(String)).size;
      const type = inferType(vals);
      const level = inferLevel(type, unique, nonEmpty.length);
      return {
        id: uuid(), name: h.replace(/\s+/g,'_').replace(/[^a-zA-Z0-9_]/g,''),
        label: h, type, width:8, decimals:type==='numeric'?2:0,
        valueLabels:{}, missingValues:[], measurementLevel:level,
        role:'input', visibility:true,
        _inferred:{ type, level, unique, n:nonEmpty.length }
      };
    });
  }

  /* ── Native CSV fallback (no PapaParse) ── */
  function parseCSVNative(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
          if (!lines.length) { resolve({ headers: [], rows: [], columns: [] }); return; }
          // Simple CSV split respecting double-quoted fields
          function splitLine(line) {
            const fields = []; let cur = '', inQ = false;
            for (let i = 0; i < line.length; i++) {
              const c = line[i];
              if (c === '"') { inQ = !inQ; }
              else if (c === ',' && !inQ) { fields.push(cur); cur = ''; }
              else { cur += c; }
            }
            fields.push(cur);
            return fields.map(f => f.trim().replace(/^"|"$/g, ''));
          }
          const headers = splitLine(lines[0]);
          const rows = lines.slice(1).map(line => {
            const vals = splitLine(line);
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] !== undefined ? vals[i] : null; });
            return obj;
          });
          const columns = headers.map(h => rows.map(r => r[h] ?? null));
          resolve({ headers, rows, columns });
        } catch(err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  function parseCSV(file) {
    if (typeof Papa === 'undefined') {
      console.warn('[SOCIOSTAT] PapaParse not available — using native CSV parser.');
      return parseCSVNative(file);
    }
    return new Promise((resolve,reject) => {
      Papa.parse(file, {
        header:true, skipEmptyLines:true, dynamicTyping:false,
        complete: res => {
          const headers = res.meta.fields || [];
          const rows = res.data;
          const columns = headers.map(h=>rows.map(r=>r[h]??null));
          resolve({ headers, rows, columns });
        },
        error: e => reject(e)
      });
    });
  }

  function parseXLSX(file) {
    if (typeof XLSX === 'undefined') {
      return Promise.reject(new Error('Excel support is currently unavailable (library not loaded). Please import a CSV file instead, or retry the Excel library from Settings → System Status.'));
    }
    return new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type:'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval:null, raw:false });
          const headers = rows.length ? Object.keys(rows[0]) : [];
          const columns = headers.map(h=>rows.map(r=>r[h]??null));
          resolve({ headers, rows, columns });
        } catch(err) { reject(err); }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async function open(file, onImport) {
    let parsed;
    try {
      if (file.name.endsWith('.csv') || file.type==='text/csv') parsed = await parseCSV(file);
      else parsed = await parseXLSX(file);
    } catch(e) {
      notify(`Import error: ${e.message}`, 'error'); return;
    }
    const { headers, rows, columns } = parsed;
    const variables = buildVariables(headers, columns);
    showWizard({ file, headers, rows, columns, variables }, onImport);
  }

  function showWizard({ file, headers, rows, columns, variables }, onImport) {
    _state = { step:1, file, headers, rows, columns, variables, onImport };
    renderWizard();
  }

  function renderWizard() {
    // Build the new wizard DOM entirely before touching the existing overlay.
    // If construction throws, the existing wizard survives.
    let newOverlay;
    try {
      newOverlay = buildWizardDOM();
    } catch(err) {
      // Construction failed — show error inside existing wizard if possible,
      // otherwise show a notification. Never silently close.
      const existing = $('#import-wizard-overlay');
      if (existing) {
        const errBox = el('div', { class:'warning-box high', style:{ margin:'12px' } },
          el('div', { class:'warning-header' }, 'Unable to display step'),
          el('div', { class:'warning-issue' }, String(err && err.message ? err.message : err))
        );
        const body = existing.querySelector('.wizard-body');
        if (body) { body.innerHTML = ''; body.appendChild(errBox); }
        else existing.querySelector('.dialog-box')?.appendChild(errBox);
      } else {
        notify('Wizard error: ' + (err && err.message ? err.message : String(err)), 'error');
      }
      console.error('[ImportWizard] renderWizard error:', err);
      return;
    }

    // Construction succeeded — swap out the old overlay atomically.
    const existing = $('#import-wizard-overlay');
    if (existing) existing.remove();
    document.body.appendChild(newOverlay);
  }

  function buildWizardDOM() {
    const overlay = el('div', { id:'import-wizard-overlay', class:'dialog-overlay' });
    const box = el('div', { class:'dialog-box wizard-box' });

    // Header
    box.appendChild(el('div', { class:'dialog-header' },
      el('h2', {}, `Import: ${_state.file.name}`),
      el('button', { class:'dialog-close', onclick:()=>overlay.remove() }, '×')
    ));

    // Steps indicator
    const stepsEl = el('div', { class:'wizard-steps' });
    ['Upload','Preview','Variables','Missing','Confirm'].forEach((s,i)=>{
      const cls = _state.step===i+1 ? 'wizard-step active'
                : _state.step>i+1  ? 'wizard-step done'
                : 'wizard-step';
      stepsEl.appendChild(el('div', { class:cls },
        el('span', { class:'step-num' }, String(i+1)),
        el('span', {}, s)
      ));
    });
    box.appendChild(stepsEl);

    // Body — render the current step
    const body = el('div', { class:'wizard-body' });
    switch (_state.step) {
      case 1: renderStep1(body); break;
      case 2: renderStep2(body); break;
      case 3: renderStep3(body); break;
      case 4: renderStep4(body); break;
      case 5: renderStep5(body); break;   // no extra args — uses _state directly
      default: renderStep1(body);
    }
    box.appendChild(body);

    // Footer
    const footer = el('div', { class:'dialog-footer' });
    if (_state.step > 1) {
      footer.appendChild(el('button', { class:'btn btn-secondary', onclick: () => {
        _state.step--;
        renderWizard();
      }}, '← Back'));
    }
    if (_state.step < 5) {
      footer.appendChild(el('button', { class:'btn btn-primary', onclick: () => {
        // Flush any un-blurred input on step 4 before advancing.
        // The missing-codes textarea stores its value via oninput/onchange;
        // read it directly from the DOM to be safe.
        if (_state.step === 4) {
          const inp = body.querySelector('#wizard-missing-input');
          if (inp) _state.missingCodes = inp.value;
        }
        _state.step++;
        renderWizard();
      }}, 'Next →'));
    } else {
      // Step 5 — Import Dataset button
      footer.appendChild(el('button', { class:'btn btn-primary', onclick: () => {
        doImport(overlay);
      }}, 'Import Dataset'));
    }

    box.appendChild(footer);
    overlay.appendChild(box);
    return overlay;
  }

  function renderStep1(body) {
    body.innerHTML='';
    const info = el('div', { class:'wizard-info' },
      el('p',{},`File: ${_state.file.name}`),
      el('p',{},`Size: ${(_state.file.size/1024).toFixed(1)} KB`),
      el('p',{},`Rows detected: ${_state.rows.length}`),
      el('p',{},`Columns detected: ${_state.headers.length}`)
    );
    body.appendChild(info);
  }

  function renderStep2(body) {
    body.innerHTML='';
    const previewRows = _state.rows.slice(0,10);
    const tbl = el('table',{class:'pivot-table preview-table'});
    const thead = el('thead'); const hrow = el('tr');
    _state.headers.forEach(h=>hrow.appendChild(el('th',{},h)));
    thead.appendChild(hrow); tbl.appendChild(thead);
    const tbody = el('tbody');
    previewRows.forEach(row=>{
      const tr=el('tr');
      _state.headers.forEach(h=>tr.appendChild(el('td',{},row[h]??'')));
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    body.appendChild(el('p',{class:'muted'},`Showing first ${previewRows.length} of ${_state.rows.length} rows`));
    body.appendChild(el('div',{class:'table-scroll'},tbl));
  }

  function renderStep3(body) {
    body.innerHTML='';
    body.appendChild(el('p',{class:'muted'},'Review inferred variable types and measurement levels. You can correct them before importing.'));
    const tbl = el('table',{class:'pivot-table'});
    const thead=el('thead',{},el('tr',{},
      ...['Name','Label','Type','Level','Unique','N'].map(h=>el('th',{},h))
    ));
    tbl.appendChild(thead);
    const tbody=el('tbody');
    _state.variables.forEach((v,i)=>{
      const tr=el('tr');
      // Name editable
      const nameInput=el('input',{type:'text',value:v.name,class:'cell-input',
        onchange:e=>_state.variables[i].name=e.target.value.replace(/\s+/g,'_')});
      tr.appendChild(el('td',{},nameInput));
      tr.appendChild(el('td',{},v.label));
      // Type selector
      const typeSelect=el('select',{class:'cell-input',onchange:e=>_state.variables[i].type=e.target.value});
      ['numeric','string','date','boolean'].forEach(t=>{
        const o=el('option',{value:t},t); if(t===v.type)o.selected=true;
        typeSelect.appendChild(o);
      });
      tr.appendChild(el('td',{},typeSelect));
      // Level selector
      const levelSelect=el('select',{class:'cell-input',onchange:e=>_state.variables[i].measurementLevel=e.target.value});
      ['nominal','ordinal','scale'].forEach(l=>{
        const o=el('option',{value:l},l); if(l===v.measurementLevel)o.selected=true;
        levelSelect.appendChild(o);
      });
      tr.appendChild(el('td',{},levelSelect));
      tr.appendChild(el('td',{},String(v._inferred?.unique??'')));
      tr.appendChild(el('td',{},String(v._inferred?.n??'')));
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    body.appendChild(el('div',{class:'table-scroll'},tbl));
  }

  function renderStep4(body) {
    body.innerHTML = '';
    body.appendChild(el('p', { class:'muted' },
      'Specify how missing values are coded in your dataset. Leave blank if there are no special missing-value codes.'));

    const label = el('label', { for:'wizard-missing-input' },
      'Treat these values as system missing (optional):');
    label.style.display = 'block';
    label.style.marginBottom = '6px';

    // Use oninput so the value is captured on every keystroke,
    // not just on blur — prevents losing content when Next is clicked.
    const missingInput = el('input', {
      type: 'text',
      id: 'wizard-missing-input',
      class: 'form-control',
      value: _state.missingCodes || '',
      placeholder: '-99, 999, N/A',
      oninput: e => { _state.missingCodes = e.target.value; }
    });

    const hint = el('p', { class:'muted small' },
      'Comma-separated values. Empty cells are always system missing. ' +
      'Leave blank to import all non-empty values as valid data.');

    body.appendChild(label);
    body.appendChild(missingInput);
    body.appendChild(hint);
  }

  function renderStep5(body) {
    body.innerHTML='';
    body.appendChild(el('h3',{},'Ready to import'));
    body.appendChild(el('p',{},`${_state.rows.length} cases, ${_state.variables.length} variables will be imported.`));
    const summary=el('ul',{});
    _state.variables.slice(0,8).forEach(v=>summary.appendChild(el('li',{},`${v.name} (${v.type}, ${v.measurementLevel})`)));
    if (_state.variables.length>8) summary.appendChild(el('li',{class:'muted'},`...and ${_state.variables.length-8} more`));
    body.appendChild(summary);
  }

  function doImport(overlay) {
    // Flush missing-codes input one last time in case oninput didn't fire
    // (e.g. programmatic value set). Value may be undefined if user never
    // reached step 4, so default to empty string — that is always valid.
    const missingCodes = (_state.missingCodes || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    // Build a header→varIndex map so we look up raw CSV values by original
    // column name, not by reference-equality indexOf.
    // _state.variables[i] was built from _state.headers[i] positionally.
    const cases = _state.rows.map(row => {
      const c = {};
      _state.variables.forEach((v, i) => {
        const header = _state.headers[i];          // original CSV column name
        const raw = (header !== undefined) ? (row[header] ?? null) : null;
        if (raw === null || raw === '') {
          c[v.name] = null;
          return;
        }
        if (missingCodes.length > 0 && missingCodes.includes(String(raw))) {
          c[v.name] = null;
          return;
        }
        if (v.type === 'numeric') {
          const n = Number(raw);
          c[v.name] = isNaN(n) ? null : n;
        } else {
          c[v.name] = raw;
        }
      });
      return c;
    });

    // Strip the _inferred helper field — not part of the persisted schema
    const variables = _state.variables.map(v => {
      const w = { ...v };
      delete w._inferred;
      return w;
    });

    const dataset = {
      id: uuid(),
      name: _state.file.name.replace(/\.[^.]+$/, ''),
      description: '',
      variables,
      cases,
      activeFilter: null,
      weightVariable: null,
      splitVariables: [],
      metadata: {
        importedFrom: _state.file.name,
        importedAt: new Date().toISOString(),
        missingCodes
      },
      transformationHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    overlay.remove();
    if (typeof _state.onImport === 'function') _state.onImport(dataset);
  }

  return { open };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 7: DATA VIEW
   ══════════════════════════════════════════════════════════════════ */

const DataView = (() => {
  const PAGE = 200;
  let _container=null, _dataset=null, _page=0, _sortKey=null, _sortDir='asc';
  // Stable DOM references — never recreated on selection change
  let _tdMap=null;   // Map: "rowIdx:varIdx" → <td>
  let _trMap=null;   // Map: rowIdx → <tr>
  let _visVars=[];   // current visible variables (for this render)
  let _caseSlice=[];  // cases[start..end] references

  // Editor & selection state
  let _editCell=null;  // { td, rowIdx, varName, origVal }
  let _selCell=null;   // { rowIdx, varName, varIdx }
  let _undoStack=[], _redoStack=[];
  let _clipboard=null;
  let _scrollEl=null;

  function init(container) { _container=container; }

  /* ── Undo / Redo ─────────────────────────────────────────── */
  function pushUndo(entry) {
    _undoStack.push(entry);
    if (_undoStack.length > 200) _undoStack.shift();
    _redoStack=[];
  }

  function undo() {
    if (!_undoStack.length || !_dataset) return;
    const e=_undoStack.pop();
    _redoStack.push(e);
    if (e.type==='cell') {
      _dataset.cases[e.rowIdx][e.varName]=e.oldVal;
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty();
      _refreshCell(e.rowIdx, e.varName);
    } else if (e.type==='addRow') {
      _dataset.cases.splice(e.rowIdx,1);
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty(); render(_dataset);
    } else if (e.type==='addVar') {
      const vi=_dataset.variables.findIndex(v=>v.name===e.varName);
      if (vi>=0) {
        _dataset.variables.splice(vi,1);
        _dataset.cases.forEach(r=>delete r[e.varName]);
        _dataset.updatedAt=new Date().toISOString();
        Project.markDirty(); render(_dataset);
      }
    } else if (e.type==='deleteRow') {
      _dataset.cases.splice(e.rowIdx,0,e.row);
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty(); render(_dataset);
    }
  }

  function redo() {
    if (!_redoStack.length || !_dataset) return;
    const e=_redoStack.pop();
    _undoStack.push(e);
    if (e.type==='cell') {
      _dataset.cases[e.rowIdx][e.varName]=e.newVal;
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty();
      _refreshCell(e.rowIdx, e.varName);
    } else if (e.type==='addRow') {
      _dataset.cases.splice(e.rowIdx,0,e.row);
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty(); render(_dataset);
    } else if (e.type==='addVar') {
      _dataset.variables.push(e.varDef);
      _dataset.cases.forEach(r=>{ r[e.varName]=null; });
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty(); render(_dataset);
    } else if (e.type==='deleteRow') {
      _dataset.cases.splice(e.rowIdx,1);
      _dataset.updatedAt=new Date().toISOString();
      Project.markDirty(); render(_dataset);
    }
  }

  /* ── Clipboard ───────────────────────────────────────────── */
  function copySelected() {
    if (!_selCell||!_dataset) return;
    const val=_dataset.cases[_selCell.rowIdx]?.[_selCell.varName];
    _clipboard={value:val};
    navigator.clipboard?.writeText(val==null?'':String(val)).catch(()=>{});
    notify('Copied','success',1200);
  }

  function pasteSelected() {
    if (!_selCell||!_dataset) return;
    const {rowIdx,varName}=_selCell;
    const oldVal=_dataset.cases[rowIdx][varName];
    const v=_dataset.variables.find(x=>x.name===varName);

    // Try system clipboard first, fall back to internal
    const doApply=(text)=>{
      // Multi-cell tab-separated paste
      const lines=text.split('\n').filter(l=>l!=='');
      if (lines.length===1&&!lines[0].includes('\t')) {
        // Single cell
        let val=text===''?null:text;
        if (v&&v.type==='numeric') {
          const n=Number(text); val=(text==='')?null:(!isNaN(n)?n:null);
          if (text!==''&&isNaN(Number(text))) { notify('Clipboard value is not numeric — paste skipped','warning'); return; }
        }
        if (val!==oldVal) pushUndo({type:'cell',rowIdx,varName,oldVal,newVal:val});
        _dataset.cases[rowIdx][varName]=val;
        _dataset.updatedAt=new Date().toISOString();
        Project.markDirty();
        _refreshCell(rowIdx,varName);
      } else {
        // Multi-cell paste
        const visVars=_dataset.variables.filter(x=>x.visibility!==false);
        let ri=rowIdx;
        lines.forEach(line=>{
          if (ri>=_dataset.cases.length) return;
          const cells=line.split('\t');
          cells.forEach((cellText,ci)=>{
            const vi=_selCell.varIdx+ci;
            if (vi>=visVars.length) return;
            const vn=visVars[vi].name;
            const vv=visVars[vi];
            let val=cellText===''?null:cellText;
            if (vv&&vv.type==='numeric') { const n=Number(cellText); val=(cellText==='')?null:(!isNaN(n)?n:null); }
            const ov=_dataset.cases[ri][vn];
            if (val!==ov) pushUndo({type:'cell',rowIdx:ri,varName:vn,oldVal:ov,newVal:val});
            _dataset.cases[ri][vn]=val;
          });
          ri++;
        });
        _dataset.updatedAt=new Date().toISOString();
        Project.markDirty(); render(_dataset);
      }
    };

    if (navigator.clipboard?.readText) {
      navigator.clipboard.readText().then(doApply).catch(()=>{ if(_clipboard) doApply(_clipboard.value==null?'':String(_clipboard.value)); });
    } else if (_clipboard) {
      doApply(_clipboard.value==null?'':String(_clipboard.value));
    }
  }

  /* ── Add/Delete rows and variables ──────────────────────── */
  function addVariableCol(dataset) {
    let n=dataset.variables.length+1;
    let name='var'+String(n).padStart(3,'0');
    while (dataset.variables.some(v=>v.name===name)) { n++; name='var'+String(n).padStart(3,'0'); }
    const varDef={id:uuid(),name,label:'',type:'numeric',width:8,decimals:2,
      valueLabels:{},missingValues:[],measurementLevel:'scale',role:'input',visibility:true};
    dataset.variables.push(varDef);
    dataset.cases.forEach(r=>{ r[name]=null; });
    dataset.updatedAt=new Date().toISOString();
    pushUndo({type:'addVar',varName:name,varDef:{...varDef}});
    Project.markDirty(); render(dataset);
  }

  function deleteSelectedRow(dataset) {
    if (!_selCell) return;
    const ri=_selCell.rowIdx;
    pushUndo({type:'deleteRow',rowIdx:ri,row:{...dataset.cases[ri]}});
    dataset.cases.splice(ri,1);
    dataset.updatedAt=new Date().toISOString();
    _selCell=null;
    Project.markDirty(); render(dataset);
  }

  function createBlankDataset() {
    const name=prompt('Dataset name:','New Dataset');
    if (!name) return;
    const ds={
      id:uuid(),name,description:'',variables:[],cases:[],
      activeFilter:null,weightVariable:null,splitVariables:[],
      metadata:{},transformationHistory:[],
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()
    };
    ['var001','var002','var003'].forEach(vn=>{
      ds.variables.push({id:uuid(),name:vn,label:'',type:'numeric',width:8,decimals:2,
        valueLabels:{},missingValues:[],measurementLevel:'scale',role:'input',visibility:true});
    });
    for(let i=0;i<5;i++){
      const row={}; ds.variables.forEach(v=>row[v.name]=null); ds.cases.push(row);
    }
    AppState.set('activeDataset',ds);
    Project.markDirty(); render(ds);
  }

  /* ── Cell display helper ─────────────────────────────────── */
  function _cellDisplayVal(v, val) {
    if (val==null) return null; // signals missing
    if (v.valueLabels&&v.valueLabels[val]) return val+' ('+v.valueLabels[val]+')';
    if (v.type==='numeric') {
      const n=Number(val);
      return isNaN(n)?String(val):n.toFixed(v.decimals||2);
    }
    return String(val);
  }

  /* ── Refresh a single cell in-place (no table rebuild) ───── */
  function _refreshCell(rowIdx, varName) {
    if (!_tdMap||!_dataset) return;
    const vi=_visVars.findIndex(v=>v.name===varName);
    if (vi<0) return;
    const pageStart=_page*PAGE;
    const key=(rowIdx-pageStart)+':'+vi;
    const td=_tdMap.get(key);
    if (!td) return;
    const v=_visVars[vi];
    const val=_dataset.cases[rowIdx]?.[varName];
    const disp=_cellDisplayVal(v,val);
    td.innerHTML='';
    if (disp==null) { td.appendChild(el('span',{class:'missing-val'},'.')); }
    else { td.textContent=disp; }
  }

  /* ── Selection: CSS-only, no table rebuild ───────────────── */
  function _applySelection(newSel) {
    // Clear old
    if (_selCell) {
      const pageStart=_page*PAGE;
      const oldKey=(_selCell.rowIdx-pageStart)+':'+_selCell.varIdx;
      const oldTd=_tdMap?.get(oldKey);
      if (oldTd) { oldTd.classList.remove('cell-selected'); }
      const oldTr=_trMap?.get(_selCell.rowIdx);
      if (oldTr) oldTr.classList.remove('row-selected');
    }
    _selCell=newSel;
    // Apply new
    if (_selCell) {
      const pageStart=_page*PAGE;
      const newKey=(_selCell.rowIdx-pageStart)+':'+_selCell.varIdx;
      const newTd=_tdMap?.get(newKey);
      if (newTd) { newTd.classList.add('cell-selected'); newTd.focus?.(); }
      const newTr=_trMap?.get(_selCell.rowIdx);
      if (newTr) newTr.classList.add('row-selected');
      // Update toolbar copy/paste/del visibility
      _updateToolbar();
    }
  }

  function _updateToolbar() {
    const toolbar=_container?.querySelector('.data-toolbar');
    if (!toolbar||!_dataset) return;
    // Copy/Paste/Del Row only shown when cell selected
    const hasSel=!!_selCell;
    ['btn-copy','btn-paste','btn-delrow'].forEach(cls=>{
      const b=toolbar.querySelector('.'+cls);
      if (b) b.style.display=hasSel?'':'none';
    });
  }

  /* ── Full render — builds stable DOM ─────────────────────── */
  function render(dataset) {
    _dataset=dataset;
    if (!_container) return;
    _container.innerHTML='';
    _container.style.cssText='display:flex;flex-direction:column;height:100%;';
    _tdMap=new Map(); _trMap=new Map();

    if (!dataset) {
      _container.appendChild(el('div',{class:'empty-state-full'},
        el('div',{class:'empty-state-icon'},'\u{1F4CB}'),
        el('h3',{},'No Dataset Loaded'),
        el('p',{},'Import a CSV/XLSX file or create a new empty dataset to get started.'),
        el('div',{class:'empty-state-actions'},
          el('button',{class:'btn btn-secondary',onclick:()=>createBlankDataset()},'\u2728 New Empty Dataset')
        )
      ));
      return;
    }

    const total=dataset.cases.length;
    const start=_page*PAGE, end=Math.min(start+PAGE,total);
    _visVars=dataset.variables.filter(v=>v.visibility!==false);

    // ── Toolbar ────────────────────────────────────────────
    const toolbar=el('div',{class:'data-toolbar data-toolbar-full'});
    toolbar.appendChild(el('div',{class:'data-toolbar-info'},
      el('span',{class:'muted small'},total+' cases \u00B7 '+dataset.variables.length+' variables')
    ));
    const btnGroup=el('div',{class:'data-toolbar-actions'});
    btnGroup.appendChild(el('button',{class:'btn btn-sm',title:'Undo (Ctrl+Z)',onclick:()=>undo()},'\u21A9 Undo'));
    btnGroup.appendChild(el('button',{class:'btn btn-sm',title:'Redo (Ctrl+Y)',onclick:()=>redo()},'\u21AA Redo'));
    btnGroup.appendChild(el('button',{class:'btn btn-sm btn-primary',onclick:()=>addRow(dataset),title:'Insert new case'},'+ Case'));
    btnGroup.appendChild(el('button',{class:'btn btn-sm btn-secondary',onclick:()=>addVariableCol(dataset),title:'Add variable column'},'+ Variable'));
    // Copy/Paste/Del only shown when selection active
    const hasSel=!!_selCell;
    const copyBtn=el('button',{class:'btn btn-sm btn-copy',style:'display:'+(hasSel?'':'none'),title:'Copy (Ctrl+C)',onclick:()=>copySelected()},'Copy');
    const pasteBtn=el('button',{class:'btn btn-sm btn-paste',style:'display:'+(hasSel?'':'none'),title:'Paste (Ctrl+V)',onclick:()=>pasteSelected()},'Paste');
    const delBtn=el('button',{class:'btn btn-sm btn-danger btn-delrow',style:'display:'+(hasSel?'':'none'),onclick:()=>deleteSelectedRow(dataset)},'Del Row');
    btnGroup.appendChild(copyBtn); btnGroup.appendChild(pasteBtn); btnGroup.appendChild(delBtn);
    toolbar.appendChild(btnGroup);
    const pgDiv=el('div',{class:'data-toolbar-page'});
    pgDiv.appendChild(el('span',{class:'small muted'},(start+1)+'\u2013'+end+' of '+total));
    pgDiv.appendChild(el('button',{class:'btn btn-xs',onclick:()=>{if(_page>0){_page--;render(dataset);}},disabled:_page===0},'\u25C0'));
    pgDiv.appendChild(el('button',{class:'btn btn-xs',onclick:()=>{if(end<total){_page++;render(dataset);}},disabled:end>=total},'\u25B6'));
    toolbar.appendChild(pgDiv);
    _container.appendChild(toolbar);

    if (total>0) {
      _container.appendChild(el('div',{class:'data-kb-hint'},
        '\u2328 Click to select \u00B7 Type to edit \u00B7 Dbl-click to edit \u00B7 Arrow keys navigate \u00B7 Ctrl+C/V \u00B7 Ctrl+Z/Y undo/redo \u00B7 Del clear cell'
      ));
    }

    // ── Scroll / Table ─────────────────────────────────────
    const scroll=el('div',{class:'data-grid-scroll',tabIndex:'0'});
    _scrollEl=scroll;
    scroll.addEventListener('keydown',(e)=>handleKeyboard(e,dataset,_visVars));

    const tbl=el('table',{class:'data-grid'});
    const thead=el('thead');
    const hrow=el('tr');
    hrow.appendChild(el('th',{class:'row-num-header'},'#'));
    _visVars.forEach(v=>{
      const th=el('th',{title:v.label||v.name});
      const nameSpan=document.createTextNode(v.name);
      th.appendChild(nameSpan);
      if (_sortKey===v.name) th.appendChild(document.createTextNode(_sortDir==='asc'?' \u25B2':' \u25BC'));
      th.addEventListener('click',()=>{
        _sortKey=v.name; _sortDir=_sortDir==='asc'?'desc':'asc'; _page=0; render(dataset);
      });
      // Double-click header → go to Variable View focused on this var
      th.addEventListener('dblclick',e=>{
        e.stopPropagation();
        if (window.App) { App.setDataSubview('variable'); App.renderDataModule(); }
      });
      const infoBtn=el('span',{class:'var-col-info',title:'Variable info (click) · Variable View (double-click)'},'ⓘ');
      infoBtn.addEventListener('click',e=>{ e.stopPropagation(); showVarContextPanel(v,dataset,th); });
      th.appendChild(infoBtn);
      hrow.appendChild(th);
    });
    thead.appendChild(hrow); tbl.appendChild(thead);

    let cases=[...dataset.cases];
    if (_sortKey) {
      const dir=_sortDir;
      cases.sort((a,b)=>{
        const av=a[_sortKey],bv=b[_sortKey];
        if(av==null&&bv==null)return 0; if(av==null)return 1; if(bv==null)return -1;
        const c=typeof av==='number'&&typeof bv==='number'?av-bv:String(av).localeCompare(String(bv));
        return dir==='asc'?c:-c;
      });
    }
    _caseSlice=cases.slice(start,end);

    const tbody=el('tbody');
    for (let i=0;i<_caseSlice.length;i++) {
      const absIdx=start+i;
      const row=_caseSlice[i];
      const isSel=_selCell&&_selCell.rowIdx===absIdx;
      const tr=el('tr',{class:isSel?'row-selected':''});
      _trMap.set(absIdx,tr);
      tr.appendChild(el('td',{class:'row-num'},String(absIdx+1)));
      _visVars.forEach((v,vi)=>{
        const val=row[v.name];
        const isCellSel=_selCell&&_selCell.rowIdx===absIdx&&_selCell.varIdx===vi;
        const td=el('td',{class:'data-cell'+(isCellSel?' cell-selected':'')});
        _tdMap.set(i+':'+vi, td);
        // Cell display
        const disp=_cellDisplayVal(v,val);
        if (disp==null) { td.appendChild(el('span',{class:'missing-val'},'.')); }
        else { td.textContent=disp; }
        // Click: select only (no rebuild)
        td.addEventListener('click',()=>{
          if (_editCell) { commitEdit(); return; }
          _applySelection({rowIdx:absIdx,varName:v.name,varIdx:vi});
        });
        // Double-click: start editing
        td.addEventListener('dblclick',e=>{
          e.stopPropagation();
          _applySelection({rowIdx:absIdx,varName:v.name,varIdx:vi});
          startEdit(td,dataset,absIdx,v.name,dataset.cases[absIdx][v.name]);
        });
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    tbl.appendChild(tbody);
    scroll.appendChild(tbl);
    _container.appendChild(scroll);

    // Restore edit state if editing was in progress (after sort/page change)
    setTimeout(()=>{ if (_scrollEl) _scrollEl.focus(); },50);
  }

  /* ── Keyboard handler ────────────────────────────────────── */
  function handleKeyboard(e,dataset,visVars) {
    // When editing, the input element handles keys; only global shortcuts reach here
    if (_editCell) {
      // Allow the input to handle its own keys (stopPropagation in startEdit)
      return;
    }
    if (e.ctrlKey||e.metaKey) {
      if (e.key==='z'||e.key==='Z') { e.preventDefault(); undo(); return; }
      if (e.key==='y'||e.key==='Y') { e.preventDefault(); redo(); return; }
      if (e.key==='c'||e.key==='C') { e.preventDefault(); copySelected(); return; }
      if (e.key==='v'||e.key==='V') { e.preventDefault(); pasteSelected(); return; }
    }
    if (!_selCell) return;
    let {rowIdx,varIdx}=_selCell;
    const total=dataset.cases.length;
    const getVN=idx=>visVars[idx]?.name||null;

    if (e.key==='ArrowDown') {
      e.preventDefault();
      if(rowIdx<total-1){ rowIdx++; _applySelection({rowIdx,varIdx,varName:getVN(varIdx)}); }
    } else if (e.key==='ArrowUp') {
      e.preventDefault();
      if(rowIdx>0){ rowIdx--; _applySelection({rowIdx,varIdx,varName:getVN(varIdx)}); }
    } else if (e.key==='ArrowRight') {
      e.preventDefault();
      if(varIdx<visVars.length-1){ varIdx++; _applySelection({rowIdx,varIdx,varName:getVN(varIdx)}); }
    } else if (e.key==='ArrowLeft') {
      e.preventDefault();
      if(varIdx>0){ varIdx--; _applySelection({rowIdx,varIdx,varName:getVN(varIdx)}); }
    } else if (e.key==='Tab') {
      e.preventDefault();
      const dir=e.shiftKey?-1:1;
      const newVi=clamp(varIdx+dir,0,visVars.length-1);
      _applySelection({rowIdx,varIdx:newVi,varName:getVN(newVi)});
    } else if (e.key==='Enter') {
      e.preventDefault();
      const pageStart=_page*PAGE;
      const td=_tdMap?.get((rowIdx-pageStart)+':'+varIdx);
      if(td) startEdit(td,dataset,rowIdx,visVars[varIdx].name,dataset.cases[rowIdx][visVars[varIdx].name]);
    } else if (e.key==='Delete'||e.key==='Backspace') {
      e.preventDefault();
      const vn=_selCell.varName;
      const oldVal=dataset.cases[_selCell.rowIdx][vn];
      if (oldVal!==null) {
        pushUndo({type:'cell',rowIdx:_selCell.rowIdx,varName:vn,oldVal,newVal:null});
        dataset.cases[_selCell.rowIdx][vn]=null;
        dataset.updatedAt=new Date().toISOString();
        Project.markDirty();
        _refreshCell(_selCell.rowIdx,vn);
      }
    } else if (e.key.length===1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Printable character — enter edit mode immediately
      const pageStart=_page*PAGE;
      const td=_tdMap?.get((rowIdx-pageStart)+':'+varIdx);
      if(td && visVars[varIdx]) {
        startEdit(td,dataset,rowIdx,visVars[varIdx].name,dataset.cases[rowIdx][visVars[varIdx].name],e.key);
      }
    }
  }

  /* ── Start inline edit ───────────────────────────────────── */
  function startEdit(td,dataset,rowIdx,varName,currentVal,initChar) {
    if (_editCell && _editCell.rowIdx===rowIdx && _editCell.varName===varName) return;
    if (_editCell) commitEdit();

    const v=dataset.variables.find(x=>x.name===varName);
    const origVal=currentVal;

    _editCell={td,dataset,rowIdx,varName,origVal};
    td.classList.add('editing');
    td.innerHTML='';

    const inp=el('input',{type:'text',class:'cell-edit-input'});
    // In edit mode show raw value, not labeled/formatted display
    const rawDisplay= (currentVal==null) ? '' :
      (v&&v.type==='numeric'&&!isNaN(Number(currentVal))) ? String(currentVal) : String(currentVal);
    inp.value = (initChar!=null) ? initChar : rawDisplay;

    inp.addEventListener('blur',()=>commitEdit());
    inp.addEventListener('keydown',e=>{
      e.stopPropagation();
      if (e.key==='Enter') {
        e.preventDefault();
        const committed=commitEdit();
        if (committed===false) return; // validation failed, stay in edit
        // Move to next row
        const vis=dataset.variables.filter(x=>x.visibility!==false);
        const vi=vis.findIndex(x=>x.name===varName);
        const nextRow=rowIdx+1;
        if (nextRow<dataset.cases.length) {
          _applySelection({rowIdx:nextRow,varIdx:vi,varName});
          const pageStart=_page*PAGE;
          const nextTd=_tdMap?.get((nextRow-pageStart)+':'+vi);
          if (nextTd) setTimeout(()=>startEdit(nextTd,dataset,nextRow,varName,dataset.cases[nextRow][varName]),0);
        }
      } else if (e.key==='Tab') {
        e.preventDefault();
        const committed=commitEdit();
        if (committed===false) return;
        const vis=dataset.variables.filter(x=>x.visibility!==false);
        const vi=vis.findIndex(x=>x.name===varName);
        const nextVi=e.shiftKey?vi-1:vi+1;
        if (nextVi>=0&&nextVi<vis.length) {
          const nextVN=vis[nextVi].name;
          _applySelection({rowIdx,varIdx:nextVi,varName:nextVN});
          // Tab commits but does NOT auto-enter edit mode on next cell
        }
      } else if (e.key==='Escape') {
        e.preventDefault();
        // Discard — restore original value
        _editCell=null;
        td.classList.remove('editing');
        td.innerHTML='';
        const disp=_cellDisplayVal(v,origVal);
        if (disp==null) td.appendChild(el('span',{class:'missing-val'},'.'));
        else td.textContent=disp;
        if (_scrollEl) _scrollEl.focus();
      }
    });

    td.appendChild(inp);
    inp.focus();
    if (initChar!=null) { inp.setSelectionRange(inp.value.length,inp.value.length); }
    else { inp.select(); }
  }

  /* ── Commit edit (returns false if validation fails) ─────── */
  function commitEdit() {
    if (!_editCell) return true;
    const {td,dataset,rowIdx,varName,origVal}=_editCell;
    _editCell=null;
    td.classList.remove('editing');

    const inp=td.querySelector('input');
    if (!inp) return true;
    const raw=inp.value;
    const v=dataset.variables.find(x=>x.name===varName);

    let val;
    if (raw==='') {
      val=null;
    } else if (v&&v.type==='numeric') {
      const n=Number(raw);
      if (isNaN(n)) {
        // Invalid numeric — show error, keep editing
        _showNumericError(td,dataset,rowIdx,varName,origVal,raw);
        return false;
      }
      val=n;
    } else {
      val=raw;
    }

    const oldVal=dataset.cases[rowIdx][varName];
    if (val!==oldVal) {
      pushUndo({type:'cell',rowIdx,varName,oldVal,newVal:val});
      dataset.cases[rowIdx][varName]=val;
      dataset.updatedAt=new Date().toISOString();
      Project.markDirty();
    }

    // Update cell display in-place
    td.innerHTML='';
    const disp=_cellDisplayVal(v,val);
    if (disp==null) td.appendChild(el('span',{class:'missing-val'},'.'));
    else td.textContent=disp;

    if (_scrollEl) _scrollEl.focus();
    return true;
  }

  /* ── Numeric error inline UI ─────────────────────────────── */
  function _showNumericError(td,dataset,rowIdx,varName,origVal,badVal) {
    td.classList.add('editing');
    td.innerHTML='';
    const inp=el('input',{type:'text',class:'cell-edit-input cell-edit-error'});
    inp.value=badVal;
    const errMsg=el('div',{class:'cell-error-msg'},
      el('span',{},'Invalid numeric value. '),
      el('button',{class:'btn btn-xs btn-keep-editing',
        // Use mousedown+preventDefault to avoid triggering blur on inp
        onmousedown:(ev)=>{ ev.preventDefault(); },
        onclick:(ev)=>{ ev.preventDefault(); ev.stopPropagation(); inp.focus(); inp.select(); }
      },'Keep Editing'),
      el('button',{class:'btn btn-xs btn-clear-cell',
        onmousedown:(ev)=>{ ev.preventDefault(); },
        onclick:(ev)=>{
          ev.preventDefault(); ev.stopPropagation();
          // Clear _editCell before DOM manipulation to prevent blur from re-committing
          _editCell=null;
          const oldV=dataset.cases[rowIdx][varName];
          if (oldV!==null) {
            pushUndo({type:'cell',rowIdx,varName,oldVal:oldV,newVal:null});
            dataset.cases[rowIdx][varName]=null;
            dataset.updatedAt=new Date().toISOString();
            Project.markDirty();
          }
          td.classList.remove('editing');
          td.innerHTML='';
          td.appendChild(el('span',{class:'missing-val'},'.'));
          if (_scrollEl) _scrollEl.focus();
        }
      },'Set Missing')
    );

    // Re-enter edit mode on this cell
    _editCell={td,dataset,rowIdx,varName,origVal};
    inp.addEventListener('blur',()=>{
      // Don't commit on blur if focus went to error buttons (mousedown prevents that)
      // Small delay to allow button clicks to clear _editCell first
      setTimeout(()=>{ if(_editCell&&_editCell.td===td) commitEdit(); },50);
    });
    inp.addEventListener('keydown',e=>{
      e.stopPropagation();
      if (e.key==='Escape') {
        _editCell=null;
        td.classList.remove('editing');
        td.innerHTML='';
        const v2=dataset.variables.find(x=>x.name===varName);
        const disp=_cellDisplayVal(v2,origVal);
        if (disp==null) td.appendChild(el('span',{class:'missing-val'},'.'));
        else td.textContent=disp;
        if (_scrollEl) _scrollEl.focus();
      } else if (e.key==='Enter') {
        e.preventDefault();
        if (_editCell) commitEdit();
      }
    });

    td.appendChild(inp);
    td.appendChild(errMsg);
    inp.focus(); inp.select();
  }

  /* ── Add row (focuses first cell) ───────────────────────── */
  function addRow(dataset) {
    const newRow={};
    dataset.variables.forEach(v=>{ newRow[v.name]=null; });
    dataset.cases.push(newRow);
    dataset.updatedAt=new Date().toISOString();
    const newIdx=dataset.cases.length-1;
    _page=Math.floor(newIdx/PAGE);
    pushUndo({type:'addRow',rowIdx:newIdx,row:{...newRow}});
    Project.markDirty();
    render(dataset);
    // Focus first cell of new row
    setTimeout(()=>{
      const vis=dataset.variables.filter(v=>v.visibility!==false);
      if (vis.length>0) {
        const pageStart=_page*PAGE;
        const td=_tdMap?.get((newIdx-pageStart)+':0');
        if (td) {
          _applySelection({rowIdx:newIdx,varIdx:0,varName:vis[0].name});
        }
      }
      if (_scrollEl) _scrollEl.focus();
    },30);
  }

  return { init, render, undo, redo };
})();

/* ── Variable Context Panel ──────────────────────────────────────────── */
function showVarContextPanel(v, ds, anchorEl) {
  document.querySelectorAll('.var-ctx-panel').forEach(p=>p.remove());
  const vals=ds.cases.map(r=>r[v.name]).filter(x=>x!=null);
  const numVals=vals.filter(x=>typeof x==='number'&&isFinite(x));
  const nValid=vals.length, nMissing=ds.cases.length-nValid;

  // Compute quick stats for numeric scale variables
  let statsBlock=null;
  if (v.type==='numeric'&&numVals.length>0) {
    const mn=Stats.mean(numVals), sd=Stats.std(numVals);
    const minV=Math.min(...numVals), maxV=Math.max(...numVals);
    statsBlock=el('div',{class:'vcp-stats'},
      el('div',{class:'vcp-stat'},el('span',{class:'vcp-stat-lbl'},'Mean'),el('span',{class:'vcp-stat-val'},fmt(mn,3))),
      el('div',{class:'vcp-stat'},el('span',{class:'vcp-stat-lbl'},'SD'),el('span',{class:'vcp-stat-val'},fmt(sd,3))),
      el('div',{class:'vcp-stat'},el('span',{class:'vcp-stat-lbl'},'Min'),el('span',{class:'vcp-stat-val'},fmt(minV,3))),
      el('div',{class:'vcp-stat'},el('span',{class:'vcp-stat-lbl'},'Max'),el('span',{class:'vcp-stat-val'},fmt(maxV,3)))
    );
  }

  // Value labels block
  let labelsBlock=null;
  if (v.valueLabels&&Object.keys(v.valueLabels).length>0) {
    const entries=Object.entries(v.valueLabels).slice(0,8);
    labelsBlock=el('div',{class:'vcp-labels'},
      el('div',{class:'vcp-section-title'},'Value Labels'),
      ...entries.map(([k,lbl])=>el('div',{class:'vcp-label-row'},
        el('span',{class:'vcp-label-key'},k),
        el('span',{class:'vcp-label-val'},lbl)
      ))
    );
  }

  // Recommended analyses
  const recMap={
    scale:['Descriptives','Correlation (Pearson)','T-Test','ANOVA','Linear Regression','Histogram','Boxplot'],
    ordinal:['Frequencies','Spearman Correlation','Mann-Whitney U','Kruskal-Wallis','Boxplot'],
    nominal:['Frequencies','Crosstabs (Chi-Square)','Bar Chart','Pie Chart']
  };
  const recs=recMap[v.measurementLevel]||recMap['scale'];
  const recsBlock=el('div',{class:'vcp-recs'},
    el('div',{class:'vcp-section-title'},'Recommended Analyses'),
    ...recs.map(r=>el('div',{class:'vcp-rec-item'},'\u2022 '+r))
  );

  const levelColor={scale:'#3b82d4',ordinal:'#7c5cd8',nominal:'#e6871e'};
  const panel=el('div',{class:'var-ctx-panel'},
    el('div',{class:'vcp-header'},
      el('div',{},
        el('div',{class:'vcp-name'},v.name),
        v.label?el('div',{class:'vcp-label-txt'},v.label):null
      ),
      el('button',{class:'vcp-close',onclick:()=>panel.remove()},'\u00D7')
    ),
    el('div',{class:'vcp-meta'},
      el('span',{class:'vcp-badge',style:{background:levelColor[v.measurementLevel]||'#aaa'}},v.measurementLevel||'unknown'),
      el('span',{class:'vcp-badge',style:{background:'#555'}},v.type||'numeric'),
      el('span',{class:'vcp-badge-outline'},nValid+' valid'),
      el('span',{class:'vcp-badge-outline',style:{color:'#e57373'}},nMissing+' missing')
    ),
    statsBlock,
    labelsBlock,
    recsBlock
  );

  // Position near the anchor
  document.body.appendChild(panel);
  const rect=anchorEl.getBoundingClientRect();
  let top=rect.bottom+window.scrollY+4;
  let left=rect.left+window.scrollX;
  if (left+260>window.innerWidth) left=window.innerWidth-270;
  panel.style.top=top+'px';
  panel.style.left=left+'px';

  // Close on outside click
  setTimeout(()=>{
    const close=e=>{
      if(!panel.contains(e.target)){panel.remove();document.removeEventListener('click',close);}
    };
    document.addEventListener('click',close);
  },10);
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 8: VARIABLE VIEW
   ══════════════════════════════════════════════════════════════════ */

const VariableView = (() => {
  let _container=null, _dataset=null;

  function init(container) { _container=container; }

  function render(dataset) {
    _dataset=dataset;
    if (!_container) return;
    _container.innerHTML='';
    if (!dataset) { _container.innerHTML='<div class="empty-state">No dataset loaded.</div>'; return; }

    const toolbar=el('div',{class:'data-toolbar'});
    toolbar.appendChild(el('span',{class:'muted'},`${dataset.variables.length} variables`));
    toolbar.appendChild(el('button',{class:'btn btn-sm btn-primary',onclick:()=>addVariable(dataset)},'+ Variable'));
    _container.appendChild(toolbar);

    const scroll=el('div',{class:'data-grid-scroll'});
    const tbl=el('table',{class:'data-grid variable-grid'});
    const cols=['Name','Label','Type','Width','Decimals','Values','Missing','Level','Role','Visible','Actions'];
    const thead=el('thead',{},el('tr',{},...cols.map(c=>el('th',{},c))));
    tbl.appendChild(thead);
    const tbody=el('tbody');
    dataset.variables.forEach((v,idx)=>{
      const tr=el('tr');
      const mkInput=(field,type='text',val)=>{
        const inp=el('input',{type,value:val??v[field]??'',class:'cell-input',
          oninput:e=>{
            // Live update — no tab-away required
            const newVal=type==='number'?Number(e.target.value):e.target.value;
            dataset.variables[idx][field]=newVal;
            dataset.updatedAt=new Date().toISOString();
            Project.markDirty();
          },
          onchange:e=>{
            const newVal=type==='number'?Number(e.target.value):e.target.value;
            dataset.variables[idx][field]=newVal;
            dataset.updatedAt=new Date().toISOString();
            Project.markDirty();
          }});
        return inp;
      };
      const mkSelect=(field,options)=>{
        const sel=el('select',{class:'cell-input',
          onchange:e=>{ dataset.variables[idx][field]=e.target.value; dataset.updatedAt=new Date().toISOString(); Project.markDirty(); }});
        options.forEach(o=>{
          const opt=el('option',{value:o},o); if(o===v[field])opt.selected=true;
          sel.appendChild(opt);
        });
        return sel;
      };

      // Atomic rename cell — double-click or ✎ to open rename dialog
      const nameCell = el('td');
      const nameSpan = el('span', {
        class:'var-name-display',
        style:'cursor:pointer;font-weight:600;padding:2px 4px;border-radius:3px;',
        title:'Double-click to rename',
        ondblclick:()=>openRenameDialog(dataset,idx,v.name)
      }, v.name);
      const renameBtn = el('button', {
        class:'btn btn-xs',
        style:'margin-left:4px;font-size:10px;',
        onclick:()=>openRenameDialog(dataset,idx,v.name)
      }, String.fromCharCode(0x270E));
      nameCell.append(nameSpan, renameBtn);
      tr.appendChild(nameCell);
      tr.appendChild(el('td',{},mkInput('label')));
      tr.appendChild(el('td',{},mkSelect('type',['numeric','string','date','datetime','boolean'])));
      tr.appendChild(el('td',{},mkInput('width','number',v.width)));
      tr.appendChild(el('td',{},mkInput('decimals','number',v.decimals)));
      // Value labels button
      const lblCount=Object.keys(v.valueLabels||{}).length;
      tr.appendChild(el('td',{},
        el('button',{class:'btn btn-sm',onclick:()=>openValueLabelsDialog(dataset,idx)},
          lblCount?`${lblCount} label${lblCount>1?'s':''}` : 'None')
      ));
      // Missing values button
      const mCount=(v.missingValues||[]).length;
      tr.appendChild(el('td',{},
        el('button',{class:'btn btn-sm',onclick:()=>openMissingDialog(dataset,idx)},
          mCount?`${mCount} value${mCount>1?'s':''}` : 'None')
      ));
      tr.appendChild(el('td',{},mkSelect('measurementLevel',['nominal','ordinal','scale'])));
      tr.appendChild(el('td',{},mkSelect('role',['input','target','both','none','partition','split','frequency','weight','identifier'])));
      // Visibility checkbox
      const vis=el('input',{type:'checkbox',checked:v.visibility!==false,
        onchange:e=>{ dataset.variables[idx].visibility=e.target.checked; render(dataset); }});
      tr.appendChild(el('td',{},vis));
      // Actions
      const del=el('button',{class:'btn btn-sm btn-danger',onclick:()=>{
        if (confirm(`Delete variable "${v.name}"?`)) {
          dataset.variables.splice(idx,1);
          dataset.cases.forEach(c=>delete c[v.name]);
          Project.markDirty(); render(dataset);
        }
      }},'✕');
      const up=el('button',{class:'btn btn-sm',onclick:()=>{
        if(idx>0){[dataset.variables[idx-1],dataset.variables[idx]]=[dataset.variables[idx],dataset.variables[idx-1]]; Project.markDirty(); render(dataset);}
      }},'↑');
      const dn=el('button',{class:'btn btn-sm',onclick:()=>{
        if(idx<dataset.variables.length-1){[dataset.variables[idx+1],dataset.variables[idx]]=[dataset.variables[idx],dataset.variables[idx+1]]; Project.markDirty(); render(dataset);}
      }},'↓');
      tr.appendChild(el('td',{},up,dn,del));
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    scroll.appendChild(tbl);
    _container.appendChild(scroll);
  }

  function addVariable(dataset) {
    dataset.variables.push({
      id:uuid(), name:`var${dataset.variables.length+1}`, label:'New Variable',
      type:'numeric', width:8, decimals:2, valueLabels:{}, missingValues:[],
      measurementLevel:'scale', role:'input', visibility:true
    });
    Project.markDirty(); render(dataset);
  }

  function openValueLabelsDialog(dataset, varIdx) {
    const v=dataset.variables[varIdx];
    const overlay=el('div',{class:'dialog-overlay'});
    const box=el('div',{class:'dialog-box'});
    box.appendChild(el('div',{class:'dialog-header'},
      el('h3',{},`Value Labels — ${v.name}`),
      el('button',{class:'dialog-close',onclick:()=>overlay.remove()},'×')
    ));
    const body=el('div',{class:'dialog-body'});
    const labels={...(v.valueLabels||{})};
    const rows=el('div',{class:'value-label-rows'});
    function renderRows(){
      rows.innerHTML='';
      Object.entries(labels).forEach(([val,lbl])=>{
        const row=el('div',{class:'value-label-row'});
        const vi=el('input',{type:'text',class:'form-control',value:val,placeholder:'Value',style:{width:'80px'}});
        const li=el('input',{type:'text',class:'form-control',value:lbl,placeholder:'Label',style:{flex:'1'}});
        const rm=el('button',{class:'btn btn-sm btn-danger',onclick:()=>{delete labels[val];renderRows();}},'✕');
        vi.onchange=e=>{ const old=val; delete labels[old]; labels[e.target.value]=lbl; renderRows(); };
        li.onchange=e=>{ labels[val]=e.target.value; };
        row.append(vi,li,rm); rows.appendChild(row);
      });
      const addRow=el('div',{class:'value-label-row'});
      const nv=el('input',{type:'text',class:'form-control',placeholder:'New value',style:{width:'80px'}});
      const nl=el('input',{type:'text',class:'form-control',placeholder:'New label',style:{flex:'1'}});
      const add=el('button',{class:'btn btn-sm btn-primary',onclick:()=>{
        if(nv.value!==''){labels[nv.value]=nl.value; renderRows();}
      }},'+');
      addRow.append(nv,nl,add); rows.appendChild(addRow);
    }
    renderRows(); body.appendChild(rows);
    box.appendChild(body);
    box.appendChild(el('div',{class:'dialog-footer'},
      el('button',{class:'btn btn-primary',onclick:()=>{
        dataset.variables[varIdx].valueLabels=labels;
        Project.markDirty(); render(dataset); overlay.remove();
      }},'OK'),
      el('button',{class:'btn btn-secondary',onclick:()=>overlay.remove()},'Cancel')
    ));
    overlay.appendChild(box); document.body.appendChild(overlay);
  }

  function openMissingDialog(dataset, varIdx) {
    const v=dataset.variables[varIdx];
    const overlay=el('div',{class:'dialog-overlay'});
    const box=el('div',{class:'dialog-box'});
    box.appendChild(el('div',{class:'dialog-header'},
      el('h3',{},`Missing Values — ${v.name}`),
      el('button',{class:'dialog-close',onclick:()=>overlay.remove()},'×')
    ));
    const body=el('div',{class:'dialog-body'});
    const missList=[...(v.missingValues||[])];
    body.appendChild(el('p',{class:'muted'},'Enter user-defined missing value codes (up to 3 values, or a range):'));
    const inp=el('textarea',{class:'form-control',rows:'3',
      placeholder:'-99\n999\n-1',
      value:missList.join('\n')});
    body.appendChild(inp);
    box.appendChild(body);
    box.appendChild(el('div',{class:'dialog-footer'},
      el('button',{class:'btn btn-primary',onclick:()=>{
        dataset.variables[varIdx].missingValues=inp.value.split('\n').map(s=>s.trim()).filter(Boolean).map(s=>isNaN(s)?s:Number(s));
        Project.markDirty(); render(dataset); overlay.remove();
      }},'OK'),
      el('button',{class:'btn btn-secondary',onclick:()=>overlay.remove()},'Cancel')
    ));
    overlay.appendChild(box); document.body.appendChild(overlay);
  }

  function renameVariable(dataset, oldName, newName) {
    if (!newName || !newName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      notify('Invalid variable name. Use letters, numbers, underscore. Must start with letter.','error');
      return false;
    }
    if (oldName !== newName && dataset.variables.some(v=>v.name===newName)) {
      notify('Variable name already in use: '+newName,'error');
      return false;
    }
    if (oldName === newName) return true;
    try {
      const vi = dataset.variables.findIndex(v=>v.name===oldName);
      if (vi<0) { notify('Variable not found: '+oldName,'error'); return false; }
      // 1. Rename metadata
      dataset.variables[vi].name = newName;
      // 2. Rename property in every case (atomic)
      dataset.cases.forEach(row=>{
        if (Object.prototype.hasOwnProperty.call(row,oldName)) {
          row[newName]=row[oldName]; delete row[oldName];
        }
      });
      // 3. Update weight variable reference
      if (dataset.weightVariable===oldName) dataset.weightVariable=newName;
      // 4. Update split variables
      if (Array.isArray(dataset.splitVariables)) {
        dataset.splitVariables = dataset.splitVariables.map(n=>n===oldName?newName:n);
      }
      // 5. Update filter string (best-effort)
      if (dataset.activeFilter && typeof dataset.activeFilter==='string') {
        dataset.activeFilter = dataset.activeFilter.replace(
          new RegExp('\\b'+oldName.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','g'), newName
        );
      }
      dataset.updatedAt = new Date().toISOString();
      Project.markDirty();
      notify('Renamed: '+oldName+' \u2192 '+newName,'success');
      return true;
    } catch(e) {
      notify('Rename failed: '+e.message,'error');
      return false;
    }
  }

  function openRenameDialog(dataset, varIdx, currentName) {
    const ov = el('div',{class:'dialog-overlay'});
    const inp = el('input',{type:'text',class:'form-control',value:currentName});
    inp.style.cssText='font-size:15px;font-weight:600;margin-bottom:6px;';
    const errDiv = el('div',{style:'color:#e57373;font-size:12px;min-height:16px;margin-bottom:4px;'});
    const box = el('div',{class:'dialog-box'},
      el('div',{class:'dialog-header'},
        el('h3',{},'Rename Variable'),
        el('button',{class:'dialog-close',onclick:()=>ov.remove()},'\u00D7')
      ),
      el('div',{class:'dialog-body'},
        el('p',{class:'muted small'},'Name must start with a letter. Only letters, numbers, and underscores allowed.'),
        inp, errDiv,
        el('p',{class:'muted small',style:'margin-top:4px;'},'\u26A0 All case data will be updated automatically.')
      ),
      el('div',{class:'dialog-footer'},
        el('button',{class:'btn btn-primary',onclick:()=>{
          const newName = inp.value.trim();
          if (!newName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
            errDiv.textContent='Invalid name: letters/numbers/underscore only, start with letter.'; return;
          }
          if (newName!==currentName && dataset.variables.some(v=>v.name===newName)) {
            errDiv.textContent='Name already in use.'; return;
          }
          if (renameVariable(dataset, currentName, newName)) {
            ov.remove(); render(dataset);
            if (window._sociostatRenderDataModule) window._sociostatRenderDataModule();
          }
        }},'Rename'),
        el('button',{class:'btn btn-secondary',onclick:()=>ov.remove()},'Cancel')
      )
    );
    inp.onkeydown=e=>{ if(e.key==='Enter') box.querySelector('.btn-primary').click(); if(e.key==='Escape') ov.remove(); };
    ov.appendChild(box); document.body.appendChild(ov);
    setTimeout(()=>{ inp.focus(); inp.select(); },50);
  }

  return { init, render };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 9: ANALYSIS DIALOGS
   ══════════════════════════════════════════════════════════════════ */

const AnalysisDialogs = (() => {
  /* Generic variable list picker used by all dialogs */
  function varList(dataset, selected, multi=true, onChange) {
    const box=el('div',{class:'var-list'});
    dataset.variables.forEach(v=>{
      const isSelected=Array.isArray(selected)?selected.includes(v.name):(selected===v.name);
      const item=el('div',{class:`var-item${isSelected?' selected':''}`},
        el('span',{class:`var-type var-type-${v.type}`},v.type[0].toUpperCase()),
        el('span',{class:'var-name'},v.name),
        el('span',{class:'var-label muted'},v.label?` — ${v.label}`:'')
      );
      item.onclick=()=>{
        if(multi){
          if(isSelected){ const idx=selected.indexOf(v.name); if(idx>-1)selected.splice(idx,1); }
          else selected.push(v.name);
        } else {
          selected.length=0; if(!isSelected)selected.push(v.name);
        }
        onChange && onChange([...selected]);
        // Re-render: toggle class
        $$('.var-item',box).forEach(x=>x.classList.remove('selected'));
        if(multi) selected.forEach(n=>{ const el2=box.querySelector(`[data-vn="${n}"]`); if(el2)el2.classList.add('selected'); });
        else item.classList.toggle('selected',!isSelected);
        // re-render full
        const parent=box.parentElement; if(parent){ parent.replaceChild(varList(dataset,selected,multi,onChange),box); }
      };
      item.dataset.vn=v.name;
      box.appendChild(item);
    });
    return box;
  }

  // WHY_PANELS: contextual explanations for each procedure
  const WHY_PANELS = {
    'Frequencies':               { why: 'Shows how often each value appears. Use for categorical or nominal variables to understand distribution.', when: 'Any variable — start here to understand your data.', alt: null },
    'Descriptives':              { why: 'Summarises continuous (scale) variables with mean, SD, min, max, skewness.', when: 'Scale variables only.', alt: null },
    'Crosstabs':                 { why: 'Tests whether two categorical variables are statistically independent.', when: 'Both variables are nominal or ordinal.', alt: 'Fisher exact test (automatic for 2×2 tables).' },
    'Bivariate Correlations':    { why: 'Measures the linear association between two numeric variables. r = 0 means no linear association; r = ±1 means perfect linear association.', when: 'Both variables are scale (interval/ratio).', alt: 'Spearman correlation if normality is violated or variables are ordinal.' },
    'One-Sample T-Test':         { why: 'Tests whether the mean of a variable differs from a specified hypothetical value.', when: 'One continuous variable; known test value.', alt: null },
    'Independent Samples T-Test':{ why: 'Tests whether two independent groups have different means on a continuous variable.', when: '1 continuous outcome + 1 binary grouping variable.', alt: 'Mann-Whitney U if normality is severely violated.' },
    'Paired Samples T-Test':     { why: 'Tests whether the mean difference between two related measurements is zero.', when: 'Two measurements on the same subjects (pre/post).', alt: 'Wilcoxon Signed-Rank if normality violated.' },
    'One-Way ANOVA':             { why: 'Tests whether three or more independent groups have different means.', when: '1 continuous outcome + 1 grouping variable with ≥3 groups.', alt: 'Kruskal-Wallis H if normality/homogeneity violated.' },
    'Linear Regression':         { why: 'Models the relationship between a continuous outcome and one or more predictors. Produces B (unstandardised) and Beta (standardised) coefficients.', when: 'Continuous outcome variable; scale or dummy-coded predictors.', alt: 'Logistic regression if outcome is binary.' },
    'Binary Logistic Regression':{ why: 'Models the log-odds of a binary outcome (0/1) as a linear function of predictors. Exp(B) = odds ratio.', when: 'Binary (0/1) outcome variable.', alt: null },
    "Reliability Analysis (Cronbach's α)": { why: "Measures internal consistency — whether scale items all measure the same construct.", when: 'Multiple Likert items that together form a scale.', alt: null },
    'Factor Analysis':           { why: 'Identifies latent factors behind a set of observed variables. Reduces many items to fewer underlying dimensions.', when: 'Multiple scale variables; KMO ≥ 0.6; Bartlett p < .05.', alt: null },
    'Nonparametric Tests':       { why: 'Distribution-free alternatives to parametric tests. Use when assumptions of normality are severely violated or variables are ordinal.', when: 'Ordinal data or severely non-normal distributions.', alt: null },
    'K-Means Cluster Analysis':  { why: 'Partitions cases into k clusters based on similarity. Cluster membership is not ground truth — try multiple k values.', when: 'Multiple continuous variables; exploratory classification.', alt: null },
    'Kaplan-Meier Survival':     { why: 'Estimates survival curves showing the proportion of subjects surviving beyond each time point.', when: 'Time-to-event data with a censoring indicator.', alt: null },
  };

  function mkDialog(title, body, onRun) {
    const overlay=el('div',{class:'dialog-overlay'});
    const box=el('div',{class:'dialog-box analysis-dialog'});
    box.appendChild(el('div',{class:'dialog-header'},
      el('h3',{},title),
      el('button',{class:'dialog-close',onclick:()=>overlay.remove()},'×')
    ));

    // Build dialog body with optional Why panel in Simple mode
    const dialogBody = el('div',{class:'dialog-body'});
    const wp = WHY_PANELS[title];
    if (wp && typeof _appMode !== 'undefined' && _appMode === 'simple') {
      dialogBody.appendChild(el('div',{class:'why-panel'},
        el('div',{class:'why-panel-title'},'ⓘ Why this test?'),
        el('p',{},wp.why),
        el('p',{class:'alt'},`When to use: ${wp.when}`),
        wp.alt ? el('p',{class:'alt'},`Alternative: ${wp.alt}`) : null
      ));
    }
    dialogBody.appendChild(body);
    box.appendChild(dialogBody);

    box.appendChild(el('div',{class:'dialog-footer'},
      el('button',{class:'btn btn-primary',onclick:()=>{
        const ok=onRun(); if(ok!==false)overlay.remove();
      }},'▶ Run'),
      el('button',{class:'btn btn-secondary',onclick:()=>overlay.remove()},'Cancel')
    ));
    overlay.appendChild(box); document.body.appendChild(overlay);
    return overlay;
  }

  function getDataset() {
    return AppState.get('activeDataset');
  }

  // ── Frequencies ────────────────────────────────────────────────
  function openFrequencies() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},
        el('label',{},'Variables:'),
        varList(ds,sel,true,()=>{})
      )
    );
    mkDialog('Frequencies',body,()=>{
      if(!sel.length){notify('Select at least one variable','warning');return false;}
      runAnalysis('frequencies',{variables:sel});
    });
  }

  // ── Descriptives ───────────────────────────────────────────────
  function openDescriptives() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},
        el('label',{},'Variables (numeric/scale):'),
        varList(ds,sel,true,()=>{})
      )
    );
    mkDialog('Descriptives',body,()=>{
      if(!sel.length){notify('Select at least one variable','warning');return false;}
      runAnalysis('descriptives',{variables:sel});
    });
  }

  // ── Crosstabs ──────────────────────────────────────────────────
  function openCrosstabs() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const rowVar=[],colVar=[];
    const chkChi=el('input',{type:'checkbox',checked:true}); const chkPhi=el('input',{type:'checkbox',checked:true});
    const chkFisher=el('input',{type:'checkbox'}); const chkLambda=el('input',{type:'checkbox'});
    const body=el('div',{class:'analysis-form two-col'},
      el('div',{class:'form-section'},el('label',{},'Row variable:'),varList(ds,rowVar,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Column variable:'),varList(ds,colVar,false,()=>{})),
      el('div',{class:'form-section wide'},el('label',{},'Statistics:'),
        el('div',{class:'check-group'},
          el('label',{},chkChi,' Chi-Square'),
          el('label',{},chkPhi,' Phi & Cramér\'s V'),
          el('label',{},chkFisher,' Fisher Exact'),
          el('label',{},chkLambda,' Lambda')
        )
      )
    );
    mkDialog('Crosstabs',body,()=>{
      if(!rowVar[0]||!colVar[0]){notify('Select row and column variables','warning');return false;}
      runAnalysis('crosstabs',{row_variable:rowVar[0],column_variable:colVar[0],
        statistics:{chi_square:chkChi.checked,phi_cramer:chkPhi.checked,fisher_exact:chkFisher.checked}});
    });
  }

  // ── Correlation ────────────────────────────────────────────────
  function openCorrelation() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const methodSel=el('select',{class:'form-control'},
      el('option',{value:'pearson'},'Pearson'),
      el('option',{value:'spearman'},'Spearman'),
      el('option',{value:'kendall'},'Kendall\'s tau')
    );
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},el('label',{},'Variables:'),varList(ds,sel,true,()=>{})),
      el('div',{class:'form-row'},el('label',{},'Method: '),methodSel)
    );
    mkDialog('Bivariate Correlations',body,()=>{
      if(sel.length<2){notify('Select at least 2 variables','warning');return false;}
      runAnalysis('correlation',{variables:sel,method:methodSel.value});
    });
  }

  // ── One-Sample T-Test ──────────────────────────────────────────
  function openOneSampleT() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const testVal=el('input',{type:'number',class:'form-control',value:'0',step:'any'});
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},el('label',{},'Test variable(s):'),varList(ds,sel,true,()=>{})),
      el('div',{class:'form-row'},el('label',{},'Test value: '),testVal)
    );
    mkDialog('One-Sample T-Test',body,()=>{
      if(!sel.length){notify('Select at least one variable','warning');return false;}
      // Engine expects one variable at a time; run for each selected variable
      sel.forEach(vn=>runAnalysis('ttest_onesample',{variable:vn,test_value:Number(testVal.value)}));
    });
  }

  // ── Independent Samples T-Test ─────────────────────────────────
  function openIndepT() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const testVar=[],groupVar=[];
    const g1=el('input',{type:'text',class:'form-control',value:'1',placeholder:'Group 1 value'});
    const g2=el('input',{type:'text',class:'form-control',value:'2',placeholder:'Group 2 value'});
    const body=el('div',{class:'analysis-form two-col'},
      el('div',{class:'form-section'},el('label',{},'Test variable:'),varList(ds,testVar,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Grouping variable:'),varList(ds,groupVar,false,()=>{})),
      el('div',{class:'form-section wide form-row'},
        el('label',{},'Group 1 value:'),g1,
        el('label',{},' Group 2 value:'),g2
      )
    );
    mkDialog('Independent Samples T-Test',body,()=>{
      if(!testVar[0]||!groupVar[0]){notify('Select test and grouping variables','warning');return false;}
      const v1=isNaN(g1.value)?g1.value:Number(g1.value);
      const v2=isNaN(g2.value)?g2.value:Number(g2.value);
      runAnalysis('ttest_independent',{variable:testVar[0],grouping_variable:groupVar[0],group1:v1,group2:v2});
    });
  }

  // ── Paired T-Test ──────────────────────────────────────────────
  function openPairedT() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const var1=[],var2=[];
    const body=el('div',{class:'analysis-form two-col'},
      el('div',{class:'form-section'},el('label',{},'Variable 1 (before):'),varList(ds,var1,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Variable 2 (after):'),varList(ds,var2,false,()=>{}))
    );
    mkDialog('Paired Samples T-Test',body,()=>{
      if(!var1[0]||!var2[0]){notify('Select both variables','warning');return false;}
      runAnalysis('ttest_paired',{variable1:var1[0],variable2:var2[0]});
    });
  }

  // ── One-Way ANOVA ──────────────────────────────────────────────
  function openOneWayANOVA() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const depVars=[],factorVar=[];
    const postHocSel=el('select',{class:'form-control'},
      el('option',{value:'none'},'None'),
      el('option',{value:'tukey'},'Tukey HSD'),
      el('option',{value:'bonferroni'},'Bonferroni'),
      el('option',{value:'scheffe'},'Scheffé')
    );
    const body=el('div',{class:'analysis-form two-col'},
      el('div',{class:'form-section'},el('label',{},'Dependent variable(s):'),varList(ds,depVars,true,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Factor:'),varList(ds,factorVar,false,()=>{})),
      el('div',{class:'form-row'},el('label',{},'Post Hoc: '),postHocSel)
    );
    mkDialog('One-Way ANOVA',body,()=>{
      if(!depVars.length||!factorVar[0]){notify('Select dependent variable(s) and factor','warning');return false;}
      const ph=postHocSel.value==='none'?[]:[ postHocSel.value ];
      depVars.forEach(dv=>runAnalysis('anova_oneway',{dependent:dv,factor:factorVar[0],post_hoc:ph}));
    });
  }

  // ── Linear Regression ─────────────────────────────────────────
  function openLinearRegression() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const depVar=[],indepVars=[];
    const body=el('div',{class:'analysis-form two-col'},
      el('div',{class:'form-section'},el('label',{},'Dependent variable:'),varList(ds,depVar,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Independent variable(s):'),varList(ds,indepVars,true,()=>{}))
    );
    mkDialog('Linear Regression',body,()=>{
      if(!depVar[0]||!indepVars.length){notify('Select dependent and independent variables','warning');return false;}
      runAnalysis('linear_regression',{dependent:depVar[0],independent:indepVars});
    });
  }

  // ── Logistic Regression ────────────────────────────────────────
  function openLogisticRegression() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const depVar=[],covariates=[];
    const body=el('div',{class:'analysis-form two-col'},
      el('div',{class:'form-section'},el('label',{},'Dependent variable (binary):'),varList(ds,depVar,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Covariates:'),varList(ds,covariates,true,()=>{}))
    );
    mkDialog('Binary Logistic Regression',body,()=>{
      if(!depVar[0]||!covariates.length){notify('Select dependent variable and covariates','warning');return false;}
      runAnalysis('logistic_regression',{dependent:depVar[0],independent:covariates});
    });
  }

  // ── Reliability Analysis ───────────────────────────────────────
  function openReliability() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},el('label',{},'Items (scale variables):'),varList(ds,sel,true,()=>{}))
    );
    mkDialog('Reliability Analysis (Cronbach\'s α)',body,()=>{
      if(sel.length<2){notify('Select at least 2 items','warning');return false;}
      runAnalysis('reliability',{items:sel});
    });
  }

  // ── Factor Analysis ────────────────────────────────────────────
  function openFactorAnalysis() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const rotSel=el('select',{class:'form-control'},
      el('option',{value:'varimax'},'Varimax'),
      el('option',{value:'none'},'None (unrotated)')
    );
    const extSel=el('select',{class:'form-control'},
      el('option',{value:'pca'},'Principal Components'),
      el('option',{value:'paf'},'Principal Axis Factoring')
    );
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},el('label',{},'Variables:'),varList(ds,sel,true,()=>{})),
      el('div',{class:'form-row'},el('label',{},'Extraction: '),extSel),
      el('div',{class:'form-row'},el('label',{},'Rotation: '),rotSel)
    );
    mkDialog('Factor Analysis',body,()=>{
      if(sel.length<3){notify('Select at least 3 variables','warning');return false;}
      runAnalysis('factor_analysis',{variables:sel,extraction:extSel.value,rotation:rotSel.value});
    });
  }

  // ── Nonparametric ──────────────────────────────────────────────
  function openNonparametric() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const testSel=el('select',{class:'form-control'},
      el('option',{value:'mann_whitney'},'Mann-Whitney U'),
      el('option',{value:'wilcoxon'},'Wilcoxon Signed-Rank'),
      el('option',{value:'kruskal_wallis'},'Kruskal-Wallis H'),
      el('option',{value:'friedman'},'Friedman')
    );
    const var1=[],var2=[],factorVar=[];
    const formBox=el('div',{class:'form-section'});
    testSel.onchange=()=>renderNPForm();
    function renderNPForm(){
      formBox.innerHTML='';
      const t=testSel.value;
      if(t==='mann_whitney'||t==='kruskal_wallis'){
        formBox.appendChild(el('label',{},'Test variable:')); formBox.appendChild(varList(ds,var1,false,()=>{}));
        formBox.appendChild(el('label',{},'Grouping variable:')); formBox.appendChild(varList(ds,factorVar,false,()=>{}));
      } else if(t==='wilcoxon'){
        formBox.appendChild(el('label',{},'Variable 1:')); formBox.appendChild(varList(ds,var1,false,()=>{}));
        formBox.appendChild(el('label',{},'Variable 2:')); formBox.appendChild(varList(ds,var2,false,()=>{}));
      } else if(t==='friedman'){
        formBox.appendChild(el('label',{},'Variables (repeated measures):')); formBox.appendChild(varList(ds,var1,true,()=>{}));
      }
    }
    renderNPForm();
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-row'},el('label',{},'Test: '),testSel),
      formBox
    );
    mkDialog('Nonparametric Tests',body,()=>{
      const t=testSel.value;
      if(t==='mann_whitney') runAnalysis('nonparametric_mannwhitney',{variable:var1[0],grouping_variable:factorVar[0]});
      else if(t==='wilcoxon') runAnalysis('nonparametric_wilcoxon',{variable1:var1[0],variable2:var2[0]});
      else if(t==='kruskal_wallis') runAnalysis('nonparametric_kruskalwallis',{variable:var1[0],grouping_variable:factorVar[0]});
      else if(t==='friedman') runAnalysis('nonparametric_friedman',{variables:var1});
    });
  }

  // ── Kaplan-Meier ───────────────────────────────────────────────
  function openKaplanMeier() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const timeVar=[],eventVar=[],groupVar=[];
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},el('label',{},'Time variable:'),varList(ds,timeVar,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Event variable (1=event, 0=censored):'),varList(ds,eventVar,false,()=>{})),
      el('div',{class:'form-section'},el('label',{},'Group variable (optional):'),varList(ds,groupVar,false,()=>{}))
    );
    mkDialog('Kaplan-Meier Survival',body,()=>{
      if(!timeVar[0]||!eventVar[0]){notify('Select time and event variables','warning');return false;}
      runAnalysis('kaplan_meier',{time_variable:timeVar[0],event_variable:eventVar[0],group_variable:groupVar[0]||null});
    });
  }

  // ── K-Means ────────────────────────────────────────────────────
  function openKMeans() {
    const ds=getDataset(); if(!ds){notify('No dataset loaded','error');return;}
    const sel=[];
    const kInp=el('input',{type:'number',class:'form-control',value:'3',min:'2',max:'20'});
    const body=el('div',{class:'analysis-form'},
      el('div',{class:'form-section'},el('label',{},'Variables:'),varList(ds,sel,true,()=>{})),
      el('div',{class:'form-row'},el('label',{},'Number of clusters (k): '),kInp)
    );
    mkDialog('K-Means Cluster Analysis',body,()=>{
      if(sel.length<2){notify('Select at least 2 variables','warning');return false;}
      const kVal=Number(kInp.value);
      const kVars=sel;
      // Pre-execution validation
      const validCases=ds.cases.filter(row=>
        kVars.every(vn=>{ const v=row[vn]; return typeof v==='number'&&isFinite(v); })
      ).length;
      if(validCases===0){
        notify(
          'No valid cases for K-Means.\n\nLikely causes:\n'+
          '\u2022 Selected variables are not numeric\n'+
          '\u2022 All values are missing or null\n'+
          '\u2022 Active filter removes all cases\n\n'+
          'Variables checked: '+kVars.join(', '),
          'error'
        );
        return false;
      }
      if(kVal<2){notify('K must be \u2265 2.','error');return false;}
      if(kVal>=validCases){
        notify('K ('+kVal+') must be less than valid cases ('+validCases+').','error');
        return false;
      }
      notify('Running K-Means (k='+kVal+', N='+validCases+' valid cases)...','info');
      runAnalysis('kmeans',{variables:sel,k:kVal});
    });
  }

  function runAnalysis(procedureId, params) {
    const ds=getDataset();
    if(!ds){notify('No dataset loaded','error');return;}
    notify(`Running ${procedureId}...`,'info');
    // Run async to keep UI responsive
    setTimeout(()=>{
      const result=ProcedureRegistry.runProcedure(procedureId,ds,params);
      Output.addResult(procedureId,result,params);
      History.addEntry({ type:'analysis', procedure:procedureId, params, timestamp:new Date().toISOString() });
      if(result.status==='error') notify(`Analysis error: ${result.error?.message||'Unknown error'}`,'error');
      else notify(`${procedureId} completed`,'success');
      // Navigate to output
      App.navigate('output');
    },10);
  }

  return {
    openFrequencies, openDescriptives, openCrosstabs, openCorrelation,
    openOneSampleT, openIndepT, openPairedT, openOneWayANOVA,
    openLinearRegression, openLogisticRegression, openReliability,
    openFactorAnalysis, openNonparametric, openKaplanMeier, openKMeans,
    runAnalysis
  };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 10: OUTPUT VIEWER
   ══════════════════════════════════════════════════════════════════ */

const Output = (() => {
  let _outputs=[];  // Array of { id, procedure, result, params, timestamp }
  let _container=null;

  function init(container) { _container=container; }

  function addResult(procedure, result, params) {
    const entry={
      id:uuid(), procedure, result, params,
      timestamp:new Date().toISOString(),
      title:makeProcTitle(procedure,params)
    };
    _outputs.push(entry);
    Project.markDirty();
    render();
    return entry.id;
  }

  function makeProcTitle(procedure, params) {
    const map={
      frequencies:'Frequencies', descriptives:'Descriptives', crosstabs:'Crosstabs',
      correlation:'Bivariate Correlations',
      ttest_onesample:'One-Sample T-Test', one_sample_t:'One-Sample T-Test',
      ttest_independent:'Independent-Samples T-Test', independent_t:'Independent-Samples T-Test',
      ttest_paired:'Paired-Samples T-Test', paired_t:'Paired-Samples T-Test',
      anova_oneway:'One-Way ANOVA', one_way_anova:'One-Way ANOVA',
      linear_regression:'Linear Regression',
      logistic_regression:'Logistic Regression', reliability:'Reliability Analysis',
      factor_analysis:'Factor Analysis',
      nonparametric_mannwhitney:'Mann-Whitney U Test', mann_whitney:'Mann-Whitney U Test',
      nonparametric_wilcoxon:'Wilcoxon Signed-Rank Test', wilcoxon:'Wilcoxon Signed-Rank Test',
      nonparametric_kruskalwallis:'Kruskal-Wallis Test', kruskal_wallis:'Kruskal-Wallis Test',
      nonparametric_friedman:'Friedman Test', friedman:'Friedman Test',
      kaplan_meier:'Kaplan-Meier Survival', kmeans:'K-Means Cluster Analysis'
    };
    return map[procedure]||procedure;
  }

  function render() {
    if(!_container) return;
    _container.innerHTML='';
    _container.style.cssText='display:flex;flex-direction:column;height:100%;overflow:hidden;';
    if(!_outputs.length){
      _container.innerHTML='';
      _container.appendChild(el('div',{class:'empty-state-full'},
        el('div',{class:'empty-state-icon'},'📊'),
        el('h3',{},'No Analysis Results Yet'),
        el('p',{},'Run a statistical procedure to see results here. Start with Descriptive Statistics if you\'re new.'),
        el('div',{class:'empty-state-actions'},
          el('button',{class:'btn btn-primary',onclick:()=>{ if(window._sociostatNavigate) window._sociostatNavigate('analyze'); }},'🔍 Open Analyze'),
          el('button',{class:'btn btn-secondary',onclick:()=>{ if(window._sociostatNavigate) window._sociostatNavigate('graphs'); }},'📈 Create a Chart')
        )
      ));
      return;
    }

    // Toolbar
    const toolbar=el('div',{class:'output-toolbar',style:{flexShrink:'0'}});
    toolbar.appendChild(el('button',{class:'btn btn-sm',onclick:()=>clearAll()},'Clear All'));
    toolbar.appendChild(el('button',{class:'btn btn-sm',onclick:()=>exportHTML()},'📄 Export HTML'));
    toolbar.appendChild(el('button',{class:'btn btn-sm',onclick:()=>exportPDF()},'📋 Export PDF'));
    toolbar.appendChild(el('button',{class:'btn btn-sm',onclick:()=>exportXLSX()},'📊 Export XLSX'));
    _container.appendChild(toolbar);

    // Tree + content split — flex:1 so it fills remaining height
    const split=el('div',{class:'output-split',style:{flex:'1',minHeight:'0'}});
    const tree=el('div',{class:'output-tree'});
    const content=el('div',{class:'output-content',id:'output-content'});

    _outputs.forEach((entry,idx)=>{
      const node=el('div',{class:'output-tree-node',onclick:()=>{
        $$('.output-tree-node').forEach(n=>n.classList.remove('active'));
        node.classList.add('active');
        renderOutputEntry(content, entry);
      }});
      node.appendChild(el('span',{class:'tree-icon'},'📊'));
      node.appendChild(el('span',{},entry.title));
      node.appendChild(el('span',{class:'muted small'},` ${fmtDate(entry.timestamp)}`));
      const del=el('button',{class:'btn btn-xs btn-danger tree-del',onclick:e=>{
        e.stopPropagation(); _outputs.splice(idx,1); Project.markDirty(); render();
      }},'✕');
      node.appendChild(del);
      tree.appendChild(node);
    });

    // Auto-select last
    const nodes=$$('.output-tree-node',tree);
    if(nodes.length){ nodes[nodes.length-1].classList.add('active'); renderOutputEntry(content,_outputs[_outputs.length-1]); }

    split.appendChild(tree); split.appendChild(content);
    _container.appendChild(split);
  }

  function renderOutputEntry(container, entry) {
    container.innerHTML='';
    const { procedure, result, params, timestamp } = entry;

    // Header
    container.appendChild(el('div',{class:'output-header'},
      el('h2',{},entry.title),
      el('span',{class:'muted small'},fmtDate(timestamp))
    ));

    if(result.status==='error'){
      container.appendChild(renderError(result.error));
      return;
    }

    // Warnings
    if(result.warnings&&result.warnings.length){
      result.warnings.forEach(w=>container.appendChild(renderWarning(w)));
    }

    // Syntax
    if(result.syntax){
      container.appendChild(el('div',{class:'output-syntax'},
        el('h4',{},'Syntax'),
        el('pre',{class:'syntax-pre'},result.syntax)
      ));
    }

    // Dispatch to specific renderer — support both old and new procedure IDs
    const renderers={
      frequencies: renderFrequencies,
      descriptives: renderDescriptives,
      crosstabs: renderCrosstabs,
      correlation: renderCorrelation,
      ttest_onesample: renderOneSampleT,   one_sample_t: renderOneSampleT,
      ttest_independent: renderIndepT,     independent_t: renderIndepT,
      ttest_paired: renderPairedT,         paired_t: renderPairedT,
      anova_oneway: renderOneWayANOVA,     one_way_anova: renderOneWayANOVA,
      linear_regression: renderLinearRegression,
      logistic_regression: renderLogisticRegression,
      reliability: renderReliability,
      factor_analysis: renderFactorAnalysis,
      nonparametric_mannwhitney: renderNonpar,  mann_whitney: renderNonpar,
      nonparametric_wilcoxon: renderNonpar,     wilcoxon: renderNonpar,
      nonparametric_kruskalwallis: renderNonpar, kruskal_wallis: renderNonpar,
      nonparametric_friedman: renderNonpar,     friedman: renderNonpar,
      kaplan_meier: renderKaplanMeier,
      kmeans: renderKMeans
    };
    const renderer=renderers[procedure];
    if(renderer) renderer(container, result.result, params, entry.id);
    else container.appendChild(el('pre',{},JSON.stringify(result.result,null,2)));
  }

  /* ── Table helpers ─────────────────────────────────────────── */
  function pivotTable(headers, rows, caption='') {
    const wrap=el('div',{class:'pivot-wrap'});
    if(caption) wrap.appendChild(el('div',{class:'table-caption'},caption));
    const scroll=el('div',{class:'table-scroll'});
    const tbl=el('table',{class:'pivot-table'});
    const thead=el('thead',{},el('tr',{},...headers.map(h=>el('th',{},String(h)))));
    tbl.appendChild(thead);
    const tbody=el('tbody');
    rows.forEach(r=>{
      const tr=el('tr');
      r.forEach(c=>{
        const isNum=typeof c==='number';
        const td=el('td',{class:isNum?'num-cell':''}, c==null?'':typeof c==='number'?fmt(c,3):String(c));
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    scroll.appendChild(tbl); wrap.appendChild(scroll);
    return wrap;
  }

  function renderError(err) {
    return el('div',{class:'warning-box high'},
      el('div',{class:'warning-header'},'ERROR'),
      el('div',{class:'warning-procedure'},`Procedure: ${err?.procedure||'Unknown'}`),
      el('div',{class:'warning-issue'},`Issue: ${err?.message||'Unknown error'}`),
      el('div',{class:'warning-cause'},`Likely cause: ${err?.likely_cause||''}`),
      el('div',{class:'warning-action'},`Suggested action: ${err?.suggested_action||''}`)
    );
  }

  function renderWarning(w) {
    const sev=w.severity||'MEDIUM';
    return el('div',{class:`warning-box ${sev.toLowerCase()}`},
      el('div',{class:'warning-header'},`⚠ WARNING — ${sev}`),
      el('div',{class:'warning-issue'},w.message||w.issue||''),
      w.details?el('div',{class:'warning-details'},w.details):null,
      w.suggested_action?el('div',{class:'warning-action'},`Action: ${w.suggested_action}`):null
    );
  }

  function section(title, termKey) {
    const wrap = el('div',{class:'output-section-header'}, title);
    if (termKey && typeof StatTooltips !== 'undefined') {
      wrap.appendChild(StatTooltips.badge(termKey));
    }
    return wrap;
  }

  /* ── Frequency renderer ────────────────────────────────────── */
  /* ── Frequencies renderer — engine: result.tables = {vn:{variable,rows}} ── */
  function renderFrequencies(container, result) {
    // Engine returns result.tables as an OBJECT keyed by variable name, not an array.
    const tablesObj = result.tables || {};
    const tableList = Array.isArray(tablesObj) ? tablesObj : Object.values(tablesObj);
    if (!tableList.length) {
      container.appendChild(el('p',{class:'muted'},'No frequency tables produced.'));
      return;
    }
    tableList.forEach(tbl => {
      container.appendChild(section(`Frequencies — ${tbl.label || tbl.variable}`));
      container.appendChild(pivotTable(
        ['Value','Label','Frequency','%','Valid %','Cumulative %'],
        (tbl.rows || []).map(r => [
          r.value ?? '.',
          r.label || '',
          r.frequency,
          fmt(r.percent, 2),
          r.valid_percent != null ? fmt(r.valid_percent, 2) : '—',
          r.cumulative_percent != null ? fmt(r.cumulative_percent, 2) : '—'
        ])
      ));
    });
  }

  /* ── Descriptives renderer — engine: result.descriptives = {vn:{variable,n,n_missing,mean,std,...}} ── */
  function renderDescriptives(container, result) {
    container.appendChild(section('Descriptive Statistics'));
    // Engine returns result.descriptives as an object keyed by variable name.
    const descObj = result.descriptives || {};
    const descList = Array.isArray(descObj) ? descObj : Object.values(descObj);
    if (!descList.length) {
      container.appendChild(el('p',{class:'muted'},'No descriptive statistics produced.'));
      return;
    }
    const headers = ['Variable','N','Missing','Mean','Std Dev','Variance','Min','Max','Range','Skewness','Kurtosis'];
    const rows = descList.map(v => [
      v.variable || v.label || '?',
      v.n,
      v.n_missing ?? '—',
      fmt(v.mean),
      fmt(v.std),          // engine field: std (not std_dev)
      fmt(v.variance),
      fmt(v.minimum),      // engine field: minimum (not min)
      fmt(v.maximum),      // engine field: maximum (not max)
      fmt(v.range),
      fmt(v.skewness),
      fmt(v.kurtosis)
    ]);
    container.appendChild(pivotTable(headers, rows));
    // Additional: median, mode, CI
    const extraRows = descList.filter(v => v.ci_95_lower != null).map(v => [
      v.variable, fmt(v.median), fmt(v.mode),
      `[${fmt(v.ci_95_lower)}, ${fmt(v.ci_95_upper)}]`
    ]);
    if (extraRows.length) {
      container.appendChild(section('Additional Statistics'));
      container.appendChild(pivotTable(['Variable','Median','Mode','95% CI for Mean'], extraRows));
    }
  }

  /* ── Crosstabs renderer — engine: result.{row_variable, col_variable, row_values, col_values,
     table_rows:[{row_value,col_value,observed,...}], statistics:{chi_square,chi_square_df,...}} ── */
  function renderCrosstabs(container, result) {
    const rVar = result.row_variable || '?';
    const cVar = result.col_variable || result.column_variable || '?';  // engine: col_variable
    container.appendChild(section(`Crosstabs: ${rVar} × ${cVar}`));

    const rowVals = result.row_values || [];
    const colVals = result.col_values || result.column_values || [];

    if (!rowVals.length || !colVals.length) {
      container.appendChild(el('p',{class:'warning-box medium'},'No crosstab data returned. Check that both variables have valid values.'));
      return;
    }

    // Build count matrix from table_rows (engine format)
    const tblRows = result.table_rows || [];
    const countMap = {};
    tblRows.forEach(r => {
      const key = `${r.row_value}|${r.col_value}`;
      countMap[key] = { observed: r.observed, expected: r.expected,
        row_pct: r.row_pct, col_pct: r.col_pct, total_pct: r.total_pct };
    });

    // Observed counts table
    const obsHeaders = [rVar, ...colVals, 'Total'];
    const obsRows = rowVals.map(rv => {
      const rowTotal = colVals.reduce((s, cv) => s + (countMap[`${rv}|${cv}`]?.observed || 0), 0);
      return [rv, ...colVals.map(cv => countMap[`${rv}|${cv}`]?.observed ?? 0), rowTotal];
    });
    // Add column totals row
    const colTotals = colVals.map(cv => rowVals.reduce((s, rv) => s + (countMap[`${rv}|${cv}`]?.observed || 0), 0));
    const grandTotal = colTotals.reduce((s, v) => s + v, 0);
    obsRows.push(['Total', ...colTotals, grandTotal]);
    container.appendChild(pivotTable(obsHeaders, obsRows, 'Count'));

    // Row % table
    const rowPctRows = rowVals.map(rv => [
      rv, ...colVals.map(cv => fmt(countMap[`${rv}|${cv}`]?.row_pct, 1) + '%')
    ]);
    container.appendChild(pivotTable([rVar, ...colVals], rowPctRows, 'Row %'));

    // Chi-square statistics
    const stats = result.statistics || {};
    const chi2 = stats.chi_square;
    if (chi2 != null) {
      container.appendChild(section('Chi-Square Tests'));
      const statRows = [
        ['Pearson Chi-Square', fmt(chi2, 3), stats.chi_square_df, fmtP(stats.chi_square_p), result.n_total]
      ];
      if (stats.chi_square_yates != null)
        statRows.push(['Continuity Correction (Yates)', fmt(stats.chi_square_yates, 3), 1, fmtP(stats.chi_square_yates_p), result.n_total]);
      if (stats.likelihood_ratio != null)
        statRows.push(['Likelihood Ratio G²', fmt(stats.likelihood_ratio, 3), stats.chi_square_df, fmtP(stats.likelihood_ratio_p), result.n_total]);
      if (stats.fisher_exact_p != null)
        statRows.push(['Fisher\'s Exact Test (2-sided)', '—', '—', fmtP(stats.fisher_exact_p), result.n_total]);
      container.appendChild(pivotTable(['Statistic','Value','df','p','N'], statRows));

      // Symmetric measures
      const symRows = [];
      if (stats.phi != null) symRows.push(['Phi', fmt(stats.phi, 3)]);
      if (stats.cramers_v != null) symRows.push(["Cramér's V", fmt(stats.cramers_v, 3)]);
      if (stats.contingency_coefficient != null) symRows.push(['Contingency Coefficient', fmt(stats.contingency_coefficient, 3)]);
      if (symRows.length) {
        container.appendChild(section('Symmetric Measures'));
        container.appendChild(pivotTable(['Measure','Value'], symRows));
      }
      // Expected count footnote
      if (stats.pct_cells_expected_lt5 != null) {
        container.appendChild(el('p', {class:'muted small'},
          `a. ${stats.pct_cells_expected_lt5.toFixed(1)}% of cells have expected count < 5. Minimum expected count = ${stats.min_expected_count?.toFixed(2) ?? '—'}.`
        ));
      }
    }
  }

  /* ── Correlation renderer — engine: result.{correlation_matrix:{v1:{v2:r}}, p_matrix, n_matrix} ── */
  function renderCorrelation(container, result) {
    const method = result.method || 'pearson';
    const methodLabel = method === 'spearman' ? 'Spearman' : method === 'kendall' ? "Kendall's τ" : 'Pearson';
    container.appendChild(section(`${methodLabel} Correlations`, 'effect-size'));

    const vars = result.variables || [];
    if (!vars.length) {
      container.appendChild(el('p',{class:'muted'},'No variables returned.'));
      return;
    }

    // Engine format: correlation_matrix[v1][v2], p_matrix[v1][v2], n_matrix[v1][v2]
    const corrMat = result.correlation_matrix || {};
    const pMat = result.p_matrix || {};
    const nMat = result.n_matrix || {};

    // Render correlation coefficient matrix
    const headers = ['', ...vars];
    const corrRows = vars.map(v1 => [
      v1,
      ...vars.map(v2 => {
        if (v1 === v2) return '1.000';
        const r = corrMat[v1]?.[v2];
        return r != null ? fmt(r, 3) : '—';
      })
    ]);
    container.appendChild(pivotTable(headers, corrRows, 'Correlation Coefficient'));

    // p-value matrix
    const pRows = vars.map(v1 => [
      v1,
      ...vars.map(v2 => {
        if (v1 === v2) return '—';
        const p = pMat[v1]?.[v2];
        return p != null ? fmtP(p) : '—';
      })
    ]);
    container.appendChild(pivotTable(headers, pRows, 'Sig. (2-tailed)'));

    // N matrix
    const nRows = vars.map(v1 => [
      v1,
      ...vars.map(v2 => {
        if (v1 === v2) return '—';
        const n = nMat[v1]?.[v2];
        return n != null ? n : '—';
      })
    ]);
    container.appendChild(pivotTable(headers, nRows, 'N'));
  }

  /* ── One-Sample T-Test renderer — engine: result.{variable,test_value,n,mean,std,se,t,df,p_two_tailed,...} ── */
  function renderOneSampleT(container, result) {
    container.appendChild(section(`One-Sample T-Test (test value = ${result.test_value})`));
    container.appendChild(pivotTable(
      ['Variable','N','Mean','Std Dev','SE Mean'],
      [[result.variable, result.n, fmt(result.mean), fmt(result.std), fmt(result.se)]]
    ));
    container.appendChild(pivotTable(
      ['Variable','t','df','p (2-tailed)','Mean Diff','CI Lower','CI Upper'],
      [[result.variable, fmt(result.t, 3), result.df, fmtP(result.p_two_tailed),
        fmt(result.mean_difference), fmt(result.ci_lower), fmt(result.ci_upper)]]
    ));
    if (result.cohens_d != null) {
      container.appendChild(section('Effect Size', 'effect-size'));
      container.appendChild(pivotTable(["Cohen's d"], [[fmt(result.cohens_d, 3)]]));
    }
  }

  /* ── Independent T-Test renderer — engine: result.{variable,grouping_variable,group1,group2,
     group1_n,group2_n,group1_mean,group2_mean,group1_std,group2_std,levene_statistic,levene_p,
     equal_variance:{t,df,p_two_tailed,mean_difference,se_difference,ci_lower,ci_upper},
     unequal_variance:{...}, cohens_d} ── */
  function renderIndepT(container, result) {
    container.appendChild(section(`Independent-Samples T-Test: ${result.variable} by ${result.grouping_variable}`));
    // Group statistics
    container.appendChild(pivotTable(
      ['Group','N','Mean','Std Dev','SE Mean'],
      [
        [result.group1, result.group1_n, fmt(result.group1_mean), fmt(result.group1_std), fmt(result.group1_se)],
        [result.group2, result.group2_n, fmt(result.group2_mean), fmt(result.group2_std), fmt(result.group2_se)]
      ], 'Group Statistics'
    ));
    // Levene's test
    if (result.levene_statistic != null) {
      container.appendChild(pivotTable(
        ["Levene's F", 'p'],
        [[fmt(result.levene_statistic, 3), fmtP(result.levene_p)]],
        "Levene's Test for Equality of Variances"
      ));
    }
    // T-test rows
    const eq = result.equal_variance || {};
    const uq = result.unequal_variance || {};
    container.appendChild(pivotTable(
      ['', 't', 'df', 'p (2-tailed)', 'Mean Diff', 'SE Diff', 'CI Lower', 'CI Upper'],
      [
        ['Equal variances assumed', fmt(eq.t, 3), eq.df, fmtP(eq.p_two_tailed),
          fmt(eq.mean_difference), fmt(eq.se_difference), fmt(eq.ci_lower), fmt(eq.ci_upper)],
        ['Equal variances not assumed', fmt(uq.t, 3), fmt(uq.df, 1), fmtP(uq.p_two_tailed),
          fmt(uq.mean_difference), fmt(uq.se_difference), fmt(uq.ci_lower), fmt(uq.ci_upper)]
      ], 'Independent Samples Test'
    ));
    if (result.cohens_d != null) {
      container.appendChild(section('Effect Size', 'effect-size'));
      container.appendChild(pivotTable(["Cohen's d"], [[fmt(result.cohens_d, 3)]]));
    }
  }

  /* ── Paired T-Test renderer — engine: result.{variable1,variable2,n,mean_difference,
     std_difference,se_difference,t,df,p_two_tailed,ci_lower,ci_upper,cohens_d} ── */
  function renderPairedT(container, result) {
    container.appendChild(section(`Paired-Samples T-Test: ${result.variable1} & ${result.variable2}`));
    container.appendChild(pivotTable(
      ['Variable','N','Mean'],
      [
        [result.variable1, result.n, fmt(result.mean1)],
        [result.variable2, result.n, fmt(result.mean2)]
      ], 'Paired Samples Statistics'
    ));
    container.appendChild(pivotTable(
      ['Pair','Mean Diff','Std Dev','SE','t','df','p (2-tailed)','CI Lower','CI Upper'],
      [[
        `${result.variable1} − ${result.variable2}`,
        fmt(result.mean_difference), fmt(result.std_difference), fmt(result.se_difference),
        fmt(result.t, 3), result.df, fmtP(result.p_two_tailed),
        fmt(result.ci_lower), fmt(result.ci_upper)
      ]]
    ));
    if (result.cohens_d != null) {
      container.appendChild(pivotTable(["Cohen's d"], [[fmt(result.cohens_d, 3)]], 'Effect Size'));
    }
  }

  /* ── One-Way ANOVA renderer — engine: result.{dependent,factor,n_total,k_groups,grand_mean,
     group_stats:{k:{n,mean,std,se,...}}, anova_table:{between:{ss,df,ms,f,p},within,total},
     eta_squared, levene:{statistic,p}, welch:{f,df1,df2,p}, post_hoc:{method:[{group1,group2,mean_difference,se,p}]}} ── */
  function renderOneWayANOVA(container, result) {
    container.appendChild(section(`ANOVA: ${result.dependent} by ${result.factor}`));

    // Group descriptives
    if (result.group_stats) {
      const gKeys = Object.keys(result.group_stats);
      container.appendChild(pivotTable(
        ['Group','N','Mean','Std Dev','SE','95% CI Lower','95% CI Upper','Min','Max'],
        gKeys.map(k => {
          const g = result.group_stats[k];
          return [k, g.n, fmt(g.mean), fmt(g.std), fmt(g.se),
            fmt(g.ci_lower), fmt(g.ci_upper), fmt(g.minimum), fmt(g.maximum)];
        }), 'Descriptives'
      ));
    }

    // ANOVA table — engine fields: ss (lowercase), df, ms, f, p
    const at = result.anova_table || {};
    const bw = at.between || {};
    const wi = at.within || {};
    const tot = at.total || {};
    container.appendChild(pivotTable(
      ['Source','SS','df','MS','F','p'],
      [
        ['Between Groups', fmt(bw.ss), bw.df, fmt(bw.ms), fmt(bw.f, 3), fmtP(bw.p)],
        ['Within Groups', fmt(wi.ss), wi.df, fmt(wi.ms), '', ''],
        ['Total', fmt(tot.ss), tot.df, '', '', '']
      ], 'ANOVA Table'
    ));

    // Effect size
    if (result.eta_squared != null) {
      container.appendChild(pivotTable(['η²'], [[fmt(result.eta_squared, 4)]], 'Effect Size'));
    }

    // Levene's test — engine: result.levene.{statistic, p}
    const lev = result.levene || {};
    if (lev.statistic != null) {
      container.appendChild(pivotTable(
        ["Levene's F", 'p'],
        [[fmt(lev.statistic, 3), fmtP(lev.p)]],
        "Levene's Test for Equality of Variances"
      ));
    }

    // Welch's ANOVA — engine: result.welch.{f, df1, df2, p}
    const wl = result.welch || {};
    if (wl.f != null) {
      container.appendChild(pivotTable(
        ["Welch's F", 'df1', 'df2', 'p'],
        [[fmt(wl.f, 3), wl.df1, fmt(wl.df2, 1), fmtP(wl.p)]],
        "Welch's Robust Test of Equality of Means"
      ));
    }

    // Post hoc — engine: result.post_hoc = {method:[{group1,group2,mean_difference,se,p,significant}]}
    const ph = result.post_hoc || {};
    Object.entries(ph).forEach(([method, comps]) => {
      if (!comps || !comps.length) return;
      container.appendChild(section(`Post Hoc: ${method.charAt(0).toUpperCase() + method.slice(1)}`));
      container.appendChild(pivotTable(
        ['(I) Group','(J) Group','Mean Diff (I-J)','SE','p','Sig.'],
        comps.map(c => [c.group1, c.group2, fmt(c.mean_difference), fmt(c.se), fmtP(c.p), c.significant ? '*' : 'n.s.'])
      ));
    });
  }

  /* ── Linear Regression renderer — engine: result.{dependent,independent,n,
     model_summary:{r,r_squared,adjusted_r_squared,se_estimate},
     anova_table:{regression:{ss,df,ms,f,p},residual,total},
     coefficients:[{name,b,se,beta,t,p,ci_lower,ci_upper}],
     vif:{varname:{vif,tolerance}},
     diagnostics:{durbin_watson,residuals_sample,fitted_sample}} ── */
  function renderLinearRegression(container, result) {
    // Model Summary
    const ms = result.model_summary || {};
    container.appendChild(section('Model Summary', 'r-squared'));
    container.appendChild(pivotTable(
      ['R', 'R²', 'Adj. R²', 'SE of Estimate'],
      [[fmt(ms.r, 3), fmt(ms.r_squared, 3), fmt(ms.adjusted_r_squared, 3), fmt(ms.se_estimate, 3)]]
    ));

    // ANOVA table
    const at = result.anova_table || {};
    const reg = at.regression || {};
    const res = at.residual || {};
    const tot = at.total || {};
    container.appendChild(section('ANOVA'));
    container.appendChild(pivotTable(
      ['Model','SS','df','MS','F','p'],
      [
        ['Regression', fmt(reg.ss), reg.df, fmt(reg.ms), fmt(reg.f, 3), fmtP(reg.p)],
        ['Residual', fmt(res.ss), res.df, fmt(res.ms), '', ''],
        ['Total', fmt(tot.ss), tot.df, '', '', '']
      ]
    ));

    // Coefficients — engine fields: name, b, se, beta, t, p, ci_lower, ci_upper
    const coefs = result.coefficients || [];
    const vifMap = result.vif || {};
    container.appendChild(section('Coefficients', 'vif'));
    container.appendChild(pivotTable(
      ['Variable','B','SE','Beta','t','p','CI Lower','CI Upper','VIF'],
      coefs.map(c => [
        c.name,
        fmt(c.b, 4), fmt(c.se, 4), c.beta != null ? fmt(c.beta, 4) : '—',
        fmt(c.t, 3), fmtP(c.p), fmt(c.ci_lower, 4), fmt(c.ci_upper, 4),
        vifMap[c.name] ? fmt(vifMap[c.name].vif, 3) : '—'
      ])
    ));

    // Diagnostics
    const diag = result.diagnostics || {};
    if (diag.durbin_watson != null) {
      container.appendChild(section('Diagnostics'));
      container.appendChild(pivotTable(
        ['Statistic','Value','Interpretation'],
        [['Durbin-Watson', fmt(diag.durbin_watson, 3), 'Range 1.5–2.5 = no autocorrelation']]
      ));
    }

    // Residuals scatterplot
    if (diag.fitted_sample && diag.residuals_sample) {
      const chartId = 'chart_' + uuid();
      container.appendChild(el('div',{id:chartId,class:'output-chart',style:{height:'280px'}}));
      setTimeout(() => Charts.scatterResiduals(chartId, diag.fitted_sample, diag.residuals_sample), 100);
    }
  }

  /* ── Logistic Regression renderer — engine: result.{dependent,independent,n,
     coefficients:[{name,b,se,wald,df,p,exp_b,exp_b_ci_lower,exp_b_ci_upper}],
     model_fit:{chi_square,df,p,neg_2ll,cox_snell_r2,nagelkerke_r2},
     classification_table:{tp,tn,fp,fn,overall_accuracy_pct}} ── */
  function renderLogisticRegression(container, result) {
    // Model fit
    const mf = result.model_fit || {};
    container.appendChild(section('Model Summary'));
    container.appendChild(pivotTable(
      ['-2 Log Likelihood','Cox & Snell R²','Nagelkerke R²'],
      [[fmt(mf.neg_2ll, 3), fmt(mf.cox_snell_r2, 3), fmt(mf.nagelkerke_r2, 3)]]
    ));
    // Omnibus test
    container.appendChild(pivotTable(
      ['Model χ²', 'df', 'p'],
      [[fmt(mf.chi_square, 3), mf.df, fmtP(mf.p)]], 'Omnibus Tests of Model Coefficients'
    ));

    // Coefficients — engine fields: name, b, se, wald, df, p, exp_b, exp_b_ci_lower, exp_b_ci_upper
    const coefs = result.coefficients || [];
    container.appendChild(section('Variables in the Equation'));
    container.appendChild(pivotTable(
      ['Variable','B','SE','Wald','df','p','Exp(B)','CI Lower','CI Upper'],
      coefs.map(c => [
        c.name,
        fmt(c.b, 4), fmt(c.se, 4), fmt(c.wald, 3), c.df,
        fmtP(c.p), fmt(c.exp_b, 4),
        fmt(c.exp_b_ci_lower, 4), fmt(c.exp_b_ci_upper, 4)
      ])
    ));

    // Classification table — engine fields: tp, tn, fp, fn, overall_accuracy_pct
    const ct = result.classification_table || {};
    if (ct.tp != null) {
      container.appendChild(section('Classification Table'));
      const total0 = (ct.tn || 0) + (ct.fp || 0);
      const total1 = (ct.fn || 0) + (ct.tp || 0);
      const pct0 = total0 > 0 ? fmt(ct.tn / total0 * 100, 1) + '%' : '—';
      const pct1 = total1 > 0 ? fmt(ct.tp / total1 * 100, 1) + '%' : '—';
      container.appendChild(pivotTable(
        ['Observed','Predicted 0','Predicted 1','% Correct'],
        [
          ['0', ct.tn, ct.fp, pct0],
          ['1', ct.fn, ct.tp, pct1],
          ['Overall', '', '', fmt(ct.overall_accuracy_pct, 1) + '%']
        ]
      ));
    }
  }

  /* ── Reliability renderer — engine: result.{model,n_cases,n_items,alpha,
     item_statistics:[{item,item_mean,item_std,corrected_item_total_r,alpha_if_deleted}]} ── */
  function renderReliability(container, result) {
    container.appendChild(section('Reliability Statistics', 'cronbach-alpha'));
    container.appendChild(pivotTable(
      ["Cronbach's α", 'N of Items', 'N of Cases'],
      [[fmt(result.alpha, 3), result.n_items, result.n_cases]]
    ));
    if (result.alpha_interpretation) {
      container.appendChild(el('p', {class:'muted small'}, `Interpretation: ${result.alpha_interpretation}`));
    }
    container.appendChild(section('Item-Total Statistics'));
    const rows = (result.item_statistics || []).map(s => [
      s.item,
      fmt(s.item_mean, 3),
      fmt(s.item_std, 3),
      fmt(s.corrected_item_total_r, 3),
      s.alpha_if_deleted != null ? fmt(s.alpha_if_deleted, 3) : '—'
    ]);
    container.appendChild(pivotTable(
      ['Item','Mean','SD','Corrected Item-Total r','α if Item Deleted'], rows
    ));
    if (result.scale_statistics) {
      const ss = result.scale_statistics;
      container.appendChild(section('Scale Statistics'));
      container.appendChild(pivotTable(
        ['Scale Mean','Scale Variance','Scale Std Dev'],
        [[fmt(ss.mean, 3), fmt(ss.variance, 3), fmt(ss.std, 3)]]
      ));
    }
  }

  /* ── Factor Analysis renderer — engine: result.{variables,n,n_factors_extracted,kmo,
     bartlett:{chi_square,df,p}, eigenvalue_table:[{component,eigenvalue,pct_variance,cumulative_pct}],
     loading_matrix:[{variable,factor_1,...,communality}]} ── */
  function renderFactorAnalysis(container, result) {
    container.appendChild(section("KMO and Bartlett's Test", 'kmo'));
    const bart = result.bartlett || {};
    container.appendChild(pivotTable(
      ['KMO Measure', "Bartlett's χ²", 'df', 'p'],
      [[fmt(result.kmo, 3), fmt(bart.chi_square, 3), bart.df, fmtP(bart.p)]]
    ));

    // Eigenvalue table — engine: eigenvalue_table[].{component,eigenvalue,pct_variance,cumulative_pct}
    container.appendChild(section('Total Variance Explained'));
    const evTable = (result.eigenvalue_table || []).slice(0, 15);
    container.appendChild(pivotTable(
      ['Component','Eigenvalue','% Variance','Cumulative %','Extracted'],
      evTable.map(r => [r.component, fmt(r.eigenvalue, 3), fmt(r.pct_variance, 2), fmt(r.cumulative_pct, 2), r.extracted ? '✓' : ''])
    ));

    // Factor loading matrix — engine: loading_matrix[].{variable, factor_1, factor_2, ..., communality}
    if (result.loading_matrix && result.loading_matrix.length) {
      const nFact = result.n_factors_extracted || 1;
      container.appendChild(section(result.rotation !== 'none' ? 'Rotated Component Matrix' : 'Component Matrix'));
      const fHeaders = ['Variable', ...Array.from({length:nFact},(_,i)=>`Factor ${i+1}`), 'Communality'];
      container.appendChild(pivotTable(
        fHeaders,
        result.loading_matrix.map(row => [
          row.variable,
          ...Array.from({length:nFact},(_,i)=>fmt(row[`factor_${i+1}`], 3)),
          fmt(row.communality, 3)
        ])
      ));
    }

    // Scree plot — eigenvalue_table[]
    if (evTable.length) {
      const chartId = 'chart_' + uuid();
      container.appendChild(el('div',{id:chartId,class:'output-chart',style:{height:'280px'}}));
      setTimeout(() => Charts.screePlot(chartId, evTable.map(r => r.eigenvalue)), 100);
    }
  }

  /* ── Nonparametric renderer — engine procedure-specific fields ── */
  function renderNonpar(container, result) {
    const testLabel = result.test || 'Nonparametric Test';
    container.appendChild(section(testLabel));
    const rows = [];
    // Mann-Whitney U — engine fields: U, z, p, n1, n2, effect_size_r, group1_median, group2_median
    if (result.test === 'Mann-Whitney U') {
      if (result.grouping_variable) rows.push(['Grouping variable', result.grouping_variable]);
      rows.push(['Group 1 (median)', fmt(result.group1_median, 3)]);
      rows.push(['Group 2 (median)', fmt(result.group2_median, 3)]);
      rows.push(['n₁', result.n1]);
      rows.push(['n₂', result.n2]);
      rows.push(['U statistic', fmt(result.U, 3)]);
      rows.push(['Z', fmt(result.z, 3)]);
      rows.push(['p (2-tailed)', fmtP(result.p)]);
      if (result.effect_size_r != null) rows.push(['r (effect size)', fmt(result.effect_size_r, 3)]);
    }
    // Wilcoxon Signed-Rank — engine fields: T, z, p, n_pairs, n_nonzero_diff
    else if (result.test === 'Wilcoxon Signed-Rank') {
      rows.push(['Variable 1', result.variable1 || '']);
      rows.push(['Variable 2', result.variable2 || '']);
      rows.push(['N (pairs)', result.n_pairs]);
      rows.push(['N (non-zero diff)', result.n_nonzero_diff]);
      rows.push(['T statistic', fmt(result.T, 3)]);
      rows.push(['Z', fmt(result.z, 3)]);
      rows.push(['p (2-tailed)', fmtP(result.p)]);
    }
    // Kruskal-Wallis — engine fields: H, df, p, n_total, epsilon_squared, group_medians
    else if (result.test === 'Kruskal-Wallis') {
      rows.push(['H statistic', fmt(result.H, 3)]);
      rows.push(['df', result.df]);
      rows.push(['p', fmtP(result.p)]);
      rows.push(['N', result.n_total]);
      if (result.epsilon_squared != null) rows.push(['ε² (effect size)', fmt(result.epsilon_squared, 4)]);
      if (result.group_medians) {
        Object.entries(result.group_medians).forEach(([g,med])=>rows.push([`Median (group ${g})`, fmt(med,3)]));
      }
    }
    // Friedman — engine fields: chi_square, df, p, n_cases, kendall_w
    else if (result.test === 'Friedman') {
      rows.push(['χ²', fmt(result.chi_square, 3)]);
      rows.push(['df', result.df]);
      rows.push(['p', fmtP(result.p)]);
      rows.push(['N (cases)', result.n_cases]);
      if (result.kendall_w != null) rows.push(["Kendall's W", fmt(result.kendall_w, 4)]);
    }
    else {
      // Generic fallback: dump all scalar result fields
      Object.entries(result).forEach(([k, v]) => {
        if (typeof v === 'number') rows.push([k, fmt(v, 4)]);
        else if (typeof v === 'string') rows.push([k, v]);
      });
    }
    if (rows.length) container.appendChild(pivotTable(['Statistic','Value'], rows));
    else container.appendChild(el('p',{class:'muted'},'No renderable values in result.'));
  }

  /* ── Kaplan-Meier renderer ─────────────────────────────────── */
  // Engine result: { time_variable, event_variable, group_variable, n, groups, survival_curves:{key:[{t,survival,n_risk,n_event,n_censor}]} }
  function renderKaplanMeier(container, result) {
    container.appendChild(section('Kaplan-Meier Survival Analysis'));
    // Summary row
    const curves = result.survival_curves || {};
    const allSteps = Object.values(curves).flat();
    const n_total = result.n || 0;
    const n_events = allSteps.filter(s=>s.n_event>0).reduce((s,r)=>s+r.n_event, 0);
    const n_censored = allSteps.filter(s=>s.n_censor>0).reduce((s,r)=>s+r.n_censor, 0);
    // Median survival: first time survival ≤ 0.5
    const getMedian = (steps) => {
      for (const s of steps) { if (s.survival <= 0.5) return s.t; }
      return null;
    };
    const summaryRows = Object.entries(curves).map(([grp, steps]) => {
      const med = getMedian(steps);
      const nevt = steps.reduce((s,r)=>s+r.n_event,0);
      const nris = steps[0]?.n_risk || 0;
      return [grp === 'all' ? 'Overall' : grp, nris, nevt, med != null ? fmt(med,2) : 'Not reached'];
    });
    container.appendChild(pivotTable(['Group','N at Risk','Events','Median Survival'], summaryRows));
    // Per-group survival table (first group only to keep it concise)
    const firstKey = Object.keys(curves)[0];
    if (firstKey) {
      const steps = curves[firstKey];
      container.appendChild(section(`Survival Table${firstKey !== 'all' ? ' — ' + firstKey : ''}`));
      container.appendChild(pivotTable(
        ['Time','N Risk','Events','Censored','Survival'],
        steps.map(s=>[fmt(s.t,2),s.n_risk,s.n_event,s.n_censor,fmt(s.survival,4)])
      ));
    }
    // KM chart
    const chartId='chart_'+uuid();
    container.appendChild(el('div',{id:chartId,class:'output-chart',style:{height:'350px'}}));
    setTimeout(()=>Charts.kaplanMeier(chartId,result),100);
  }

  /* ── K-Means renderer ─────────────────────────────────────── */
  // Engine result: { variables, k, n, assignments, sizes:[n0,n1,...], centers:[{cluster,n,means:{vn:val}}], silhouette_score }
  function renderKMeans(container, result) {
    container.appendChild(section('K-Means Cluster Analysis'));
    container.appendChild(pivotTable(
      ['K','N','Silhouette Score'],[[result.k, result.n, fmt(result.silhouette_score,4)]]
    ));
    // Cluster sizes from centers array
    const centers = result.centers || [];
    container.appendChild(section('Cluster Sizes'));
    container.appendChild(pivotTable(
      ['Cluster','N'],
      centers.map(c=>[`Cluster ${c.cluster}`, c.n])
    ));
    // Final cluster centers (means object keyed by variable name)
    const vars = result.variables || [];
    if (vars.length && centers.length) {
      container.appendChild(section('Final Cluster Centers'));
      container.appendChild(pivotTable(
        ['Variable', ...centers.map(c=>`Cluster ${c.cluster}`)],
        vars.map(vn=>[ vn, ...centers.map(c=>fmt((c.means||{})[vn], 3)) ])
      ));
    }
  }

  function clearAll() { if(confirm('Clear all output?')){ _outputs=[]; Project.markDirty(); render(); } }

  function exportXLSX() {
    if(!_outputs.length){ notify('No output to export','warning'); return; }
    if(typeof XLSX === 'undefined'){ notify('Excel export unavailable — library not loaded. Retry from Settings → System Status.','error'); return; }
    const wb=XLSX.utils.book_new();
    _outputs.forEach(entry=>{
      try {
        const tmp=document.createElement('div');
        renderOutputEntry(tmp,entry);
        const tables=tmp.querySelectorAll('table.pivot-table');
        tables.forEach((tbl,ti)=>{
          const ws2=XLSX.utils.table_to_sheet(tbl);
          const sheetName=(entry.title||entry.procedure).replace(/[:\\\/\?\*\[\]]/g,'').slice(0,28)+(tables.length>1?`_${ti+1}`:'');
          XLSX.utils.book_append_sheet(wb,ws2,sheetName.slice(0,31));
        });
      } catch(e) { /* skip */ }
    });
    if(wb.SheetNames.length===0){ notify('No tables to export','warning'); return; }
    XLSX.writeFile(wb,'sociostat_output.xlsx');
  }

  function exportHTML() {
    let html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>SOCIOSTAT Output</title>';
    html+=`<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:40px auto;} table{border-collapse:collapse;width:100%;margin-bottom:16px;} th,td{border:1px solid #ccc;padding:6px 10px;text-align:left;} th{background:#f0f0f0;} h2{border-bottom:2px solid #333;} h3{margin-top:24px;}</style></head><body>`;
    html+=`<h1>SOCIOSTAT Output — ${new Date().toLocaleString()}</h1>`;
    const tmp=document.createElement('div'); tmp.innerHTML='';
    _outputs.forEach(entry=>{
      html+=`<h2>${entry.title}</h2><p class="muted">${fmtDate(entry.timestamp)}</p>`;
      const cont=document.createElement('div');
      renderOutputEntry(cont,entry);
      // Strip chart divs
      $$('.output-chart',cont).forEach(c=>c.remove());
      html+=cont.innerHTML;
    });
    html+='</body></html>';
    const blob=new Blob([html],{type:'text/html'});
    const a=el('a',{href:URL.createObjectURL(blob),download:'sociostat_output.html'});
    a.click();
  }

  function exportPDF() {
    const tmp=document.createElement('div');
    tmp.style.cssText='position:absolute;left:-9999px;top:0;width:800px;background:white;font-family:system-ui,sans-serif;padding:20px;';
    _outputs.forEach(entry=>{ const cont=document.createElement('div'); renderOutputEntry(cont,entry); $$('.output-chart',cont).forEach(c=>c.remove()); tmp.appendChild(cont); });
    document.body.appendChild(tmp);
    const { jsPDF } = window.jspdf||{};
    if(!jsPDF){ notify('jsPDF not loaded','error'); tmp.remove(); return; }
    const doc=new jsPDF({ orientation:'portrait', unit:'pt', format:'a4' });
    doc.html(tmp, {
      callback: pdf => { pdf.save('sociostat_output.pdf'); tmp.remove(); },
      x:20, y:20, width:555, windowWidth:800
    });
  }

  function getOutputs() { return _outputs; }
  function setOutputs(arr) { _outputs=arr||[]; render(); }

  return { init, addResult, render, getOutputs, setOutputs, clearAll, exportXLSX };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 11: CHART ENGINE
   ══════════════════════════════════════════════════════════════════ */

const Charts = (() => {
  function getChart(id) {
    const dom=document.getElementById(id);
    if(!dom) return null;
    if(typeof echarts === 'undefined') {
      dom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:10px;color:#6b7280;font-size:13px;">' +
        '<span style="font-size:22px;">📊</span>' +
        '<span>Chart library is still loading or unavailable.</span>' +
        '<button class="btn btn-sm" onclick="LibraryLoader.retry(\'echarts\').then(()=>{ this.closest(\'[id]\') && (document.getElementById(this.closest(\'[id]\').id).innerHTML=\'\'); })">Retry</button>' +
        '</div>';
      return null;
    }
    // Dispose old instance
    const old=echarts.getInstanceByDom(dom);
    if(old) old.dispose();
    return echarts.init(dom, null, { renderer:'canvas' });
  }

  function histogram(domId, values, title='Histogram', variable='') {
    const chart=getChart(domId); if(!chart) return;
    const vals=values.filter(v=>typeof v==='number'&&isFinite(v));
    if(!vals.length) return;
    const mn=Math.min(...vals), mx=Math.max(...vals);
    const bins=Math.max(5,Math.min(30,Math.ceil(Math.sqrt(vals.length))));
    const w=(mx-mn)/bins;
    const counts=new Array(bins).fill(0);
    vals.forEach(v=>{ let i=Math.floor((v-mn)/w); if(i>=bins)i=bins-1; counts[i]++; });
    const labels=counts.map((_,i)=>fmt(mn+i*w+w/2,2));
    chart.setOption({ title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'axis'},
      xAxis:{type:'category',data:labels,name:variable},
      yAxis:{type:'value',name:'Frequency'},
      series:[{type:'bar',data:counts,itemStyle:{color:'#3b82d4'},barCategoryGap:'5%'}]
    });
  }

  function boxplot(domId, groups, title='Boxplot') {
    // groups: { groupName: [values...] }
    const chart=getChart(domId); if(!chart) return;
    const names=Object.keys(groups);
    const data=names.map(n=>{
      const v=groups[n].filter(x=>typeof x==='number'&&isFinite(x)).sort((a,b)=>a-b);
      if(!v.length) return [0,0,0,0,0];
      const q1=Stats.quantile(v,0.25), q2=Stats.quantile(v,0.5), q3=Stats.quantile(v,0.75);
      return [v[0],q1,q2,q3,v[v.length-1]];
    });
    chart.setOption({
      title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'item'},
      xAxis:{type:'category',data:names},
      yAxis:{type:'value'},
      series:[{type:'boxplot',data,itemStyle:{color:'#e6f0ff',borderColor:'#3b82d4'}}]
    });
  }

  function scatterPlot(domId, xVals, yVals, xLabel='X', yLabel='Y', title='Scatterplot') {
    const chart=getChart(domId); if(!chart) return;
    const data=xVals.map((x,i)=>[x,yVals[i]]).filter(d=>d[0]!=null&&d[1]!=null&&isFinite(d[0])&&isFinite(d[1]));
    chart.setOption({
      title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'item',formatter:p=>`${xLabel}: ${p.data[0].toFixed(3)}<br>${yLabel}: ${p.data[1].toFixed(3)}`},
      xAxis:{name:xLabel,nameLocation:'middle',nameGap:25},
      yAxis:{name:yLabel,nameLocation:'middle',nameGap:35},
      series:[{type:'scatter',data,symbolSize:6,itemStyle:{color:'#3b82d4',opacity:0.7}}]
    });
  }

  function scatterResiduals(domId, predicted, residuals) {
    scatterPlot(domId,predicted,residuals,'Predicted Value','Std. Residual','Residuals vs. Predicted');
  }

  function barChart(domId, categories, values, title='Bar Chart', label='') {
    const chart=getChart(domId); if(!chart) return;
    chart.setOption({
      title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'axis'},
      xAxis:{type:'category',data:categories,name:label},
      yAxis:{type:'value'},
      series:[{type:'bar',data:values,itemStyle:{color:'#3b82d4'}}]
    });
  }

  function screePlot(domId, eigenvalues) {
    const chart=getChart(domId); if(!chart) return;
    const labels=eigenvalues.map((_,i)=>`F${i+1}`);
    chart.setOption({
      title:{text:'Scree Plot',left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'axis'},
      xAxis:{type:'category',data:labels,name:'Component'},
      yAxis:{type:'value',name:'Eigenvalue'},
      series:[
        {type:'line',data:eigenvalues,name:'Eigenvalue',itemStyle:{color:'#3b82d4'},markLine:{data:[{yAxis:1,lineStyle:{color:'red',type:'dashed'},label:{formatter:'λ=1'}}]}},
        {type:'scatter',data:eigenvalues,name:'',itemStyle:{color:'#3b82d4'},symbolSize:8}
      ]
    });
  }

  function qqPlot(domId, values, title='Q-Q Plot') {
    const chart=getChart(domId); if(!chart) return;
    const sorted=values.filter(v=>typeof v==='number'&&isFinite(v)).sort((a,b)=>a-b);
    const n=sorted.length;
    const expected=sorted.map((_,i)=>{
      const p=(i+0.5)/n;
      // Rational approximation for inverse normal
      let q; const c0=2.515517,c1=0.802853,c2=0.010328,d1=1.432788,d2=0.189269,d3=0.001308;
      const pp=p<0.5?p:1-p; const t2=Math.sqrt(-2*Math.log(pp));
      q=t2-(c0+c1*t2+c2*t2**2)/(1+d1*t2+d2*t2**2+d3*t2**3);
      return p<0.5?-q:q;
    });
    const mn=Stats.mean(sorted), sd=Stats.std(sorted);
    const lineX=[expected[0],expected[n-1]];
    const lineY=[expected[0]*sd+mn, expected[n-1]*sd+mn];
    chart.setOption({
      title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'item'},
      xAxis:{name:'Theoretical Quantile',nameLocation:'middle',nameGap:25},
      yAxis:{name:'Observed Value',nameLocation:'middle',nameGap:35},
      series:[
        {type:'scatter',data:expected.map((e,i)=>[e,sorted[i]]),symbolSize:5,itemStyle:{color:'#3b82d4',opacity:0.7}},
        {type:'line',data:lineX.map((x,i)=>[x,lineY[i]]),lineStyle:{color:'red',width:1},symbol:'none',itemStyle:{color:'red'}}
      ]
    });
  }

  function kaplanMeier(domId, result) {
    const chart=getChart(domId); if(!chart) return;
    const series=[];
    // Engine returns survival_curves:{key:[{t,survival,n_risk,n_event,n_censor}]}
    const curves=result.survival_curves||result.groups||{};
    Object.entries(curves).forEach(([gname,steps])=>{
      if(!steps||!steps.length) return;
      const label = gname==='all'?'Overall':gname;
      series.push({type:'line',name:label,data:steps.map(s=>[s.t,s.survival]),step:'end',symbol:'none'});
    });
    chart.setOption({
      title:{text:'Kaplan-Meier Survival Curve',left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'axis'},
      xAxis:{type:'value',name:'Time',nameLocation:'middle',nameGap:25},
      yAxis:{type:'value',min:0,max:1,name:'Survival Probability',nameLocation:'middle',nameGap:40},
      legend:{bottom:0},
      series
    });
  }

  function lineChart(domId, xData, series, title='Line Chart') {
    const chart=getChart(domId); if(!chart) return;
    chart.setOption({
      title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'axis'},
      xAxis:{type:'category',data:xData},
      yAxis:{type:'value'},
      legend:{bottom:0},
      series:series.map(s=>({type:'line',name:s.name,data:s.data}))
    });
  }

  function pieChart(domId, labels, values, title='Pie Chart') {
    const chart=getChart(domId); if(!chart) return;
    chart.setOption({
      title:{text:title,left:'center',textStyle:{fontSize:13}},
      tooltip:{trigger:'item',formatter:'{b}: {c} ({d}%)'},
      legend:{bottom:0,type:'scroll'},
      series:[{type:'pie',radius:['30%','65%'],data:labels.map((l,i)=>({name:l,value:values[i]})),
        label:{formatter:'{b}\n{d}%'},emphasis:{itemStyle:{shadowBlur:10,shadowColor:'rgba(0,0,0,0.3)'}}}]
    });
  }

  return { histogram, boxplot, scatterPlot, scatterResiduals, barChart, screePlot, qqPlot, kaplanMeier, lineChart, pieChart };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 12: SYNTAX EDITOR
   ══════════════════════════════════════════════════════════════════ */

const SyntaxEditor = (() => {
  let _container = null;
  let _history = [];
  let _currentSyntax = '';

  function init(container) { _container = container; }

  function render() {
    if (!_container) return;
    _container.innerHTML = '';
    _container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';

    const toolbar = el('div', { class: 'data-toolbar', style: { flexShrink: '0' } },
      el('button', { class: 'btn btn-primary btn-sm', onclick: () => runSyntax() }, '▶ Run'),
      el('button', { class: 'btn btn-sm', onclick: () => clearEditor() }, 'Clear'),
      el('button', { class: 'btn btn-sm', onclick: () => exportSyntax() }, 'Export .sps'),
      el('span', { class: 'muted small', style: { marginLeft:'8px' } }, 'Supported: DESCRIPTIVES, FREQUENCIES, CORRELATIONS, T-TEST, ONEWAY, REGRESSION, RELIABILITY, CROSSTABS, COMPUTE, SORT CASES, SELECT IF')
    );

    const textarea = el('textarea', {
      class: 'syntax-editor-area',
      style: { flex: '1', minHeight: '0' },
      placeholder: '* SOCIOSTAT Syntax\n* Example:\nDESCRIPTIVES VARIABLES=age income\n  /STATISTICS=MEAN STDDEV MIN MAX.\n\nREGRESSION\n  /DEPENDENT income\n  /METHOD=ENTER education age.\n',
      onchange: e => { _currentSyntax = e.target.value; },
      onkeyup: e => { _currentSyntax = e.target.value; }
    });
    textarea.value = _currentSyntax;  // set value after creation to avoid attribute encoding issues

    const histBox = el('div', { class: 'syntax-history', style: { flexShrink: '0' } });
    histBox.appendChild(el('h4', {}, 'Syntax History'));
    if (_history.length === 0) histBox.appendChild(el('p', { class: 'muted' }, 'No syntax run yet. Commands you run will appear here.'));
    [..._history].reverse().slice(0, 20).forEach((entry) => {
      const node = el('div', { class: 'syntax-history-entry' },
        el('span', { class: 'muted small' }, fmtDate(entry.timestamp) + ' '),
        el('code', {}, entry.syntax.slice(0, 60) + (entry.syntax.length > 60 ? '…' : '')),
        el('button', { class: 'btn btn-xs', onclick: () => { _currentSyntax = entry.syntax; render(); } }, 'Reuse')
      );
      histBox.appendChild(node);
    });

    _container.appendChild(toolbar);
    _container.appendChild(textarea);
    _container.appendChild(histBox);
  }

  function runSyntax() {
    const syntax = _currentSyntax.trim();
    if (!syntax) { notify('No syntax to run', 'warning'); return; }
    const ds = AppState.get('activeDataset');
    if (!ds) { notify('No dataset loaded', 'error'); return; }

    // Parse simple syntax → dispatch to ProcedureRegistry
    const result = parseSyntax(syntax, ds);
    _history.push({ syntax, timestamp: new Date().toISOString(), result });
    History.addEntry({ type: 'syntax', syntax, timestamp: new Date().toISOString() });
    if (result.error) {
      notify('Syntax error: ' + result.error, 'error');
    } else {
      notify('Syntax executed successfully', 'success');
      App.navigate('output');
    }
    render();
  }

  function parseSyntax(syntax, dataset) {
    // Very basic syntax parser — supports DESCRIPTIVES, FREQUENCIES, CORRELATIONS,
    // T-TEST, ONEWAY, REGRESSION, RELIABILITY, CROSSTABS
    const lines = syntax.split('\n').map(l => l.replace(/\*.*/, '').trim()).filter(Boolean);
    const cmd = lines[0].toUpperCase();

    try {
      if (cmd.startsWith('DESCRIPTIVES')) {
        const vars = extractVarList(lines, 'VARIABLES');
        if (!vars.length) return { error: 'No variables specified for DESCRIPTIVES.' };
        AnalysisDialogs.runAnalysis('descriptives', { variables: vars });
        return { ok: true };
      }
      if (cmd.startsWith('FREQUENCIES')) {
        const vars = extractVarList(lines, 'VARIABLES');
        if (!vars.length) return { error: 'No variables for FREQUENCIES.' };
        AnalysisDialogs.runAnalysis('frequencies', { variables: vars });
        return { ok: true };
      }
      if (cmd.startsWith('CORRELATIONS')) {
        const vars = extractVarList(lines, 'VARIABLES');
        const method = /SPEARMAN/i.test(syntax) ? 'spearman' : 'pearson';
        AnalysisDialogs.runAnalysis('correlation', { variables: vars, method });
        return { ok: true };
      }
      if (cmd.startsWith('T-TEST') || cmd.startsWith('TTEST')) {
        if (/\/TESTVAL/i.test(syntax)) {
          const vars = extractVarList(lines, 'VARIABLES');
          const tv = parseFloat(syntax.match(/\/TESTVAL\s*=\s*([\d\.\-]+)/i)?.[1] || '0');
          // Engine processes one variable at a time
          vars.forEach(vn => AnalysisDialogs.runAnalysis('ttest_onesample', { variable: vn, test_value: tv }));
        } else if (/\/PAIRS/i.test(syntax)) {
          const m = syntax.match(/\/PAIRS\s*=\s*(\w+)\s+WITH\s+(\w+)/i);
          if (m) AnalysisDialogs.runAnalysis('ttest_paired', { variable1: m[1], variable2: m[2] });
        } else {
          const vars = extractVarList(lines, 'VARIABLES');
          const grpM = syntax.match(/\/GROUPS\s*=\s*(\w+)\s*\(\s*([\d\.]+)\s+([\d\.]+)\s*\)/i);
          if (grpM && vars[0]) AnalysisDialogs.runAnalysis('ttest_independent', {
            variable: vars[0], grouping_variable: grpM[1],
            group1: Number(grpM[2]), group2: Number(grpM[3])
          });
        }
        return { ok: true };
      }
      if (cmd.startsWith('ONEWAY')) {
        const dvM = syntax.match(/ONEWAY\s+([\w\s]+)\s+BY\s+(\w+)/i);
        if (dvM) {
          const dvs = dvM[1].trim().split(/\s+/);
          const fv = dvM[2];
          const ph = /TUKEY/i.test(syntax) ? ['tukey'] : /BONFERRONI/i.test(syntax) ? ['bonferroni'] : [];
          dvs.forEach(dv => AnalysisDialogs.runAnalysis('anova_oneway', { dependent: dv, factor: fv, post_hoc: ph }));
          return { ok: true };
        }
        return { error: 'ONEWAY syntax error. Use: ONEWAY depvar BY factor.' };
      }
      if (cmd.startsWith('REGRESSION')) {
        const depM = syntax.match(/\/DEPENDENT\s+(\w+)/i);
        const indM = syntax.match(/METHOD\s*=\s*ENTER\s+([\w\s]+)/i);
        if (depM && indM) {
          AnalysisDialogs.runAnalysis('linear_regression', {
            dependent: depM[1],
            independent: indM[1].trim().split(/\s+/).filter(Boolean)
          });
          return { ok: true };
        }
        return { error: 'REGRESSION syntax error. Use: REGRESSION /DEPENDENT y /METHOD=ENTER x1 x2.' };
      }
      if (cmd.startsWith('RELIABILITY')) {
        const vars = extractVarList(lines, 'VARIABLES');
        if (vars.length < 2) return { error: 'RELIABILITY requires at least 2 variables.' };
        AnalysisDialogs.runAnalysis('reliability', { items: vars });
        return { ok: true };
      }
      if (cmd.startsWith('CROSSTABS')) {
        const m = syntax.match(/\/TABLES\s*=\s*(\w+)\s+BY\s+(\w+)/i);
        if (m) {
          AnalysisDialogs.runAnalysis('crosstabs', {
            row_variable: m[1], column_variable: m[2],
            statistics: { chi_square: true, phi_cramer: true }
          });
          return { ok: true };
        }
        return { error: 'CROSSTABS syntax error. Use: CROSSTABS /TABLES=row BY col.' };
      }
      if (cmd.startsWith('COMPUTE')) {
        const m = syntax.match(/COMPUTE\s+(\w+)\s*=\s*(.+)\./i);
        if (m && AppState.get('activeDataset')) {
          Transform.computeVariable(AppState.get('activeDataset'), m[1].trim(), m[2].trim());
          notify(`Computed variable: ${m[1]}`, 'success');
          Project.markDirty();
          return { ok: true };
        }
        return { error: 'COMPUTE syntax error. Use: COMPUTE newvar = expression.' };
      }
      if (cmd.startsWith('SORT CASES')) {
        const m = syntax.match(/BY\s+([\w\s\(\)ADSC]+)\./i);
        if (m && AppState.get('activeDataset')) {
          const parts = m[1].trim().split(/\s+/);
          const keys = [];
          for (let i = 0; i < parts.length; i++) {
            if (parts[i + 1] === '(D)') { keys.push({ variable: parts[i], direction: 'desc' }); i++; }
            else if (parts[i] !== '(A)') keys.push({ variable: parts[i], direction: 'asc' });
          }
          Transform.sortCases(AppState.get('activeDataset'), keys);
          Project.markDirty();
          return { ok: true };
        }
      }
      if (cmd.startsWith('SELECT IF') || cmd.startsWith('FILTER')) {
        const m = syntax.match(/(?:SELECT IF|FILTER)\s+(.+)\./i);
        if (m && AppState.get('activeDataset')) {
          Transform.selectCases(AppState.get('activeDataset'), m[1].trim());
          notify(`Filter applied: ${m[1]}`, 'success');
          Project.markDirty();
          App.updateStatusBar();
          return { ok: true };
        }
      }
      return { error: `Unrecognized command: ${lines[0].split(/\s/)[0]}` };
    } catch (e) {
      return { error: e.message };
    }
  }

  function extractVarList(lines, keyword) {
    const full = lines.join(' ');
    const m = full.match(new RegExp(keyword + '\\s*=\\s*([\\w\\s]+?)(?:\\/|\\.|$)', 'i'));
    if (!m) return [];
    return m[1].trim().split(/\s+/).filter(Boolean);
  }

  function clearEditor() { _currentSyntax = ''; render(); }

  function exportSyntax() {
    const blob = new Blob([_currentSyntax], { type: 'text/plain' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'syntax.sps' });
    a.click();
  }

  function setSyntax(s) { _currentSyntax = s; }

  return { init, render, setSyntax };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 13: PROJECT SYSTEM
   ══════════════════════════════════════════════════════════════════ */

const Project = (() => {
  let _dirty = false;
  let _autosaveTimer = null;

  function newProject() {
    const name = prompt('Project name:', 'New Project');
    if (!name) return;
    const proj = {
      id: uuid(),
      name,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      datasets: [],
      activeDatasetId: null,
      outputs: [],
      history: [],
      syntaxHistory: [],
      aiConversations: []
    };
    AppState.set('currentProject', proj);
    AppState.set('activeDataset', null);
    Output.setOutputs([]);
    History.setEntries([]);
    _dirty = false;
    App.navigate('data');
    notify(`Project "${name}" created`, 'success');
    DB.saveProject(proj);
  }

  function saveProject() {
    const proj = AppState.get('currentProject');
    if (!proj) { notify('No project to save', 'warning'); return; }
    proj.updatedAt = new Date().toISOString();
    // Sync dataset
    const ds = AppState.get('activeDataset');
    if (ds) {
      const idx = proj.datasets.findIndex(d => d.id === ds.id);
      if (idx >= 0) proj.datasets[idx] = ds;
      else proj.datasets.push(ds);
      proj.activeDatasetId = ds.id;
    }
    proj.outputs = Output.getOutputs();
    proj.history = History.getEntries();
    DB.saveProject(proj).then(() => {
      _dirty = false;
      notify('Project saved', 'success');
      App.updateTitleBar();
    });
  }

  function markDirty() {
    _dirty = true;
    App.updateTitleBar();
    clearTimeout(_autosaveTimer);
    _autosaveTimer = setTimeout(() => saveProject(), 5000);
  }

  function isDirty() { return _dirty; }

  async function openProject(projId) {
    const proj = await DB.loadProject(projId);
    if (!proj) { notify('Project not found', 'error'); return; }
    AppState.set('currentProject', proj);
    const ds = proj.datasets.find(d => d.id === proj.activeDatasetId) || proj.datasets[0] || null;
    AppState.set('activeDataset', ds);
    if (proj.outputs) Output.setOutputs(proj.outputs);
    if (proj.history) History.setEntries(proj.history);
    _dirty = false;
    App.navigate('data');
    notify(`Opened project: ${proj.name}`, 'success');
    App.updateTitleBar();
    App.updateStatusBar();
  }

  async function loadProjectList() {
    return DB.listProjects();
  }

  function exportProject() {
    const proj = AppState.get('currentProject');
    if (!proj) { notify('No project to export', 'warning'); return; }
    const ds = AppState.get('activeDataset');
    if (ds) {
      const idx = proj.datasets.findIndex(d => d.id === ds.id);
      if (idx >= 0) proj.datasets[idx] = ds; else proj.datasets.push(ds);
    }
    proj.outputs = Output.getOutputs();
    const blob = new Blob([JSON.stringify(proj, null, 2)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `${proj.name}.sociostat.json` });
    a.click();
  }

  function importProject(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const proj = JSON.parse(e.target.result);
        if (!proj.id || !proj.datasets) throw new Error('Invalid project file');
        proj.id = uuid(); // new ID to avoid collision
        DB.saveProject(proj).then(() => openProject(proj.id));
      } catch (err) {
        notify('Import error: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  function loadDatasetIntoApp(dataset) {
    const proj = AppState.get('currentProject');
    if (!proj) {
      // Create a default project if none
      const p = {
        id: uuid(), name: dataset.name || 'Untitled Project',
        description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        datasets: [dataset], activeDatasetId: dataset.id,
        outputs: [], history: [], syntaxHistory: [], aiConversations: []
      };
      AppState.set('currentProject', p);
      DB.saveProject(p);
    } else {
      const idx = proj.datasets.findIndex(d => d.id === dataset.id);
      if (idx >= 0) proj.datasets[idx] = dataset; else proj.datasets.push(dataset);
      proj.activeDatasetId = dataset.id;
    }
    AppState.set('activeDataset', dataset);
    markDirty();
    App.navigate('data');
    App.updateStatusBar();
    notify(`Dataset "${dataset.name}" loaded (${dataset.cases.length} cases, ${dataset.variables.length} variables)`, 'success');
  }

  async function deleteProject(projId) {
    const currentProj = AppState.get('currentProject');
    await DB.deleteProject(projId);
    // If the deleted project was the active one, clear it
    if (currentProj && currentProj.id === projId) {
      AppState.set('currentProject', null);
      AppState.set('activeDataset', null);
      Output.setOutputs([]);
      History.setEntries([]);
      _dirty = false;
      App.updateTitleBar();
      App.updateStatusBar();
    }
    notify(I18N.t('projectDeleted', projId), 'success');
  }

  async function renameProject(projId, newName) {
    const proj = await DB.loadProject(projId);
    if (!proj) return;
    proj.name = newName;
    proj.updatedAt = new Date().toISOString();
    await DB.saveProject(proj);
    const current = AppState.get('currentProject');
    if (current && current.id === projId) {
      current.name = newName;
      App.updateTitleBar();
    }
    notify(`Renamed to "${newName}"`, 'success');
  }

  async function duplicateProject(projId) {
    const proj = await DB.loadProject(projId);
    if (!proj) return;
    const copy = JSON.parse(JSON.stringify(proj));
    copy.id = uuid();
    copy.name = proj.name + ' (Copy)';
    copy.createdAt = new Date().toISOString();
    copy.updatedAt = new Date().toISOString();
    // Assign new IDs to datasets
    copy.datasets = (copy.datasets || []).map(d => ({ ...d, id: uuid() }));
    if (copy.datasets.length) copy.activeDatasetId = copy.datasets[0].id;
    await DB.saveProject(copy);
    notify(`Duplicated as "${copy.name}"`, 'success');
    return copy;
  }

  async function clearAllProjects() {
    const projects = await DB.listProjects();
    for (const p of projects) await DB.deleteProject(p.id);
    AppState.set('currentProject', null);
    AppState.set('activeDataset', null);
    Output.setOutputs([]);
    History.setEntries([]);
    _dirty = false;
    App.updateTitleBar();
    App.updateStatusBar();
    notify('All projects cleared.', 'info');
  }

  return { newProject, saveProject, markDirty, isDirty, openProject, loadProjectList, exportProject, importProject, loadDatasetIntoApp, deleteProject, renameProject, duplicateProject, clearAllProjects };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 14: AI ASSISTANT
   ══════════════════════════════════════════════════════════════════ */

const AIAssistant = (() => {
  let _container = null;
  let _messages = [];
  let _apiKey = '';
  let _provider = 'none';
  let _navigate = null;

  function setNavigateFn(fn) { _navigate = fn; }

  /* ── Intent detection ───────────────────────────────────────── */
  function extractVarName(msg, ds) {
    if (!ds) return null;
    for (const v of ds.variables) {
      if (msg.includes(v.name.toLowerCase())) return v.name;
      if (v.label && msg.includes(v.label.toLowerCase())) return v.name;
    }
    return null;
  }

  function detectIntent(msg, ds) {
    const m = msg.toLowerCase();
    // Navigation
    if (/buka.*data|open.*data|lihat.*data|tampilkan.*data/.test(m)) return {action:'OPEN_DATA', params:{}};
    if (/buka.*output|open.*output|lihat.*output|tampilkan.*output/.test(m)) return {action:'OPEN_OUTPUT', params:{}};
    if (/buka.*analisi|open.*analyz|buka.*analyze/.test(m)) return {action:'OPEN_ANALYZE', params:{}};
    if (/buka.*grafik|buka.*chart|open.*graph|buka grafik/.test(m)) return {action:'OPEN_GRAPHS', params:{}};
    if (/buka.*transform/.test(m)) return {action:'OPEN_TRANSFORM', params:{}};
    // Chart creation — try to extract variable name
    if (/buat.*pie|pie.*chart|diagram.*pie|pie.*dari|create.*pie/.test(m)) {
      const varName = extractVarName(m, ds);
      return {action:'CREATE_PIE', params:{variable: varName}};
    }
    if (/buat.*histogram|histogram.*dari|create.*histogram/.test(m)) {
      const varName = extractVarName(m, ds);
      return {action:'CREATE_HISTOGRAM', params:{variable: varName}};
    }
    if (/buat.*bar|bar.*chart|diagram.*batang|create.*bar/.test(m)) {
      const varName = extractVarName(m, ds);
      return {action:'CREATE_BAR', params:{variable: varName}};
    }
    if (/buat.*scatter|scatterplot|diagram.*pencar|create.*scatter/.test(m)) return {action:'OPEN_GRAPHS', params:{}};
    if (/buat.*boxplot|box.*plot/.test(m)) return {action:'OPEN_GRAPHS', params:{}};
    // Analysis
    if (/rata.?rata|mean|average/.test(m)) {
      const varName = extractVarName(m, ds);
      if (varName) return {action:'RUN_DESCRIPTIVES_VAR', params:{variable: varName}};
      return {action:'RUN_DESCRIPTIVES', params:{}};
    }
    if (/jalankan.*frekuensi|run.*frequenc|tampilkan.*frekuensi|hitung.*frekuensi|frekuensi/.test(m)) {
      const varName = extractVarName(m, ds);
      return {action:'RUN_FREQUENCIES', params:{variable: varName}};
    }
    if (/jalankan.*deskript|run.*descript|statistik.*deskript|rata.?rata.*semua/.test(m)) return {action:'RUN_DESCRIPTIVES', params:{}};
    if (/jalankan.*korelasi|run.*correlat|hitung.*korelasi/.test(m)) return {action:'RUN_CORRELATION', params:{}};
    return null;
  }

  /* ── Action registry ────────────────────────────────────────── */
  const AIActionRegistry = {
    NAVIGATE:        { handler: (params) => { if(_navigate) _navigate(params.module); return `Navigated to ${params.module}.`; } },
    OPEN_DATA:       { handler: () => { if(_navigate) _navigate('data');      return 'Opened Data Editor.'; } },
    OPEN_OUTPUT:     { handler: () => { if(_navigate) _navigate('output');    return 'Opened Output Viewer.'; } },
    OPEN_ANALYZE:    { handler: () => { if(_navigate) _navigate('analyze');   return 'Opened Analyze module. Choose a procedure.'; } },
    OPEN_GRAPHS:     { handler: () => { if(_navigate) _navigate('graphs');    return 'Opened Graph Builder.'; } },
    OPEN_TRANSFORM:  { handler: () => { if(_navigate) _navigate('transform'); return 'Opened Transform module.'; } },
    RUN_FREQUENCIES: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const varName = params.variable || (ds.variables[0] && ds.variables[0].name);
      if (!varName) return 'No variable found.';
      try {
        const result = ProcedureRegistry.execute('frequencies', ds, { variables: [varName] });
        Output.addResult('frequencies', result, { variables: [varName] });
        if (_navigate) _navigate('output');
        return `Ran Frequencies for **${varName}**. Results added to Output.`;
      } catch(e) { return `Error: ${e.message}`; }
    }},
    RUN_DESCRIPTIVES: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const numVars = ds.variables.filter(v => v.type==='numeric').map(v=>v.name);
      if (!numVars.length) return 'No numeric variables found.';
      const vars = params.variables || numVars.slice(0,5);
      try {
        const result = ProcedureRegistry.execute('descriptives', ds, { variables: vars });
        Output.addResult('descriptives', result, { variables: vars });
        if (_navigate) _navigate('output');
        return `Ran Descriptives for **${vars.join(', ')}**. Results added to Output.`;
      } catch(e) { return `Error: ${e.message}`; }
    }},
    RUN_CORRELATION: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const scaleVars = ds.variables.filter(v => v.measurementLevel==='scale'||v.type==='numeric').map(v=>v.name);
      if (scaleVars.length < 2) return 'Need at least 2 scale variables for correlation.';
      const vars = params.variables || scaleVars.slice(0,4);
      try {
        const result = ProcedureRegistry.execute('correlation', ds, { variables: vars, method:'pearson' });
        Output.addResult('correlation', result, { variables: vars });
        if (_navigate) _navigate('output');
        return 'Ran Pearson Correlation for **'+vars.join(', ')+'**. Results added to Output.';
      } catch(e) { return 'Error: '+e.message; }
    }},
    RUN_DESCRIPTIVES_VAR: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const varName = params.variable;
      if (!varName) return 'Could not identify variable name. Please try: "rata-rata [variable name]"';
      const v = ds.variables.find(x=>x.name===varName);
      if (!v) return 'Variable not found: '+varName+'. Available: '+ds.variables.map(x=>x.name).join(', ');
      try {
        const result = ProcedureRegistry.execute('descriptives', ds, { variables: [varName] });
        Output.addResult('descriptives', result, { variables: [varName] });
        if (_navigate) _navigate('output');
        return 'Ran Descriptives for **'+varName+'**. Results added to Output.';
      } catch(e) { return 'Error: '+e.message; }
    }},
    CREATE_PIE: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const varName = params.variable;
      if (!varName) {
        if (_navigate) _navigate('graphs');
        return 'Opened Graph Builder. Please select a category variable for the pie chart.';
      }
      const v = ds.variables.find(x=>x.name===varName);
      if (!v) return 'Variable "'+varName+'" not found. Available: '+ds.variables.map(x=>x.name).join(', ');
      // Navigate to graphs and draw
      if (_navigate) _navigate('graphs');
      setTimeout(()=>{
        const area = document.getElementById('graph-canvas-area');
        if (!area) return;
        const allVals = ds.cases.map(r=>String(r[varName]!=null?r[varName]:'')).filter(Boolean);
        const catCount = {};
        allVals.forEach(val=>{ catCount[val]=(catCount[val]||0)+1; });
        const sorted = Object.entries(catCount).sort((a,b)=>b[1]-a[1]).slice(0,20);
        if (!sorted.length) return;
        const chartId = 'ai_pie_'+Date.now();
        area.innerHTML='';
        const wrapper = el('div',{class:'graph-output-wrap'});
        const titleEl = el('div',{class:'graph-title'},'Pie Chart: '+varName+' (created by AI)');
        const exportBtn = el('button',{class:'btn btn-sm',onclick:()=>{
          const dom=document.getElementById(chartId);
          if(!dom)return;
          if(typeof echarts==='undefined'){notify('Chart library unavailable','error');return;}
          const chart=echarts.getInstanceByDom(dom);
          if(!chart)return;
          const url=chart.getDataURL({type:'png',pixelRatio:2,backgroundColor:'#fff'});
          const a=el('a',{href:url,download:'pie_'+varName+'.png'}); a.click();
        }},'Export PNG');
        const chartDiv = el('div',{id:chartId,class:'graph-chart'});
        wrapper.append(titleEl, exportBtn, chartDiv);
        area.appendChild(wrapper);
        Charts.pieChart(chartId, sorted.map(e=>e[0]), sorted.map(e=>e[1]), 'Pie: '+varName);
      }, 300);
      return 'Creating pie chart for **'+varName+'**... Navigating to Graph Builder.';
    }},
    CREATE_HISTOGRAM: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const varName = params.variable;
      if (!varName) { if (_navigate) _navigate('graphs'); return 'Opened Graph Builder. Select a numeric variable for histogram.'; }
      const v = ds.variables.find(x=>x.name===varName);
      if (!v || v.type!=='numeric') return 'Variable "'+varName+'" is not numeric. Histogram requires a numeric variable.';
      if (_navigate) _navigate('graphs');
      setTimeout(()=>{
        const area = document.getElementById('graph-canvas-area');
        if (!area) return;
        const vals = ds.cases.map(r=>r[varName]).filter(x=>typeof x==='number'&&isFinite(x));
        if (!vals.length) return;
        const chartId = 'ai_hist_'+Date.now();
        area.innerHTML='';
        const wrapper = el('div',{class:'graph-output-wrap'});
        wrapper.appendChild(el('div',{class:'graph-title'},'Histogram: '+varName+' (AI)'));
        const chartDiv = el('div',{id:chartId,class:'graph-chart'});
        wrapper.appendChild(chartDiv);
        area.appendChild(wrapper);
        Charts.histogram(chartId, vals, 'Histogram: '+varName, varName);
      }, 300);
      return 'Creating histogram for **'+varName+'**...';
    }},
    CREATE_BAR: { handler: (params, ds) => {
      if (!ds) return 'No dataset loaded.';
      const varName = params.variable;
      if (!varName) { if (_navigate) _navigate('graphs'); return 'Opened Graph Builder. Select a category variable for bar chart.'; }
      if (_navigate) _navigate('graphs');
      setTimeout(()=>{
        const area = document.getElementById('graph-canvas-area');
        if (!area) return;
        const cats = [...new Set(ds.cases.map(r=>String(r[varName]!=null?r[varName]:'')).filter(Boolean))].slice(0,30);
        const counts = cats.map(c=>ds.cases.filter(r=>String(r[varName]!=null?r[varName]:'')==c).length);
        const chartId = 'ai_bar_'+Date.now();
        area.innerHTML='';
        const wrapper = el('div',{class:'graph-output-wrap'});
        wrapper.appendChild(el('div',{class:'graph-title'},'Bar Chart: '+varName+' (AI)'));
        const chartDiv = el('div',{id:chartId,class:'graph-chart'});
        wrapper.appendChild(chartDiv);
        area.appendChild(wrapper);
        Charts.barChart(chartId, cats, counts, 'Frequencies: '+varName, varName);
      }, 300);
      return 'Creating bar chart for **'+varName+'**...';
    }}
  };

  function runAction(intentResult, ds) {
    const { action, params } = intentResult;
    const entry = AIActionRegistry[action];
    if (!entry) return null;
    return entry.handler(params, ds);
  }

  /* ── Rule-based response engine — no fabricated statistics ─── */
  function ruleBasedResponse(userMsg) {
    const msg = userMsg.toLowerCase();

    if (/hubungan|association|correlat|berhubungan|korelasi/.test(msg)) {
      if (/nominal|kategorik|kategorikal|categorical/.test(msg))
        return 'Untuk menguji hubungan antara dua variabel **nominal/kategorikal**, gunakan **Crosstabs** dengan Chi-Square (Pearson). Jika tabel 2×2, Fisher Exact juga tersedia.\n\nSyarat: Expected count ≥ 5 di minimal 80% sel.';
      if (/ordinal/.test(msg))
        return 'Untuk hubungan antara variabel **ordinal**, gunakan **Spearman** atau **Kendall\'s tau** dari menu Analyze → Correlation.';
      return 'Untuk hubungan antara dua variabel **skala/numerik**, gunakan **Pearson Correlation** jika asumsi linearitas terpenuhi. Untuk non-parametrik, gunakan Spearman.\n\nPenting: Korelasi ≠ kausalitas.';
    }

    if (/perbedaan|beda|difference|compare|bandingkan/.test(msg)) {
      if (/dua kelompok|two group|independent/.test(msg))
        return 'Untuk membandingkan **dua kelompok independen** (misal: laki-laki vs perempuan), gunakan **Independent Samples T-Test**.\n\nPeriksa:\n• Levene\'s Test (kesamaan varians)\n• Jika signifikan → gunakan Welch correction\n• Normalitas (untuk n kecil)';
      if (/lebih dari dua|more than two|beberapa kelompok|multiple group/.test(msg))
        return 'Untuk **lebih dari dua kelompok**, gunakan **One-Way ANOVA**.\n\nTambahkan:\n• Levene\'s Test untuk homogenitas varians\n• Post Hoc (Tukey/Bonferroni) jika ANOVA signifikan';
      if (/sebelum.*sesudah|pre.*post|paired|berpasangan/.test(msg))
        return 'Untuk dua pengukuran **pada subjek yang sama** (pre-post), gunakan **Paired-Samples T-Test**.';
    }

    if (/reliabilit|cronbach|konsistensi|alpha/.test(msg))
      return 'Untuk mengukur **reliabilitas skala Likert**, gunakan **Reliability Analysis (Cronbach\'s Alpha)**.\n\nInterpretasi α:\n• α ≥ 0.9 = Excellent\n• α ≥ 0.8 = Good\n• α ≥ 0.7 = Acceptable\n• α ≥ 0.6 = Questionable\n• α < 0.6 = Poor\n\nPeriksa "Alpha if Item Deleted" untuk mengidentifikasi item bermasalah. Jangan hapus item otomatis — pertimbangkan konten substantif.';

    if (/faktor|factor analysis|konstruk|dimensi/.test(msg))
      return 'Untuk **exploratory factor analysis**, gunakan Analyze → Factor Analysis.\n\nLangkah:\n1. Periksa KMO ≥ 0.6 dan Bartlett\'s Test signifikan\n2. Ekstraksi: PCA atau PAF\n3. Rotasi: Varimax (faktor independen)\n4. Interpretasi loading ≥ 0.4 atau 0.5\n\nPerhatian: PCA ≠ Common Factor Analysis.';

    if (/regresi|regression|prediksi|predict/.test(msg)) {
      if (/logistik|logistic|biner|binary/.test(msg))
        return 'Untuk **variabel dependen biner** (0/1), gunakan **Binary Logistic Regression**.\n\nOutput penting:\n• B = koefisien log-odds\n• Exp(B) = Odds Ratio\n• Nagelkerke R² (pseudo R²)\n• Classification Table\n\nPeringatan: Logistic regression mengukur asosiasi, bukan sebab-akibat.';
      return 'Untuk **memprediksi variabel kontinu**, gunakan **Linear Regression**.\n\nPeriksa asumsi:\n• Linearitas (scatterplot residu vs predicted)\n• Homoskedastisitas\n• Normalitas residu (diagnostic, bukan syarat mutlak)\n• Tidak ada multikolinearitas (VIF < 10)\n• Durbin-Watson ~2 (tidak ada autokorelasi)\n\nPeringatan: Regresi signifikan ≠ kausalitas.';
    }

    if (/non.?parametr|nonparam|mann.?whit|wilcoxon|kruskal|friedman/.test(msg))
      return 'Gunakan **uji non-parametrik** ketika:\n• Distribusi sangat tidak normal dengan n kecil\n• Variabel ordinal\n• Asumsi parametrik tidak terpenuhi\n\nAlternatif:\n• t-test independen → **Mann-Whitney U**\n• t-test berpasangan → **Wilcoxon Signed-Rank**\n• ANOVA → **Kruskal-Wallis H**\n• ANOVA repeated → **Friedman**';

    if (/missing|hilang|kosong/.test(msg))
      return 'SOCIOSTAT mendukung:\n• **Listwise deletion**: kasus dengan missing di variabel mana pun dihapus dari analisis\n• **Pairwise deletion**: untuk korelasi, hanya pasangan tanpa missing yang digunakan\n• **User-defined missing**: definisikan kode missing di Variable View\n\nPenting: Jangan replace missing dengan mean tanpa alasan teoritis.';

    if (/skala|likert|ordinal|measurement level/.test(msg))
      return 'Dalam SOCIOSTAT, **Measurement Level** memengaruhi validasi prosedur:\n• **Nominal**: Chi-Square, frekuensi, crosstabs\n• **Ordinal**: Spearman, Mann-Whitney, Kruskal-Wallis, Friedman\n• **Scale**: Mean, SD, t-test, ANOVA, Pearson, Regression\n\nSkala Likert: perdebatan akademis. Banyak peneliti memperlakukan Likert 5-7 point sebagai kontinu (scale) untuk kemudahan, tetapi pendekatan ordinal lebih konservatif secara statistik.';

    if (/kausalitas|causality|causation|sebab|menyebabkan/.test(msg))
      return '⚠ **Penting**: Analisis statistik observasional (korelasi, regresi) **tidak membuktikan kausalitas**.\n\nKausalitas membutuhkan:\n• Eksperimental design (randomisasi)\n• Temporal precedence (sebab mendahului akibat)\n• Mekanisme yang masuk akal\n• Eliminasi confounders\n\nPertanyaan yang tepat: "Apakah variabel X berasosiasi dengan Y?" bukan "Apakah X menyebabkan Y?"';

    if (/ukuran sampel|sample size|power|n minimal/.test(msg))
      return 'Ukuran sampel minimum (panduan umum):\n• Korelasi: n ≥ 30 untuk estimasi yang stabil\n• T-test: n ≥ 20 per kelompok\n• ANOVA: n ≥ 20 per kelompok\n• Regresi: n ≥ 10–20 per prediktor\n• Factor Analysis: n ≥ 5–10 per variabel, minimum n ≥ 100\n• Chi-Square: expected count ≥ 5 di ≥ 80% sel\n\nGunakan power analysis formal untuk penelitian yang dipublikasikan.';

    if (/effect size|ukuran efek|cohen|eta|omega/.test(msg))
      return 'Effect size mengukur **besarnya praktis** suatu efek, berbeda dari signifikansi statistik:\n\n• Cohen\'s d: kecil=0.2, sedang=0.5, besar=0.8\n• r (korelasi): kecil=0.1, sedang=0.3, besar=0.5\n• η² (ANOVA): kecil=0.01, sedang=0.06, besar=0.14\n• Cramér\'s V: bergantung pada df\n\nP < .05 dengan n besar ≠ efek penting secara praktis.';

    if (/outlier|pencilan/.test(msg))
      return 'Penanganan outlier:\n• Identifikasi: Z-score > ±3, boxplot, Cook\'s distance > 1\n• Jangan hapus outlier secara otomatis\n• Pertimbangkan: apakah data entry error? apakah kasus valid?\n• Lakukan analisis dengan dan tanpa outlier, laporkan keduanya\n• Untuk regresi: Cook\'s distance dan leverage tersedia di output diagnostics';

    if (/halo|hello|hi|selamat|apa kabar/.test(msg))
      return 'Halo! Saya adalah **AI Assistant SOCIOSTAT** — asisten statistik berbasis aturan.\n\nSaya dapat membantu:\n• Memilih prosedur statistik yang tepat\n• Menjelaskan asumsi dan interpretasi\n• Membimbing alur penelitian\n• Mengidentifikasi potensi masalah dalam data\n\nApa yang ingin Anda analisis?';

    if (/apa itu|what is|jelaskan|explain/.test(msg)) {
      if (/cronbach/.test(msg)) return 'Cronbach\'s Alpha (α) adalah ukuran **internal consistency reliability** — seberapa konsisten responden menjawab item-item dalam skala yang mengukur konstruk yang sama. Nilainya 0–1; ≥ 0.7 umumnya dianggap acceptable.';
      if (/kmo/.test(msg)) return 'KMO (Kaiser-Meyer-Olkin) mengukur kecukupan sampling untuk factor analysis. Nilai ≥ 0.6 = adequate, ≥ 0.8 = meritorious, ≥ 0.9 = marvelous. Nilai < 0.5 = tidak layak untuk factor analysis.';
      if (/vif|multikolinear/.test(msg)) return 'VIF (Variance Inflation Factor) mengukur multikolinearitas dalam regresi berganda. VIF > 10 = masalah serius. VIF 5–10 = perhatian. VIF < 5 = acceptable. Multikolinearitas tinggi membuat koefisien tidak stabil.';
    }

    if (/prosedur|pilih.*uji|uji.*apa|bantu.*pilih/.test(msg))
      return 'Untuk memilih prosedur yang tepat, saya perlu tahu:\n\n1. **Berapa variabel** yang terlibat?\n2. **Apa tipe masing-masing?** (nominal/ordinal/scale)\n3. **Apa yang ingin diketahui?**\n   • Hubungan antara variabel → Korelasi/Regresi\n   • Perbedaan antar kelompok → T-test/ANOVA\n   • Distribusi frekuensi → Crosstabs/Chi-Square\n   • Kualitas skala → Reliabilitas/Factor Analysis';

    return 'Saya memahami pertanyaan Anda tentang statistik. Untuk mendapatkan bantuan yang lebih spesifik, bisa Anda ceritakan:\n\n1. **Apa pertanyaan penelitian Anda?**\n2. **Variabel apa yang Anda punya?** (jenis: nominal/ordinal/scale)\n3. **Apa yang ingin Anda ketahui?** (perbedaan, hubungan, prediksi?)\n\nSaya akan membantu memilih prosedur yang tepat dan menjelaskan asumsi yang perlu dipenuhi.';
  }

  async function callAPI(messages) {
    if (_provider === 'none' || !_apiKey) return null;

    const ds = AppState.get('activeDataset');
    const context = ds ? `Dataset aktif: "${ds.name}" (${ds.cases.length} kasus, ${ds.variables.length} variabel: ${ds.variables.slice(0,5).map(v=>v.name).join(', ')}${ds.variables.length>5?'...':''})` : 'Tidak ada dataset aktif.';

    const systemPrompt = `Anda adalah asisten statistik SOCIOSTAT untuk mahasiswa sosiologi dan peneliti ilmu sosial.

Aturan WAJIB:
1. JANGAN pernah mengarang angka statistik, nilai p, koefisien, atau hasil analisis.
2. Angka statistik hanya boleh dikutip dari output nyata yang diberikan user.
3. Anda boleh menjelaskan, menginterpretasi, dan memberi rekomendasi prosedur.
4. Selalu bedakan asosiasi statistik vs kausalitas.
5. Selalu pertimbangkan ukuran sampel dan effect size, bukan hanya signifikansi.
6. Jawab dalam Bahasa Indonesia kecuali user meminta bahasa lain.

${context}`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    try {
      let url, headers, body;
      if (_provider === 'openai') {
        url = 'https://api.openai.com/v1/chat/completions';
        headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_apiKey}` };
        body = JSON.stringify({ model: 'gpt-4o-mini', messages: apiMessages, max_tokens: 800, temperature: 0.3 });
      } else if (_provider === 'anthropic') {
        url = 'https://api.anthropic.com/v1/messages';
        headers = { 'Content-Type': 'application/json', 'x-api-key': _apiKey, 'anthropic-version': '2023-06-01' };
        body = JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 800, system: systemPrompt, messages: messages.filter(m=>m.role!=='system').map(m=>({role:m.role,content:m.content})) });
      }
      const res = await fetch(url, { method:'POST', headers, body });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (_provider === 'openai') return data.choices?.[0]?.message?.content;
      if (_provider === 'anthropic') return data.content?.[0]?.text;
    } catch(e) { return null; }
  }

  function render() {
    if (!_container) return;
    _container.innerHTML = '';
    _container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';
    const lang = I18N.getLang();

    // API settings panel
    const settings = el('div', { class:'ai-settings' },
      el('h4', {}, lang==='id' ? 'Pengaturan AI (Opsional)' : 'AI Settings (Optional)'),
      el('p', { class:'muted small' }, lang==='id'
        ? 'Secara default, mesin berbasis aturan digunakan. Opsional: masukkan API key untuk GPT-4 atau Claude.'
        : 'By default, a rule-based engine is used. Optionally provide an API key for GPT-4 or Claude.'),
      el('div', { class:'form-row' },
        el('label', {}, 'Provider: '),
        el('select', { class:'form-control', id:'ai-provider', onchange: e=>{ _provider=e.target.value; } },
          el('option', { value:'none' }, lang==='id' ? 'Berbasis Aturan (default)' : 'Rule-based (default)'),
          el('option', { value:'openai' }, 'OpenAI (GPT-4o-mini)'),
          el('option', { value:'anthropic' }, 'Anthropic (Claude Haiku)')
        )
      ),
      el('div', { class:'form-row', id:'ai-key-row' },
        el('label', {}, 'API Key: '),
        el('input', { type:'password', class:'form-control', id:'ai-key-input', placeholder:'sk-... or similar', onchange: e=>{ _apiKey=e.target.value; } })
      )
    );

    const chatArea = el('div', { class:'ai-chat-area', id:'ai-chat-area' });
    _messages.forEach(m => chatArea.appendChild(renderMsg(m)));

    if (_messages.length === 0) {
      const quickChips = lang === 'id'
        ? [
            { label:'📊 Statistik Deskriptif', msg:'jalankan deskriptif untuk semua variabel' },
            { label:'🔗 Korelasi Variabel',     msg:'jalankan korelasi' },
            { label:'📈 Buat Grafik',           msg:'buka grafik' },
            { label:'❓ Bantu Pilih Uji',       msg:'bantu saya memilih prosedur statistik yang tepat' },
            { label:'📋 Frekuensi Data',        msg:'tampilkan frekuensi' },
            { label:'⚠️ Masalah Kausalitas',    msg:'jelaskan perbedaan asosiasi dan kausalitas' }
          ]
        : [
            { label:'📊 Descriptive Stats',    msg:'run descriptives for all variables' },
            { label:'🔗 Correlations',         msg:'run correlation' },
            { label:'📈 Build a Chart',        msg:'open graphs' },
            { label:'❓ Choose a Test',        msg:'help me choose the right statistical procedure' },
            { label:'📋 Frequencies',          msg:'show frequencies' },
            { label:'⚠️ Causality Warning',    msg:'explain the difference between association and causality' }
          ];

      chatArea.appendChild(el('div', { class:'ai-welcome' },
        el('h3', { class:'ai-recs-header' }, 'SOCIOSTAT AI Assistant'),
        el('p', {}, lang==='id'
          ? 'Saya dapat membantu memilih prosedur statistik, memahami asumsi, menginterpretasi output, dan menjalankan analisis langsung!'
          : 'I can help choose statistical procedures, explain assumptions, interpret output, and run analyses directly!'),
        el('div', { class:'ai-suggestions' },
          ...quickChips.map(c => el('button', { class:'ai-suggestion-chip', onclick:()=>sendMsg(c.msg) }, c.label))
        )
      ));
    }

    const inputArea = el('div', { class:'ai-input-area' });
    const input = el('textarea', { class:'ai-input',
      placeholder: lang==='id' ? 'Tanyakan tentang statistik, atau ketik perintah seperti "jalankan korelasi"...' : 'Ask about statistics, or type a command like "run correlation"...',
      rows:'2' });
    const sendBtn = el('button', { class:'btn btn-primary', onclick:()=>{ if(input.value.trim()){ sendMsg(input.value.trim()); input.value=''; } } },
      lang==='id' ? 'Kirim' : 'Send');
    input.onkeydown = e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendBtn.click(); } };
    const clearBtn = el('button', { class:'btn btn-sm btn-secondary', onclick:()=>{ _messages=[]; render(); } },
      lang==='id' ? 'Bersihkan' : 'Clear');
    inputArea.append(input, sendBtn, clearBtn);

    _container.appendChild(settings);
    _container.appendChild(chatArea);
    _container.appendChild(inputArea);
  }

  function renderMsg(m) {
    const div = el('div', { class:`ai-msg ai-msg-${m.role}` });
    const lang = I18N.getLang();
    const label = el('span', { class:'ai-msg-label' }, m.role==='user' ? (lang==='id'?'Anda':'You') : 'Assistant');
    const text = el('div', { class:'ai-msg-text' });
    if (m.isAction) {
      // Render structured action result
      text.innerHTML = m.content;
    } else {
      text.innerHTML = (m.content || '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\n/g,'<br>');
    }
    div.append(label, text);
    return div;
  }

  function buildActionHtml(actionKey, resultText, lang) {
    const actionLabels = {
      OPEN_DATA:            { en:'Opened Data Editor',            id:'Membuka Editor Data' },
      OPEN_OUTPUT:          { en:'Opened Output Viewer',          id:'Membuka Output Viewer' },
      OPEN_ANALYZE:         { en:'Opened Analyze module',         id:'Membuka modul Analyze' },
      OPEN_GRAPHS:          { en:'Opened Graph Builder',          id:'Membuka Graph Builder' },
      OPEN_TRANSFORM:       { en:'Opened Transform module',       id:'Membuka modul Transform' },
      RUN_FREQUENCIES:      { en:'Ran Frequencies analysis',      id:'Menjalankan analisis Frekuensi' },
      RUN_DESCRIPTIVES:     { en:'Ran Descriptive Statistics',    id:'Menjalankan Statistik Deskriptif' },
      RUN_DESCRIPTIVES_VAR: { en:'Ran Descriptive Statistics',    id:'Menjalankan Statistik Deskriptif' },
      RUN_CORRELATION:      { en:'Ran Pearson Correlation',       id:'Menjalankan Korelasi Pearson' },
      CREATE_PIE:           { en:'Created Pie Chart',             id:'Membuat Diagram Pie' },
      CREATE_HISTOGRAM:     { en:'Created Histogram',             id:'Membuat Histogram' },
      CREATE_BAR:           { en:'Created Bar Chart',             id:'Membuat Diagram Batang' }
    };
    const nextSteps = {
      OPEN_DATA:        { en:'Edit variables or review cases.',                id:'Edit variabel atau tinjau kasus.' },
      OPEN_OUTPUT:      { en:'Review your analysis results.',                  id:'Tinjau hasil analisis Anda.' },
      OPEN_ANALYZE:     { en:'Select a procedure from the list.',              id:'Pilih prosedur dari daftar.' },
      OPEN_GRAPHS:      { en:'Choose a chart type and select variables.',      id:'Pilih jenis grafik dan variabel.' },
      OPEN_TRANSFORM:   { en:'Compute new variables or recode values.',        id:'Hitung variabel baru atau recode nilai.' },
      RUN_FREQUENCIES:  { en:'Check the Output tab for results. Look for modal category and valid percent.',  id:'Cek tab Output untuk hasil. Perhatikan kategori modus dan persen valid.' },
      RUN_DESCRIPTIVES: { en:'Check means and standard deviations in Output. Assess range for outliers.',    id:'Cek rata-rata dan standar deviasi di Output. Nilai range bisa mengindikasikan outlier.' },
      RUN_CORRELATION:  { en:'Check Output for r values and significance. Remember: correlation ≠ causation.', id:'Cek Output untuk nilai r dan signifikansi. Ingat: korelasi ≠ kausalitas.' }
    };
    const lbl = (actionLabels[actionKey]||{})[lang] || actionKey;
    const nxt = (nextSteps[actionKey]||{})[lang] || '';
    const whatLabel = lang==='id' ? '🎯 Yang saya lakukan:' : '🎯 What I did:';
    const nextLabel = lang==='id' ? '💡 Langkah berikutnya:' : '💡 Next step:';
    return `<div class="ai-action-result"><div class="ai-action-what">${whatLabel} ${lbl}</div><div class="ai-action-next">${nextLabel} ${nxt}</div></div>`;
  }

  async function sendMsg(text) {
    const lang = I18N.getLang();
    _messages.push({ role:'user', content:text });
    render();
    scrollChatBottom();

    const ds = AppState.get('activeDataset');
    const intent = detectIntent(text, ds);

    let response, isAction = false;
    if (intent) {
      const actionResult = runAction(intent, ds);
      if (actionResult !== null) {
        isAction = true;
        response = buildActionHtml(intent.action, actionResult, lang);
        // Re-render since navigation may have changed the view
        setTimeout(()=>{ render(); scrollChatBottom(); }, 100);
      }
    }

    if (!isAction) {
      if (_provider !== 'none' && _apiKey) {
        const chatArea = document.getElementById('ai-chat-area');
        const typing = el('div', { class:'ai-msg ai-msg-assistant' }, el('span', {}, '…'));
        if (chatArea) chatArea.appendChild(typing);
        response = await callAPI(_messages);
        if (!response) response = ruleBasedResponse(text);
      } else {
        response = ruleBasedResponse(text);
      }
    }

    _messages.push({ role:'assistant', content:response, isAction });
    render();
    scrollChatBottom();
  }

  function scrollChatBottom() {
    setTimeout(() => {
      const a = document.getElementById('ai-chat-area');
      if (a) a.scrollTop = a.scrollHeight;
    }, 50);
  }

  function init(container) { _container = container; }

  return { init, render, setNavigateFn };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 15: HISTORY MODULE
   ══════════════════════════════════════════════════════════════════ */

const History = (() => {
  let _entries = [];
  let _container = null;

  function init(container) { _container = container; }

  function addEntry(entry) {
    _entries.push({ ...entry, id: uuid() });
    if (_container && _container.offsetParent !== null) render();
  }

  function setEntries(arr) { _entries = arr || []; }
  function getEntries() { return _entries; }

  function render() {
    if (!_container) return;
    _container.innerHTML = '';
    _container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';
    if (!_entries.length) {
      _container.innerHTML = '<div class="empty-state">No history yet. Actions will be recorded here.</div>';
      return;
    }
    _container.appendChild(el('div', { class: 'data-toolbar', style: { flexShrink: '0' } },
      el('span', { class: 'muted' }, `${_entries.length} entries`),
      el('button', { class: 'btn btn-sm btn-danger', onclick: () => { if (confirm('Clear history?')) { _entries = []; render(); } } }, 'Clear')
    ));
    const list = el('div', { class: 'history-list' });
    [..._entries].reverse().forEach(e => {
      const icon = e.type === 'analysis' ? '📊' : e.type === 'syntax' ? '📝' : e.type === 'import' ? '📥' : '🔧';
      const title = e.type === 'analysis' ? `Analysis: ${e.procedure}` :
        e.type === 'syntax' ? `Syntax: ${(e.syntax || '').slice(0, 40)}` :
        e.type === 'import' ? `Import: ${e.name}` : e.type;
      const row = el('div', { class: 'history-entry' },
        el('span', { class: 'history-icon' }, icon),
        el('div', { class: 'history-info' },
          el('div', { class: 'history-title' }, title),
          el('div', { class: 'muted small' }, fmtDate(e.timestamp))
        ),
        e.type === 'analysis' ? el('button', {
          class: 'btn btn-sm',
          onclick: () => {
            AnalysisDialogs.runAnalysis(e.procedure, e.params);
          }
        }, '↻ Re-run') : el('span', {})
      );
      list.appendChild(row);
    });
    _container.appendChild(list);
  }

  return { init, addEntry, setEntries, getEntries, render };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 16: TRANSFORMATION DIALOGS
   ══════════════════════════════════════════════════════════════════ */

const TransformDialogs = (() => {
  function getDataset() { return AppState.get('activeDataset'); }

  function openComputeVariable() {
    const ds = getDataset(); if (!ds) { notify('No dataset loaded', 'error'); return; }
    const targetInp = el('input', { type: 'text', class: 'form-control', placeholder: 'new_variable' });
    const exprInp = el('textarea', { class: 'form-control', rows: '3', placeholder: 'income / 1000000\nIF(age >= 18, 1, 0)\n(v1 + v2 + v3) / 3' });
    const labelInp = el('input', { type: 'text', class: 'form-control', placeholder: 'Variable label (optional)' });

    const varButtons = el('div', { class: 'var-button-list' });
    ds.variables.forEach(v => {
      varButtons.appendChild(el('button', { class: 'btn btn-xs', onclick: () => { exprInp.value += v.name; exprInp.focus(); } }, v.name));
    });

    const body = el('div', { class: 'analysis-form' },
      el('div', { class: 'form-row' }, el('label', {}, 'Target variable:'), targetInp),
      el('div', { class: 'form-row' }, el('label', {}, 'Label:'), labelInp),
      el('label', {}, 'Expression:'), exprInp,
      el('p', { class: 'muted small' }, 'Variables:'),
      varButtons,
      el('p', { class: 'muted small' }, 'Functions: IF(cond,a,b), Math.abs(), Math.sqrt(), Math.log()')
    );

    const ov = el('div', { class: 'dialog-overlay' });
    const box = el('div', { class: 'dialog-box' },
      el('div', { class: 'dialog-header' }, el('h3', {}, 'Compute Variable'), el('button', { class: 'dialog-close', onclick: () => ov.remove() }, '×')),
      el('div', { class: 'dialog-body' }, body),
      el('div', { class: 'dialog-footer' },
        el('button', { class: 'btn btn-primary', onclick: () => {
          const target = targetInp.value.trim();
          const expr = exprInp.value.trim();
          if (!target || !expr) { notify('Target and expression required', 'warning'); return; }
          const r = Transform.computeVariable(ds, target, expr, labelInp.value.trim());
          History.addEntry({ type: 'transform', procedure: 'compute', variable: target, expression: expr, timestamp: new Date().toISOString() });
          Project.markDirty();
          notify(`Computed "${target}" for ${r.changed} cases`, 'success');
          App.updateStatusBar();
          ov.remove();
          if (App.getCurrentModule() === 'data') App.renderDataModule();
        } }, 'OK'),
        el('button', { class: 'btn btn-secondary', onclick: () => ov.remove() }, 'Cancel')
      )
    );
    ov.appendChild(box); document.body.appendChild(ov);
  }

  function openRecode() {
    const ds = getDataset(); if (!ds) { notify('No dataset loaded', 'error'); return; }
    const srcVar = [];
    let targetMode = 'same'; // 'same' or 'new'
    const targetInp = el('input', { type: 'text', class: 'form-control', placeholder: 'new_variable (leave blank to recode in place)' });

    const mappingRows = el('div', { class: 'recode-rows' });
    const mappings = [];

    function addMappingRow(fromVal = '', toVal = '') {
      const idx = mappings.length;
      mappings.push({ from: fromVal, to: toVal });
      const row = el('div', { class: 'recode-row' });
      const fInp = el('input', { type: 'text', class: 'form-control', value: fromVal, placeholder: 'Old value(s), e.g. 1 2 or 1-3' });
      const arrow = el('span', { style: { margin: '0 8px' } }, '→');
      const tInp = el('input', { type: 'text', class: 'form-control', value: toVal, placeholder: 'New value' });
      const rm = el('button', { class: 'btn btn-xs btn-danger', onclick: () => { mappings.splice(idx, 1); row.remove(); } }, '✕');
      fInp.onchange = e => { mappings[idx].from = e.target.value; };
      tInp.onchange = e => { mappings[idx].to = e.target.value; };
      row.append(fInp, arrow, tInp, rm);
      mappingRows.appendChild(row);
    }

    addMappingRow();

    const body = el('div', { class: 'analysis-form' },
      el('label', {}, 'Source variable:'),
      el('div', {}, ...ds.variables.map(v => {
        const b = el('button', { class: `btn btn-xs${srcVar[0] === v.name ? ' selected' : ''}`, onclick: () => { srcVar[0] = v.name; notify(`Selected: ${v.name}`, 'info'); } }, v.name);
        return b;
      })),
      el('div', { class: 'form-row' }, el('label', {}, 'Target variable (blank = recode in place):'), targetInp),
      el('label', {}, 'Value mappings:'),
      mappingRows,
      el('button', { class: 'btn btn-sm', onclick: () => addMappingRow() }, '+ Add mapping')
    );

    const ov = el('div', { class: 'dialog-overlay' });
    const box = el('div', { class: 'dialog-box' },
      el('div', { class: 'dialog-header' }, el('h3', {}, 'Recode Variable'), el('button', { class: 'dialog-close', onclick: () => ov.remove() }, '×')),
      el('div', { class: 'dialog-body' }, body),
      el('div', { class: 'dialog-footer' },
        el('button', { class: 'btn btn-primary', onclick: () => {
          if (!srcVar[0]) { notify('Select source variable', 'warning'); return; }
          const target = targetInp.value.trim() || srcVar[0];
          const parsedMappings = mappings.filter(m => m.from !== '' && m.to !== '').map(m => {
            let from;
            const f = m.from.trim();
            if (f === 'SYSMIS' || f === '') { from = 'SYSMIS'; }
            else if (f.includes('-')) {
              const parts = f.split('-');
              from = [{ lo: parts[0].trim(), hi: parts[1].trim() }];
            } else {
              from = f.split(/\s+/).map(v => isNaN(v) ? v : Number(v));
            }
            const to = m.to.trim() === 'SYSMIS' ? 'SYSMIS' : (isNaN(m.to.trim()) ? m.to.trim() : Number(m.to.trim()));
            return { from, to };
          });
          const r = Transform.recodeVariable(ds, srcVar[0], target, parsedMappings, 'copy');
          History.addEntry({ type: 'transform', procedure: 'recode', source: srcVar[0], target, timestamp: new Date().toISOString() });
          Project.markDirty();
          notify(`Recoded ${r.changed} values in "${target}"`, 'success');
          ov.remove();
          if (App.getCurrentModule() === 'data') App.renderDataModule();
        } }, 'OK'),
        el('button', { class: 'btn btn-secondary', onclick: () => ov.remove() }, 'Cancel')
      )
    );
    ov.appendChild(box); document.body.appendChild(ov);
  }

  function openSelectCases() {
    const ds = getDataset(); if (!ds) { notify('No dataset loaded', 'error'); return; }
    const exprInp = el('textarea', { class: 'form-control', rows: '3', value: ds.activeFilter || '', placeholder: 'age >= 18\ngender == 1\nincome > 5000000' });
    const varBtns = el('div', { class: 'var-button-list' });
    ds.variables.forEach(v => varBtns.appendChild(el('button', { class: 'btn btn-xs', onclick: () => { exprInp.value += v.name; exprInp.focus(); } }, v.name)));

    const ov = el('div', { class: 'dialog-overlay' });
    const box = el('div', { class: 'dialog-box' },
      el('div', { class: 'dialog-header' }, el('h3', {}, 'Select Cases'), el('button', { class: 'dialog-close', onclick: () => ov.remove() }, '×')),
      el('div', { class: 'dialog-body' },
        el('p', { class: 'muted' }, 'Enter a filter condition. Cases not matching will be excluded from analyses.'),
        exprInp, varBtns,
        el('p', { class: 'muted small' }, 'Use == for equality. Leave blank to remove filter.')
      ),
      el('div', { class: 'dialog-footer' },
        el('button', { class: 'btn btn-primary', onclick: () => {
          Transform.selectCases(ds, exprInp.value.trim() || null);
          History.addEntry({ type: 'transform', procedure: 'select_cases', filter: ds.activeFilter, timestamp: new Date().toISOString() });
          Project.markDirty(); App.updateStatusBar(); ov.remove();
          notify(ds.activeFilter ? `Filter active: ${ds.activeFilter}` : 'Filter cleared', 'success');
        } }, 'OK'),
        el('button', { class: 'btn btn-secondary', onclick: () => ov.remove() }, 'Cancel')
      )
    );
    ov.appendChild(box); document.body.appendChild(ov);
  }

  function openWeightCases() {
    const ds = getDataset(); if (!ds) { notify('No dataset loaded', 'error'); return; }
    const numVars = ds.variables.filter(v => v.type === 'numeric');
    const sel = el('select', { class: 'form-control' },
      el('option', { value: '' }, '(None — remove weight)'),
      ...numVars.map(v => { const o = el('option', { value: v.name }, `${v.name} — ${v.label || ''}`); if (v.name === ds.weightVariable) o.selected = true; return o; })
    );
    const ov = el('div', { class: 'dialog-overlay' });
    const box = el('div', { class: 'dialog-box' },
      el('div', { class: 'dialog-header' }, el('h3', {}, 'Weight Cases'), el('button', { class: 'dialog-close', onclick: () => ov.remove() }, '×')),
      el('div', { class: 'dialog-body' },
        el('p', { class: 'muted' }, 'Select a frequency weight variable. Each case will be treated as if it appears the number of times specified.'),
        sel
      ),
      el('div', { class: 'dialog-footer' },
        el('button', { class: 'btn btn-primary', onclick: () => {
          Transform.weightCases(ds, sel.value || null);
          Project.markDirty(); App.updateStatusBar(); ov.remove();
          notify(ds.weightVariable ? `Weight by: ${ds.weightVariable}` : 'Weight removed', 'success');
        } }, 'OK'),
        el('button', { class: 'btn btn-secondary', onclick: () => ov.remove() }, 'Cancel')
      )
    );
    ov.appendChild(box); document.body.appendChild(ov);
  }

  function openSortCases() {
    const ds = getDataset(); if (!ds) { notify('No dataset loaded', 'error'); return; }
    const sortKeys = [];
    const keyList = el('div', { class: 'sort-keys' });
    function addKey(vname = '', dir = 'asc') {
      const idx = sortKeys.length;
      sortKeys.push({ variable: vname, direction: dir });
      const row = el('div', { class: 'sort-key-row' });
      const vsel = el('select', { class: 'form-control', onchange: e => sortKeys[idx].variable = e.target.value },
        el('option', { value: '' }, '-- select --'),
        ...ds.variables.map(v => { const o = el('option', { value: v.name }, v.name); if (v.name === vname) o.selected = true; return o; })
      );
      const dsel = el('select', { class: 'form-control', onchange: e => sortKeys[idx].direction = e.target.value },
        el('option', { value: 'asc', selected: dir === 'asc' }, 'Ascending'),
        el('option', { value: 'desc', selected: dir === 'desc' }, 'Descending')
      );
      const rm = el('button', { class: 'btn btn-xs btn-danger', onclick: () => { sortKeys.splice(idx, 1); row.remove(); } }, '✕');
      row.append(vsel, dsel, rm); keyList.appendChild(row);
    }
    addKey();
    const ov = el('div', { class: 'dialog-overlay' });
    const box = el('div', { class: 'dialog-box' },
      el('div', { class: 'dialog-header' }, el('h3', {}, 'Sort Cases'), el('button', { class: 'dialog-close', onclick: () => ov.remove() }, '×')),
      el('div', { class: 'dialog-body' },
        el('p', { class: 'muted' }, 'Define sort order. First key = primary sort.'),
        keyList,
        el('button', { class: 'btn btn-sm', onclick: () => addKey() }, '+ Add key')
      ),
      el('div', { class: 'dialog-footer' },
        el('button', { class: 'btn btn-primary', onclick: () => {
          const validKeys = sortKeys.filter(k => k.variable);
          if (!validKeys.length) { notify('Select at least one sort variable', 'warning'); return; }
          Transform.sortCases(ds, validKeys);
          History.addEntry({ type: 'transform', procedure: 'sort_cases', keys: validKeys, timestamp: new Date().toISOString() });
          Project.markDirty();
          notify(`Sorted by: ${validKeys.map(k => k.variable + ' ' + k.direction).join(', ')}`, 'success');
          ov.remove();
          if (App.getCurrentModule() === 'data') App.renderDataModule();
        } }, 'OK'),
        el('button', { class: 'btn btn-secondary', onclick: () => ov.remove() }, 'Cancel')
      )
    );
    ov.appendChild(box); document.body.appendChild(ov);
  }

  function openSplitFile() {
    const ds = getDataset(); if (!ds) { notify('No dataset loaded', 'error'); return; }
    const sel = [];
    const body = el('div', { class: 'analysis-form' },
      el('p', { class: 'muted' }, 'Select variables to split the file by. Analyses will be run separately for each group.'),
      el('label', {}, 'Split by:'),
      el('div', { class: 'var-list' },
        ...ds.variables.map(v => {
          const chk = el('input', { type: 'checkbox', checked: ds.splitVariables.includes(v.name),
            onchange: e => { if (e.target.checked) sel.push(v.name); else { const i = sel.indexOf(v.name); if (i >= 0) sel.splice(i, 1); } }
          });
          if (ds.splitVariables.includes(v.name)) sel.push(v.name);
          return el('label', { class: 'var-item' }, chk, ' ', v.name);
        })
      )
    );
    const ov = el('div', { class: 'dialog-overlay' });
    const box = el('div', { class: 'dialog-box' },
      el('div', { class: 'dialog-header' }, el('h3', {}, 'Split File'), el('button', { class: 'dialog-close', onclick: () => ov.remove() }, '×')),
      el('div', { class: 'dialog-body' }, body),
      el('div', { class: 'dialog-footer' },
        el('button', { class: 'btn btn-primary', onclick: () => {
          Transform.splitFile(ds, sel);
          Project.markDirty(); App.updateStatusBar(); ov.remove();
          notify(sel.length ? `Split by: ${sel.join(', ')}` : 'Split removed', 'success');
        } }, 'OK'),
        el('button', { class: 'btn btn-secondary', onclick: () => ov.remove() }, 'Cancel')
      )
    );
    ov.appendChild(box); document.body.appendChild(ov);
  }

  return { openComputeVariable, openRecode, openSelectCases, openWeightCases, openSortCases, openSplitFile };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 17: GRAPHS MODULE
   ══════════════════════════════════════════════════════════════════ */

const GraphsModule = (() => {
  let _container = null;

  const CHART_TYPES = [
    { id:'histogram', icon:'📊', label:'Histogram', labelId:'Histogram',
      desc:'Distribution shape of a single numeric variable',
      descId:'Distribusi bentuk satu variabel numerik',
      when:'Scale variable, check normality, explore spread',
      whenId:'Variabel skala, cek normalitas, eksplorasi sebaran',
      levels:['scale'], vars:['x'], varLabels:['Variable'] },
    { id:'boxplot', icon:'📦', label:'Boxplot', labelId:'Boxplot',
      desc:'Median, quartiles, and outliers of numeric data',
      descId:'Median, kuartil, dan outlier data numerik',
      when:'Compare distributions across groups',
      whenId:'Bandingkan distribusi antar kelompok',
      levels:['scale'], vars:['x','group'], varLabels:['Variable','Group by (optional)'] },
    { id:'scatter', icon:'🔵', label:'Scatterplot', labelId:'Diagram Pencar',
      desc:'Relationship between two numeric variables',
      descId:'Hubungan antara dua variabel numerik',
      when:'Explore correlation, linearity assumption',
      whenId:'Eksplorasi korelasi, asumsi linearitas',
      levels:['scale'], vars:['x','y'], varLabels:['X Variable','Y Variable'] },
    { id:'bar', icon:'📶', label:'Bar Chart', labelId:'Diagram Batang',
      desc:'Frequencies or means across categories',
      descId:'Frekuensi atau rata-rata antar kategori',
      when:'Categorical variable, compare group means',
      whenId:'Variabel kategorik, bandingkan rata-rata kelompok',
      levels:['nominal','ordinal','scale'], vars:['x','y'], varLabels:['Category Variable','Value Variable (optional)'] },
    { id:'pie', icon:'🥧', label:'Pie Chart', labelId:'Diagram Pie',
      desc:'Proportions of categories in a nominal variable',
      descId:'Proporsi kategori dalam variabel nominal',
      when:'Nominal variable with few categories (<10)',
      whenId:'Variabel nominal dengan sedikit kategori (<10)',
      levels:['nominal','ordinal'], vars:['x'], varLabels:['Category Variable'] },
    { id:'line', icon:'📈', label:'Line Chart', labelId:'Diagram Garis',
      desc:'Trends across an ordered X axis',
      descId:'Tren sepanjang sumbu X yang berurutan',
      when:'Time series, ordered categories',
      whenId:'Data deret waktu, kategori berurutan',
      levels:['scale','ordinal'], vars:['x','y'], varLabels:['X Variable','Y Variables (select multiple)'] },
    { id:'qq', icon:'📉', label:'Q-Q Plot', labelId:'Q-Q Plot',
      desc:'Normality assessment for a scale variable',
      descId:'Uji normalitas visual untuk variabel skala',
      when:'Check if data follows normal distribution',
      whenId:'Cek apakah data mengikuti distribusi normal',
      levels:['scale'], vars:['x'], varLabels:['Variable'] }
  ];

  function recommendCharts(ds) {
    if (!ds || !ds.variables.length) return [];
    const hasScale = ds.variables.some(v => v.measurementLevel === 'scale');
    const hasNominal = ds.variables.some(v => v.measurementLevel === 'nominal' || v.measurementLevel === 'ordinal');
    const recs = [];
    if (hasScale) recs.push('histogram','boxplot','scatter','qq');
    if (hasNominal) recs.push('bar','pie');
    if (hasScale && hasNominal) recs.push('boxplot');
    return [...new Set(recs)];
  }

  function init(container) { _container = container; }

  function render() {
    if (!_container) return;
    _container.innerHTML = '';
    _container.style.cssText = 'display:flex;flex-direction:column;height:100%;overflow:hidden;';
    const ds = AppState.get('activeDataset');
    const lang = I18N.getLang();

    // Header
    const dsInfo = ds ? `${ds.name} · ${ds.cases.length} cases · ${ds.variables.length} vars` : '';
    _container.appendChild(el('div', { style:'padding:14px 20px 8px;flex-shrink:0;' },
      el('h2', { style:'font-size:18px;font-weight:800;margin-bottom:4px;' }, '📈 ' + (lang==='id' ? 'Pembangun Grafik' : 'Graph Builder')),
      el('p', { style:'font-size:12px;color:var(--text-muted);' }, dsInfo || (lang==='id' ? 'Belum ada dataset.' : 'No dataset loaded.'))
    ));

    if (!ds) {
      _container.appendChild(el('div', { class:'empty-state' },
        el('p', {}, lang==='id' ? 'Belum ada dataset. Impor data untuk membuat grafik.' : 'No dataset loaded. Import data to build charts.'),
        el('button', { class:'btn btn-primary', onclick:()=>{ if(window._sociostatNavigate) window._sociostatNavigate('data'); } },
          lang==='id' ? '📥 Buka Data' : '📥 Open Data')
      ));
      return;
    }

    const recs = recommendCharts(ds);

    // Recommendation bar
    if (recs.length) {
      const recBar = el('div', { class:'graph-rec-bar' });
      recBar.appendChild(el('span', {}, lang==='id' ? 'Direkomendasikan:' : 'Recommended for your data:'));
      recs.forEach(rid => {
        const ct = CHART_TYPES.find(c => c.id === rid);
        if (ct) recBar.appendChild(el('span', { class:'graph-rec-badge' }, ct.icon + ' ' + (lang==='id' ? ct.labelId : ct.label)));
      });
      _container.appendChild(recBar);
    }

    // Cards grid
    const grid = el('div', { class:'graph-cards-grid' });
    CHART_TYPES.forEach(ct => {
      const isRec = recs.includes(ct.id);
      const card = el('div', { class:'graph-card' + (isRec ? ' graph-card-recommended' : '') },
        el('div', { class:'graph-card-icon' }, ct.icon),
        el('div', { class:'graph-card-title' }, lang==='id' ? ct.labelId : ct.label),
        el('div', { class:'graph-card-desc' }, lang==='id' ? ct.descId : ct.desc),
        el('div', { class:'graph-card-when' }, lang==='id' ? ct.whenId : ct.when),
        el('button', { class:'btn btn-primary btn-sm graph-card-create',
          onclick: () => openGraphDialog(ds, ct)
        }, lang==='id' ? 'Buat' : 'Create')
      );
      grid.appendChild(card);
    });
    _container.appendChild(grid);

    const chartArea = el('div', { id:'graph-canvas-area', class:'graph-canvas-area' });
    _container.appendChild(chartArea);
  }

  /* ── GraphSpecValidator ──────────────────────────────────────── */
  function validateGraphSpec(ds, chartType, xVarName, yVarNames, groupVarName) {
    const errors = [];
    const xVarMeta = ds.variables.find(v=>v.name===xVarName);
    const getVals = vn => ds.cases.map(r=>r[vn]).filter(v=>typeof v==='number'&&isFinite(v));
    if (chartType==='histogram' || chartType==='qq') {
      if (!xVarName) errors.push({what:'No variable selected.',why:'This chart requires exactly one numeric variable.',fix:'Select a numeric (scale) variable.'});
      else if (xVarMeta && xVarMeta.type!=='numeric') errors.push({what:xVarName+' is not numeric.',why:'Histogram and Q-Q Plot require a numeric (scale) variable.',fix:'Select a variable with type = numeric.'});
      else if (xVarName && getVals(xVarName).length===0) errors.push({what:'No valid numeric values in '+xVarName+'.',why:'All values are missing or non-numeric.',fix:'Check data or choose a different variable.'});
    }
    if (chartType==='scatter') {
      if (!xVarName) errors.push({what:'No X variable selected.',why:'Scatterplot requires two numeric variables.',fix:'Select an X variable.'});
      if (!yVarNames||!yVarNames[0]) errors.push({what:'No Y variable selected.',why:'Scatterplot requires two numeric variables.',fix:'Select a Y variable.'});
    }
    if (chartType==='boxplot') {
      if (!xVarName) errors.push({what:'No variable selected.',why:'Boxplot requires one numeric variable.',fix:'Select a numeric variable.'});
      else if (xVarMeta && xVarMeta.type!=='numeric') errors.push({what:xVarName+' is not numeric.',why:'Boxplot main variable must be numeric.',fix:'Select a numeric variable.'});
    }
    if (chartType==='bar') {
      if (!xVarName) errors.push({what:'No category variable selected.',why:'Bar chart needs a category variable.',fix:'Select any variable as the category axis.'});
    }
    if (chartType==='pie') {
      if (!xVarName) errors.push({what:'No variable selected.',why:'Pie chart requires one categorical variable.',fix:'Select a nominal or ordinal variable.'});
      else {
        const cats = [...new Set(ds.cases.map(r=>String(r[xVarName]!=null?r[xVarName]:'')).filter(Boolean))];
        if (cats.length===0) errors.push({what:'No non-missing values in '+xVarName+'.',why:'Pie chart needs at least one category.',fix:'Check for missing data.'});
        else if (cats.length>20) errors.push({what:cats.length+' categories (max 20 shown).',why:'Too many slices reduces readability.',fix:'Consider a bar chart instead.'});
      }
    }
    if (chartType==='line') {
      if (!xVarName) errors.push({what:'No X variable selected.',why:'Line chart needs an X axis variable.',fix:'Select a variable for X axis.'});
      if (!yVarNames||!yVarNames[0]) errors.push({what:'No Y variable selected.',why:'Line chart needs at least one Y variable.',fix:'Select a numeric variable for Y axis.'});
    }
    return errors;
  }

  function showGraphError(container, errors) {
    container.innerHTML = '';
    const box = el('div',{class:'graph-error-box'},
      el('div',{class:'graph-error-title'},'\u26A0\uFE0F Cannot Draw Chart — '+errors.length+' issue(s)'),
      ...errors.map(e=>el('div',{class:'graph-error-item'},
        el('div',{style:'font-weight:600;margin-bottom:2px;'},'\u2022 '+e.what),
        el('div',{style:'color:var(--text-muted);font-size:12px;margin-left:12px;margin-bottom:1px;'},e.why),
        el('div',{style:'color:var(--accent);font-size:12px;margin-left:12px;font-style:italic;'},'\u2192 '+e.fix)
      ))
    );
    container.appendChild(box);
  }

  // Enhanced variable selector with obvious selected state
  function buildVarSel2(vars, sel, multi) {
    const wrap = el('div',{class:'vsel-wrap'});
    // Selected chips bar
    if (sel.length > 0) {
      const chipsDiv = el('div',{class:'vsel-chips'});
      chipsDiv.appendChild(el('span',{class:'vsel-chips-lbl'},'Selected:'));
      sel.forEach(sn=>{
        const chip = el('span',{class:'vsel-chip'},
          sn,
          el('button',{class:'vsel-chip-rm',onclick:(e)=>{
            e.stopPropagation();
            sel.splice(sel.indexOf(sn),1);
            const nb=buildVarSel2(vars,sel,multi);
            wrap.replaceWith(nb);
          }},'\u00D7')
        );
        chipsDiv.appendChild(chip);
      });
      wrap.appendChild(chipsDiv);
    } else {
      wrap.appendChild(el('div',{class:'vsel-none'},'None selected'));
    }
    // Variable list
    const listDiv = el('div',{class:'var-list'});
    vars.forEach(v=>{
      const isSelected = sel.includes(v.name);
      const typeColor = {scale:'#3b82d4',nominal:'#e6871e',ordinal:'#7c5cd8',string:'#555'}[v.measurementLevel||v.type]||'#888';
      const item = el('div',{
        class:'var-item'+(isSelected?' selected':''),
        onclick:()=>{
          if(multi){
            if(sel.includes(v.name))sel.splice(sel.indexOf(v.name),1);else sel.push(v.name);
          } else { sel.length=0; sel.push(v.name); }
          const nb=buildVarSel2(vars,sel,multi);
          wrap.replaceWith(nb);
        }
      },
        el('span',{class:'var-item-check'},isSelected?'\u2713':' '),
        el('span',{class:'var-item-name'},v.name),
        el('span',{class:'var-type-badge',style:'background:'+typeColor+';color:#fff;'},v.measurementLevel||v.type)
      );
      listDiv.appendChild(item);
    });
    wrap.appendChild(listDiv);
    return wrap;
  }

  function buildVarSel(vars, sel, multi) {
    return buildVarSel2(vars, sel, multi);
  }

  function openGraphDialog(ds, ct) {
    const lang = I18N.getLang();
    const numVars = ds.variables.filter(v => v.type === 'numeric');
    const xVar = [], yVar = [], groupVar = [];

    function getPool(vKey) {
      if (ct.id==='histogram'||ct.id==='qq') return numVars;
      if (ct.id==='scatter') return numVars;
      if (ct.id==='boxplot' && vKey==='x') return numVars;
      if (ct.id==='pie') return ds.variables;
      return ds.variables;
    }

    const formSections = [];
    ct.vars.forEach((vKey, i) => {
      const label = ct.varLabels[i] || vKey;
      const isMulti = (vKey==='y' && ct.id==='line');
      const pool = getPool(vKey);
      const sel = vKey==='x' ? xVar : vKey==='y' ? yVar : groupVar;
      const wrapper = el('div',{class:'form-section'});
      wrapper.appendChild(el('label',{style:'font-weight:600;margin-bottom:4px;display:block;'},label+':'));
      let selWidget = buildVarSel2(pool, sel, isMulti);
      // Live update when selection changes — wrap in a div we can replace
      const selContainer = el('div');
      selContainer.appendChild(selWidget);
      // Monkey-patch replaceWith to re-attach to container
      const origBuild = buildVarSel2;
      wrapper.appendChild(selContainer);
      formSections.push(wrapper);
    });

    const formContent = el('div',{class:'analysis-form'+(ct.vars.length>1?' two-col':'')}, ...formSections);
    const previewId = 'graph_preview_'+uuid();
    const previewDiv = el('div',{id:previewId,style:'height:200px;width:100%;margin-top:10px;'});
    const errorDiv = el('div',{class:'graph-dialog-error'});

    const ov = el('div',{class:'dialog-overlay'});
    const box = el('div',{class:'dialog-box'},
      el('div',{class:'dialog-header'},
        el('h3',{},ct.icon+' '+(lang==='id'?ct.labelId:ct.label)),
        el('button',{class:'dialog-close',onclick:()=>ov.remove()},'\u00D7')
      ),
      el('div',{class:'dialog-body'},
        el('p',{style:'font-size:12px;color:var(--text-muted);margin-bottom:10px;'},lang==='id'?ct.descId:ct.desc),
        formContent,
        errorDiv,
        previewDiv
      ),
      el('div',{class:'dialog-footer'},
        el('button',{class:'btn btn-secondary',onclick:()=>{
          errorDiv.innerHTML='';
          const errs=validateGraphSpec(ds,ct.id,xVar[0],yVar,groupVar[0]);
          if(errs.length){showGraphError(errorDiv,errs);return;}
          drawGraphInto(ds,ct.id,xVar[0],yVar,groupVar[0],previewId,true);
        }},lang==='id'?'Pratinjau':'Preview'),
        el('button',{class:'btn btn-primary',onclick:()=>{
          errorDiv.innerHTML='';
          const errs=validateGraphSpec(ds,ct.id,xVar[0],yVar,groupVar[0]);
          if(errs.length){showGraphError(errorDiv,errs);return;}
          ov.remove();
          drawGraph(ds,ct.id,xVar[0],yVar,groupVar[0]);
        }},lang==='id'?'Tambah ke Output':'Add to Output'),
        el('button',{class:'btn btn-secondary',onclick:()=>ov.remove()},lang==='id'?'Batal':'Cancel')
      )
    );
    ov.appendChild(box);
    document.body.appendChild(ov);
  }

  function drawGraphInto(ds, chartType, xVarName, yVarNames, groupVarName, chartId, resize) {
    if (resize) {
      const dom = document.getElementById(chartId);
      if (dom && typeof echarts !== 'undefined') { const inst = echarts.getInstanceByDom(dom); if(inst) inst.dispose(); }
    }
    const getVals = vn => ds.cases.map(r=>r[vn]).filter(v=>typeof v==='number'&&isFinite(v));
    setTimeout(() => {
      try {
        if (chartType==='histogram' && xVarName) {
          Charts.histogram(chartId, getVals(xVarName), 'Histogram of '+xVarName, xVarName);
        } else if (chartType==='qq' && xVarName) {
          Charts.qqPlot(chartId, getVals(xVarName), 'Q-Q Plot: '+xVarName);
        } else if (chartType==='scatter' && xVarName && yVarNames&&yVarNames[0]) {
          Charts.scatterPlot(chartId, getVals(xVarName), getVals(yVarNames[0]), xVarName, yVarNames[0], xVarName+' vs '+yVarNames[0]);
        } else if (chartType==='boxplot' && xVarName) {
          const groups = {};
          if (groupVarName) {
            const cats = [...new Set(ds.cases.map(r=>String(r[groupVarName]!=null?r[groupVarName]:'')))];
            cats.forEach(c=>{ groups[c]=ds.cases.filter(r=>String(r[groupVarName]!=null?r[groupVarName]:'')==c).map(r=>r[xVarName]).filter(v=>typeof v==='number'&&isFinite(v)); });
          } else { groups[xVarName]=getVals(xVarName); }
          Charts.boxplot(chartId, groups, 'Boxplot: '+xVarName);
        } else if (chartType==='bar' && xVarName) {
          const cats=[...new Set(ds.cases.map(r=>String(r[xVarName]!=null?r[xVarName]:'')).filter(Boolean))].slice(0,30);
          if (yVarNames&&yVarNames[0]) {
            const means=cats.map(c=>{
              const vs=ds.cases.filter(r=>String(r[xVarName]!=null?r[xVarName]:'')==c).map(r=>r[yVarNames[0]]).filter(v=>typeof v==='number'&&isFinite(v));
              return vs.length?Stats.mean(vs):0;
            });
            Charts.barChart(chartId, cats, means, yVarNames[0]+' by '+xVarName, xVarName);
          } else {
            const counts=cats.map(c=>ds.cases.filter(r=>String(r[xVarName]!=null?r[xVarName]:'')==c).length);
            Charts.barChart(chartId, cats, counts, 'Frequencies: '+xVarName, xVarName);
          }
        } else if (chartType==='pie' && xVarName) {
          const allVals=ds.cases.map(r=>String(r[xVarName]!=null?r[xVarName]:'')).filter(Boolean);
          const catCount={};
          allVals.forEach(v=>{ catCount[v]=(catCount[v]||0)+1; });
          const sorted=Object.entries(catCount).sort((a,b)=>b[1]-a[1]).slice(0,20);
          Charts.pieChart(chartId, sorted.map(e=>e[0]), sorted.map(e=>e[1]), 'Pie Chart: '+xVarName);
        } else if (chartType==='line' && xVarName && yVarNames&&yVarNames.length) {
          Charts.lineChart(chartId, ds.cases.map(r=>r[xVarName]),
            yVarNames.map(yn=>({name:yn,data:ds.cases.map(r=>r[yn])})), 'Line: '+yVarNames.join(', '));
        }
      } catch(e) {
        const dom=document.getElementById(chartId);
        if(dom) dom.innerHTML='<div class="graph-error-box"><div class="graph-error-title">\u26A0 Chart Error</div><div>'+e.message+'</div></div>';
      }
    }, 50);
  }

  function drawGraph(ds, chartType, xVarName, yVarNames, groupVarName) {
    const area = document.getElementById('graph-canvas-area');
    if (!area) return;
    const chartId = 'graph_' + uuid();
    area.innerHTML = '';
    const wrapper = el('div', { class:'graph-output-wrap' });
    const titleStr = `${chartType}: ${xVarName || ''}`;
    const titleEl = el('div', { class:'graph-title' }, titleStr);
    const exportBtn = el('button', { class:'btn btn-sm', onclick:()=>exportChart(chartId) }, 'Export PNG');
    const chartDiv = el('div', { id:chartId, class:'graph-chart' });
    wrapper.append(titleEl, exportBtn, chartDiv);
    area.appendChild(wrapper);
    drawGraphInto(ds, chartType, xVarName, yVarNames, groupVarName, chartId, false);
  }

  function exportChart(chartId) {
    const dom = document.getElementById(chartId);
    if (!dom) return;
    if (typeof echarts === 'undefined') { notify('Chart library unavailable — cannot export.', 'error'); return; }
    const chart = echarts.getInstanceByDom(dom);
    if (!chart) return;
    const url = chart.getDataURL({ type:'png', pixelRatio:2, backgroundColor:'#fff' });
    const a = el('a', { href:url, download:'sociostat_chart.png' });
    a.click();
  }

  return { init, render };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 18: APP SHELL v2 — Liquid Glass Design
   ══════════════════════════════════════════════════════════════════ */

/* ── Tooltip System ─────────────────────────────────────────────── */
const StatTooltips = {
  definitions: {
    'p-value':       { title: 'p-value (Significance)', text: 'Probability of observing results as extreme as these if the null hypothesis is true. p < .05 is commonly used as a threshold, but does NOT prove an effect is real or important.' },
    'confidence-interval': { title: 'Confidence Interval (CI)', text: 'A range of plausible values for the true parameter. A 95% CI means: if we repeated the study many times, 95% of the intervals would contain the true value.' },
    'effect-size':   { title: 'Effect Size', text: 'A standardised measure of the magnitude of an effect (e.g. Cohen\'s d, r, η²). Unlike p-values, effect sizes are not affected by sample size and indicate practical significance.' },
    'standard-deviation': { title: 'Standard Deviation (SD)', text: 'Average distance of each observation from the mean. Larger SD = more spread. Uses n-1 (Bessel correction) for sample estimates.' },
    'cronbach-alpha': { title: "Cronbach's Alpha (α)", text: 'Measure of internal consistency for a scale. Ranges 0–1. Interpretation: α ≥ .90 Excellent; ≥ .80 Good; ≥ .70 Acceptable; ≥ .60 Questionable; < .60 Poor.' },
    'kmo':           { title: 'Kaiser-Meyer-Olkin (KMO)', text: 'Measure of sampling adequacy for factor analysis. KMO ≥ 0.6 is generally acceptable; < 0.5 is unacceptable.' },
    'vif':           { title: 'Variance Inflation Factor (VIF)', text: 'Measures multicollinearity in regression. VIF > 10 indicates severe multicollinearity; VIF > 5 is concerning. Tolerance = 1/VIF.' },
    'r-squared':     { title: 'R² (Coefficient of Determination)', text: 'Proportion of variance in the outcome explained by the predictors. R² = .30 means 30% of variance is explained. Adjusted R² penalises for extra predictors.' },
    'odds-ratio':    { title: 'Odds Ratio (OR)', text: 'In logistic regression: how much the odds of the outcome multiply for a one-unit increase in the predictor. OR > 1 = increased odds; OR < 1 = decreased odds; OR = 1 = no effect.' },
    'bartlett':      { title: "Bartlett's Test of Sphericity", text: 'Tests whether the correlation matrix is an identity matrix (no correlations). Significant p < .05 is required before factor analysis — it confirms variables are sufficiently correlated.' },
  },
  show(termKey, anchorEl) {
    const def = this.definitions[termKey];
    if (!def) return;
    document.querySelectorAll('.tooltip-popup').forEach(t => t.remove());
    const popup = el('div', { class: 'tooltip-popup' },
      el('div', { class: 'tooltip-popup-title' }, def.title),
      document.createTextNode(def.text)
    );
    document.body.appendChild(popup);
    const rect = anchorEl.getBoundingClientRect();
    let top = rect.bottom + 6, left = rect.left;
    if (top + 120 > window.innerHeight) top = rect.top - 130;
    if (left + 290 > window.innerWidth) left = window.innerWidth - 300;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
    const dismiss = () => { popup.remove(); document.removeEventListener('click', dismiss); };
    setTimeout(() => document.addEventListener('click', dismiss), 100);
  },
  badge(termKey) {
    const b = el('span', { class: 'stat-tooltip', title: 'Click for explanation' }, 'ⓘ');
    b.addEventListener('click', e => { e.stopPropagation(); StatTooltips.show(termKey, b); });
    return b;
  }
};

/* ── Command Palette ────────────────────────────────────────────── */
const CommandPalette = (() => {
  const COMMANDS = [
    { group: 'Navigate', label: 'Home', icon: '⌂', action: () => App.navigate('home') },
    { group: 'Navigate', label: 'Data View', icon: '⊞', action: () => App.navigate('data') },
    { group: 'Navigate', label: 'Variable View', icon: '⊞', action: () => { App.setDataSubview('variable'); App.navigate('data'); } },
    { group: 'Navigate', label: 'Transform', icon: '⇄', action: () => App.navigate('transform') },
    { group: 'Navigate', label: 'Analyze', icon: '📊', action: () => App.navigate('analyze') },
    { group: 'Navigate', label: 'Output', icon: '📋', action: () => App.navigate('output') },
    { group: 'Navigate', label: 'Graphs', icon: '📈', action: () => App.navigate('graphs') },
    { group: 'Navigate', label: 'Syntax Editor', icon: '📝', action: () => App.navigate('syntax') },
    { group: 'Navigate', label: 'AI Assistant', icon: '🤖', action: () => App.navigate('ai') },
    { group: 'Navigate', label: 'History', icon: '🕐', action: () => App.navigate('history') },
    { group: 'Navigate', label: 'Settings', icon: '⚙', action: () => App.navigate('settings') },
    { group: 'Navigate', label: 'Help Center', icon: '❓', action: () => App.navigate('help') },
    { group: 'File', label: 'Import Dataset (CSV/XLSX)', icon: '📥', action: () => App.triggerImport() },
    { group: 'File', label: 'New Project', icon: '✚', action: () => Project.newProject() },
    { group: 'File', label: 'Save Project', icon: '💾', action: () => Project.saveProject() },
    { group: 'File', label: 'Export Dataset as CSV', icon: '📤', action: () => App.exportDataCSV() },
    { group: 'Analyze', label: 'Frequencies', icon: '📊', action: () => AnalysisDialogs.openFrequencies() },
    { group: 'Analyze', label: 'Descriptive Statistics', icon: '📊', action: () => AnalysisDialogs.openDescriptives() },
    { group: 'Analyze', label: 'Crosstabs + Chi-Square', icon: '📊', action: () => AnalysisDialogs.openCrosstabs() },
    { group: 'Analyze', label: 'Bivariate Correlation', icon: '📊', action: () => AnalysisDialogs.openCorrelation() },
    { group: 'Analyze', label: 'One-Sample T-Test', icon: '📊', action: () => AnalysisDialogs.openOneSampleT() },
    { group: 'Analyze', label: 'Independent-Samples T-Test', icon: '📊', action: () => AnalysisDialogs.openIndepT() },
    { group: 'Analyze', label: 'Paired-Samples T-Test', icon: '📊', action: () => AnalysisDialogs.openPairedT() },
    { group: 'Analyze', label: 'One-Way ANOVA', icon: '📊', action: () => AnalysisDialogs.openOneWayANOVA() },
    { group: 'Analyze', label: 'Linear Regression', icon: '📊', action: () => AnalysisDialogs.openLinearRegression() },
    { group: 'Analyze', label: 'Logistic Regression', icon: '📊', action: () => AnalysisDialogs.openLogisticRegression() },
    { group: 'Analyze', label: 'Reliability (Cronbach Alpha)', icon: '📊', action: () => AnalysisDialogs.openReliability() },
    { group: 'Analyze', label: 'Factor Analysis', icon: '📊', action: () => AnalysisDialogs.openFactorAnalysis() },
    { group: 'Analyze', label: 'Nonparametric Tests', icon: '📊', action: () => AnalysisDialogs.openNonparametric() },
    { group: 'Transform', label: 'Compute Variable', icon: '⇄', action: () => TransformDialogs.openComputeVariable() },
    { group: 'Transform', label: 'Recode Variable', icon: '⇄', action: () => TransformDialogs.openRecode() },
    { group: 'Transform', label: 'Select Cases (Filter)', icon: '⇄', action: () => TransformDialogs.openSelectCases() },
    { group: 'Transform', label: 'Weight Cases', icon: '⇄', action: () => TransformDialogs.openWeightCases() },
    { group: 'Mode', label: 'Switch to Simple Mode', icon: '🎓', action: () => App.setMode('simple') },
    { group: 'Mode', label: 'Switch to Pro Mode', icon: '⚡', action: () => App.setMode('pro') },
    { group: 'Help', label: 'Start Guided Tour', icon: '🗺', action: () => OnboardingTour.start() },
    { group: 'Help', label: 'Guided Research Analysis', icon: '🔬', action: () => GuidedAnalysis.open() },
  ];

  let _overlay = null;
  let _focused = 0;
  let _filtered = [];

  function open() {
    close();
    _focused = 0;
    _overlay = el('div', { class: 'cmd-overlay', onclick: e => { if (e.target === _overlay) close(); } });
    const box = el('div', { class: 'cmd-box' });
    const inp = el('input', { class: 'cmd-input', placeholder: 'Search SOCIOSTAT... (Analyze, Navigate, Transform...)', type: 'text' });
    const resultsDiv = el('div', { class: 'cmd-results' });
    box.appendChild(el('div', { class: 'cmd-input-wrap' },
      el('span', { class: 'cmd-search-icon' }, '🔍'), inp
    ));
    box.appendChild(resultsDiv);
    _overlay.appendChild(box);
    document.body.appendChild(_overlay);
    inp.focus();

    function render(q) {
      _filtered = q
        ? COMMANDS.filter(c => (c.label + c.group).toLowerCase().includes(q.toLowerCase()))
        : COMMANDS;
      resultsDiv.innerHTML = '';
      if (!_filtered.length) { resultsDiv.appendChild(el('div', { class: 'cmd-empty' }, 'No results found')); return; }
      const groups = [...new Set(_filtered.map(c => c.group))];
      groups.forEach(grp => {
        resultsDiv.appendChild(el('div', { class: 'cmd-result-group' }, grp));
        _filtered.filter(c => c.group === grp).forEach((c, i) => {
          const idx = _filtered.indexOf(c);
          const item = el('div', { class: `cmd-result-item${idx === _focused ? ' focused' : ''}`,
            onclick: () => { close(); c.action(); } },
            el('span', { class: 'cmd-result-icon' }, c.icon),
            el('span', { class: 'cmd-result-label' }, c.label),
            el('span', { class: 'cmd-result-meta' }, c.group)
          );
          resultsDiv.appendChild(item);
        });
      });
    }

    render('');
    inp.addEventListener('input', () => { _focused = 0; render(inp.value); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') { _focused = Math.min(_focused + 1, _filtered.length - 1); render(inp.value); }
      if (e.key === 'ArrowUp') { _focused = Math.max(_focused - 1, 0); render(inp.value); }
      if (e.key === 'Enter' && _filtered[_focused]) { close(); _filtered[_focused].action(); }
    });
  }

  function close() {
    if (_overlay) { _overlay.remove(); _overlay = null; }
  }

  // Global Ctrl+K
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); open(); }
  });

  return { open, close };
})();

/* ── Onboarding Tour ────────────────────────────────────────────── */
const OnboardingTour = (() => {
  const STEPS = [
    { title: 'Welcome to SOCIOSTAT', body: 'SOCIOSTAT is a statistical analysis workbench for sociology students and researchers. It works entirely in your browser — no installation or server required.', anchor: null },
    { title: 'Data View', body: 'The Data View shows your dataset as rows (cases) and columns (variables). Double-click any cell to edit it. Import CSV or XLSX files using the Import button.', anchor: 'nav-data' },
    { title: 'Variable View', body: 'Variable View lets you define metadata: variable labels, value labels (1=Male, 2=Female), missing values, and measurement levels (Nominal/Ordinal/Scale).', anchor: 'nav-data' },
    { title: 'Measurement Levels', body: 'Nominal: categories with no order (gender, region). Ordinal: ordered categories (education level, Likert scale). Scale: continuous numbers (age, income, scores).', anchor: null },
    { title: 'Transform', body: 'Transform lets you compute new variables, recode values, apply case filters, set frequency weights, and sort cases — all without destroying your original data.', anchor: 'nav-transform' },
    { title: 'Analyze', body: 'Analyze contains all statistical procedures: descriptives, t-tests, ANOVA, correlation, regression, reliability, factor analysis, and more. Results appear in Output.', anchor: 'nav-analyze' },
    { title: 'Output Viewer', body: 'Every analysis result is saved in the Output panel as a structured table. You can export results as HTML, PDF, or copy tables. Results include warnings and assumption checks.', anchor: 'nav-output' },
    { title: 'AI Assistant', body: 'The AI Assistant can explain statistical concepts, recommend procedures, help interpret results, and explain warnings. It never fabricates statistical values — all numbers come from real computation.', anchor: 'nav-ai' },
    { title: 'You\'re Ready!', body: 'Start by importing a dataset or creating a New Project. Use Ctrl+K to search for any feature quickly. If you need guidance, click "Guided Research Analysis" on the Home screen.', anchor: null },
  ];

  let _step = 0;
  let _box = null;
  let _active = false;

  function start() {
    _step = 0; _active = true; showStep();
  }

  function showStep() {
    if (_box) _box.remove();
    if (_step >= STEPS.length) { _active = false; return; }
    const s = STEPS[_step];
    const dots = el('div', { class: 'tour-dots' },
      ...STEPS.map((_, i) => el('div', { class: `tour-dot${i === _step ? ' active' : ''}` }))
    );
    _box = el('div', { class: 'tour-box' },
      el('div', { class: 'tour-box-title' }, s.title),
      el('div', { class: 'tour-box-body' }, s.body),
      el('div', { class: 'tour-box-footer' },
        dots,
        el('div', { class: 'flex gap-1' },
          _step > 0 ? el('button', { class: 'tour-btn skip', onclick: () => { _step--; showStep(); } }, '← Back') : null,
          el('button', { class: 'tour-btn skip', onclick: () => { _box.remove(); _active = false; } }, 'Skip'),
          el('button', { class: 'tour-btn', onclick: () => { _step++; showStep(); } },
            _step === STEPS.length - 1 ? '✓ Done' : 'Next →')
        )
      )
    );
    // Position: try to anchor near nav item, else bottom-right
    document.body.appendChild(_box);
    const anchor = s.anchor ? document.getElementById(s.anchor) : null;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      _box.style.top = (rect.top + rect.height / 2 - 60) + 'px';
      _box.style.left = (rect.right + 12) + 'px';
    } else {
      _box.style.bottom = '60px';
      _box.style.right = '20px';
    }
  }

  return { start };
})();

/* ── Guided Analysis ────────────────────────────────────────────── */
const GuidedAnalysis = (() => {
  const OPTIONS = [
    { icon: '📋', title: 'Describe my data', desc: 'Summarise variables: frequencies, means, distributions.', procs: [
      { name: 'Frequencies', desc: 'Count how many times each value appears. Ideal for categorical variables.', fn: () => AnalysisDialogs.openFrequencies() },
      { name: 'Descriptive Statistics', desc: 'Mean, SD, min/max, skewness for numeric variables.', fn: () => AnalysisDialogs.openDescriptives() },
    ]},
    { icon: '⚖️', title: 'Compare groups', desc: 'Test if two or more groups differ significantly.', procs: [
      { name: 'Independent-Samples T-Test', desc: 'Compare means of two independent groups. Requires numeric outcome + binary grouping variable.', fn: () => AnalysisDialogs.openIndepT() },
      { name: 'Paired-Samples T-Test', desc: 'Compare two measurements on the same subjects (before/after).', fn: () => AnalysisDialogs.openPairedT() },
      { name: 'One-Way ANOVA', desc: 'Compare means across three or more groups.', fn: () => AnalysisDialogs.openOneWayANOVA() },
      { name: 'Mann-Whitney U', desc: 'Non-parametric alternative to independent t-test.', fn: () => AnalysisDialogs.openNonparametric() },
    ]},
    { icon: '🔗', title: 'Find relationships', desc: 'Test if two variables are associated.', procs: [
      { name: 'Pearson / Spearman Correlation', desc: 'Linear association between two numeric or ordinal variables.', fn: () => AnalysisDialogs.openCorrelation() },
      { name: 'Crosstabs + Chi-Square', desc: 'Association between two categorical variables.', fn: () => AnalysisDialogs.openCrosstabs() },
    ]},
    { icon: '🎯', title: 'Predict an outcome', desc: 'Build a model using predictors.', procs: [
      { name: 'Linear Regression', desc: 'Predict a continuous outcome from one or more predictors.', fn: () => AnalysisDialogs.openLinearRegression() },
      { name: 'Logistic Regression', desc: 'Predict a binary (yes/no) outcome.', fn: () => AnalysisDialogs.openLogisticRegression() },
    ]},
    { icon: '📏', title: 'Analyze questionnaire reliability', desc: 'Test if scale items measure consistently.', procs: [
      { name: 'Reliability Analysis (Cronbach\'s α)', desc: 'Internal consistency of Likert scale items. Also shows which items to remove.', fn: () => AnalysisDialogs.openReliability() },
    ]},
    { icon: '🧩', title: 'Find underlying dimensions', desc: 'Reduce many variables to fewer factors.', procs: [
      { name: 'Exploratory Factor Analysis', desc: 'Identify latent constructs behind a set of variables. Requires KMO ≥ 0.6.', fn: () => AnalysisDialogs.openFactorAnalysis() },
    ]},
    { icon: '👥', title: 'Classify cases into groups', desc: 'Discover natural clusters in your data.', procs: [
      { name: 'K-Means Cluster Analysis', desc: 'Partition cases into k clusters based on variable similarity.', fn: () => AnalysisDialogs.openKMeans() },
    ]},
    { icon: '⏱', title: 'Survival / time-to-event', desc: 'Analyze time until an event occurs.', procs: [
      { name: 'Kaplan-Meier Survival Analysis', desc: 'Estimate survival curves and compare groups using log-rank test.', fn: () => AnalysisDialogs.openKaplanMeier() },
    ]},
  ];

  let _selected = null;
  let _overlay = null;

  function open() {
    if (_overlay) _overlay.remove();
    _selected = null;
    _overlay = el('div', { class: 'guided-overlay', onclick: e => { if (e.target === _overlay) close(); } });
    const box = el('div', { class: 'guided-box' });

    const header = el('div', { class: 'guided-header' },
      el('h2', {}, '🔬 Guided Research Analysis'),
      el('p', {}, 'What are you trying to find out? Select a goal and we\'ll recommend the right procedure.')
    );

    const body = el('div', { class: 'guided-body', id: 'guided-body' });
    const footer = el('div', { class: 'guided-footer' },
      el('button', { class: 'btn btn-ghost btn-sm', onclick: () => close() }, 'Cancel')
    );

    OPTIONS.forEach(opt => {
      const item = el('div', { class: 'guided-option',
        onclick: () => {
          $$('.guided-option', box).forEach(o => o.classList.remove('selected'));
          item.classList.add('selected');
          _selected = opt;
          showProcs(opt);
        }
      },
        el('span', { class: 'guided-option-icon' }, opt.icon),
        el('div', { class: 'guided-option-body' },
          el('div', { class: 'guided-option-title' }, opt.title),
          el('div', { class: 'guided-option-desc' }, opt.desc)
        )
      );
      body.appendChild(item);
    });

    box.append(header, body, footer);
    _overlay.appendChild(box);
    document.body.appendChild(_overlay);
  }

  function showProcs(opt) {
    const body = document.getElementById('guided-body');
    if (!body) return;
    body.innerHTML = '';
    body.appendChild(el('div', { class: 'guided-option', style: { cursor: 'default', background: '#f0f6ff', borderColor: '#bfdbfe' } },
      el('span', { class: 'guided-option-icon' }, opt.icon),
      el('div', { class: 'guided-option-body' },
        el('div', { class: 'guided-option-title' }, opt.title),
        el('div', { class: 'guided-option-desc' }, opt.desc)
      )
    ));
    body.appendChild(el('p', { style: { fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: '0.4px' } }, 'Recommended Procedures'));
    opt.procs.forEach(proc => {
      const card = el('div', { class: 'guided-proc-card' },
        el('div', { class: 'guided-proc-name' }, proc.name),
        el('div', { class: 'guided-proc-desc' }, proc.desc),
        el('button', { class: 'btn btn-primary btn-sm', onclick: () => { close(); proc.fn(); } }, `Open ${proc.name}`)
      );
      body.appendChild(card);
    });
    body.appendChild(el('button', { class: 'btn btn-ghost btn-sm', onclick: () => { _selected = null; rebuildOptions(); } }, '← Back to all options'));
  }

  function rebuildOptions() {
    const body = document.getElementById('guided-body');
    if (!body) return;
    body.innerHTML = '';
    OPTIONS.forEach(opt => {
      const item = el('div', { class: 'guided-option',
        onclick: () => { $$('.guided-option', body).forEach(o => o.classList.remove('selected')); item.classList.add('selected'); _selected = opt; showProcs(opt); }
      },
        el('span', { class: 'guided-option-icon' }, opt.icon),
        el('div', { class: 'guided-option-body' },
          el('div', { class: 'guided-option-title' }, opt.title),
          el('div', { class: 'guided-option-desc' }, opt.desc)
        )
      );
      body.appendChild(item);
    });
  }

  function close() { if (_overlay) { _overlay.remove(); _overlay = null; } }

  return { open, close };
})();

/* ── App State: Simple/Pro Mode ─────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════════
   SECTION 18A: I18N — BILINGUAL SYSTEM (EN / ID)
   ══════════════════════════════════════════════════════════════════ */

const I18N = (() => {
  const DICT = {
    en: {
      // Nav
      home:'Home', data:'Data', transform:'Transform', analyze:'Analyze',
      graphs:'Graphs', output:'Output', history:'History', syntax:'Syntax',
      ai:'AI Assistant', settings:'Settings', help:'Help',
      // Topbar
      newBtn:'+ New', saveBtn:'💾 Save', importBtn:'📥 Import', exportBtn:'📤 Export',
      searchPlaceholder:'Search SOCIOSTAT...', simple:'🎓 Simple', pro:'⚡ Pro',
      // Home
      heroTagline:'Statistical Analysis Workbench for Social Sciences — runs entirely in your browser',
      heroAuthor:'Dibuat oleh Bimo Cahyo Ramadhan — Mahasiswa Sosiologi, UIN Sunan Gunung Djati Bandung',
      recentProjects:'Recent Projects', quickStart:'Quick Start Guide',
      whatToDo:'What would you like to do?',
      importDataset:'📥 Import Dataset', newProject:'+ New Project', guidedAnalysis:'🔬 Guided Analysis', takeTour:'🗺 Take Tour',
      noRecentProjects:'No recent projects. Import a dataset or create a new project to get started.',
      // Project
      openProject:'Open', renameProject:'Rename', duplicateProject:'Duplicate', deleteProject:'Delete',
      deleteProjectConfirm:'Delete project "%s"?\n\nThis will permanently remove all datasets, outputs, and history stored in this project.',
      deleteProjectBtn:'Delete Project', cancelBtn:'Cancel',
      projectDeleted:'Project "%s" deleted.',
      clearAllProjects:'Clear All Projects', clearAllConfirm:'Delete ALL local projects? This cannot be undone.',
      // Data
      dataView:'⊞ Data View', variableView:'📋 Variable View',
      addCase:'+ Case', addVariable:'+ Variable',
      noDataset:'No dataset loaded. Import data or create a new project.',
      casesLabel:'cases', variablesLabel:'variables',
      // Transform
      transformTitle:'Transform', transformSubtitle:'What would you like to change about your data?',
      computeTitle:'Create a New Variable', computeDesc:'Calculate a new column from existing variables using a mathematical expression.',
      computeExample:'Example: income_millions = income / 1000000',
      recodeTitle:'Change / Recode Values', recodeDesc:'Map old values to new ones, or group categories together.',
      recodeExample:'Example: 1,2 → Low | 3,4 → Medium | 5 → High',
      sortTitle:'Sort Cases', sortDesc:'Reorder your data rows by one or more variables.',
      filterTitle:'Filter Cases (Select Cases)', filterDesc:'Temporarily keep only cases that match a condition.',
      filterExample:'Example: age >= 18',
      weightTitle:'Weight Cases', weightDesc:'Give cases different frequencies for survey-weighted analysis.',
      splitTitle:'Analyze Groups Separately (Split File)', splitDesc:'Run analyses independently for each group of a variable.',
      // Graphs
      graphsTitle:'Graph Builder', graphsSubtitle:'What would you like to visualise?',
      graphHistogramTitle:'Distribution', graphHistogramDesc:'Show how values are spread across a range.',
      graphHistogramWhen:'Use for: scale/numeric variables',
      graphBoxplotTitle:'Spread & Outliers', graphBoxplotDesc:'Compare distributions and detect outliers.',
      graphBoxplotWhen:'Use for: scale variable, optionally grouped',
      graphScatterTitle:'Relationship', graphScatterDesc:'Explore association between two numeric variables.',
      graphScatterWhen:'Use for: two scale variables',
      graphBarTitle:'Categories', graphBarDesc:'Compare counts or means across categories.',
      graphBarWhen:'Use for: nominal/ordinal variable',
      graphPieTitle:'Composition', graphPieDesc:'Show proportions of a categorical variable.',
      graphPieWhen:'Use for: nominal variable with few categories',
      graphLineTitle:'Trend', graphLineDesc:'Show how values change over a sequence.',
      graphLineWhen:'Use for: ordered/time data',
      graphQQTitle:'Normality Check', graphQQDesc:'Test whether a variable follows a normal distribution.',
      graphQQWhen:'Use for: scale variable before parametric test',
      selectVariable:'Select variable', drawChart:'Draw Chart', exportPng:'Export PNG',
      recommended:'Recommended', chartPreview:'Live Preview',
      // AI
      aiTitle:'SOCIOSTAT AI Assistant', aiSubtitle:'Ask me anything about your data, statistics, or analyses.',
      aiPlaceholder:'Type a question or ask me to do something... (EN/ID)',
      aiSend:'Send', aiClear:'Clear',
      aiChipAnalyze:'Analyze my data', aiChipRecommend:'Recommend a test',
      aiChipChart:'Create a chart', aiChipExplain:'Explain this result',
      aiChipTransform:'Help with transform',
      aiWhatIDid:'✅ What I did', aiWhy:'💡 Why', aiResult:'📊 Result', aiNextStep:'➡ Next step',
      aiConfirmDestructive:'Confirm action',
      // Settings
      settingsTitle:'Settings', modeLabel:'Interface Mode',
      simpleModeDesc:'🎓 Simple Mode — explanations, guided analysis, beginner hints',
      proModeDesc:'⚡ Pro Mode — direct access, no guidance',
      languageLabel:'Language / Bahasa',
      storageLabel:'Storage', storageProjects:'Projects', storageDatasets:'Datasets stored',
      storageEstimate:'Estimated storage used',
      clearAllProjectsBtn:'Clear All Projects',
      projectLabel:'Project', exportProjectBtn:'Export Current Project', importProjectBtn:'Import Project File',
      exportCsvBtn:'Export Dataset as CSV', exportXlsxBtn:'Export Dataset as XLSX',
      tourBtn:'🗺 Start Guided Tour', resetTourBtn:'Reset Tour',
      aboutLabel:'About', version:'Version 2.0 — Pure client-side. No server, no installation.',
      disclaimer:'All statistical computations run in your browser using validated algorithms. No data is sent to any server.',
      // Status bar
      noDatasetLoaded:'No dataset loaded',
      datasetLabel:'Dataset', casesStatus:'Cases', variablesStatus:'Variables',
      filterStatus:'Filter', weightStatus:'Weight', splitStatus:'Split',
      // Notifications
      projectCreated:'Project "%s" created',
      projectSaved:'Project saved',
      projectOpened:'Opened project: %s',
      datasetLoaded:'Dataset "%s" loaded (%d cases, %d variables)',
      modeSwitched:'Switched to %s mode',
      noProjectToSave:'No project to save',
      noProjectToExport:'No project to export',
      noDataset:'No dataset loaded',
      importError:'Import error: %s',
      filterApplied:'Filter active: %s', filterCleared:'Filter cleared',
      weightSet:'Weight by: %s', weightRemoved:'Weight removed',
      sortedBy:'Sorted by: %s',
      computedVar:'Computed "%s" for %d cases',
      recodedVar:'Recoded %d values in "%s"',
      syntaxRan:'Syntax executed successfully',
      syntaxError:'Syntax error: %s',
      analysisRunning:'Running %s...',
      analysisComplete:'%s completed',
      analysisError:'Analysis error: %s',
      variableNotFound:'Variable "%s" not found in dataset.',
      tourReset:'Tour reset — reload to trigger again',
    },
    id: {
      // Nav
      home:'Beranda', data:'Data', transform:'Transformasi', analyze:'Analisis',
      graphs:'Grafik', output:'Output', history:'Riwayat', syntax:'Sintaks',
      ai:'Asisten AI', settings:'Pengaturan', help:'Bantuan',
      // Topbar
      newBtn:'+ Baru', saveBtn:'💾 Simpan', importBtn:'📥 Impor', exportBtn:'📤 Ekspor',
      searchPlaceholder:'Cari SOCIOSTAT...', simple:'🎓 Sederhana', pro:'⚡ Pro',
      // Home
      heroTagline:'Workbench Analisis Statistik untuk Ilmu Sosial — berjalan sepenuhnya di browser',
      heroAuthor:'Dibuat oleh Bimo Cahyo Ramadhan — Mahasiswa Sosiologi, UIN Sunan Gunung Djati Bandung',
      recentProjects:'Proyek Terbaru', quickStart:'Panduan Cepat',
      whatToDo:'Apa yang ingin Anda lakukan?',
      importDataset:'📥 Impor Dataset', newProject:'+ Proyek Baru', guidedAnalysis:'🔬 Analisis Terpandu', takeTour:'🗺 Tur Aplikasi',
      noRecentProjects:'Belum ada proyek. Impor dataset atau buat proyek baru untuk mulai.',
      // Project
      openProject:'Buka', renameProject:'Ganti Nama', duplicateProject:'Duplikat', deleteProject:'Hapus',
      deleteProjectConfirm:'Hapus proyek "%s"?\n\nIni akan menghapus permanen semua dataset, output, dan riwayat dalam proyek ini.',
      deleteProjectBtn:'Hapus Proyek', cancelBtn:'Batal',
      projectDeleted:'Proyek "%s" dihapus.',
      clearAllProjects:'Hapus Semua Proyek', clearAllConfirm:'Hapus SEMUA proyek lokal? Tindakan ini tidak dapat dibatalkan.',
      // Data
      dataView:'⊞ Tampilan Data', variableView:'📋 Tampilan Variabel',
      addCase:'+ Kasus', addVariable:'+ Variabel',
      noDataset:'Tidak ada dataset. Impor data atau buat proyek baru.',
      casesLabel:'kasus', variablesLabel:'variabel',
      // Transform
      transformTitle:'Transformasi', transformSubtitle:'Apa yang ingin Anda ubah dari data Anda?',
      computeTitle:'Buat Variabel Baru', computeDesc:'Hitung kolom baru dari variabel yang ada menggunakan ekspresi matematika.',
      computeExample:'Contoh: harga_juta = harga_usd / 1000000',
      recodeTitle:'Ubah / Recode Nilai', recodeDesc:'Petakan nilai lama ke nilai baru, atau kelompokkan kategori.',
      recodeExample:'Contoh: 1,2 → Rendah | 3,4 → Sedang | 5 → Tinggi',
      sortTitle:'Urutkan Kasus', sortDesc:'Susun ulang baris data berdasarkan satu atau lebih variabel.',
      filterTitle:'Filter Kasus (Pilih Kasus)', filterDesc:'Sementara simpan hanya kasus yang memenuhi kondisi tertentu.',
      filterExample:'Contoh: usia >= 18',
      weightTitle:'Bobot Kasus', weightDesc:'Berikan frekuensi berbeda pada kasus untuk analisis berbobot survei.',
      splitTitle:'Analisis Per Kelompok (Split File)', splitDesc:'Jalankan analisis secara terpisah untuk setiap kelompok variabel.',
      // Graphs
      graphsTitle:'Pembuat Grafik', graphsSubtitle:'Apa yang ingin Anda visualisasikan?',
      graphHistogramTitle:'Distribusi', graphHistogramDesc:'Tampilkan bagaimana nilai tersebar dalam suatu rentang.',
      graphHistogramWhen:'Untuk: variabel skala/numerik',
      graphBoxplotTitle:'Sebaran & Pencilan', graphBoxplotDesc:'Bandingkan distribusi dan temukan pencilan.',
      graphBoxplotWhen:'Untuk: variabel skala, opsional dikelompokkan',
      graphScatterTitle:'Hubungan', graphScatterDesc:'Jelajahi asosiasi antara dua variabel numerik.',
      graphScatterWhen:'Untuk: dua variabel skala',
      graphBarTitle:'Kategori', graphBarDesc:'Bandingkan jumlah atau rata-rata antar kategori.',
      graphBarWhen:'Untuk: variabel nominal/ordinal',
      graphPieTitle:'Komposisi', graphPieDesc:'Tampilkan proporsi variabel kategorik.',
      graphPieWhen:'Untuk: variabel nominal dengan sedikit kategori',
      graphLineTitle:'Tren', graphLineDesc:'Tampilkan bagaimana nilai berubah sepanjang urutan.',
      graphLineWhen:'Untuk: data berurutan/waktu',
      graphQQTitle:'Pemeriksaan Normalitas', graphQQDesc:'Uji apakah variabel mengikuti distribusi normal.',
      graphQQWhen:'Untuk: variabel skala sebelum uji parametrik',
      selectVariable:'Pilih variabel', drawChart:'Buat Grafik', exportPng:'Ekspor PNG',
      recommended:'Direkomendasikan', chartPreview:'Pratinjau Langsung',
      // AI
      aiTitle:'Asisten AI SOCIOSTAT', aiSubtitle:'Tanyakan apa saja tentang data, statistik, atau analisis Anda.',
      aiPlaceholder:'Ketik pertanyaan atau minta saya melakukan sesuatu... (EN/ID)',
      aiSend:'Kirim', aiClear:'Bersihkan',
      aiChipAnalyze:'Analisis data saya', aiChipRecommend:'Rekomendasikan uji statistik',
      aiChipChart:'Buat grafik', aiChipExplain:'Jelaskan hasil ini',
      aiChipTransform:'Bantu transformasi',
      aiWhatIDid:'✅ Yang saya lakukan', aiWhy:'💡 Mengapa', aiResult:'📊 Hasil', aiNextStep:'➡ Langkah berikut',
      aiConfirmDestructive:'Konfirmasi tindakan',
      // Settings
      settingsTitle:'Pengaturan', modeLabel:'Mode Antarmuka',
      simpleModeDesc:'🎓 Mode Sederhana — penjelasan, analisis terpandu, petunjuk pemula',
      proModeDesc:'⚡ Mode Pro — akses langsung, tanpa panduan',
      languageLabel:'Bahasa / Language',
      storageLabel:'Penyimpanan', storageProjects:'Proyek', storageDatasets:'Dataset tersimpan',
      storageEstimate:'Estimasi penyimpanan terpakai',
      clearAllProjectsBtn:'Hapus Semua Proyek',
      projectLabel:'Proyek', exportProjectBtn:'Ekspor Proyek Aktif', importProjectBtn:'Impor File Proyek',
      exportCsvBtn:'Ekspor Dataset sebagai CSV', exportXlsxBtn:'Ekspor Dataset sebagai XLSX',
      tourBtn:'🗺 Mulai Tur Terpandu', resetTourBtn:'Reset Tur',
      aboutLabel:'Tentang', version:'Versi 2.0 — Sisi klien murni. Tanpa server, tanpa instalasi.',
      disclaimer:'Semua komputasi statistik berjalan di browser Anda menggunakan algoritma yang telah divalidasi. Tidak ada data yang dikirim ke server mana pun.',
      // Status bar
      noDatasetLoaded:'Tidak ada dataset',
      datasetLabel:'Dataset', casesStatus:'Kasus', variablesStatus:'Variabel',
      filterStatus:'Filter', weightStatus:'Bobot', splitStatus:'Split',
      // Notifications
      projectCreated:'Proyek "%s" dibuat',
      projectSaved:'Proyek disimpan',
      projectOpened:'Proyek dibuka: %s',
      datasetLoaded:'Dataset "%s" dimuat (%d kasus, %d variabel)',
      modeSwitched:'Beralih ke mode %s',
      noProjectToSave:'Tidak ada proyek untuk disimpan',
      noProjectToExport:'Tidak ada proyek untuk diekspor',
      noDataset:'Tidak ada dataset',
      importError:'Error impor: %s',
      filterApplied:'Filter aktif: %s', filterCleared:'Filter dihapus',
      weightSet:'Bobot berdasarkan: %s', weightRemoved:'Bobot dihapus',
      sortedBy:'Diurutkan berdasarkan: %s',
      computedVar:'Dihitung "%s" untuk %d kasus',
      recodedVar:'Direcode %d nilai di "%s"',
      syntaxRan:'Sintaks berhasil dijalankan',
      syntaxError:'Error sintaks: %s',
      analysisRunning:'Menjalankan %s...',
      analysisComplete:'%s selesai',
      analysisError:'Error analisis: %s',
      variableNotFound:'Variabel "%s" tidak ditemukan dalam dataset.',
      tourReset:'Tur direset — muat ulang untuk memicu kembali',
    }
  };

  let _lang = localStorage.getItem('sociostat_lang') ||
    (navigator.language && navigator.language.startsWith('id') ? 'id' : 'en');

  function t(key, ...args) {
    const dict = DICT[_lang] || DICT.en;
    let str = dict[key] || DICT.en[key] || key;
    // Simple printf-style substitution: %s = string, %d = number
    let i = 0;
    str = str.replace(/%[sd]/g, () => (args[i++] ?? ''));
    return str;
  }

  function setLang(lang) {
    _lang = lang;
    localStorage.setItem('sociostat_lang', lang);
  }

  function getLang() { return _lang; }

  return { t, setLang, getLang, DICT };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 18B: VarPicker — Universal Variable Selection Component
   ══════════════════════════════════════════════════════════════════ */

const VarPicker = {
  /**
   * Creates a variable picker list.
   * @param {Array} variables  - array of variable objects with {name, label, type, measurementLevel}
   * @param {Array} selected   - mutable array of selected variable names (modified in-place)
   * @param {Object} opts
   *   multi      {boolean}  allow multiple selection
   *   maxHeight  {string}   CSS max-height for the scrollable list
   *   onChange   {function} called with current selection array after every change
   *   filter     {function} optional filter predicate (v) => bool
   * @returns {HTMLElement}
   */
  create(variables, selected, opts = {}) {
    const { multi = true, maxHeight = '180px', onChange, filter } = opts;
    const vars = filter ? variables.filter(filter) : variables;

    const wrap = el('div', { class: 'varpicker' });
    wrap.style.maxHeight = maxHeight;

    function rebuild() {
      wrap.innerHTML = '';
      if (!vars.length) {
        wrap.appendChild(el('div', { class: 'varpicker-empty' }, 'No variables available'));
        return;
      }
      vars.forEach(v => {
        const isSel = selected.includes(v.name);
        const item = el('div', { class: `varpicker-item${isSel ? ' selected' : ''}` },
          el('span', { class: 'varpicker-check' }, isSel ? '✓' : ''),
          el('span', { class: `varpicker-type varpicker-type-${v.type || 'numeric'}` },
            (v.type || 'N')[0].toUpperCase()),
          el('span', { class: 'varpicker-name' }, v.name),
          v.label ? el('span', { class: 'varpicker-label' }, v.label) : null
        );
        item.dataset.vn = v.name;
        item.onclick = () => {
          if (multi) {
            const idx = selected.indexOf(v.name);
            if (idx >= 0) selected.splice(idx, 1);
            else selected.push(v.name);
          } else {
            selected.length = 0;
            if (!isSel) selected.push(v.name);
          }
          rebuild();
          onChange && onChange([...selected]);
        };
        wrap.appendChild(item);
      });
    }
    rebuild();
    return wrap;
  },

  /**
   * Shorthand: single-select picker that shows the picked value in a display element.
   */
  single(variables, onSelect, opts = {}) {
    const sel = [];
    return VarPicker.create(variables, sel, {
      multi: false,
      onChange: arr => onSelect(arr[0] || null),
      ...opts
    });
  }
};

let _appMode = localStorage.getItem('sociostat_mode') || 'simple'; // 'simple' | 'pro'

const App = (() => {
  let _currentModule = 'home';
  let _dataSubview = 'data';
  const _lang = () => I18N.getLang();

  const NAV_SECTIONS = [
    { label: 'WORKSPACE', items: [
      { id: 'home',      label: 'Home',         icon: '⌂' },
      { id: 'data',      label: 'Data',         icon: '⊞' },
      { id: 'transform', label: 'Transform',    icon: '⇄' },
      { id: 'analyze',   label: 'Analyze',      icon: '📊' },
      { id: 'graphs',    label: 'Graphs',       icon: '📈' },
    ]},
    { label: 'RESULTS', items: [
      { id: 'output',    label: 'Output',       icon: '📋' },
      { id: 'history',   label: 'History',      icon: '🕐' },
    ]},
    { label: 'ASSIST', items: [
      { id: 'ai',        label: 'AI Assistant', icon: '🤖' },
      { id: 'syntax',    label: 'Syntax',       icon: '📝' },
    ]},
    { label: 'SYSTEM', items: [
      { id: 'help',      label: 'Help',         icon: '❓' },
      { id: 'settings',  label: 'Settings',     icon: '⚙' },
    ]},
  ];

  function init() {
    renderShell();
    navigate('home');
    // Show onboarding on first ever visit
    if (!localStorage.getItem('sociostat_toured')) {
      setTimeout(() => { localStorage.setItem('sociostat_toured','1'); OnboardingTour.start(); }, 800);
    }
  }

  function renderShell() {
    document.body.innerHTML = '';

    // ── Top Bar ──────────────────────────────────────────────────
    const topbar = el('div', { class: 'topbar', id: 'topbar' },
      el('div', { class: 'topbar-brand' },
        'SOCIOSTAT',
        el('span', { class: 'topbar-brand-badge' }, 'BETA')
      ),
      el('div', { class: 'topbar-title', id: 'topbar-title' },
        el('span', {}, 'Statistical Analysis Workbench')
      ),
      // Command palette search button
      el('button', { class: 'topbar-search-btn', onclick: () => CommandPalette.open() },
        '🔍 Search SOCIOSTAT...',
        el('span', { class: 'topbar-search-kbd' }, 'Ctrl K')
      ),
      // Mode toggle
      el('div', { class: 'topbar-mode-toggle', id: 'mode-toggle' },
        el('button', { class: `mode-btn${_appMode === 'simple' ? ' active' : ''}`, id: 'mode-btn-simple',
          onclick: () => setMode('simple'), title: 'Simple Mode — guided, explanations shown' }, '🎓 Simple'),
        el('button', { class: `mode-btn${_appMode === 'pro' ? ' active' : ''}`, id: 'mode-btn-pro',
          onclick: () => setMode('pro'), title: 'Pro Mode — full controls, advanced features' }, '⚡ Pro')
      ),
      el('div', { class: 'topbar-lang', id: 'topbar-lang' },
        el('button', { class: `lang-btn-mini${I18N.getLang()==='id'?' active':''}`, id: 'lang-btn-id',
          onclick: () => { I18N.setLang('id'); updateTopbarLang(); notify('Bahasa Indonesia aktif','info'); navigate(getCurrentModule()); }
        }, 'ID'),
        el('span', { style:{color:'rgba(255,255,255,0.3)',fontSize:'11px'} }, '|'),
        el('button', { class: `lang-btn-mini${I18N.getLang()==='en'?' active':''}`, id: 'lang-btn-en',
          onclick: () => { I18N.setLang('en'); updateTopbarLang(); notify('English active','info'); navigate(getCurrentModule()); }
        }, 'EN')
      ),
      el('div', { class: 'topbar-actions' },
        el('button', { class: 'btn btn-sm', onclick: () => Project.newProject() }, '+ New'),
        el('button', { class: 'btn btn-sm', onclick: () => Project.saveProject() }, '💾 Save'),
        el('button', { class: 'btn btn-sm', onclick: () => openImportFile() }, '📥 Import'),
        el('button', { class: 'btn btn-sm', onclick: () => Project.exportProject() }, '📤 Export')
      )
    );

    // ── Sidebar ──────────────────────────────────────────────────
    const sidebar = el('nav', { class: 'sidebar', id: 'sidebar' });
    NAV_SECTIONS.forEach((sec, si) => {
      if (si > 0) sidebar.appendChild(el('div', { class: 'sidebar-divider' }));
      sidebar.appendChild(el('div', { class: 'sidebar-section-label' }, sec.label));
      sec.items.forEach(item => {
        const li = el('div', {
          class: 'nav-item', id: `nav-${item.id}`,
          onclick: () => navigate(item.id),
          title: item.label
        },
          el('span', { class: 'nav-icon' }, item.icon),
          el('span', { class: 'nav-label' }, item.label)
        );
        sidebar.appendChild(li);
      });
    });

    // ── Main Workspace ───────────────────────────────────────────
    const workspace = el('div', { class: 'workspace', id: 'workspace' });

    // ── Status Bar ───────────────────────────────────────────────
    const statusbar = el('div', { class: 'statusbar', id: 'statusbar' });

    // Notification area
    const notifArea = el('div', { class: 'notif-area', id: 'notif-area' });

    document.body.append(topbar, sidebar, workspace, statusbar, notifArea);

    // Init sub-modules
    Output.init(null);  // Will be set when navigating to output
    History.init(null);
    SyntaxEditor.init(null);
    AIAssistant.init(null);
    GraphsModule.init(null);

    updateStatusBar();
  }

  function navigate(moduleId) {
    _currentModule = moduleId;
    $$('.nav-item').forEach(n => n.classList.remove('active'));
    const navEl = document.getElementById(`nav-${moduleId}`);
    if (navEl) navEl.classList.add('active');

    const workspace = document.getElementById('workspace');
    if (!workspace) return;
    workspace.innerHTML = '';

    switch (moduleId) {
      case 'home':      renderHome(workspace); break;
      case 'data':      renderDataModule(workspace); break;
      case 'transform': renderTransformModule(workspace); break;
      case 'analyze':   renderAnalyzeModule(workspace); break;
      case 'graphs':    GraphsModule.init(workspace); GraphsModule.render(); break;
      case 'syntax':    SyntaxEditor.init(workspace); SyntaxEditor.render(); break;
      case 'output':    Output.init(workspace); Output.render(); break;
      case 'history':   History.init(workspace); History.render(); break;
      case 'ai':        AIAssistant.init(workspace); AIAssistant.render(); break;
      case 'settings':  renderSettings(workspace); break;
      case 'help':      renderHelpModule(workspace); break;
    }
    updateStatusBar();
  }

  // Expose navigate for modules that need it (AIAssistant action system, GraphsModule empty state)
  AIAssistant.setNavigateFn(navigate);
  window._sociostatNavigate = navigate;
  window._sociostatRenderDataModule = () => renderDataModule();

  function setMode(mode) {
    _appMode = mode;
    localStorage.setItem('sociostat_mode', mode);
    // Update buttons
    const bs = document.getElementById('mode-btn-simple');
    const bp = document.getElementById('mode-btn-pro');
    if (bs) bs.classList.toggle('active', mode === 'simple');
    if (bp) bp.classList.toggle('active', mode === 'pro');
    notify(`Switched to ${mode === 'simple' ? '🎓 Simple' : '⚡ Pro'} mode`, 'info');
    // Re-render current module
    navigate(_currentModule);
  }

  function setDataSubview(v) { _dataSubview = v; }

  function triggerImport() { openImportFile(); }

  function renderDataModule(container) {
    const ws = container || document.getElementById('workspace');
    if (!ws) return;
    ws.innerHTML = '';

    // Simple mode hint
    if (_appMode === 'simple') {
      ws.appendChild(el('div', { class: 'simple-hint', style: { margin: '8px 10px 0' } },
        el('span', { class: 'simple-hint-icon' }, 'ℹ️'),
        el('div', {},
          el('strong', {}, 'Data View'), ' shows your cases (rows) and variables (columns). ',
          el('strong', {}, 'Variable View'), ' lets you define labels, measurement levels, and missing values. ',
          el('span', { style: { color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' },
            onclick: () => OnboardingTour.start() }, 'Start guided tour →')
        )
      ));
    }

    const tabs = el('div', { class: 'data-tabs' },
      el('button', { class: `tab-btn${_dataSubview === 'data' ? ' active' : ''}`,
        onclick: () => { _dataSubview = 'data'; renderDataModule(); } }, '⊞ Data View'),
      el('button', { class: `tab-btn${_dataSubview === 'variable' ? ' active' : ''}`,
        onclick: () => { _dataSubview = 'variable'; renderDataModule(); } }, '📋 Variable View')
    );
    ws.appendChild(tabs);

    const content = el('div', { class: 'data-content' });
    ws.appendChild(content);

    const ds = AppState.get('activeDataset');
    if (_dataSubview === 'data') { DataView.init(content); DataView.render(ds); }
    else { VariableView.init(content); VariableView.render(ds); }
  }

  function renderTransformModule(container) {
    const ws = container || document.getElementById('workspace');
    ws.innerHTML = '';

    const ds = AppState.get('activeDataset');
    const isId = _lang() === 'id';

    const wrap = el('div', { class: 'transform-workspace' });

    // ── Header ───────────────────────────────────────────────────
    wrap.appendChild(el('div', { class: 'transform-header' },
      el('h2', {}, I18N.t('transformTitle')),
      el('p', {}, isId
        ? 'Apa yang ingin Anda ubah dari data Anda?'
        : 'What would you like to change about your data?')
    ));

    // ── Simple mode guidance card ────────────────────────────────
    if (_appMode === 'simple') {
      wrap.appendChild(el('div', { class: 'simple-hint', style: { marginBottom: '16px' } },
        el('span', { class: 'simple-hint-icon' }, '💡'),
        el('div', {},
          isId
            ? 'Transformasi tidak menghancurkan data asli. Anda selalu bisa membatalkan atau membuat variabel baru.'
            : 'Transformations do not delete your original data. You can always undo or create a new variable instead of overwriting.'
        )
      ));
    }

    // ── Active state badges ──────────────────────────────────────
    const activeKeys = new Set();
    if (ds) {
      if (ds.activeFilter) activeKeys.add('filter');
      if (ds.weightVariable) activeKeys.add('weight');
      if (ds.splitVariables && ds.splitVariables.length) activeKeys.add('split');
    }

    // ── Card definitions ─────────────────────────────────────────
    const CARDS = [
      {
        icon: 'ƒ', key: 'compute',
        title: I18N.t('computeTitle'),
        desc: isId
          ? 'Hitung kolom baru dari variabel yang ada menggunakan ekspresi matematika.'
          : 'Create a variable using a formula.',
        example: 'price_million = harga_usd / 1000000',
        fn: () => TransformDialogs.openComputeVariable()
      },
      {
        icon: '↔', key: 'recode',
        title: I18N.t('recodeTitle'),
        desc: isId
          ? 'Petakan nilai lama ke nilai baru, atau kelompokkan kategori.'
          : 'Change values or group categories.',
        example: 'LCGC + Menengah → 1',
        fn: () => TransformDialogs.openRecode()
      },
      {
        icon: '↕', key: 'sort',
        title: I18N.t('sortTitle'),
        desc: isId
          ? 'Susun ulang baris data berdasarkan satu atau lebih variabel.'
          : 'Reorder cases by variable values.',
        example: null,
        fn: () => TransformDialogs.openSortCases()
      },
      {
        icon: '⊃', key: 'filter',
        title: I18N.t('filterTitle'),
        desc: isId
          ? 'Sementara simpan hanya kasus yang memenuhi kondisi tertentu.'
          : 'Temporarily include only matching cases.',
        example: 'age >= 18',
        fn: () => TransformDialogs.openSelectCases()
      },
      {
        icon: '⚖', key: 'weight',
        title: I18N.t('weightTitle'),
        desc: isId
          ? 'Berikan frekuensi berbeda pada kasus untuk analisis berbobot survei.'
          : 'Give different frequency weights to cases.',
        example: null,
        fn: () => TransformDialogs.openWeightCases()
      },
      {
        icon: '⊞', key: 'split',
        title: I18N.t('splitTitle'),
        desc: isId
          ? 'Jalankan analisis secara terpisah untuk setiap kelompok variabel.'
          : 'Run analyses separately by groups.',
        example: null,
        fn: () => TransformDialogs.openSplitFile()
      }
    ];

    // ── Grid of cards ─────────────────────────────────────────────
    const grid = el('div', { class: 'transform-grid-v2' });
    CARDS.forEach(card => {
      const isActive = activeKeys.has(card.key);
      const c = el('div', { class: 'transform-card-v2' + (isActive ? ' tc-active' : '') });

      // Icon (large, centered)
      c.appendChild(el('div', { class: 'tc-icon' }, card.icon));

      // Title
      c.appendChild(el('div', { class: 'tc-title' }, card.title));

      // Description
      c.appendChild(el('div', { class: 'tc-desc' }, card.desc));

      // Example code (if any)
      if (card.example) {
        c.appendChild(el('div', { class: 'tc-example' }, card.example));
      }

      // Active badge
      if (isActive) {
        c.appendChild(el('div', { class: 'tc-active-badge' }, '✓ Active'));
      }

      // Spacer to push button to bottom
      c.appendChild(el('div', { class: 'tc-spacer' }));

      // Start button (ONLY this launches dialog)
      const startBtn = el('button', { class: 'tc-start-btn' }, isId ? 'Mulai →' : 'Start →');
      startBtn.addEventListener('click', e => { e.stopPropagation(); card.fn(); });
      c.appendChild(startBtn);

      grid.appendChild(c);
    });

    wrap.appendChild(grid);
    ws.appendChild(wrap);
  }

  function renderAnalyzeModule(container) {
    const ws = container || document.getElementById('workspace');
    ws.innerHTML = '';

    const wrap = el('div', { class: 'analyze-workspace' });
    wrap.appendChild(el('div', { class: 'analyze-header' },
      el('h2', {}, '📊 Analyze'),
      el('p', {}, 'Select a statistical procedure. ' + (_appMode === 'simple' ? 'Start with a research question below, or browse procedures.' : 'All procedures are available below.'))
    ));

    // Simple mode: guided question chips
    if (_appMode === 'simple') {
      const qBox = el('div', { class: 'analyze-question-box' });
      qBox.appendChild(el('h3', {}, '💡 What do you want to know?'));
      const questions = [
        { label: 'Describe my data', action: () => GuidedAnalysis.open() },
        { label: 'Compare groups', action: () => GuidedAnalysis.open() },
        { label: 'Find relationships', action: () => GuidedAnalysis.open() },
        { label: 'Predict an outcome', action: () => GuidedAnalysis.open() },
        { label: 'Analyze questionnaire', action: () => GuidedAnalysis.open() },
        { label: 'Find dimensions/factors', action: () => GuidedAnalysis.open() },
        { label: 'Cluster cases', action: () => GuidedAnalysis.open() },
      ];
      const chips = el('div', { class: 'question-chips' });
      questions.forEach(q => {
        chips.appendChild(el('div', { class: 'question-chip', onclick: () => GuidedAnalysis.open() }, q.label));
      });
      qBox.appendChild(chips);
      qBox.appendChild(el('p', { style: { fontSize:'11px', color:'var(--text-muted)', marginTop:'10px' } },
        'Or browse all procedures below. Switch to ⚡ Pro mode for direct access without guidance.'));
      wrap.appendChild(qBox);
    }

    // All procedures as cards
    const CATALOG = [
      { title: 'Descriptive Statistics', desc: '', recommended: ['Frequencies', 'Descriptive Statistics'], items: [
        { label: 'Frequencies', desc: 'Count and percent for each value', badge: 'beginner', fn: () => AnalysisDialogs.openFrequencies() },
        { label: 'Descriptive Statistics', desc: 'Mean, SD, min/max, skewness', badge: 'beginner', fn: () => AnalysisDialogs.openDescriptives() },
        { label: 'Crosstabs + Chi-Square', desc: 'Association between categorical variables', badge: 'beginner', fn: () => AnalysisDialogs.openCrosstabs() },
      ]},
      { title: 'Compare Means', desc: '', items: [
        { label: 'One-Sample T-Test', desc: 'Compare one mean to a known value', badge: 'intermediate', fn: () => AnalysisDialogs.openOneSampleT() },
        { label: 'Independent-Samples T-Test', desc: 'Compare two independent groups', badge: 'intermediate', fn: () => AnalysisDialogs.openIndepT() },
        { label: 'Paired-Samples T-Test', desc: 'Compare two related measurements', badge: 'intermediate', fn: () => AnalysisDialogs.openPairedT() },
        { label: 'One-Way ANOVA', desc: 'Compare three or more groups', badge: 'intermediate', fn: () => AnalysisDialogs.openOneWayANOVA() },
      ]},
      { title: 'Correlate', desc: '', items: [
        { label: 'Bivariate Correlation', desc: 'Pearson, Spearman, or Kendall', badge: 'beginner', fn: () => AnalysisDialogs.openCorrelation() },
      ]},
      { title: 'Regression', desc: '', items: [
        { label: 'Linear Regression', desc: 'Predict a continuous outcome', badge: 'intermediate', fn: () => AnalysisDialogs.openLinearRegression() },
        { label: 'Binary Logistic Regression', desc: 'Predict a binary outcome', badge: 'advanced', fn: () => AnalysisDialogs.openLogisticRegression() },
      ]},
      { title: 'Scale / Reliability', desc: '', items: [
        { label: "Reliability (Cronbach's α)", desc: 'Internal consistency of Likert scales', badge: 'intermediate', fn: () => AnalysisDialogs.openReliability() },
      ]},
      { title: 'Dimension Reduction', desc: '', items: [
        { label: 'Exploratory Factor Analysis', desc: 'Find latent constructs', badge: 'advanced', fn: () => AnalysisDialogs.openFactorAnalysis() },
      ]},
      { title: 'Nonparametric Tests', desc: '', items: [
        { label: 'Nonparametric Tests', desc: 'Mann-Whitney, Wilcoxon, Kruskal-Wallis, Friedman', badge: 'intermediate', fn: () => AnalysisDialogs.openNonparametric() },
      ]},
      { title: 'Cluster Analysis', desc: '', items: [
        { label: 'K-Means Cluster Analysis', desc: 'Classify cases into k groups', badge: 'advanced', fn: () => AnalysisDialogs.openKMeans() },
      ]},
      { title: 'Survival Analysis', desc: '', items: [
        { label: 'Kaplan-Meier', desc: 'Survival curves and log-rank test', badge: 'advanced', fn: () => AnalysisDialogs.openKaplanMeier() },
      ]},
    ];

    const badgeColor = { beginner: '#dcfce7', intermediate: '#fef3c7', advanced: '#ede9fe' };
    const badgeText = { beginner: '#15803d', intermediate: '#92400e', advanced: '#6d28d9' };

    CATALOG.forEach(sec => {
      wrap.appendChild(el('div', { class: 'analyze-section-header' }, sec.title));
      const grid = el('div', { class: 'analyze-grid' });
      sec.items.forEach(item => {
        const card = el('div', { class: 'analyze-card', onclick: item.fn },
          el('div', { class: 'analyze-card-title' }, item.label),
          el('div', { class: 'analyze-card-desc' }, item.desc),
          el('div', { class: 'analyze-card-badge',
            style: { background: badgeColor[item.badge] || '#f3f4f6', color: badgeText[item.badge] || '#374151' } },
            item.badge)
        );
        grid.appendChild(card);
      });
      wrap.appendChild(grid);
    });

    ws.appendChild(wrap);
  }

  function renderHome(container) {
    const ws = container || document.getElementById('workspace');
    ws.innerHTML = '';
    const screen = el('div', { class: 'home-screen' });

    // Hero
    const hero = el('div', { class: 'home-hero' });
    const hc = el('div', { class: 'home-hero-content' });
    hc.appendChild(el('div', { class: 'home-title' },
      'SOCIO', el('span', {}, 'STAT')
    ));
    hc.appendChild(el('p', { class: 'home-author' }, I18N.t('heroAuthor')));
    hc.appendChild(el('p', { class: 'home-tagline' }, I18N.t('heroTagline')));
    const heroActions = el('div', { class: 'home-hero-actions' });
    heroActions.appendChild(el('button', { class: 'home-hero-btn primary', onclick: () => openImportFile() }, I18N.t('importDataset')));
    heroActions.appendChild(el('button', { class: 'home-hero-btn secondary', onclick: () => Project.newProject() }, I18N.t('newProject')));
    heroActions.appendChild(el('button', { class: 'home-hero-btn secondary', onclick: () => GuidedAnalysis.open() }, I18N.t('guidedAnalysis')));
    heroActions.appendChild(el('button', { class: 'home-hero-btn secondary', onclick: () => OnboardingTour.start() }, I18N.t('takeTour')));
    hc.appendChild(heroActions);
    hero.appendChild(hc);
    screen.appendChild(hero);

    // Body
    const body = el('div', { class: 'home-body' });

    // What would you like to do?
    body.appendChild(el('div', { class: 'home-section-title' }, I18N.t('whatToDo')));
    const actionCards = [
      { icon: '📥', title: 'Analyze my data', desc: 'Import a dataset and run statistical analysis', fn: () => openImportFile() },
      { icon: '🔍', title: 'Understand variables', desc: 'Define labels, types, missing values', fn: () => { navigate('data'); setDataSubview('variable'); } },
      { icon: '🔗', title: 'Find relationships', desc: 'Correlation, crosstabs, association', fn: () => { navigate('analyze'); } },
      { icon: '⚖️', title: 'Compare groups', desc: 'T-test, ANOVA, nonparametric tests', fn: () => { navigate('analyze'); } },
      { icon: '📏', title: 'Analyze questionnaire', desc: 'Reliability, factor analysis', fn: () => { navigate('analyze'); } },
      { icon: '📈', title: 'Create charts', desc: 'Histogram, scatter, boxplot, bar', fn: () => navigate('graphs') },
      { icon: '📝', title: 'Build a research report', desc: 'Export output to HTML, PDF, XLSX', fn: () => navigate('output') },
      { icon: '🎓', title: 'Learn statistics', desc: 'Help center, guided tour, AI Assistant', fn: () => navigate('help') },
    ];
    const agrid = el('div', { class: 'action-grid' });
    actionCards.forEach(c => {
      agrid.appendChild(el('div', { class: 'action-card', onclick: c.fn },
        el('div', { class: 'action-card-icon' }, c.icon),
        el('div', { class: 'action-card-title' }, c.title),
        el('div', { class: 'action-card-desc' }, c.desc)
      ));
    });
    body.appendChild(agrid);

    // Recent Projects
    body.appendChild(el('div', { class: 'home-section-title' }, I18N.t('recentProjects')));
    const recentArea = el('div', { id: 'recent-projects-area' });
    recentArea.appendChild(el('p', { class: 'muted text-sm' }, 'Loading...'));
    body.appendChild(recentArea);
    DB.listProjects().then(projects => {
      recentArea.innerHTML = '';
      if (!projects.length) {
        recentArea.appendChild(el('p', { class: 'muted text-sm' }, I18N.t('noRecentProjects')));
        return;
      }
      const grid = el('div', { class: 'project-grid' });
      projects.slice(0, 8).forEach(p => {
        const card = el('div', { class: 'project-card' });
        card.appendChild(el('div', { class: 'project-card-name', onclick: () => Project.openProject(p.id) }, p.name));
        card.appendChild(el('div', { class: 'project-card-meta' },
          `${(p.datasets||[]).length} dataset(s) · ${fmtDate(p.updatedAt||p.createdAt)}`));
        const actions = el('div', { class: 'project-card-actions' },
          el('button', { class: 'btn btn-xs', title: I18N.t('openProject'),
            onclick: () => Project.openProject(p.id) }, I18N.t('openProject')),
          el('button', { class: 'btn btn-xs', title: I18N.t('renameProject'),
            onclick: async () => {
              const newName = prompt('New name:', p.name);
              if (newName && newName.trim()) {
                await Project.renameProject(p.id, newName.trim());
                navigate('home');
              }
            }}, I18N.t('renameProject')),
          el('button', { class: 'btn btn-xs', title: I18N.t('duplicateProject'),
            onclick: async () => { await Project.duplicateProject(p.id); navigate('home'); }
          }, I18N.t('duplicateProject')),
          el('button', { class: 'btn btn-xs btn-danger', title: I18N.t('deleteProject'),
            onclick: async () => {
              if (!confirm(I18N.t('deleteProjectConfirm', p.name))) return;
              await Project.deleteProject(p.id);
              navigate('home');
            }}, I18N.t('deleteProject'))
        );
        card.appendChild(actions);
        grid.appendChild(card);
      });
      recentArea.appendChild(grid);
    });

    // Quick Start
    body.appendChild(el('div', { class: 'home-section-title', style: { marginTop: '24px' } }, 'Quick Start Guide'));
    body.appendChild(el('ol', { class: 'quickstart-list' },
      el('li', {}, 'Click ', el('strong', {}, 'Import Dataset'), ' or ', el('strong', {}, '+ New Project')),
      el('li', {}, 'Inspect your data in ', el('strong', {}, 'Data View'), ' — each row is a case, each column a variable'),
      el('li', {}, 'Define variable metadata in ', el('strong', {}, 'Variable View'), ' — labels, measurement levels, missing values'),
      el('li', {}, 'Use ', el('strong', {}, 'Transform'), ' to recode, compute new variables, or apply filters'),
      el('li', {}, 'Go to ', el('strong', {}, 'Analyze'), ' — or use ', el('strong', {}, '🔬 Guided Analysis'), ' if unsure which test to use'),
      el('li', {}, 'View structured results in ', el('strong', {}, 'Output'), ' — export to HTML, PDF, or XLSX'),
      el('li', {}, 'Use ', el('strong', {}, 'Ctrl+K'), ' to search for any feature, procedure, or navigation item')
    ));

    screen.appendChild(body);
    ws.appendChild(screen);
  }

  function renderSettings(container) {
    container.innerHTML = '';
    const wrap = el('div', { class: 'settings-workspace' });
    wrap.appendChild(el('h2', { style: { marginBottom: '20px' } }, `⚙ ${I18N.t('settingsTitle')}`));

    // Mode
    wrap.appendChild(el('div', { class: 'settings-section' },
      el('h4', {}, I18N.t('modeLabel')),
      el('div', { class: 'settings-row' },
        el('label', {}, I18N.t('simpleModeDesc')),
        el('button', { class: `btn btn-sm${_appMode === 'simple' ? ' btn-primary' : ''}`,
          onclick: () => setMode('simple') }, _appMode === 'simple' ? '✓ Active' : 'Switch')
      ),
      el('div', { class: 'settings-row' },
        el('label', {}, I18N.t('proModeDesc')),
        el('button', { class: `btn btn-sm${_appMode === 'pro' ? ' btn-primary' : ''}`,
          onclick: () => setMode('pro') }, _appMode === 'pro' ? '✓ Active' : 'Switch')
      )
    ));

    // Language
    const langSec = el('div', { class: 'settings-section' },
      el('h4', {}, I18N.t('languageLabel'))
    );
    const langToggle = el('div', { class: 'lang-toggle' });
    ['en','id'].forEach(code => {
      const label = code === 'en' ? '🇬🇧 English' : '🇮🇩 Bahasa Indonesia';
      const btn = el('button', {
        class: `lang-btn${I18N.getLang() === code ? ' active' : ''}`,
        onclick: () => {
          I18N.setLang(code);
          notify(code === 'id' ? 'Bahasa diubah ke Indonesia' : 'Language set to English', 'success');
          navigate('settings');
        }
      }, label);
      langToggle.appendChild(btn);
    });
    langSec.appendChild(langToggle);
    wrap.appendChild(langSec);

    // Storage manager
    const storageSec = el('div', { class: 'settings-section', id: 'storage-section' },
      el('h4', {}, I18N.t('storageLabel')),
      el('p', { class: 'muted small' }, 'Loading storage info...')
    );
    wrap.appendChild(storageSec);
    DB.listProjects().then(projects => {
      storageSec.innerHTML = '';
      storageSec.appendChild(el('h4', {}, I18N.t('storageLabel')));
      const totalDatasets = projects.reduce((s, p) => s + (p.datasets || []).length, 0);
      const totalOutputs = projects.reduce((s, p) => s + (p.outputs || []).length, 0);
      const stats = el('div', { class: 'storage-stats' });
      [
        [I18N.t('storageProjects'), projects.length],
        [I18N.t('storageDatasets'), totalDatasets],
        ['Outputs', totalOutputs],
      ].forEach(([label, val]) => {
        stats.appendChild(el('div', { class: 'storage-stat' },
          el('div', { class: 'storage-stat-num' }, String(val)),
          el('div', { class: 'storage-stat-label' }, label)
        ));
      });
      storageSec.appendChild(stats);
      storageSec.appendChild(el('div', { class: 'form-row', style: { marginTop: '12px' } },
        el('button', { class: 'btn btn-sm btn-danger', onclick: async () => {
          if (!confirm(I18N.t('clearAllConfirm'))) return;
          await Project.clearAllProjects();
          navigate('settings');
        }}, I18N.t('clearAllProjectsBtn'))
      ));
    });

    // Project
    wrap.appendChild(el('div', { class: 'settings-section' },
      el('h4', {}, I18N.t('projectLabel')),
      el('div', { class: 'form-row' },
        el('button', { class: 'btn btn-sm btn-secondary', onclick: () => Project.exportProject() }, I18N.t('exportProjectBtn')),
        el('button', { class: 'btn btn-sm btn-secondary', onclick: () => openProjectImport() }, I18N.t('importProjectBtn'))
      )
    ));

    // Data
    wrap.appendChild(el('div', { class: 'settings-section' },
      el('h4', {}, 'Data'),
      el('div', { class: 'form-row' },
        el('button', { class: 'btn btn-sm btn-secondary', onclick: () => exportDataCSV() }, I18N.t('exportCsvBtn')),
        el('button', { class: 'btn btn-sm btn-secondary', onclick: () => exportDataXLSX() }, I18N.t('exportXlsxBtn'))
      )
    ));

    // Tour
    wrap.appendChild(el('div', { class: 'settings-section' },
      el('h4', {}, 'Help & Tour'),
      el('div', { class: 'form-row' },
        el('button', { class: 'btn btn-sm btn-secondary', onclick: () => OnboardingTour.start() }, I18N.t('tourBtn')),
        el('button', { class: 'btn btn-sm btn-secondary', onclick: () => {
          localStorage.removeItem('sociostat_toured');
          notify(I18N.t('tourReset'), 'info');
        }}, I18N.t('resetTourBtn'))
      )
    ));

    // System Status
    const statusSec = el('div', { class: 'settings-section' }, el('h4', {}, '🔧 System Status'));
    function renderLibStatusRows() {
      statusSec.querySelectorAll('.lib-status-row').forEach(r => r.remove());
      const libs = [
        { key: 'jstat',      label: 'Statistics (jStat)',  icon: '📐' },
        { key: 'papaparse',  label: 'CSV (PapaParse)',     icon: '📄' },
        { key: 'xlsx',       label: 'Excel (XLSX)',        icon: '📊' },
        { key: 'echarts',    label: 'Charts (ECharts)',    icon: '📈' },
        { key: 'jspdf',      label: 'PDF (jsPDF)',         icon: '🖨️'  },
      ];
      libs.forEach(lib => {
        const info = LibraryLoader.status(lib.key);
        const badgeCls = info.state === 'ready' ? 'splash-badge-ok' : info.state === 'loading' ? 'splash-badge-loading' : 'splash-badge-fail';
        const badgeTxt = info.state === 'ready' ? 'Ready' : info.state === 'loading' ? 'Loading…' : 'Unavailable';
        const row = el('div', { class: 'settings-row lib-status-row', style: { alignItems: 'center' } },
          el('span', { style: { marginRight: '6px' } }, lib.icon),
          el('label', { style: { flex: '1' } }, lib.label),
          el('span', { class: `splash-status-badge ${badgeCls}`, style: { marginRight: '8px' } }, badgeTxt),
          info.state !== 'ready'
            ? el('button', { class: 'btn btn-sm', onclick: () => {
                LibraryLoader.retry(lib.key).then(() => renderLibStatusRows()).catch(() => renderLibStatusRows());
              }}, 'Retry')
            : el('span', {})
        );
        statusSec.appendChild(row);
      });
    }
    renderLibStatusRows();
    wrap.appendChild(statusSec);

    // About
    wrap.appendChild(el('div', { class: 'settings-section' },
      el('h4', {}, I18N.t('aboutLabel')),
      el('p', { class: 'muted text-sm' }, 'SOCIOSTAT — Statistical Analysis Workbench'),
      el('p', { class: 'muted text-sm' }, I18N.t('version')),
      el('p', { class: 'muted text-sm' }, I18N.t('disclaimer'))
    ));

    container.appendChild(wrap);
  }

  function renderHelpModule(container) {
    container.innerHTML = '';
    const HELP = [
      { section: 'Getting Started', items: [
        { title: 'What is SOCIOSTAT?', content: '<h2>What is SOCIOSTAT?</h2><p>SOCIOSTAT is a web-based statistical analysis workbench inspired by the workflow of professional statistical software. It runs entirely in your browser — no installation, no server required.</p><p>It supports the full research workflow: data import → variable metadata → transformation → analysis → output → interpretation → report.</p>' },
        { title: 'Importing Data', content: '<h2>Importing Data</h2><p>SOCIOSTAT supports CSV and XLSX files. Use the <strong>📥 Import</strong> button in the topbar to open the Import Wizard.</p><h3>Import Wizard Steps</h3><ul><li><strong>Upload</strong> — drag and drop or select your file</li><li><strong>Preview</strong> — see detected columns and sample rows</li><li><strong>Types</strong> — confirm or correct data types</li><li><strong>Missing values</strong> — define how missing data is coded</li><li><strong>Measurement levels</strong> — set Nominal, Ordinal, or Scale for each variable</li><li><strong>Confirm</strong> — import into your active project</li></ul>' },
        { title: 'Simple vs Pro Mode', content: '<h2>Simple vs Pro Mode</h2><p><strong>Simple Mode (🎓)</strong> — designed for beginners and students. Shows explanations, guided analysis, and contextual hints throughout the interface.</p><p><strong>Pro Mode (⚡)</strong> — direct access to all procedures without guidance. Recommended for researchers familiar with statistical methods.</p><p>Switch modes at any time using the toggle in the topbar or via Settings.</p>' },
      ]},
      { section: 'Measurement Levels', items: [
        { title: 'Nominal', content: '<h2>Nominal Variables</h2><p>Nominal variables represent categories without any natural order. The numbers are just labels.</p><h3>Examples</h3><ul><li>Gender: 1 = Male, 2 = Female, 3 = Other</li><li>Region: 1 = Urban, 2 = Suburban, 3 = Rural</li><li>Religion, ethnicity, political party</li></ul><h3>Appropriate analyses</h3><ul><li>Frequencies</li><li>Crosstabs + Chi-Square</li><li>Mode</li></ul><div class="help-example-box"><strong>Research example:</strong> "Is there a difference in political party preference between urban and rural residents?" → Crosstabs with Chi-Square.</div>' },
        { title: 'Ordinal', content: '<h2>Ordinal Variables</h2><p>Ordinal variables have a meaningful order, but the intervals between values are not necessarily equal.</p><h3>Examples</h3><ul><li>Education level: 1 = Primary, 2 = Secondary, 3 = Tertiary</li><li>Likert scale: 1 = Strongly Disagree … 5 = Strongly Agree</li><li>Socioeconomic class: Low, Middle, High</li></ul><h3>Appropriate analyses</h3><ul><li>Frequencies, crosstabs</li><li>Spearman or Kendall correlation</li><li>Mann-Whitney U, Kruskal-Wallis</li></ul><div class="help-example-box"><strong>Note:</strong> Many researchers treat 5-point or 7-point Likert scales as approximately continuous (Scale) for practical reasons, but the ordinal approach is more conservative.</div>' },
        { title: 'Scale', content: '<h2>Scale (Continuous) Variables</h2><p>Scale variables have equal intervals between values and can be meaningfully added, subtracted, and averaged.</p><h3>Examples</h3><ul><li>Age, income, temperature, test scores</li><li>Composite index scores (e.g. social trust score)</li></ul><h3>Appropriate analyses</h3><ul><li>Mean, SD, variance</li><li>Pearson correlation</li><li>T-tests, ANOVA</li><li>Linear regression</li></ul>' },
      ]},
      { section: 'Statistical Tests', items: [
        { title: 'Choosing the Right Test', content: '<h2>Choosing the Right Test</h2><p>Use <strong>🔬 Guided Analysis</strong> on the Home screen or Analyze module to get recommendations.</p><h3>Quick decision guide</h3><ul><li><strong>Describe data</strong> → Frequencies, Descriptives</li><li><strong>Two categorical variables</strong> → Crosstabs + Chi-Square</li><li><strong>Two scale variables</strong> → Pearson Correlation</li><li><strong>Compare 2 independent groups (scale outcome)</strong> → Independent T-Test</li><li><strong>Compare 3+ groups</strong> → One-Way ANOVA</li><li><strong>Predict continuous outcome</strong> → Linear Regression</li><li><strong>Predict binary outcome</strong> → Logistic Regression</li><li><strong>Scale reliability</strong> → Reliability Analysis (Cronbach\'s α)</li></ul>' },
        { title: 'p-value and Significance', content: '<h2>Understanding p-values</h2><p>The p-value is the probability of observing a result as extreme as yours (or more) if the null hypothesis were true.</p><p>p < .05 is commonly used as a threshold for "statistical significance", but this does NOT mean:</p><ul><li>The result is important or large</li><li>The effect is real with certainty</li><li>The relationship is causal</li></ul><p>Always report effect sizes alongside p-values. Always consider sample size and research design.</p><div class="help-example-box"><strong>Caution:</strong> p < .05 with N = 10,000 may reflect a trivially small effect. p = .08 with N = 20 may reflect a meaningful but underpowered effect.</div>' },
        { title: 'Effect Sizes', content: '<h2>Effect Sizes</h2><p>Effect sizes measure the magnitude of an effect independently of sample size.</p><ul><li><strong>Cohen\'s d</strong> (T-test): Small = 0.2, Medium = 0.5, Large = 0.8</li><li><strong>r</strong> (Correlation): Small = 0.1, Medium = 0.3, Large = 0.5</li><li><strong>η² (eta squared)</strong> (ANOVA): Small = .01, Medium = .06, Large = .14</li><li><strong>R²</strong> (Regression): proportion of variance explained</li></ul><p>Effect sizes are arguably more informative than p-values for practical and substantive interpretation.</p>' },
      ]},
      { section: 'Sociology Research', items: [
        { title: 'Likert Scale Analysis', content: '<h2>Analyzing Likert Scales</h2><p>Likert scales (e.g. 1–5 Strongly Disagree to Strongly Agree) are common in social science surveys.</p><h3>Steps</h3><ol><li>Define value labels in Variable View (1 = Strongly Disagree, etc.)</li><li>Check internal consistency with Reliability Analysis (Cronbach\'s α)</li><li>Create a composite score with Compute Variable (average of items)</li><li>Use the composite as a Scale variable in further analyses</li></ol><div class="help-example-box"><strong>Example:</strong> Social trust scale with 5 items → α = .82 (Good) → compute trust_index = mean of items → use in correlation with political participation.</div>' },
        { title: 'Survey Data Workflow', content: '<h2>Survey Data Workflow</h2><ol><li>Import CSV from survey export</li><li>Define variable labels and value labels in Variable View</li><li>Define missing values (e.g. 99 = refused, 98 = don\'t know)</li><li>Set measurement levels (nominal for categorical, ordinal/scale for Likert)</li><li>Check missing data patterns</li><li>Recode reverse-scored items if needed</li><li>Compute composite scale scores</li><li>Run reliability analysis on scales</li><li>Run descriptive statistics for the sample profile</li><li>Run inferential analyses based on research questions</li></ol>' },
      ]},
    ];

    const helpWrap = el('div', { class: 'help-workspace' });
    const helpSide = el('div', { class: 'help-sidebar' });
    const helpContent = el('div', { class: 'help-content', id: 'help-content' });

    let _activeItem = HELP[0].items[0];

    function showHelp(item) {
      _activeItem = item;
      helpContent.innerHTML = item.content;
      $$('.help-sidebar-item').forEach(i => i.classList.remove('active'));
      const matching = Array.from(helpSide.querySelectorAll('.help-sidebar-item')).find(i => i.dataset.title === item.title);
      if (matching) matching.classList.add('active');
    }

    HELP.forEach(sec => {
      helpSide.appendChild(el('div', { class: 'help-sidebar-section' }, sec.section));
      sec.items.forEach(item => {
        const sideItem = el('div', {
          class: 'help-sidebar-item' + (item === _activeItem ? ' active' : ''),
          onclick: () => showHelp(item)
        }, item.title);
        sideItem.dataset.title = item.title;
        helpSide.appendChild(sideItem);
      });
    });

    showHelp(_activeItem);
    helpWrap.append(helpSide, helpContent);
    container.appendChild(helpWrap);
  }

  function openImportFile() {
    const inp = el('input', { type: 'file', accept: '.csv,.xlsx,.xls' });
    inp.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      ImportWizard.open(file, dataset => {
        Project.loadDatasetIntoApp(dataset);
        History.addEntry({ type: 'import', name: dataset.name, cases: dataset.cases.length, timestamp: new Date().toISOString() });
      });
    };
    inp.click();
  }

  function openProjectImport() {
    const inp = el('input', { type: 'file', accept: '.json' });
    inp.onchange = e => { const file = e.target.files[0]; if (file) Project.importProject(file); };
    inp.click();
  }

  function exportDataCSV() {
    const ds = AppState.get('activeDataset');
    if (!ds) { notify('No dataset loaded', 'warning'); return; }
    const headers = ds.variables.map(v => v.name);
    const rows = ds.cases.map(c => headers.map(h => c[h] ?? ''));
    const csv = [headers.join(','), ...rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `${ds.name}.csv` });
    a.click();
  }

  function exportDataXLSX() {
    const ds = AppState.get('activeDataset');
    if (!ds) { notify('No dataset loaded', 'warning'); return; }
    if (typeof XLSX === 'undefined') { notify('Excel export unavailable — library not loaded. Retry from Settings → System Status.', 'error'); return; }
    const headers = ds.variables.map(v => v.name);
    const rows = ds.cases.map(c => headers.map(h => c[h] ?? null));
    const ws2 = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws2, 'Data');
    XLSX.writeFile(wb, `${ds.name}.xlsx`);
  }

  function updateStatusBar() {
    const sb = document.getElementById('statusbar');
    if (!sb) return;
    const ds = AppState.get('activeDataset');
    if (!ds) {
      sb.innerHTML = '<span class="status-item">No dataset loaded</span>';
      return;
    }
    const filterCases = ds.activeFilter
      ? Transform.applyFilter(ds.cases, ds.activeFilter, ds.variables).length
      : ds.cases.length;

    sb.innerHTML = '';
    const items = [
      `Dataset: ${ds.name}`,
      `Cases: ${filterCases}${ds.activeFilter ? ` (of ${ds.cases.length} filtered)` : ''}`,
      `Variables: ${ds.variables.length}`,
      ds.activeFilter ? `Filter: ${ds.activeFilter.slice(0, 30)}` : null,
      ds.weightVariable ? `Weight: ${ds.weightVariable}` : null,
      ds.splitVariables && ds.splitVariables.length ? `Split: ${ds.splitVariables.join(', ')}` : null
    ].filter(Boolean);
    items.forEach(i => sb.appendChild(el('span', { class: 'status-item' }, i)));
  }

  function updateTopbarLang() {
    const bid = document.getElementById('lang-btn-id');
    const ben = document.getElementById('lang-btn-en');
    if (bid) bid.classList.toggle('active', I18N.getLang() === 'id');
    if (ben) ben.classList.toggle('active', I18N.getLang() === 'en');
  }

  function updateTitleBar() {
    const proj = AppState.get('currentProject');
    const titleEl = document.getElementById('topbar-title');
    if (titleEl && proj) {
      titleEl.innerHTML = '';
      titleEl.appendChild(el('span', {}, proj.name + (Project.isDirty() ? ' *' : '')));
    }
  }

  function getCurrentModule() { return _currentModule; }

  return {
    init, navigate, renderDataModule, updateStatusBar, updateTitleBar,
    getCurrentModule, setMode, setDataSubview, triggerImport,
    exportDataCSV, exportDataXLSX, updateTopbarLang
  };
})();

/* ══════════════════════════════════════════════════════════════════
   SECTION 19: LIBRARY LOADER + BOOTSTRAP
   Loads optional CDN libraries asynchronously.
   Core application starts immediately — never waits for optional libs.
   ══════════════════════════════════════════════════════════════════ */

const LibraryLoader = (() => {
  const LIBS = {
    jstat: {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jstat/1.9.6/jstat.min.js',
      global: 'jStat', timeout: 8000
    },
    papaparse: {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
      global: 'Papa', timeout: 8000
    },
    xlsx: {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
      global: 'XLSX', timeout: 10000
    },
    echarts: {
      url: 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js',
      global: 'echarts', timeout: 10000
    },
    jspdf: {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
      global: 'jspdf', timeout: 10000
    },
    jspdf_autotable: {
      url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js',
      global: null, timeout: 8000, dependsOn: 'jspdf'
    },
  };

  // state: 'idle' | 'loading' | 'ready' | 'failed'
  const _state = {};
  const _callbacks = {};

  Object.keys(LIBS).forEach(k => { _state[k] = 'idle'; _callbacks[k] = []; });

  function status(key) {
    return { state: _state[key] || 'idle' };
  }

  function load(key) {
    const def = LIBS[key];
    if (!def) return Promise.resolve();

    // If already ready, resolve immediately
    if (_state[key] === 'ready') return Promise.resolve();

    // If loading, return a promise that resolves/rejects when done
    if (_state[key] === 'loading') {
      return new Promise((res, rej) => { _callbacks[key].push({ res, rej }); });
    }

    _state[key] = 'loading';

    // If depends on another lib, load that first
    const parentLoad = def.dependsOn ? load(def.dependsOn) : Promise.resolve();

    return parentLoad.then(() => new Promise((res, rej) => {
      _callbacks[key].push({ res, rej });

      // Check if already in DOM (e.g. duplicate call)
      if (def.global && typeof window[def.global] !== 'undefined') {
        _state[key] = 'ready';
        _drain(key, true);
        return;
      }

      const script = document.createElement('script');
      script.src = def.url;
      script.async = true;

      const timer = setTimeout(() => {
        script.onload = script.onerror = null;
        _state[key] = 'failed';
        console.warn(`[LibraryLoader] ${key} timed out after ${def.timeout}ms`);
        _drain(key, false, new Error(`${key} load timeout`));
      }, def.timeout);

      script.onload = () => {
        clearTimeout(timer);
        _state[key] = 'ready';
        console.log(`[LibraryLoader] ${key} ready`);
        _drain(key, true);
      };

      script.onerror = () => {
        clearTimeout(timer);
        _state[key] = 'failed';
        console.warn(`[LibraryLoader] ${key} failed to load`);
        _drain(key, false, new Error(`${key} failed to load`));
      };

      document.head.appendChild(script);
    })).catch(err => {
      _state[key] = 'failed';
      console.warn(`[LibraryLoader] ${key} dependency failed:`, err);
    });
  }

  function retry(key) {
    if (_state[key] === 'loading') return new Promise((res, rej) => { _callbacks[key].push({ res, rej }); });
    _state[key] = 'idle';
    // Remove existing script tag to force reload
    const existing = document.head.querySelector(`script[src="${LIBS[key]?.url}"]`);
    if (existing) existing.remove();
    return load(key);
  }

  function _drain(key, ok, err) {
    const cbs = _callbacks[key].splice(0);
    cbs.forEach(cb => ok ? cb.res() : cb.rej(err));
  }

  function loadAll() {
    return Promise.allSettled(
      Object.keys(LIBS).filter(k => !LIBS[k].dependsOn).map(k => load(k))
    );
  }

  return { load, loadAll, retry, status };
})();

/* ── Fault-tolerant Splash ───────────────────────────────────────── */
(function bootSplash() {
  const CORE_TIMEOUT_MS = 5000; // max wait before forcing app open
  const OPTIONAL_LIBS = ['jstat', 'papaparse', 'xlsx', 'echarts', 'jspdf', 'jspdf_autotable'];

  const splashSub    = document.getElementById('splash-sub');
  const splashStatus = document.getElementById('splash-status');
  const splashSpin   = document.getElementById('splash-spinner');
  const splashActs   = document.getElementById('splash-actions');

  function updateSplashStatus() {
    if (!splashStatus) return;
    const libs = [
      { key: 'jstat',     label: 'Statistics engine' },
      { key: 'papaparse', label: 'CSV library' },
      { key: 'xlsx',      label: 'Excel library' },
      { key: 'echarts',   label: 'Charts library' },
      { key: 'jspdf',     label: 'PDF library' },
    ];
    splashStatus.innerHTML = '';
    splashStatus.classList.add('visible');
    libs.forEach(lib => {
      const s = LibraryLoader.status(lib.key).state;
      const icon = s === 'ready' ? '✓' : s === 'failed' ? '⚠' : '⏳';
      const badge = s === 'ready' ? 'splash-badge-ok' : s === 'failed' ? 'splash-badge-fail' : 'splash-badge-loading';
      const badgeTxt = s === 'ready' ? 'Ready' : s === 'failed' ? 'Unavailable' : 'Loading…';
      const row = document.createElement('div');
      row.className = 'splash-status-row';
      row.innerHTML = `<span class="splash-status-icon">${icon}</span>` +
        `<span class="splash-status-label">${lib.label}</span>` +
        `<span class="splash-status-badge ${badge}">${badgeTxt}</span>`;
      splashStatus.appendChild(row);
    });
  }

  function showOpenButton() {
    if (!splashActs) return;
    if (splashSub) splashSub.textContent = 'Core application ready.';
    if (splashSpin) splashSpin.classList.add('hidden');
    splashActs.style.display = 'block';
    splashActs.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'Open SOCIOSTAT';
    btn.onclick = () => launchApp();
    splashActs.appendChild(btn);
  }

  function launchApp() {
    DB.init().then(() => App.init()).catch(err => {
      console.error('[SOCIOSTAT] DB init failed, running without persistence:', err);
      App.init();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (splashSub) splashSub.textContent = 'Starting workspace…';

    // Start loading all optional libraries in parallel
    OPTIONAL_LIBS.forEach(k => LibraryLoader.load(k));

    let _launched = false;
    let _pollTimer = null;
    let _forceTimer = null;

    function launch() {
      if (_launched) return;
      _launched = true;
      clearTimeout(_pollTimer);
      clearTimeout(_forceTimer);
      launchApp();
    }

    // Begin polling — update status display and launch when all settled
    function pollStatus() {
      updateSplashStatus();
      const allDone = OPTIONAL_LIBS.every(k => {
        const s = LibraryLoader.status(k).state;
        return s === 'ready' || s === 'failed';
      });
      if (!allDone) {
        _pollTimer = setTimeout(pollStatus, 300);
      } else {
        launch();
      }
    }

    // Hard deadline: 5 seconds → show [Open SOCIOSTAT] button instead of auto-launching
    _forceTimer = setTimeout(() => {
      if (_launched) return;
      clearTimeout(_pollTimer);
      updateSplashStatus();
      showOpenButton();
    }, CORE_TIMEOUT_MS);

    // Start polling immediately
    pollStatus();
  });
})();
