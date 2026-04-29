/* global React, ReactDOM */
const { useState, useMemo, useEffect, useRef, useCallback } = React;
const API = window.HUB_API;
const sb  = API.sb;

// ============================================================
// Auth recovery detection — must happen synchronously on load
// ============================================================
let isPasswordRecovery = (function detectRecovery() {
  const hash = window.location.hash || '';
  const search = window.location.search || '';
  return /[#?&]type=recovery/.test(hash) || /[?&]type=recovery/.test(search);
})();

// ============================================================
// Icons (tiny inline SVG, monochrome)
// ============================================================
const Ic = {
  doc:    (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M3 1.5h6l4 4V14a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 14V2a.5.5 0 0 1 0-.5z"/><path d="M9 1.5V5.5h4"/></svg>),
  grid:   (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="5"/><rect x="2" y="9" width="5" height="5"/><rect x="9" y="9" width="5" height="5"/></svg>),
  presentation: (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><rect x="2" y="2.5" width="12" height="9"/><path d="M6 11.5l-1 2.5M10 11.5l1 2.5M8 11.5V14"/></svg>),
  mail:   (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><rect x="2" y="3.5" width="12" height="9"/><path d="M2.5 4l5.5 4.5L13.5 4"/></svg>),
  msg:    (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M2 3.5h12v8H6l-3 2.5v-2.5H2v-8z"/></svg>),
  sparkle:(p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>),
  play:   (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M5 3l8 5-8 5V3z"/></svg>),
  chart:  (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M2 13h12M4 11V7M7 11V4M10 11V8M13 11V5"/></svg>),
  link:   (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M7 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-1 1M9 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l1-1"/></svg>),
  article:(p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M3 2.5h10v11H3z M5 5h6M5 7.5h6M5 10h4"/></svg>),
  send:   (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M14 2 L7 9 M14 2 L9 14 L7 9 L2 7 L14 2z"/></svg>),
  log:    (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M3 4h10M3 8h10M3 12h10"/></svg>),
  arrow:  (p) => (<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 8h10M9 4l4 4-4 4"/></svg>),
  back:   (p) => (<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M13 8H3M7 4l-4 4 4 4"/></svg>),
  dl:     (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><path d="M8 2v9M4 8l4 4 4-4M3 14h10"/></svg>),
  search: (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>),
  x:      (p) => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M3 3l10 10M13 3L3 13"/></svg>),
  copy:   (p) => (<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" {...p}><rect x="5" y="5" width="9" height="9"/><path d="M3 11V2h9"/></svg>),
};

// ============================================================
// Stars / CountryMark
// ============================================================
const Stars = ({ value, ratings }) => {
  const v = value || 0;
  return (
    <span className="stars" title={ratings ? `${v.toFixed(1)} (${ratings})` : "Нет оценок"}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`st ${i <= Math.round(v) ? 'filled' : ''}`}>★</span>
      ))}
    </span>
  );
};

const CountryMark = ({ code }) => {
  const c = API.COUNTRIES[code] || { flag: '🏳', label: code };
  return (
    <span className="country">
      <span className="flag">{c.flag}</span>
      <span>{c.label}</span>
    </span>
  );
};

// ============================================================
// Toast (lightweight)
// ============================================================
const Toast = ({ msg }) => {
  if (!msg) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--surface)', padding: '10px 18px',
      borderRadius: 6, fontSize: 13, zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
    }}>{msg}</div>
  );
};

// ============================================================
// Sidebar
// ============================================================
const Sidebar = ({ section, sub, brand, onNav, cats, brands, syncedAt }) => {
  const navBrand = (id, label, count) => (
    <button key={id} className={`nav-item ${section === 'brand' && brand === id ? 'active' : ''}`}
      onClick={() => onNav({ section: 'brand', brand: id })}>
      <span className="nav-glyph">{id === 'all' ? '◆' : '▸'}</span>
      <span>{label}</span>
      <span className="nav-count">{count}</span>
    </button>
  );

  const catGlyph = {
    presentations: <Ic.presentation />, emails: <Ic.mail />, scripts: <Ic.msg />,
    teasers: <Ic.sparkle />, webinars: <Ic.play />, analytics: <Ic.chart />,
    landings: <Ic.link />, articles: <Ic.article />,
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="mark">tranio<span className="dot">.</span>hub</span>
        <span className="env">v1</span>
      </div>

      <div className="nav-group">
        <div className="nav-label">Бренд</div>
        {brands.map(b => navBrand(b.id, b.label, b.count))}
      </div>

      <div className="nav-group">
        <div className="nav-label">Категории</div>
        {cats.map(c => (
          <React.Fragment key={c.id}>
            <button className={`nav-item ${section === 'cat' && sub?.cat === c.id && !sub?.sub ? 'active' : ''}`}
              onClick={() => onNav({ section: 'cat', sub: { cat: c.id } })}>
              <span className="nav-glyph">{catGlyph[c.id]}</span>
              <span>{c.label}</span>
              <span className="nav-count">{c.count}</span>
            </button>
            {c.subs && c.subs.map(s => (
              <button key={s.id} className={`nav-item sub ${section === 'cat' && sub?.cat === c.id && sub?.sub === s.id ? 'active' : ''}`}
                onClick={() => onNav({ section: 'cat', sub: { cat: c.id, sub: s.id } })}>
                <span>{s.label}</span>
                <span className="nav-count">{s.count}</span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="nav-group">
        <button className={`nav-item ${section === 'tg' ? 'active' : ''}`}
          onClick={() => onNav({ section: 'tg' })}>
          <span className="nav-glyph"><Ic.send /></span>
          <span>Telegram-каналы</span>
        </button>
        <button className={`nav-item ${section === 'log' ? 'active' : ''}`}
          onClick={() => onNav({ section: 'log' })}>
          <span className="nav-glyph"><Ic.log /></span>
          <span>Лог скачиваний</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <span className="live-dot"></span>
        <span>LIVE{syncedAt ? ` · synced ${syncedAt}` : ''}</span>
      </div>
    </aside>
  );
};

// ============================================================
// Topbar
// ============================================================
const Topbar = ({ crumbs, userName, userIni, onLogout }) => (
  <header className="topbar">
    <div className="crumbs">
      {crumbs.map((c, i) => (
        <span key={i}>
          {i > 0 && <span className="sep">/</span>}
          <span className={i === crumbs.length - 1 ? 'here' : ''}>{c}</span>
        </span>
      ))}
    </div>
    <div className="spacer" />
    <div className="user-chip">
      <span className="avatar">{userIni}</span>
      <span>{userName}</span>
    </div>
    <button className="btn-ghost" onClick={onLogout}>Выйти</button>
  </header>
);

// ============================================================
// Stat strip
// ============================================================
const StatStrip = ({ items }) => (
  <div className="stats">
    {items.map((s, i) => (
      <div className="stat" key={i}>
        <span className="num">{s.num}</span>
        <span className="lbl">{s.lbl}</span>
      </div>
    ))}
  </div>
);

// ============================================================
// Filter rail
// ============================================================
const FilterRail = ({ filters, onChange, materials }) => {
  // Derive available chips from real materials so we don't show empty chips
  const COUNTRY_KEYS = useMemo(() => {
    const set = new Set(materials.map(m => m.country).filter(Boolean));
    return Array.from(set).sort();
  }, [materials]);
  const TYPES = useMemo(() => {
    const set = new Set(materials.map(m => m.type).filter(Boolean));
    return Array.from(set);
  }, [materials]);
  const TAGS = useMemo(() => {
    const set = new Set(materials.flatMap(m => m.tags || []));
    return Array.from(set).slice(0, 16);
  }, [materials]);

  const toggle = (key, val) => {
    const arr = filters[key] || [];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next });
  };
  const setRating = (val) => {
    onChange({ ...filters, rating: filters.rating === val ? null : val });
  };
  const reset = () => onChange({ q: "", country: [], type: [], tag: [], rating: null });

  return (
    <div className="filter-rail">
      <div className="search">
        <Ic.search />
        <input value={filters.q || ""}
          onChange={e => onChange({ ...filters, q: e.target.value })}
          placeholder="Поиск по названию, стране или описанию…" />
      </div>
      <div className="filter-row">
        <span className="label">Страна</span>
        <div className="chips">
          {COUNTRY_KEYS.map(k => {
            const c = API.COUNTRIES[k] || { flag: '🏳', label: k };
            const active = (filters.country || []).includes(k);
            return (
              <button key={k} className={`chip ${active ? 'active' : ''}`} onClick={() => toggle('country', k)}>
                <span className="flag">{c.flag}</span><span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="filter-row">
        <span className="label">Тип</span>
        <div className="chips">
          {TYPES.map(t => {
            const active = (filters.type || []).includes(t);
            return (
              <button key={t} className={`chip ${active ? 'active' : ''}`} onClick={() => toggle('type', t)}>{t}</button>
            );
          })}
          <button className="chip reset" onClick={reset}>Сбросить</button>
        </div>
      </div>
      {TAGS.length > 0 && (
        <div className="filter-row">
          <span className="label">Теги</span>
          <div className="chips">
            {TAGS.map(t => {
              const active = (filters.tag || []).includes(t);
              return (
                <button key={t} className={`chip ${active ? 'active' : ''}`} onClick={() => toggle('tag', t)}>{t}</button>
              );
            })}
          </div>
        </div>
      )}
      <div className="filter-row">
        <span className="label">Рейтинг</span>
        <div className="chips">
          {[4,3].map(v => (
            <button key={v} className={`chip ${filters.rating === v ? 'active' : ''}`} onClick={() => setRating(v)}>★ {v}+</button>
          ))}
          <button className={`chip ${filters.rating === 'any' ? 'active' : ''}`} onClick={() => setRating('any')}>С оценками</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Card
// ============================================================
const Card = ({ m, onOpen }) => {
  const isDark = m.cover === 'dark';
  const thumb = API.getDriveThumb(m.url) || API.getDriveThumb(m.teaserUrl);
  const showThumb = thumb && !isDark;
  return (
    <article className="card" onClick={() => onOpen(m)}>
      <div className={`card-cover ${!isDark && !showThumb ? 'placeholder' : ''}`}
           style={isDark
             ? {background: '#1c2230'}
             : showThumb
               ? {background: `#fbf8f2 url("${thumb}") center/cover no-repeat`}
               : {}}>
        {m.isNew && <span className="ribbon-new">Новое</span>}
        <span className="filetype">{m.type}</span>
        {!isDark && !showThumb && <span className="ph-text">{m.kind}</span>}
        {isDark && (
          <div style={{
            color: '#e8e2d2', fontFamily: 'serif', fontWeight: 700,
            fontSize: 22, lineHeight: 1.05, padding: '14px 16px',
            textTransform: 'uppercase', letterSpacing: '0.01em', textAlign: 'left', alignSelf: 'flex-start'
          }}>
            {m.title.split(' ').slice(0,4).join(' ')}
          </div>
        )}
      </div>
      <div className="card-body">
        <span className="card-kind">{m.kind}</span>
        <h3 className="card-title">{m.title}</h3>
        {m.desc && <p className="card-desc">{m.desc}</p>}
        <div className="card-meta">
          <CountryMark code={m.country} />
          <span className="dot">·</span>
          <span>{m.date}</span>
          <span className="dl">↓ {m.downloads}</span>
        </div>
      </div>
      <div className="card-action">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', color: 'var(--ink-4)' }}>
          {m.rating ? <span className="rate"><Stars value={m.rating} /> {m.rating.toFixed(1)}</span> : '— нет оценок'}
        </span>
        <span className="open">Открыть <Ic.arrow /></span>
      </div>
    </article>
  );
};

// ============================================================
// Modal
// ============================================================
const Modal = ({ m, onClose, onDownload, onRate, onTemplateCopy, myRating }) => {
  const [copied, setCopied] = useState(false);
  const [tplCopied, setTplCopied] = useState(false);
  const [rating, setRating] = useState(myRating || 0);
  const [hover, setHover] = useState(0);
  useEffect(() => { setRating(myRating || 0); }, [myRating]);
  if (!m) return null;
  const isDark = m.cover === 'dark';
  const thumb = API.getDriveThumb(m.url) || API.getDriveThumb(m.teaserUrl);
  const showThumb = thumb && !isDark;
  const url = `${window.location.origin}${window.location.pathname}#m-${m.id}`;

  const handleRate = (i) => {
    setRating(i);
    onRate?.(m, i);
  };

  const handleDownload = (kind) => {
    // kind: 'download' | 'teaser' | 'onepage'
    const targetUrl = kind === 'teaser'  ? m.teaserUrl
                    : kind === 'onepage' ? m.onepageUrl
                    : m.url;
    onDownload?.(m, kind || 'download');
    if (targetUrl) window.open(targetUrl, '_blank', 'noopener');
  };

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className={`modal-cover ${!isDark && !showThumb ? 'placeholder' : ''}`}
             style={isDark
               ? {background: '#1c2230'}
               : showThumb
                 ? {background: `#fbf8f2 url("${thumb}") center/cover no-repeat`}
                 : {}}>
          <button className="modal-close" onClick={onClose}><Ic.x /></button>
          {isDark ? (
            <div style={{
              color: '#e8e2d2', fontFamily: 'serif', fontWeight: 700, fontSize: 38,
              lineHeight: 1.0, padding: '32px', textTransform: 'uppercase'
            }}>
              {m.title}
            </div>
          ) : !showThumb ? (
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
              color: 'var(--ink-4)', textTransform: 'uppercase'
            }}>{m.kind} — превью</div>
          ) : null}
        </div>
        <div className="modal-body">
          <div className="modal-kind">{m.kind}</div>
          <h2 className="modal-title">{m.title}</h2>
          {m.desc && <p className="modal-desc">{m.desc}</p>}

          {m.tags && m.tags.length > 0 && (
            <div className="modal-tags">
              {m.tags.map((t,i) => <span key={i} className="tag">{t}</span>)}
            </div>
          )}

          <div className="modal-meta">
            <CountryMark code={m.country} />
            <span className="dot">·</span>
            <span>{m.date}</span>
            <span className="dot">·</span>
            <span>↓ {m.downloads} скачиваний</span>
            <span className="dot">·</span>
            <span className="rate">
              <span className="stars" style={{ cursor: 'pointer' }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i}
                    className={`st ${i <= (hover || rating) ? 'filled' : ''}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => handleRate(i)}
                  >★</span>
                ))}
              </span>
              {rating ? ` ${rating.toFixed(1)} / 5` : ' оцените'}
            </span>
          </div>

          {m.template && (
            <>
              <div className="modal-section-title">▸ Шаблон сообщения</div>
              <div className="message-block">
                <button className="btn secondary sm copy-btn" onClick={() => {
                  navigator.clipboard?.writeText(m.template);
                  setTplCopied(true); setTimeout(() => setTplCopied(false), 1400);
                  onTemplateCopy?.(m);
                }}><Ic.copy />{tplCopied ? 'Скопировано' : 'Копировать'}</button>
                {m.template}
              </div>
            </>
          )}

          {m.url && (
            <div className="dl-row">
              <button className="dl-btn" onClick={() => handleDownload('download')}>
                <span className="icon"><Ic.dl /></span> Скачать полную версию
              </button>
            </div>
          )}
          {m.teaserUrl && (
            <div className="dl-row" style={{ marginTop: 8 }}>
              <button className="dl-btn" onClick={() => handleDownload('teaser')}>
                <span className="icon"><Ic.dl /></span> Скачать тизер
              </button>
            </div>
          )}
          {m.onepageUrl && (
            <div className="dl-row" style={{ marginTop: 8 }}>
              <button className="dl-btn" onClick={() => handleDownload('onepage')}>
                <span className="icon"><Ic.dl /></span> Скачать 1-page
              </button>
            </div>
          )}
          <div className="share-row">
            <span className="url">{url}</span>
            <button className="btn accent" onClick={() => {
              navigator.clipboard?.writeText(url);
              setCopied(true); setTimeout(() => setCopied(false), 1400);
            }}>{copied ? 'Скопировано' : 'Копировать ссылку'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Materials view (catalog)
// ============================================================
const MaterialsView = ({ title, lede, materials, allMaterials, onOpen }) => {
  const [filters, setFilters] = useState({ q: "", country: [], type: [], tag: [], rating: null });

  const filtered = useMemo(() => {
    return materials.filter(m => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!(m.title.toLowerCase().includes(q) || (m.desc||"").toLowerCase().includes(q) || (API.COUNTRIES[m.country]?.label||"").toLowerCase().includes(q))) return false;
      }
      if (filters.country?.length && !filters.country.includes(m.country)) return false;
      if (filters.type?.length && !filters.type.includes(m.type)) return false;
      if (filters.tag?.length && !(m.tags||[]).some(t => filters.tag.includes(t))) return false;
      if (filters.rating === 4 && !(m.rating >= 4)) return false;
      if (filters.rating === 3 && !(m.rating >= 3)) return false;
      if (filters.rating === 'any' && !m.rating) return false;
      return true;
    });
  }, [materials, filters]);

  const stats = [
    { num: materials.length, lbl: "Файлов" },
    { num: materials.reduce((s, m) => s + (m.downloads || 0), 0), lbl: "Скачиваний" },
    { num: new Set(materials.map(m => m.cat)).size, lbl: "Категорий" },
    { num: materials.filter(m => m.isNew).length, lbl: "Новинок" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <div className="lede">{lede}</div>
        </div>
      </div>
      <StatStrip items={stats} />
      <FilterRail filters={filters} onChange={setFilters} materials={allMaterials || materials} />
      {filtered.length === 0 ? (
        <div className="empty">
          <div className="glyph">— EMPTY STATE —</div>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить фильтры или сбросить их.</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map(m => <Card key={m.id} m={m} onOpen={onOpen} />)}
        </div>
      )}
    </>
  );
};

// ============================================================
// Telegram view — fetched live from /api/posts
// ============================================================
const TgView = () => {
  const [posts, setPosts] = useState(null);
  const [active, setActive] = useState('all');

  useEffect(() => {
    let cancelled = false;
    API.loadTgPosts().then(p => { if (!cancelled) setPosts(p); });
    return () => { cancelled = true; };
  }, []);

  if (posts === null) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Telegram-каналы Tranio</h1>
            <div className="lede">Загружаем последние посты из всех каналов…</div>
          </div>
        </div>
      </>
    );
  }

  const channels = ['all', ...Array.from(new Set(posts.map(t => t.ch))).filter(Boolean)];
  const list = active === 'all' ? posts : posts.filter(t => t.ch === active);
  const labelFor = (c) => c === 'all' ? 'Все' : c;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Telegram-каналы Tranio</h1>
          <div className="lede">Последние посты и все каналы компании</div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>
          Последние посты — свежие публикации из всех каналов
        </div>
        <div className="chips">
          {channels.map(c => (
            <button key={c} className={`chip ${active === c ? 'active' : ''}`} onClick={() => setActive(c)}>
              {labelFor(c)}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="glyph">— EMPTY STATE —</div>
          <h3>Постов пока нет</h3>
          <p>Не удалось получить публикации из канала. Попробуйте позже.</p>
        </div>
      ) : (
        <div className="tg-grid">
          {list.map((t, i) => (
            <div key={i} className="tg-card">
              <div className="tg-head">
                <span className="tg-channel">{t.ch}</span>
                <span>{t.time}</span>
              </div>
              <h3 className="tg-title">{t.title}</h3>
              <p className="tg-snip">{t.snip}</p>
              <div className="tg-foot">
                <span>↗ {t.views}</span>
                {t.link
                  ? <a className="read" href={t.link} target="_blank" rel="noreferrer">Читать →</a>
                  : <span className="read">Читать →</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ============================================================
// Activity log view — reads from Supabase activity_log (read-only)
// ============================================================
const LogView = ({ refreshKey }) => {
  const [log, setLog] = useState(null);
  const [period, setPeriod] = useState('Все');
  const [actionFilter, setActionFilter] = useState('Все');
  const [userFilter, setUserFilter] = useState('Все');

  useEffect(() => {
    let cancelled = false;
    API.loadActivityLog().then(l => { if (!cancelled) setLog(l); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (log === null) {
    return (
      <>
        <div className="page-head">
          <div>
            <h1>Лог скачиваний</h1>
            <div className="lede">Загружаем записи из базы…</div>
          </div>
        </div>
      </>
    );
  }

  const userOptions = ['Все', ...Array.from(new Set(log.map(l => l.user).filter(Boolean))).sort()];
  const actionOptions = ['Все', ...Array.from(new Set(log.map(l => l.action).filter(Boolean)))];

  const now = new Date();
  const filtered = log.filter(l => {
    if (userFilter !== 'Все' && l.user !== userFilter) return false;
    if (actionFilter !== 'Все' && l.action !== actionFilter) return false;
    if (period !== 'Все' && l.raw?.created_at) {
      const d = new Date(l.raw.created_at);
      const diff = (now - d) / 86400000;
      if (period === 'Неделя' && diff > 7) return false;
      if (period === 'Месяц'  && diff > 31) return false;
    }
    return true;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Лог скачиваний</h1>
          <div className="lede">Кто, когда и что скачал — {log.length} записей в базе</div>
        </div>
      </div>

      <div className="filter-rail" style={{ marginBottom: 18 }}>
        <div className="filter-row">
          <span className="label">Период</span>
          <div className="chips">
            {['Все','Неделя','Месяц'].map(p => (
              <button key={p} className={`chip ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="label">Действие</span>
          <div className="chips">
            {actionOptions.map(p => (
              <button key={p} className={`chip ${actionFilter === p ? 'active' : ''}`} onClick={() => setActionFilter(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="label">Сотрудник</span>
          <div className="chips">
            {userOptions.map(p => (
              <button key={p} className={`chip ${userFilter === p ? 'active' : ''}`} onClick={() => setUserFilter(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="glyph">— EMPTY STATE —</div>
          <h3>Записей по фильтру нет</h3>
          <p>Попробуйте сбросить фильтры.</p>
        </div>
      ) : (
        <table className="log-table">
          <thead>
            <tr>
              <th style={{ width: '50%' }}>Файл</th>
              <th>Пользователь</th>
              <th>Время</th>
              <th>Действие</th>
              <th>Рейтинг</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i}>
                <td>
                  <div className="file-cell">
                    <span className="ftype">{l.raw?.material_type || '—'}</span>
                    <span>{l.file}</span>
                  </div>
                </td>
                <td className="who">{l.user}</td>
                <td className="when">{l.when}</td>
                <td><span className="action-link">{l.action}</span></td>
                <td className="rate-num">{l.rating ? `${l.rating.toFixed(1)} ★` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

// ============================================================
// Auth screens
// ============================================================
const ADMIN_PREFIXES = ['bogatenkov', 'skorykh'];
const isAdminUser = (user) => !!user && ADMIN_PREFIXES.some(p => (user.email || '').split('@')[0].toLowerCase() === p);

const AuthShell = ({ children }) => (
  <div className="login-page" data-screen-label="auth">
    <div className="login-card">
      <div className="login-brand">tranio<span className="dot">.</span>hub</div>
      <div className="login-sub">маркетинговые материалы — только для команды</div>
      {children}
    </div>
  </div>
);

const Login = ({ onSwitch, toast }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!email || !pass) { setErr('Введите email и пароль'); return; }
    setBusy(true);
    try {
      const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: pass });
      if (error) setErr(error.message);
      // onAuthStateChange → SIGNED_IN handles the rest
    } catch (ex) { setErr('Ошибка подключения'); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit}>
      <div className="field">
        <label>Email</label>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@tranio.com" />
      </div>
      <div className="field">
        <label>Пароль</label>
        <input type="password" autoComplete="current-password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
      </div>
      {err && <div style={{ color: '#a8442a', fontSize: 12, marginTop: -6, marginBottom: 10 }}>{err}</div>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Входим…' : 'Войти →'}</button>
      <div className="login-foot">
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('forgot'); }}>Забыли пароль?</a>
        <span>Нет аккаунта? <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('register'); }}>Зарегистрироваться</a></span>
      </div>
    </form>
  );
};

const Register = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!name || !email || !pass) { setErr('Заполните все поля'); return; }
    if (pass.length < 6) { setErr('Пароль — минимум 6 символов'); return; }
    setBusy(true);
    try {
      const { data, error } = await sb.auth.signUp({
        email: email.trim().toLowerCase(),
        password: pass,
        options: { data: { name } }
      });
      if (error) { setErr(error.message); return; }
      if (data.user && !data.session) setDone(true); // email confirmation enabled
      // else SIGNED_IN event will take over
    } catch (ex) { setErr('Ошибка подключения'); }
    finally { setBusy(false); }
  };
  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✉</div>
        <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 8 }}>Проверьте почту</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Мы отправили письмо с подтверждением. Откройте его, чтобы завершить регистрацию.
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('login'); }} style={{ color: 'var(--accent)' }}>Назад к входу</a>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={submit}>
      <div className="field">
        <label>Имя</label>
        <input type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Петров" />
      </div>
      <div className="field">
        <label>Email</label>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@tranio.com" />
      </div>
      <div className="field">
        <label>Пароль (мин. 6 символов)</label>
        <input type="password" autoComplete="new-password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
      </div>
      {err && <div style={{ color: '#a8442a', fontSize: 12, marginTop: -6, marginBottom: 10 }}>{err}</div>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Создаём…' : 'Зарегистрироваться'}</button>
      <div className="login-foot">
        <span>Уже есть аккаунт? <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('login'); }}>Войти</a></span>
      </div>
    </form>
  );
};

const ForgotPass = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!email) { setErr('Введите email'); return; }
    setBusy(true);
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin + window.location.pathname,
      });
      if (error) { setErr(error.message); return; }
      setSent(true);
    } catch (ex) { setErr('Ошибка подключения'); }
    finally { setBusy(false); }
  };
  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✉</div>
        <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 8 }}>Проверьте почту</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>
          Мы отправили ссылку для сброса пароля. Откройте её, чтобы задать новый пароль.
        </div>
        <div style={{ marginTop: 16 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('login'); }} style={{ color: 'var(--accent)' }}>Назад к входу</a>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={submit}>
      <div className="field">
        <label>Email</label>
        <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@tranio.com" />
      </div>
      {err && <div style={{ color: '#a8442a', fontSize: 12, marginTop: -6, marginBottom: 10 }}>{err}</div>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Отправляем…' : 'Отправить ссылку для сброса'}</button>
      <div className="login-foot">
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch('login'); }}>Назад к входу</a>
      </div>
    </form>
  );
};

const NewPass = ({ onDone }) => {
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!pass || pass.length < 6) { setErr('Минимум 6 символов'); return; }
    setBusy(true);
    try {
      const { data, error } = await sb.auth.updateUser({ password: pass });
      if (error) { setErr(error.message); return; }
      // Recovery flow done — clean URL so refresh doesn't re-enter
      isPasswordRecovery = false;
      if (window.location.hash || window.location.search.includes('type=recovery')) {
        history.replaceState(null, '', window.location.pathname);
      }
      onDone?.(data?.user);
    } catch (ex) { setErr('Ошибка подключения'); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit}>
      <div style={{ fontSize: 14, color: 'var(--ink)', textAlign: 'center', marginBottom: 14 }}>Задайте новый пароль</div>
      <div className="field">
        <label>Новый пароль (мин. 6 символов)</label>
        <input type="password" autoComplete="new-password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
      </div>
      {err && <div style={{ color: '#a8442a', fontSize: 12, marginTop: -6, marginBottom: 10 }}>{err}</div>}
      <button className="btn" type="submit" disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить новый пароль'}</button>
    </form>
  );
};

// ============================================================
// App — top-level orchestrator
// ============================================================
const App = () => {
  // Auth state
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null); // null = logged out
  const [authScreen, setAuthScreen] = useState('login'); // login | register | forgot | newpass
  const [toast, setToast] = useState('');

  // Data state
  const [materials, setMaterials] = useState([]);
  const [downloadCounts, setDownloadCounts] = useState({});
  const [ratings, setRatings] = useState({ aggregate: {}, mine: {} });
  const [dataLoading, setDataLoading] = useState(false);
  const [logRefresh, setLogRefresh] = useState(0);
  const [syncedAt, setSyncedAt] = useState('');

  // Navigation
  const [route, setRoute] = useState({ section: 'brand', brand: 'all' });
  const [openMaterial, setOpenMaterial] = useState(null);

  // Toast helper
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1800);
  }, []);

  // ---- Auth bootstrap -------------------------------------------
  useEffect(() => {
    (async () => {
      const { data: { session } } = await sb.auth.getSession();
      if (session && isPasswordRecovery) {
        setAuthScreen('newpass');
        setAuthReady(true);
      } else if (session) {
        setUser(buildUser(session.user));
        setAuthReady(true);
      } else {
        setAuthReady(true);
      }
    })();

    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        isPasswordRecovery = true;
        setAuthScreen('newpass');
        setUser(null);
        return;
      }
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session && !isPasswordRecovery) {
        setUser(buildUser(session.user));
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setMaterials([]);
        isPasswordRecovery = false;
        setAuthScreen('login');
      }
    });
    return () => subscription?.unsubscribe();
  }, []);

  function buildUser(u) {
    const meta = u.user_metadata || {};
    const name = meta.name || (u.email || '').split('@')[0] || 'Пользователь';
    const ini = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '??';
    return { id: u.id, email: u.email, name, ini, isAdmin: isAdminUser(u) };
  }

  // ---- Data loading (after sign-in) -----------------------------
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setDataLoading(true);
    (async () => {
      const [mats, dlCounts, rt] = await Promise.all([
        API.loadMaterials(),
        API.loadDownloadCounts(),
        API.loadRatings(user.id),
      ]);
      if (cancelled) return;
      setMaterials(mats);
      setDownloadCounts(dlCounts);
      setRatings(rt);
      const now = new Date();
      setSyncedAt(`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
      setDataLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Apply enrichments (download counts + ratings) lazily
  const enrichedMaterials = useMemo(
    () => API.applyEnrichments(materials, downloadCounts, ratings),
    [materials, downloadCounts, ratings]
  );

  // ---- Hash-based deep linking (#m-{id}) ------------------------
  // 1) On materials load: read URL hash → open the corresponding modal.
  // 2) When openMaterial changes: write/clear the hash so URL is shareable.
  // 3) Listen to hashchange + Escape so back/forward + Esc work as expected.
  useEffect(() => {
    if (!enrichedMaterials.length) return;
    const m = location.hash.match(/^#m-(\d+)/);
    if (m) {
      const id = parseInt(m[1], 10);
      const mat = enrichedMaterials.find(x => x.id === id);
      if (mat) setOpenMaterial(mat);
    }
    // intentionally only on first materials load — running on every change
    // would re-open the modal after the user closed it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials.length]);

  useEffect(() => {
    if (openMaterial) {
      const next = `#m-${openMaterial.id}`;
      if (location.hash !== next) history.replaceState(null, '', location.pathname + next);
    } else {
      if (location.hash) history.replaceState(null, '', location.pathname);
    }
  }, [openMaterial]);

  useEffect(() => {
    const onHashChange = () => {
      const m = location.hash.match(/^#m-(\d+)/);
      if (m) {
        const id = parseInt(m[1], 10);
        const mat = enrichedMaterials.find(x => x.id === id);
        if (mat) setOpenMaterial(mat);
      } else {
        setOpenMaterial(null);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpenMaterial(null); };
    window.addEventListener('hashchange', onHashChange);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      document.removeEventListener('keydown', onKey);
    };
  }, [enrichedMaterials]);
  const { CATS, BRANDS } = useMemo(
    () => API.deriveCatsAndBrands(enrichedMaterials),
    [enrichedMaterials]
  );

  // ---- Actions ---------------------------------------------------
  const handleLogout = async () => {
    try { await sb.auth.signOut(); } catch (e) { /* ignore */ }
  };

  const handleDownload = async (m, kind = 'download') => {
    // 'download' = main file URL, 'teaser' = teaserUrl, 'onepage' = onepageUrl
    // Only the main download bumps the counter — teaser / onepage are tracked
    // as separate action types in the activity log, matching the legacy code.
    if (kind === 'download') {
      const next = await API.bumpDownloadCount(m.id, m.downloads);
      setDownloadCounts(prev => ({ ...prev, [m.id]: next }));
    }
    const titleSuffix = kind === 'teaser' ? ' (teaser)' : kind === 'onepage' ? ' (1-page)' : '';
    await API.logActivity({
      user,
      materialId: m.id,
      materialTitle: m.title + titleSuffix,
      actionType: kind,
    });
    showToast(kind === 'download' ? 'Скачивание зарегистрировано'
            : kind === 'teaser'   ? 'Тизер открыт'
            : kind === 'onepage'  ? '1-page открыт'
            : 'Зарегистрировано');
    setLogRefresh(k => k + 1);
  };

  const handleTemplateCopy = async (m) => {
    await API.logActivity({
      user,
      materialId: m.id,
      materialTitle: m.title + ' (SMS)',
      actionType: 'copy_sms',
    });
    showToast('Шаблон скопирован');
    setLogRefresh(k => k + 1);
  };

  const handleRate = async (m, score) => {
    await API.setRating(user.id, m.id, score);
    setRatings(prev => {
      const aggregate = { ...prev.aggregate };
      // optimistic update — refetch will give accurate aggregate
      const cur = aggregate[m.id] || { rating: null, ratings: 0 };
      aggregate[m.id] = { rating: score, ratings: (cur.ratings || 0) + 1 };
      return { aggregate, mine: { ...prev.mine, [m.id]: score } };
    });
    await API.logActivity({
      user, materialId: m.id, materialTitle: m.title, actionType: 'rating', rating: score,
    });
    showToast('Оценка сохранена');
    setLogRefresh(k => k + 1);
  };

  // ---- Render ----------------------------------------------------
  if (!authReady) {
    return <AuthShell><div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>Подключаемся…</div></AuthShell>;
  }

  // Recovery flow always wins over a stale session
  if (authScreen === 'newpass') {
    return <AuthShell><NewPass onDone={(u) => { if (u) setUser(buildUser(u)); setAuthScreen('login'); showToast('Пароль обновлён'); }} /></AuthShell>;
  }

  if (!user) {
    return (
      <>
        <AuthShell>
          {authScreen === 'login'    && <Login    onSwitch={setAuthScreen} />}
          {authScreen === 'register' && <Register onSwitch={setAuthScreen} />}
          {authScreen === 'forgot'   && <ForgotPass onSwitch={setAuthScreen} />}
        </AuthShell>
        <Toast msg={toast} />
      </>
    );
  }

  // ---- Logged-in app --------------------------------------------
  let title = "", lede = "Актуальные маркетинговые материалы команды", crumbs = ["TRANIO HUB"];
  let mats = enrichedMaterials;

  if (route.section === 'brand') {
    if (route.brand === 'all') {
      title = "Все материалы"; crumbs = ["TRANIO HUB", "Все материалы"];
    } else if (route.brand === 'capital') {
      title = "Tranio Capital"; mats = enrichedMaterials.filter(m => m.brand === 'capital');
      crumbs = ["TRANIO HUB", "Бренды", "Tranio Capital"];
    } else if (route.brand === 'brokerage') {
      title = "Tranio Brokerage"; mats = enrichedMaterials.filter(m => m.brand === 'brokerage');
      crumbs = ["TRANIO HUB", "Бренды", "Tranio Brokerage"];
    }
  } else if (route.section === 'cat') {
    const cat = CATS.find(c => c.id === route.sub.cat);
    if (cat) {
      title = cat.label;
      if (route.sub.sub) {
        const sub = cat.subs?.find(s => s.id === route.sub.sub);
        title = sub ? `${cat.label} — ${sub.label.toLowerCase()}` : cat.label;
        crumbs = ["TRANIO HUB", "Категории", cat.label, sub?.label || ''];
        mats = enrichedMaterials.filter(m => m.cat === cat.id && m.subCat === route.sub.sub);
      } else {
        crumbs = ["TRANIO HUB", "Категории", cat.label];
        mats = enrichedMaterials.filter(m => m.cat === cat.id);
      }
    }
  } else if (route.section === 'tg') {
    crumbs = ["TRANIO HUB", "Telegram-каналы"];
  } else if (route.section === 'log') {
    crumbs = ["TRANIO HUB", "Лог скачиваний"];
  }

  // Restrict log view to admins
  if (route.section === 'log' && !user.isAdmin) {
    return (
      <div className="app">
        <Sidebar section={route.section} sub={route.sub} brand={route.brand} onNav={setRoute} cats={CATS} brands={BRANDS} syncedAt={syncedAt} />
        <main className="main">
          <Topbar crumbs={crumbs} userName={user.name} userIni={user.ini} onLogout={handleLogout} />
          <div className="main-inner">
            <div className="empty">
              <div className="glyph">— ACCESS DENIED —</div>
              <h3>Раздел только для админов</h3>
              <p>Лог активности доступен пользователям с правами администратора.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="app" data-screen-label={`section ${route.section}`}>
        <Sidebar section={route.section} sub={route.sub} brand={route.brand} onNav={setRoute}
                 cats={CATS} brands={BRANDS} syncedAt={syncedAt} />
        <main className="main">
          <Topbar crumbs={crumbs} userName={user.name} userIni={user.ini} onLogout={handleLogout} />
          <div className="main-inner">
            {dataLoading && enrichedMaterials.length === 0 ? (
              <div style={{ padding: 40, color: 'var(--ink-3)', fontSize: 14 }}>Загружаем материалы…</div>
            ) : route.section === 'tg' ? <TgView /> :
                route.section === 'log' ? <LogView refreshKey={logRefresh} /> :
                <MaterialsView title={title} lede={lede} materials={mats} allMaterials={enrichedMaterials} onOpen={setOpenMaterial} />}
          </div>
        </main>
        {openMaterial && (
          <Modal m={openMaterial}
                 onClose={() => setOpenMaterial(null)}
                 onDownload={handleDownload}
                 onRate={handleRate}
                 onTemplateCopy={handleTemplateCopy}
                 myRating={ratings.mine?.[openMaterial.id]} />
        )}
      </div>
      <Toast msg={toast} />
    </>
  );
};

// ============================================================
// Mount
// ============================================================
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
