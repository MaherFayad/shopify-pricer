/* ═══════════════════════════════════════════════════════
   Shopify Pricer — app.js  (EN/AR, auto-recalc, live rate)
   ═══════════════════════════════════════════════════════ */
'use strict';

// ─── TRANSLATIONS ────────────────────────────────────────
const T = {
  en: {
    appName: 'Shopify Pricer',
    dropTitle: 'Drop your Shopify CSV here',
    dropSub: 'or click to browse — supports all shopify_import_*.csv files',
    browseBtn: 'Browse File',
    quickLoad: 'Quick:',
    currencyTitle: 'Currency',
    targetCurrencyLabel: 'Target Currency',
    rateLabel: 'Exchange Rate (1 AED = ?)',
    dutiesTitle: 'Import & Customs',
    customsLabel: 'Customs Fee (%)',
    importLabel: 'Import / Shipping (%)',
    vatLabel: 'VAT / Local Tax (%)',
    profitTitle: 'Profit Margin',
    marginLabel: 'Margin (%)',
    roundingLabel: 'Price Rounding',
    roundNone: 'No rounding',
    round99: 'Round up to .99',
    round50: 'To .00 or .50',
    round1: 'Nearest whole number',
    round5: 'Nearest 5',
    minPriceLabel: 'Minimum Price',
    compareTitle: 'Discount Price',
    compareMarkupLabel: 'Discount above sale (%)',
    previewTitle: 'Example: 112 AED →',
    previewFinal: 'Final price',
    previewCompare: 'After Discount',
    exportTitle: 'Export Options',
    exportStatusLabel: 'Product Status',
    keepStatus: 'Keep original',
    activeStatus: 'Force Active',
    draftStatus: 'Force Draft',
    exportBtn: '📤 Export CSV',
    allVendors: 'All Vendors',
    searchPlaceholder: 'Search products…',
    colImg: 'Img',
    colProduct: 'Product',
    colVendor: 'Vendor',
    colSKU: 'SKU',
    colSize: 'Size',
    colOriginal: 'Original (AED)',
    colPrice: 'New Price',
    colCompare: 'After Discount',
    colStock: 'Stock',
    variantsCount: (n) => `${n} variant${n !== 1 ? 's' : ''}`,
    statProducts: (n) => `${n} products`,
    statAvg: (p, c) => `Avg ${p} ${c}`,
    loadedMsg: (n, name) => `Loaded "${name}" · ${n} products`,
    fetchingRate: 'Fetching…',
    rateOk: (r, c, t) => `Live · 1 AED = ${r} ${c}`,
    rateFail: 'Rate error — set manually',
    exportDone: 'CSV downloaded ✅',
    outOfStock: 'Out',
    inStock: (n) => `${n}`,
  },
  ar: {
    appName: 'مُسعِّر شوبيفاي',
    dropTitle: 'أفلت ملف CSV هنا',
    dropSub: 'أو انقر للاستعراض — يدعم جميع ملفات shopify_import_*.csv',
    browseBtn: 'استعراض ملف',
    quickLoad: 'تحميل سريع:',
    currencyTitle: 'العملة',
    targetCurrencyLabel: 'العملة المستهدفة',
    rateLabel: 'سعر الصرف (١ درهم = ؟)',
    dutiesTitle: 'الاستيراد والجمارك',
    customsLabel: 'رسوم جمركية (%)',
    importLabel: 'شحن / استيراد (%)',
    vatLabel: 'ضريبة القيمة المضافة (%)',
    profitTitle: 'هامش الربح',
    marginLabel: 'الهامش (%)',
    roundingLabel: 'تقريب السعر',
    roundNone: 'بدون تقريب',
    round99: 'تقريب إلى .99',
    round50: 'إلى .00 أو .50',
    round1: 'أقرب رقم صحيح',
    round5: 'أقرب 5',
    minPriceLabel: 'الحد الأدنى للسعر',
    compareTitle: 'سعر الخصم',
    compareMarkupLabel: 'خصم فوق سعر البيع (%)',
    previewTitle: 'مثال: ١١٢ درهم →',
    previewFinal: 'السعر النهائي',
    previewCompare: 'بعد الخصم',
    exportTitle: 'خيارات التصدير',
    exportStatusLabel: 'حالة المنتج',
    keepStatus: 'كما هو',
    activeStatus: 'نشط',
    draftStatus: 'مسودة',
    exportBtn: '📤 تصدير CSV',
    allVendors: 'جميع الموردين',
    searchPlaceholder: 'ابحث عن منتجات…',
    colImg: 'صورة',
    colProduct: 'المنتج',
    colVendor: 'المورد',
    colSKU: 'SKU',
    colSize: 'المقاس',
    colOriginal: 'السعر الأصلي (درهم)',
    colPrice: 'السعر الجديد',
    colCompare: 'سعر مقارنة',
    colStock: 'المخزون',
    variantsCount: (n) => `${n} متغير`,
    statProducts: (n) => `${n} منتج`,
    statAvg: (p, c) => `متوسط ${p} ${c}`,
    loadedMsg: (n, name) => `تم تحميل "${name}" · ${n} منتج`,
    fetchingRate: 'جاري الجلب…',
    rateOk: (r, c) => `مباشر · ١ AED = ${r} ${c}`,
    rateFail: 'خطأ في السعر — أدخله يدوياً',
    exportDone: 'تم تنزيل ملف CSV ✅',
    outOfStock: 'نفذ',
    inStock: (n) => `${n}`,
  }
};

// ─── LANG STATE ───────────────────────────────────────────
let lang = 'en';

function t(key, ...args) {
  const val = T[lang][key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}

function applyLang() {
  const html = document.getElementById('html-root');
  const isAr = lang === 'ar';
  html.setAttribute('lang', lang);
  html.setAttribute('dir', isAr ? 'rtl' : 'ltr');

  // nav labels
  document.getElementById('lang-en-label').className = 'lang-en' + (lang === 'en' ? ' active' : '');
  document.getElementById('lang-ar-label').className = 'lang-ar' + (lang === 'ar' ? ' active' : '');

  // data-t attributes
  document.querySelectorAll('[data-t]').forEach(el => {
    const key = el.dataset.t;
    if (T[lang][key] !== undefined && typeof T[lang][key] === 'string') {
      el.textContent = T[lang][key];
    }
  });

  // placeholders
  document.querySelectorAll('[data-t-placeholder]').forEach(el => {
    const key = el.dataset.tPlaceholder;
    if (T[lang][key]) el.placeholder = T[lang][key];
  });

  // select options with data-t
  document.querySelectorAll('option[data-t]').forEach(el => {
    const key = el.dataset.t;
    if (T[lang][key] !== undefined) el.textContent = T[lang][key];
  });

  // export button
  document.getElementById('export-btn').textContent = T[lang].exportBtn;

  // re-render table header if loaded
  if (state.products.length) renderTableHeader();
}

document.getElementById('lang-toggle').addEventListener('click', () => {
  lang = lang === 'en' ? 'ar' : 'en';
  document.getElementById('lang-toggle').setAttribute('aria-pressed', String(lang === 'ar'));
  applyLang();
});

// ─── STATE ────────────────────────────────────────────────
const state = {
  rawRows: [],
  products: [],
  headers: [],
  fileName: '',
};

// ─── PRICE CALCULATION ────────────────────────────────────
function S() {
  return {
    rate: parseFloat(document.getElementById('exchange-rate').value) || 1,
    customs: parseFloat(document.getElementById('customs-rate').value) || 0,
    import_: parseFloat(document.getElementById('import-rate').value) || 0,
    vat: parseFloat(document.getElementById('vat-rate').value) || 0,
    margin: parseFloat(document.getElementById('profit-margin').value) || 0,
    rounding: document.getElementById('rounding-mode').value,
    minPrice: parseFloat(document.getElementById('min-price').value) || 0,
    compareOn: document.getElementById('compare-at-enabled').checked,
    compareMarkup: parseFloat(document.getElementById('compare-at-markup').value) || 0,
    currency: document.getElementById('target-currency').value,
    exportStatus: document.getElementById('export-status').value,
  };
}

function calcPrice(aed, s) {
  let p = aed * s.rate;
  p = p * (1 + s.customs / 100) * (1 + s.import_ / 100);
  p = p * (1 + s.margin / 100);
  p = p * (1 + s.vat / 100);
  p = Math.max(p, s.minPrice);
  p = round(p, s.rounding);
  const cmp = s.compareOn && s.compareMarkup > 0
    ? round(p * (1 - s.compareMarkup / 100), s.rounding)
    : null;
  return { price: p, compareAt: cmp };
}

function round(v, mode) {
  switch (mode) {
    case '0.5': return Math.round(v * 2) / 2;
    case '0.99': return Math.floor(v) + 0.99;
    case '1': return Math.round(v);
    case '5': return Math.round(v / 5) * 5;
    default: return Math.round(v * 100) / 100;
  }
}

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function trunc(s, n) { return s.length > n ? s.slice(0, n) + '…' : s; }

// ─── AUTO-RECALC: attach to all inputs ────────────────────
const settingIds = [
  'exchange-rate', 'customs-rate', 'import-rate', 'vat-rate',
  'profit-margin', 'rounding-mode', 'min-price',
  'compare-at-enabled', 'compare-at-markup'
];

settingIds.forEach(id => {
  const el = document.getElementById(id);
  ['input', 'change'].forEach(ev => el.addEventListener(ev, () => {
    updatePreview();
    if (state.products.length) renderTableBody();
  }));
});

// currency change → fetch rate then recalc
document.getElementById('target-currency').addEventListener('change', () => {
  fetchRate();
});

// compare-at toggle → show/hide markup field completely
document.getElementById('compare-at-enabled').addEventListener('change', function () {
  document.getElementById('compare-at-field').classList.toggle('hidden', !this.checked);
});

// ─── PREVIEW ──────────────────────────────────────────────
function updatePreview() {
  const s = S();
  const r = calcPrice(112, s);
  document.getElementById('pv-final').textContent = fmt(r.price) + ' ' + s.currency;
  document.getElementById('pv-compare').textContent = r.compareAt ? fmt(r.compareAt) + ' ' + s.currency : '—';
}
updatePreview();

// ─── LIVE RATE FETCH ──────────────────────────────────────
let rateFetching = false;

async function fetchRate() {
  const cur = document.getElementById('target-currency').value;
  const pill = document.getElementById('rate-pill');

  if (cur === 'AED') {
    document.getElementById('exchange-rate').value = '1.000000';
    pill.className = 'rate-pill live';
    pill.textContent = '1 : 1';
    updatePreview();
    if (state.products.length) renderTableBody();
    return;
  }

  if (rateFetching) return;
  rateFetching = true;
  pill.className = 'rate-pill';
  pill.textContent = t('fetchingRate');

  const tryFetch = async (url, extract) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return extract(await r.json());
  };

  try {
    let rate;
    try {
      rate = await tryFetch(
        `https://open.er-api.com/v6/latest/AED`,
        d => { if (d.result !== 'success') throw new Error(); return d.rates[cur]; }
      );
    } catch {
      rate = await tryFetch(
        `https://api.frankfurter.app/latest?from=AED&to=${cur}`,
        d => d.rates?.[cur]
      );
    }
    if (!rate) throw new Error('no rate');

    document.getElementById('exchange-rate').value = rate.toFixed(6);
    pill.className = 'rate-pill live';
    pill.textContent = `${rate.toFixed(4)} ${cur}`;
    updatePreview();
    if (state.products.length) renderTableBody();
  } catch {
    pill.className = 'rate-pill err';
    pill.textContent = '!';
    showToast(t('rateFail'), 'error');
  } finally {
    rateFetching = false;
  }
}

// auto-fetch on load
fetchRate();

// ─── CSV PARSER ───────────────────────────────────────────
function parseCSV(text) {
  const lines = [];
  let cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { cur += '""'; i++; } // escaped quote → keep both chars
      else { inQ = !inQ; cur += ch; }                       // opening/closing quote → keep it so splitLine sees it
    }
    else if (ch === '\n' && !inQ) { lines.push(cur.replace(/\r$/, '')); cur = ''; }
    else cur += ch;
  }
  if (cur) lines.push(cur.replace(/\r$/, ''));
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = splitLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const vals = splitLine(lines[i]);
    const obj = {};
    headers.forEach((h, j) => { obj[h] = vals[j] ?? ''; });
    rows.push(obj);
  }
  return { headers, rows };
}

function splitLine(line) {
  const cells = []; let cur = '', inQ = false;
  for (let i = 0; i <= line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQ && line[i + 1] === '"') { cur += '"'; i++; } else inQ = !inQ; }
    else if ((ch === ',' && !inQ) || i === line.length) { cells.push(cur); cur = ''; }
    else cur += ch;
  }
  return cells;
}

function groupProducts(rows) {
  const products = []; let current = null;
  rows.forEach(row => {
    if (row['Title'] && row['Title'].trim()) {
      current = {
        title: row['Title'], handle: row['URL handle'],
        vendor: row['Vendor'], imageUrl: row['Product image URL'],
        rows: [row], variants: [],
      };
      products.push(current);
    } else if (current) current.rows.push(row);
  });
  products.forEach(p => {
    p.variants = p.rows.filter(r => {
      if (!r['SKU'] || !r['SKU'].trim()) return false;
      // Skip phantom rows that have zero/missing price (always a Shopify CSV placeholder)
      if (!(parseFloat(r['Price']) > 0)) return false;
      // Also skip rows where Option1 value literally equals Option1 name (e.g., "Size" = "Size")
      const optName = (r['Option1 name'] || r['Option1 Name'] || '').trim().toLowerCase();
      const optVal  = (r['Option1 value'] || r['Option1 Value'] || '').trim().toLowerCase();
      if (optName && optVal && optName === optVal) return false;
      return true;
    });
  });
  return products;
}

// ─── FILE LOADING ─────────────────────────────────────────
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

document.getElementById('browse-btn').addEventListener('click', e => { e.stopPropagation(); fileInput.click(); });

// Clicking the drop zone itself (not on the Browse button) → open picker
dropZone.addEventListener('click', e => {
  if (e.target.id !== 'browse-btn') fileInput.click();
});

// Keyboard activation on the drop zone (Enter / Space)
dropZone.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
});

fileInput.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  const f = e.dataTransfer.files[0];
  if (f?.name.endsWith('.csv')) loadFile(f);
  else showToast('Please drop a .csv file', 'error');
});

// ─── QUICK-LOAD CHIPS: fetch CSV directly from Shopify Import folder ────────
document.querySelectorAll('.chip').forEach(btn => {
  btn.addEventListener('click', async () => {
    const key = btn.dataset.file;
    const fileName = `shopify_import_${key}.csv`;
    const url = `Shopify Import/${fileName}`;

    btn.disabled = true;
    btn.style.opacity = '0.6';
    showToast(lang === 'ar' ? `جاري تحميل ${fileName}…` : `Loading ${fileName}…`, 'info');

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      // Synthesise a File-like object so loadFile works unchanged
      const file = new File([text], fileName, { type: 'text/csv' });
      loadFile(file);
    } catch (err) {
      // Fallback: open file picker so user can locate it manually
      showToast(
        lang === 'ar'
          ? `تعذّر تحميل الملف تلقائياً — يرجى تحديده يدوياً`
          : `Could not auto-load ${fileName} — please select it manually`,
        'error'
      );
      fileInput.click();
    } finally {
      btn.disabled = false;
      btn.style.opacity = '';
    }
  });
});

function loadFile(file) {
  showLoadingBar(true);
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const { headers, rows } = parseCSV(e.target.result);
      if (!headers.length) throw new Error('Empty CSV');

      // Normalize multi-value Product category fields at parse time
      // e.g. "sets, Dungarees" → "Dungarees" (keeps last/most specific part)
      const catKey = 'Product category';
      if (headers.includes(catKey)) {
        rows.forEach(r => {
          if (r[catKey] && r[catKey].includes(',')) {
            r[catKey] = r[catKey].split(',').map(v => v.trim()).filter(Boolean).pop() || r[catKey];
          }
        });
      }

      state.headers = headers;
      state.rawRows = rows;
      state.products = groupProducts(rows);
      state.fileName = file.name;

      showUpload(false);
      renderTableHeader();
      renderTableBody();
      updateVendorFilter();
      updateStats();
      updateHeader();
      showToast(t('loadedMsg', state.products.length, file.name), 'success');
      document.getElementById('export-btn').disabled = false;
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      showLoadingBar(false);
    }
  };
  reader.readAsText(file, 'utf-8');
}

function resetToUpload() {
  state.rawRows = []; state.products = []; state.headers = []; state.fileName = '';
  showUpload(true);
  document.getElementById('export-btn').disabled = true;
  document.getElementById('file-badge').classList.add('hidden');
  fileInput.value = '';
}

document.getElementById('clear-btn').addEventListener('click', resetToUpload);

// Logo click → back to upload view
document.querySelector('.logo').addEventListener('click', resetToUpload);
document.querySelector('.logo').style.cursor = 'pointer';

function showUpload(yes) {
  document.getElementById('upload-view').classList.toggle('hidden', !yes);
  document.getElementById('table-view').classList.toggle('hidden', yes);
}

function updateHeader() {
  const badge = document.getElementById('file-badge');
  badge.classList.remove('hidden');
  document.getElementById('file-name-label').textContent = state.fileName;
  document.getElementById('header-count').textContent =
    t('statProducts', state.products.length);
}

// ─── TABLE RENDER ─────────────────────────────────────────
function renderTableHeader() {
  const thead = document.getElementById('table-head');
  thead.innerHTML = `<tr>
    <th style="width:42px">${t('colImg')}</th>
    <th>${t('colProduct')}</th>
    <th>${t('colVendor')}</th>
    <th>${t('colSKU')}</th>
    <th>${t('colSize')}</th>
    <th>${t('colOriginal')}</th>
    <th>${t('colPrice')} (${S().currency})</th>
    <th>${t('colCompare')}</th>
    <th>${t('colStock')}</th>
  </tr>`;
}

function renderTableBody() {
  const s = S();
  const search = document.getElementById('search-input').value.toLowerCase();
  const vendor = document.getElementById('filter-vendor').value;

  const filtered = state.products.filter(p =>
    (!search || p.title.toLowerCase().includes(search) || (p.vendor || '').toLowerCase().includes(search)) &&
    (!vendor || p.vendor === vendor)
  );

  const tbody = document.getElementById('table-body');
  let html = '';

  filtered.forEach(p => {
    const firstPrice = parseFloat(p.variants[0]?.['Price']) || 0;
    const pc = calcPrice(firstPrice, s);

    html += `<tr class="prod-row">
      <td class="td-img">${p.imageUrl
        ? `<img src="${esc(p.imageUrl)}" onerror="this.closest('td').innerHTML='<span class=td-img-placeholder>🖼️</span>'" loading="lazy">`
        : '<span class="td-img-placeholder">🖼️</span>'}</td>
      <td class="td-title" title="${esc(p.title)}">${esc(trunc(p.title, 55))}</td>
      <td>${esc(p.vendor || '—')}</td>
      <td colspan="2" style="color:var(--muted);font-size:11px">${t('variantsCount', p.variants.length)}</td>
      <td class="td-aed">${fmt(firstPrice)} AED</td>
      <td class="td-new">${fmt(pc.price)} ${s.currency}</td>
      <td class="td-cmp">${pc.compareAt ? fmt(pc.compareAt) + ' ' + s.currency : '—'}</td>
      <td></td>
    </tr>`;

    p.variants.forEach(v => {
      const vp = parseFloat(v['Price']) || 0;
      const vc = calcPrice(vp, s);
      const stock = parseInt(v['Inventory quantity']) || 0;
      html += `<tr class="var-row">
        <td></td>
        <td class="var-indent">↳ ${esc(v['Option1 value'] || '')}${v['Option2 value'] ? ' / ' + esc(v['Option2 value']) : ''}</td>
        <td></td>
        <td class="td-sku">${esc(v['SKU'] || '—')}</td>
        <td class="td-size">${esc(v['Option1 value'] || '—')}</td>
        <td class="td-aed">${fmt(vp)} AED</td>
        <td class="td-new">${fmt(vc.price)} ${s.currency}</td>
        <td class="td-cmp">${vc.compareAt ? fmt(vc.compareAt) + ' ' + s.currency : '—'}</td>
        <td><span class="stock-pill ${stock > 0 ? 'in' : 'out'}">${stock > 0 ? t('inStock', stock) : t('outOfStock')}</span></td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;
  updateStats(filtered);
}

function updateVendorFilter() {
  const sel = document.getElementById('filter-vendor');
  const vendors = [...new Set(state.products.map(p => p.vendor).filter(Boolean))].sort();
  sel.innerHTML = `<option value="">${t('allVendors')}</option>` +
    vendors.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
}

function updateStats(filtered) {
  filtered = filtered || state.products;
  const s = S();
  const prices = filtered.flatMap(p => p.variants.map(v => calcPrice(parseFloat(v['Price']) || 0, s).price)).filter(p => p > 0);
  const avg = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  document.getElementById('stat-count').textContent = t('statProducts', filtered.length);
  document.getElementById('stat-avg').textContent = avg ? t('statAvg', fmt(avg), s.currency) : '—';
}

// search & filter → re-render body
document.getElementById('search-input').addEventListener('input', () => { if (state.products.length) renderTableBody(); });
document.getElementById('filter-vendor').addEventListener('change', () => { if (state.products.length) renderTableBody(); });

// ─── EXPORT ───────────────────────────────────────────────
document.getElementById('export-btn').addEventListener('click', exportCSV);

function exportCSV() {
  if (!state.rawRows.length) return;
  const s = S();

  // Exclude phantom/zero-price rows from export (they'd create $0 variants in Shopify)
  const exportRows = state.rawRows.filter(row => {
    const price = parseFloat(row['Price']);
    // Keep: rows with a title (product header rows) or rows with a real price
    return row['Title']?.trim() || (price > 0);
  });

  const modified = exportRows.map(row => {
    const r = { ...row };
    // Always clear Compare-at price first — prevents stale AED values bleeding through
    r['Compare-at price'] = '';

    const orig = parseFloat(row['Price']);
    if (!isNaN(orig) && orig > 0) {
      const calc = calcPrice(orig, s);
      if (s.compareOn && calc.compareAt) {
        // Discount ON: Price = discounted (lower), Compare-at = full price (crossed out in Shopify)
        r['Price'] = calc.compareAt.toFixed(2);
        r['Compare-at price'] = calc.price.toFixed(2);
      } else {
        // Discount OFF: just write the calculated price, compare-at stays ''
        r['Price'] = calc.price.toFixed(2);
      }
    }
    if (s.exportStatus !== 'keep' && row['Status']) {
      r['Status'] = s.exportStatus === 'active' ? 'Active' : 'Draft';
    }
    // Clear Product category — scraped values (e.g. "Sleepsuits", "sets") are not valid
    // Shopify taxonomy IDs and cause "invalid product category" errors on import.
    // Shopify will simply leave it unset, which is safe.
    if ('Product category' in r) r['Product category'] = '';
    return r;
  });

  const csvText = [
    state.headers.map(csvCell).join(','),
    ...modified.map(row => state.headers.map(h => csvCell(row[h] ?? '')).join(','))
  ].join('\r\n');

  const fname = (state.fileName || 'shopify').replace('.csv', '') + `_${s.currency}_priced.csv`;
  // Prepend UTF-8 BOM (\uFEFF) so Excel auto-detects encoding and renders
  // accented characters (é, ü, etc.) and Arabic text correctly
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvText], { type: 'text/csv;charset=utf-8;' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: fname });
  a.click(); URL.revokeObjectURL(a.href);
  showToast(t('exportDone'), 'success');
}

function csvCell(v) {
  const s = String(v ?? '');
  // Quote if contains comma, double-quote, newline OR bare carriage return
  // (bare \r without \n causes Excel to treat the field as a line break)
  return (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r'))
    ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// ─── HELPERS ──────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast ' + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = 'toast hidden'; }, 3500);
}

function showLoadingBar(show) {
  let bar = document.getElementById('loading-bar');
  if (show && !bar) {
    bar = document.createElement('div');
    bar.id = 'loading-bar';
    bar.className = 'loading-bar';
    document.body.prepend(bar);
  } else if (!show && bar) bar.remove();
}

// ─── INIT ─────────────────────────────────────────────────
applyLang();
