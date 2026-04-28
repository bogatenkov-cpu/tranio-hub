/* global React, ReactDOM */
const { useState, useMemo, useEffect, useRef } = React;
const HUB = window.HUB_DATA;

// ---------- ICONS (tiny inline SVG, monochrome) ----------
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

// ---------- Stars ----------
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

// ---------- Country marker (small flag + ISO mono code) ----------
const CountryMark = ({ code }) => {
  const c = HUB.COUNTRIES[code];
  if (!c) return null;
  return (
    <span className="country">
      <span className="flag">{c.flag}</span>
      <span>{c.label}</span>
    </span>
  );
};

// ---------- Sidebar ----------
const Sidebar = ({ section, sub, onNav, brand }) => {
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
        <span className="env">v0.4</span>
      </div>

      <div className="nav-group">
        <div className="nav-label">Бренд</div>
        {HUB.BRANDS.map(b => navBrand(b.id, b.label, b.count))}
      </div>

      <div className="nav-group">
        <div className="nav-label">Категории</div>
        {HUB.CATS.map(c => (
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
        <span>LIVE · synced 14:32</span>
      </div>
    </aside>
  );
};

// ---------- Topbar ----------
const Topbar = ({ crumbs }) => (
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
    <button className="search-mini">
      <Ic.search />
      <span>Поиск по хабу</span>
      <kbd>⌘K</kbd>
    </button>
    <div className="user-chip">
      <span className="avatar">ЕБ</span>
      <span>Евгений Богатенков</span>
    </div>
    <button className="btn-ghost">Выйти</button>
  </header>
);

// ---------- Stat strip ----------
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

// ---------- Filter rail ----------
const FilterRail = ({ filters, onChange, available }) => {
  const COUNTRY_KEYS = ["Bali","Cambodia","Cyprus","Global","Greece","Oman","Russia","Spain","SaoTome","Thailand","UAE"];
  const MONTHS = ["Апрель 2026","Март 2026","Февраль 2026","Январь 2026","Декабрь 2025","Ноябрь 2025","Август 2025","Июль 2025","Июнь 2025"];
  const TYPES = ["PDF","PPTX","Image","Video","DOC","HTML"];
  const TAGS = ["ВНЖ","ВНЖ, Кейс","Кейс","Налоги"];

  const toggle = (key, val) => {
    const arr = filters[key] || [];
    const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    onChange({ ...filters, [key]: next });
  };
  const setRating = (val) => {
    onChange({ ...filters, rating: filters.rating === val ? null : val });
  };
  const reset = () => onChange({ q: "", country: [], month: [], type: [], tag: [], rating: null });

  return (
    <div className="filter-rail">
      <div className="search">
        <Ic.search />
        <input value={filters.q || ""}
          onChange={e => onChange({ ...filters, q: e.target.value })}
          placeholder="Поиск по названию, стране или описанию…" />
        <span className="hint">⌘K</span>
      </div>
      <div className="filter-row">
        <span className="label">Страна</span>
        <div className="chips">
          {COUNTRY_KEYS.map(k => {
            const c = HUB.COUNTRIES[k];
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
        <span className="label">Месяц</span>
        <div className="chips">
          {MONTHS.map(m => {
            const active = (filters.month || []).includes(m);
            return (
              <button key={m} className={`chip ${active ? 'active' : ''}`} onClick={() => toggle('month', m)}>{m}</button>
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

// ---------- Card ----------
const Card = ({ m, onOpen }) => {
  const isDark = m.cover === 'dark';
  return (
    <article className="card" onClick={() => onOpen(m)}>
      <div className={`card-cover ${!isDark ? 'placeholder' : ''}`} style={isDark ? {background: '#1c2230'} : {}}>
        {m.isNew && <span className="ribbon-new">Новое</span>}
        <span className="filetype">{m.type}</span>
        {!isDark && <span className="ph-text">{m.kind}</span>}
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

// ---------- Modal ----------
const Modal = ({ m, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [tplCopied, setTplCopied] = useState(false);
  const [rating, setRating] = useState(m.rating || 0);
  const [hover, setHover] = useState(0);
  if (!m) return null;
  const isDark = m.cover === 'dark';
  const url = `https://tranio-hub.vercel.app/#m-${m.id}`;

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className={`modal-cover ${!isDark ? 'placeholder' : ''}`} style={isDark ? {background: '#1c2230'} : {}}>
          <button className="modal-close" onClick={onClose}><Ic.x /></button>
          {isDark ? (
            <div style={{
              color: '#e8e2d2', fontFamily: 'serif', fontWeight: 700, fontSize: 38,
              lineHeight: 1.0, padding: '32px', textTransform: 'uppercase'
            }}>
              {m.title}
            </div>
          ) : (
            <div style={{
              fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.14em',
              color: 'var(--ink-4)', textTransform: 'uppercase'
            }}>{m.kind} — превью</div>
          )}
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
                    onClick={() => setRating(i)}
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
                }}><Ic.copy />{tplCopied ? 'Скопировано' : 'Копировать'}</button>
                {m.template}
              </div>
            </>
          )}

          <div className="dl-row">
            <button className="dl-btn"><span className="icon"><Ic.dl /></span> Скачать полную версию</button>
          </div>
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

// ---------- Materials view ----------
const MaterialsView = ({ title, lede, materials, statOverride, onOpen }) => {
  const [filters, setFilters] = useState({ q: "", country: [], month: [], type: [], tag: [], rating: null });

  const filtered = useMemo(() => {
    return materials.filter(m => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!(m.title.toLowerCase().includes(q) || (m.desc||"").toLowerCase().includes(q) || (HUB.COUNTRIES[m.country]?.label||"").toLowerCase().includes(q))) return false;
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

  const stats = statOverride || [
    { num: 120, lbl: "Файлов" },
    { num: 262, lbl: "Скачиваний" },
    { num: 6, lbl: "Категорий" },
    { num: 44, lbl: "Новинок" },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{title}</h1>
          <div className="lede">{lede}</div>
        </div>
        <div className="actions">
          <button className="btn secondary"><Ic.dl /> Экспорт</button>
          <button className="btn">+ Загрузить материал</button>
        </div>
      </div>
      <StatStrip items={stats} />
      <FilterRail filters={filters} onChange={setFilters} />
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

// ---------- Telegram view ----------
const TgView = () => {
  const [active, setActive] = useState('all');
  const channels = ['all', ...Array.from(new Set(HUB.TG.map(t => t.ch)))];
  const list = active === 'all' ? HUB.TG : HUB.TG.filter(t => t.ch === active);
  const labelFor = (c) => c === 'all' ? 'Все' : c;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Telegram-каналы Tranio</h1>
          <div className="lede">Последние посты и все каналы компании</div>
        </div>
        <div className="actions">
          <button className="btn secondary"><Ic.link /> Открыть в Telegram</button>
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
              <span className="read">Читать →</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ---------- Log view ----------
const LogView = () => {
  const [period, setPeriod] = useState('Все');
  const [action, setAction] = useState('Все');
  const [user, setUser] = useState('Все');

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Лог скачиваний</h1>
          <div className="lede">Кто, когда и что скачал</div>
        </div>
        <div className="actions">
          <button className="btn secondary"><Ic.back /> Назад</button>
          <button className="btn"><Ic.dl /> Экспорт CSV</button>
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
            {['Все','Скачивание','Просмотр'].map(p => (
              <button key={p} className={`chip ${action === p ? 'active' : ''}`} onClick={() => setAction(p)}>{p}</button>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="label">Сотрудник</span>
          <div className="chips">
            {['Все','Наталья','Anastasia Shchepetova','Илья Шереметьев','Полина Фёдорова'].map(p => (
              <button key={p} className={`chip ${user === p ? 'active' : ''}`} onClick={() => setUser(p)}>{p}</button>
            ))}
          </div>
        </div>
      </div>

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
          {HUB.LOG.map((l, i) => (
            <tr key={i}>
              <td>
                <div className="file-cell">
                  <span className="ftype">{l.file.match(/Guide|smartphone|English/i) ? 'PDF' : 'PDF'}</span>
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
    </>
  );
};

// ---------- App ----------
const App = () => {
  const [route, setRoute] = useState({ section: 'brand', brand: 'all' });
  const [openMaterial, setOpenMaterial] = useState(null);
  const [logged, setLogged] = useState(true);

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  const onNav = (r) => setRoute(r);

  let title = "", lede = "Актуальные маркетинговые материалы команды", crumbs = ["TRANIO HUB"];
  let mats = HUB.MATERIALS;

  if (route.section === 'brand') {
    if (route.brand === 'all') {
      title = "Все материалы"; crumbs = ["TRANIO HUB", "Все материалы"];
    } else if (route.brand === 'capital') {
      title = "Tranio Capital"; mats = HUB.MATERIALS.filter(m => m.brand === 'capital');
      crumbs = ["TRANIO HUB", "Бренды", "Tranio Capital"];
    } else if (route.brand === 'brokerage') {
      title = "Tranio Brokerage"; mats = HUB.MATERIALS.filter(m => m.brand === 'brokerage');
      crumbs = ["TRANIO HUB", "Бренды", "Tranio Brokerage"];
    }
  } else if (route.section === 'cat') {
    const cat = HUB.CATS.find(c => c.id === route.sub.cat);
    title = cat.label;
    if (route.sub.sub) {
      const sub = cat.subs.find(s => s.id === route.sub.sub);
      title = `${cat.label} ${sub.label.toLowerCase()}`;
      crumbs = ["TRANIO HUB", "Категории", cat.label, sub.label];
      mats = HUB.MATERIALS.filter(m => m.cat === cat.id && m.subCat === route.sub.sub);
    } else {
      crumbs = ["TRANIO HUB", "Категории", cat.label];
      mats = HUB.MATERIALS.filter(m => m.cat === cat.id);
    }
  } else if (route.section === 'tg') {
    crumbs = ["TRANIO HUB", "Telegram-каналы"];
  } else if (route.section === 'log') {
    crumbs = ["TRANIO HUB", "Лог скачиваний"];
  }

  return (
    <div className="app" data-screen-label={`section ${route.section}`}>
      <Sidebar section={route.section} sub={route.sub} brand={route.brand} onNav={onNav} />
      <main className="main">
        <Topbar crumbs={crumbs} />
        <div className="main-inner">
          {route.section === 'tg' ? <TgView /> :
           route.section === 'log' ? <LogView /> :
           <MaterialsView title={title} lede={lede} materials={mats} onOpen={setOpenMaterial} />}
        </div>
      </main>
      {openMaterial && <Modal m={openMaterial} onClose={() => setOpenMaterial(null)} />}
    </div>
  );
};

// ---------- Login ----------
const Login = ({ onLogin }) => {
  return (
    <div className="login-page" data-screen-label="login">
      <form className="login-card" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
        <div className="login-brand">tranio<span className="dot">.</span>hub</div>
        <div className="login-sub">маркетинговые материалы — только для команды</div>
        <div className="field">
          <label>Email</label>
          <input type="email" defaultValue="evgenii@tranio.com" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input type="password" defaultValue="••••••••" />
        </div>
        <button className="btn" type="submit">Войти →</button>
        <div className="login-foot">
          <a href="#">Забыли пароль?</a>
          <span>Нет аккаунта? <a href="#">Зарегистрироваться</a></span>
        </div>
      </form>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
