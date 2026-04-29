// ============================================================
// Tranio Hub — data layer for the React app
// Wires the redesign UI to the real backend:
//  - Supabase Auth (login, register, password recovery)
//  - Google Sheets fetch via /api/materials
//  - Telegram channels via /api/posts
//  - Supabase tables: activity_log (READ ONLY for existing rows,
//    INSERT-only for new download/teaser/sms/rating events),
//    download_counts (UPSERT), ratings (UPSERT)
// Nothing here ever DELETES or UPDATES existing log rows.
// ============================================================

(function () {
  // ---- Supabase client ----------------------------------------------
  const SUPABASE_URL = 'https://nctkgoasvoumfnlgcdrj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_bqF0kmX7F3pfRhC02c1Q0g_x7FVgyFp';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  window.sb = sb;

  // ---- Static metadata (categories, countries, brands) -------------
  // The design's UI references these by exact key, so we keep the same shape
  // as in data.js but populate counts dynamically from loaded materials.
  const COUNTRIES = {
    Bali:    { iso: "ID", flag: "🇮🇩", label: "Bali" },
    Cambodia:{ iso: "KH", flag: "🇰🇭", label: "Cambodia" },
    Cyprus:  { iso: "CY", flag: "🇨🇾", label: "Cyprus" },
    Global:  { iso: "GL", flag: "🌐", label: "Global" },
    Greece:  { iso: "GR", flag: "🇬🇷", label: "Greece" },
    Indonesia:{ iso:"ID", flag: "🇮🇩", label: "Indonesia" },
    Montenegro:{ iso:"ME",flag: "🇲🇪", label: "Montenegro" },
    Oman:    { iso: "OM", flag: "🇴🇲", label: "Oman" },
    Portugal:{ iso: "PT", flag: "🇵🇹", label: "Portugal" },
    Russia:  { iso: "RU", flag: "🇷🇺", label: "Russia" },
    Spain:   { iso: "ES", flag: "🇪🇸", label: "Spain" },
    SaoTome: { iso: "ST", flag: "🇸🇹", label: "São Tomé and Príncipe" },
    'Saudi Arabia': { iso: "SA", flag: "🇸🇦", label: "Saudi Arabia" },
    Thailand:{ iso: "TH", flag: "🇹🇭", label: "Thailand" },
    Turkey:  { iso: "TR", flag: "🇹🇷", label: "Turkey" },
    UAE:     { iso: "AE", flag: "🇦🇪", label: "UAE" },
  };

  // category id → display "kind" used on cards / modal
  const CAT_KIND = {
    presentations: "Презентация",
    'pres-regional': "Презентация",
    'pres-company':  "Презентация",
    emails:        "E-mail рассылка",
    messengers:    "Скрипт мессенджера",
    scripts:       "Скрипт мессенджера",
    teasers:       "Тизер / сторис",
    webinars:      "Запись вебинара",
    analytics:     "Аналитика",
    landings:      "Посадочная страница",
    articles:      "Статья",
  };

  // category id → React-friendly id used by the sidebar.
  // The sheet may use either the "pres-regional" / "pres-company" sub-ids
  // or the parent "presentations". We normalize to the design's shape.
  function normalizeCat(rawCat) {
    if (rawCat === 'pres-regional') return { cat: 'presentations', subCat: 'regional' };
    if (rawCat === 'pres-company')  return { cat: 'presentations', subCat: 'company' };
    if (rawCat === 'messengers')    return { cat: 'scripts' };
    return { cat: rawCat };
  }

  // Map "Иконка"/file-type column from sheet to the design's TYPE chip
  function normalizeType(t) {
    if (!t) return 'PDF';
    const v = String(t).toUpperCase().trim();
    if (v.includes('PPTX') || v.includes('PPT')) return 'PPTX';
    if (v.includes('PDF')) return 'PDF';
    if (v === 'VIDEO' || v === 'MP4') return 'VIDEO';
    if (v === 'IMAGE' || v === 'IMG' || v === 'PNG' || v === 'JPG') return 'IMAGE';
    if (v === 'HTML' || v === 'URL' || v === 'LINK') return 'HTML';
    if (v === 'DOC' || v === 'DOCX') return 'DOC';
    return v;
  }

  // ---- CSV parser (carries multi-line quoted fields) ---------------
  function splitCSVRows(csv) {
    const rows = []; let cur = ''; let inQ = false;
    for (let i = 0; i < csv.length; i++) {
      const ch = csv[i];
      if (ch === '"') { inQ = !inQ; cur += ch; }
      else if (ch === '\n' && !inQ) { if (cur.length) rows.push(cur); cur = ''; }
      else if (ch === '\r' && !inQ) { /* skip */ }
      else cur += ch;
    }
    if (cur.length) rows.push(cur);
    return rows;
  }
  function splitCSVCells(row) {
    const cells = []; let cur = ''; let inQ = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQ && row[i+1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return cells;
  }
  function parseCSV(csv) {
    const rows = splitCSVRows(csv);
    if (!rows.length) return [];
    const header = splitCSVCells(rows[0]).map(h => h.trim());
    return rows.slice(1).map(r => {
      const cells = splitCSVCells(r);
      const o = {};
      header.forEach((h, i) => { o[h] = (cells[i] || '').trim(); });
      return o;
    });
  }

  // ---- Adapter: sheet row → design Material shape ------------------
  // Actual sheet headers (production):
  //   ID | Название | Категория | Страна | Тип файла | Дата добавления |
  //   Новинка | Ссылка на файл | Иконка | Описание | Бренд | tags |
  //   brief | sms | url_teaser | url_onepage
  // Map "Tranio Capital" → 'capital' (the investments arm), the rest → 'brokerage'.
  function normalizeBrand(raw) {
    const v = String(raw || '').toLowerCase().trim();
    if (v.includes('capital') || v.includes('инвест')) return 'capital';
    return 'brokerage';
  }

  function rowToMaterial(row, idx) {
    // Tolerate english headers and legacy column names
    const get = (...keys) => { for (const k of keys) if (row[k] != null && row[k] !== '') return row[k]; return ''; };
    const rawCat = get('Категория','cat','category').toLowerCase().trim();
    const subRaw = get('Подкатегория','subCat','sub').toLowerCase().trim();
    const norm = normalizeCat(rawCat);
    const subCat = subRaw ? (subRaw.includes('regional') || subRaw.includes('регион') ? 'regional' :
                              subRaw.includes('company')  || subRaw.includes('компани') ? 'company'  : norm.subCat)
                          : norm.subCat;
    const country = get('Страна','country','Country') || 'Global';
    const isNewRaw = String(get('Новинка','isNew','new')).toLowerCase().trim();
    const isNew = isNewRaw === 'true' || isNewRaw === 'да' || isNewRaw === 'yes' || isNewRaw === '1';
    const typeNorm = normalizeType(get('Тип файла','type','Тип'));
    const downloadsRaw = get('Скачиваний','dl','downloads');
    const downloads = parseInt(downloadsRaw, 10) || 0;
    const id = parseInt(get('ID','id'), 10) || (idx + 1);
    const title = get('Название','title','Title');
    const desc  = get('Описание','desc','Description');
    // "Дата добавления" is the canonical column name in prod; fall back to old names
    const date  = get('Дата добавления','Дата','date','Date');
    const url   = get('Ссылка на файл','url','link');
    // Templates for messengers / teaser-share live in `sms` column
    const template = get('sms','Шаблон','template');
    const brand    = normalizeBrand(get('Бренд','brand','Brand'));
    const brief    = get('brief','Бриф');
    const teaserUrl  = get('url_teaser');
    const onepageUrl = get('url_onepage');

    // Tags: prefer the explicit `tags` column (comma-separated). Otherwise
    // derive from country/kind so chips don't disappear for old rows.
    const rawTags = get('tags','Tags');
    let tags;
    if (rawTags) {
      tags = rawTags.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    } else {
      tags = [];
      if (country) tags.push(country);
      if (CAT_KIND[norm.cat] && !tags.includes(CAT_KIND[norm.cat])) tags.push(CAT_KIND[norm.cat]);
    }

    return {
      id, title, desc,
      cat: norm.cat,
      subCat,
      brand,
      country,
      date,
      downloads,
      rating: null,
      ratings: 0,
      type: typeNorm,
      isNew,
      tags,
      kind: CAT_KIND[norm.cat] || 'Материал',
      cover: norm.cat === 'webinars' ? 'dark' : undefined,
      url, template,
      brief, teaserUrl, onepageUrl,
    };
  }

  // ---- Loaders ------------------------------------------------------
  async function loadMaterials() {
    try {
      const resp = await fetch('/api/materials');
      if (!resp.ok) throw new Error('Sheet fetch failed: ' + resp.status);
      const csv = await resp.text();
      const rows = parseCSV(csv);
      return rows.map(rowToMaterial).filter(m => m.title);
    } catch (e) {
      console.warn('[data-loader] materials fetch failed:', e.message);
      return [];
    }
  }

  async function loadTgPosts() {
    try {
      const resp = await fetch('/api/posts');
      if (!resp.ok) throw new Error('Posts fetch failed: ' + resp.status);
      const data = await resp.json();
      // Map api shape → design TG shape: { ch, time, title, snip, views, link }
      return (data.posts || []).map(p => ({
        ch: p.channelName || p.channel || '',
        time: p.date ? new Date(p.date).toLocaleString('ru-RU', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        }) : '',
        title: p.text ? p.text.split('\n')[0].slice(0, 110) : '',
        snip: p.text ? p.text.split('\n').slice(1).join(' ').slice(0, 220) : '',
        views: p.views || '',
        link: p.link || '',
      }));
    } catch (e) {
      console.warn('[data-loader] tg posts fetch failed:', e.message);
      return [];
    }
  }

  async function loadActivityLog() {
    try {
      // Existing schema (preserved): file_id, file_title, user_email, user_name, action, created_at
      const { data, error } = await sb.from('activity_log')
        .select('*').order('created_at', { ascending: false }).limit(500);
      if (error) throw error;
      return (data || []).map(r => ({
        file: r.file_title || '',
        material_id: r.file_id,
        user: r.user_name || r.user_email || '',
        when: r.created_at ? formatLogDate(r.created_at) : '',
        action: actionLabel(r.action || 'download'),
        rating: r.rating != null ? Number(r.rating) : null,
        raw: r,
      }));
    } catch (e) {
      console.warn('[data-loader] activity_log fetch failed:', e.message);
      return [];
    }
  }

  async function loadDownloadCounts() {
    try {
      // Existing schema (preserved): file_id, count
      const { data, error } = await sb.from('download_counts').select('*');
      if (error) throw error;
      const map = {};
      (data || []).forEach(r => { map[r.file_id] = r.count || 0; });
      return map;
    } catch (e) {
      console.warn('[data-loader] download_counts fetch failed:', e.message);
      return {};
    }
  }

  async function loadRatings(currentUserId) {
    try {
      const { data: all, error: e1 } = await sb.from('ratings').select('material_id, score');
      if (e1) throw e1;
      const byMaterial = {};
      (all || []).forEach(r => {
        const id = r.material_id;
        byMaterial[id] = byMaterial[id] || { sum: 0, n: 0 };
        byMaterial[id].sum += Number(r.score) || 0;
        byMaterial[id].n   += 1;
      });
      const aggregate = {};
      Object.keys(byMaterial).forEach(id => {
        const { sum, n } = byMaterial[id];
        aggregate[id] = { rating: n ? sum / n : null, ratings: n };
      });

      let mine = {};
      if (currentUserId) {
        const { data: own } = await sb.from('ratings').select('material_id, score').eq('user_id', currentUserId);
        (own || []).forEach(r => { mine[r.material_id] = Number(r.score) || 0; });
      }
      return { aggregate, mine };
    } catch (e) {
      console.warn('[data-loader] ratings fetch failed:', e.message);
      return { aggregate: {}, mine: {} };
    }
  }

  // ---- Mutators (preserve existing log; only INSERT new rows) ------
  // IMPORTANT: schema fields match the existing prod table to avoid breaking
  // anything: file_id, file_title, user_email, user_name, action.
  async function logActivity({ user, materialId, materialTitle, actionType, rating }) {
    if (!user) return;
    try {
      // For rating events, the legacy code stored it as part of the title:
      //   "Material name → 5★"
      // We preserve the same convention so the existing log view stays readable.
      const title = (actionType === 'rating' && rating != null)
        ? `${materialTitle} → ${rating}★`
        : materialTitle;
      const row = {
        user_email: user.email,
        user_name:  user.name || (user.email && user.email.split('@')[0]) || '',
        file_id:    materialId,
        file_title: title,
        action:     actionType || 'download',
      };
      const { error } = await sb.from('activity_log').insert(row);
      if (error) console.warn('[data-loader] activity_log insert failed:', error.message);
    } catch (e) {
      console.warn('[data-loader] activity_log insert error:', e.message);
    }
  }

  async function bumpDownloadCount(materialId, currentCount) {
    try {
      const next = (currentCount || 0) + 1;
      const { error } = await sb.from('download_counts').upsert(
        { file_id: materialId, count: next },
        { onConflict: 'file_id' }
      );
      if (error) console.warn('[data-loader] download_counts upsert failed:', error.message);
      return next;
    } catch (e) {
      console.warn('[data-loader] download_counts upsert error:', e.message);
      return currentCount || 0;
    }
  }

  async function setRating(userId, materialId, score) {
    try {
      const { error } = await sb.from('ratings').upsert(
        { user_id: userId, material_id: materialId, score },
        { onConflict: 'user_id,material_id' }
      );
      if (error) console.warn('[data-loader] ratings upsert failed:', error.message);
    } catch (e) {
      console.warn('[data-loader] ratings upsert error:', e.message);
    }
  }

  // ---- Helpers ------------------------------------------------------
  function actionLabel(t) {
    const m = { download: 'Скачивание', teaser: 'Тизер', sms: 'Шаблон', rating: 'Оценка', view: 'Просмотр' };
    return m[t] || t || 'Действие';
  }

  function formatLogDate(iso) {
    try {
      const d = new Date(iso);
      const now = new Date();
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const hh = String(d.getHours()).padStart(2,'0');
      const mi = String(d.getMinutes()).padStart(2,'0');
      if (now.toDateString() === d.toDateString()) return `Сегодня, ${hh}:${mi}`;
      const y = new Date(now - 86400000);
      if (y.toDateString() === d.toDateString()) return `Вчера, ${hh}:${mi}`;
      return `${dd}.${mm} ${hh}:${mi}`;
    } catch (e) { return ''; }
  }

  // Re-derive sidebar counts (BRANDS, CATS) from loaded materials
  function deriveCatsAndBrands(materials) {
    const total = materials.length;
    const byCat = {};
    materials.forEach(m => { byCat[m.cat] = (byCat[m.cat] || 0) + 1; });
    const subCount = (cat, sub) => materials.filter(m => m.cat === cat && m.subCat === sub).length;

    const CATS = [
      { id: 'presentations', label: 'Презентации', count: byCat.presentations || 0, hasSub: true,
        subs: [
          { id: 'regional', label: 'Региональные', count: subCount('presentations','regional') },
          { id: 'company',  label: 'О компании',   count: subCount('presentations','company')  },
        ] },
      { id: 'emails',     label: 'E-mail рассылки',     count: byCat.emails    || 0 },
      { id: 'scripts',    label: 'Скрипты мессенджеров', count: byCat.scripts   || 0 },
      { id: 'teasers',    label: 'Тизеры и сторис',     count: byCat.teasers   || 0 },
      { id: 'webinars',   label: 'Записи вебинаров',    count: byCat.webinars  || 0 },
      { id: 'analytics',  label: 'Аналитика',           count: byCat.analytics || 0 },
      { id: 'landings',   label: 'Посадочные страницы', count: byCat.landings  || 0 },
      { id: 'articles',   label: 'Статьи',              count: byCat.articles  || 0 },
    ];
    const BRANDS = [
      { id: 'all',       label: 'Все материалы', count: total },
      { id: 'capital',   label: 'Tranio Capital',   count: materials.filter(m => m.brand === 'capital').length },
      { id: 'brokerage', label: 'Tranio Brokerage', count: materials.filter(m => m.brand === 'brokerage').length },
    ];
    return { CATS, BRANDS };
  }

  // Apply download counts and ratings on top of materials
  function applyEnrichments(materials, downloadCounts, ratings) {
    return materials.map(m => {
      const out = { ...m };
      if (downloadCounts[m.id] != null) out.downloads = downloadCounts[m.id];
      const r = ratings.aggregate?.[m.id];
      if (r) { out.rating = r.rating; out.ratings = r.ratings; }
      return out;
    });
  }

  // Public surface
  window.HUB_API = {
    sb,
    COUNTRIES,
    CAT_KIND,
    loadMaterials, loadTgPosts, loadActivityLog,
    loadDownloadCounts, loadRatings,
    logActivity, bumpDownloadCount, setRating,
    deriveCatsAndBrands, applyEnrichments,
    formatLogDate, actionLabel,
  };
})();
