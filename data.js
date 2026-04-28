// Seed data for TRANIO HUB
window.HUB_DATA = (() => {
  const COUNTRIES = {
    Bali:    { iso: "ID", flag: "🇮🇩", label: "Bali" },
    Cambodia:{ iso: "KH", flag: "🇰🇭", label: "Cambodia" },
    Cyprus:  { iso: "CY", flag: "🇨🇾", label: "Cyprus" },
    Global:  { iso: "GL", flag: "🌐", label: "Global" },
    Greece:  { iso: "GR", flag: "🇬🇷", label: "Greece" },
    Oman:    { iso: "OM", flag: "🇴🇲", label: "Oman" },
    Russia:  { iso: "RU", flag: "🇷🇺", label: "Russia" },
    Spain:   { iso: "ES", flag: "🇪🇸", label: "Spain" },
    SaoTome: { iso: "ST", flag: "🇸🇹", label: "São Tomé and Príncipe" },
    Thailand:{ iso: "TH", flag: "🇹🇭", label: "Thailand" },
    UAE:     { iso: "AE", flag: "🇦🇪", label: "UAE" },
  };

  // Categories
  const CATS = [
    { id: "presentations", label: "Презентации", count: 2,  hasSub: true,
      subs: [
        { id: "regional", label: "Региональные", count: 0 },
        { id: "company",  label: "О компании",   count: 0 },
      ]
    },
    { id: "emails",       label: "E-mail рассылки",     count: 0 },
    { id: "scripts",      label: "Скрипты мессенджеров", count: 0 },
    { id: "teasers",      label: "Тизеры и сторис",     count: 5 },
    { id: "webinars",     label: "Записи вебинаров",    count: 24 },
    { id: "analytics",    label: "Аналитика",           count: 38 },
    { id: "landings",     label: "Посадочные страницы", count: 29 },
    { id: "articles",     label: "Статьи",              count: 22 },
  ];

  const BRANDS = [
    { id: "all",       label: "Все материалы", count: 120 },
    { id: "capital",   label: "Tranio Capital",   count: 13 },
    { id: "brokerage", label: "Tranio Brokerage", count: 106 },
  ];

  // Materials
  const M = [];
  let id = 0;
  const add = (m) => { M.push({ id: ++id, ...m }); };

  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Альтернативные инвестиции в России",
    desc: "Запись с конференции — курортная недвижимость на Алтае",
    country: "Russia", date: "10 мар", downloads: 7, rating: 5.0, ratings: 1,
    type: "VIDEO", isNew: false, tags: ["Альт.инвестиции", "Россия"],
    cover: "dark"
  });

  add({ kind: "Аналитика", cat: "analytics", brand: "capital",
    title: "Рынок жилой недвижимости Абу-Даби, FY2025",
    desc: "Обзор Абу-Даби: факторы и точки роста для недвижимости в 2026 году",
    country: "UAE", date: "14 мар", downloads: 14, rating: null,
    type: "PDF", isNew: true, tags: ["ОАЭ", "Аналитика"]
  });

  add({ kind: "Аналитика", cat: "analytics", brand: "capital",
    title: "Метаксургио: богемный кластер Афин в периоде трансформации",
    desc: "Как джентрификация Метаксургио создала точку роста инвестиций",
    country: "Greece", date: "7 мар", downloads: 7, rating: null,
    type: "PDF", isNew: false, tags: ["Греция", "Афины"]
  });

  add({ kind: "Аналитика", cat: "analytics", brand: "capital",
    title: "«Золотая виза» Греции и рынок Афин в 2025 году",
    desc: "Анализ спроса на ВНЖ Греции в 2025 году",
    country: "Greece", date: "8 мар", downloads: 8, rating: null,
    type: "PDF", isNew: true, tags: ["ВНЖ", "Греция"]
  });

  add({ kind: "Аналитика", cat: "analytics", brand: "brokerage",
    title: "Демографическое чудо Дубая: фундамент роста рынка недвижимости",
    desc: "Большое исследование демографии Дубая",
    country: "UAE", date: "10 мар", downloads: 8, rating: 5.0, ratings: 2,
    type: "PDF", isNew: false, tags: ["Дубай", "Демография"]
  });

  add({ kind: "Аналитика", cat: "analytics", brand: "brokerage",
    title: "Как проверить застройщика на Бали: модель контроля рисков Tranio",
    desc: "Внутренние практики Tranio: фильтры и критерии отбора проектов",
    country: "Bali", date: "2 апр", downloads: 12, rating: null,
    type: "PDF", isNew: true, tags: ["Бали", "Девелопмент"]
  });

  add({ kind: "Статья", cat: "articles", brand: "brokerage",
    title: "Налоговая реформа Кипра в 2026 году",
    desc: "Влияние на частный капитал, бизнес и инвестиции",
    country: "Cyprus", date: "9 мар", downloads: 9, rating: null,
    type: "PDF", isNew: true, tags: ["Кипр", "Налоги"]
  });

  add({ kind: "Статья", cat: "articles", brand: "brokerage",
    title: "Наследственное планирование в трансграничных юрисдикциях",
    desc: "Памятка поможет разобраться в процедурных аспектах принятия наследства",
    country: "UAE", date: "30 мар", downloads: 6, rating: null,
    type: "PDF", isNew: true, tags: ["Наследство", "ОАЭ"]
  });

  add({ kind: "Статья", cat: "articles", brand: "brokerage",
    title: "Школы на Кипре в 2026 году",
    desc: "Гид по лучшим школам острова в 2026 году",
    country: "Cyprus", date: "25 июл", downloads: 9, rating: null,
    type: "PDF", isNew: false, tags: ["Кипр", "Образование"]
  });

  add({ kind: "Статья", cat: "articles", brand: "brokerage",
    title: "Стратегии розничных покупок в ОАЭ в 2025",
    desc: "",
    country: "UAE", date: "9 апр", downloads: 2, rating: null,
    type: "PDF", isNew: false, tags: ["ОАЭ", "Ритейл"]
  });

  add({ kind: "Статья", cat: "articles", brand: "brokerage",
    title: "Стратегии инвестиций в Таиланде в высокий сезон",
    desc: "Почему высокий сезон — лучшее время для инвестиций",
    country: "Thailand", date: "9 апр", downloads: 2, rating: null,
    type: "PDF", isNew: false, tags: ["Таиланд", "Сезонность"]
  });

  add({ kind: "Статья", cat: "articles", brand: "brokerage",
    title: "Кейс: Паспорт Вануату как инструмент получения ВНЖ в Европе",
    desc: "Упакованный кейс с получением паспорта Вануату",
    country: "Global", date: "27 апр", downloads: 1, rating: null,
    type: "PDF", isNew: true, tags: ["ВНЖ", "Кейс"],
    template: `{{Имя}}, добрый день!

Мы подготовили памятку по валютным операциям при сделках с зарубежной недвижимостью. В материале собраны практические вопросы:

— международных переводов;
— расчётов с иностранными продавцами;
— банковского комплаенса;
— подтверждающих документов;
— типовых ограничений и рабочих решений на практике.

Если вам интересно узнать подробнее, отправлю полную версию отчёта в PDF.`
  });

  // Landings (HTML)
  add({ kind: "Посадочная страница", cat: "landings", brand: "brokerage",
    title: "Инвестиции в недвижимость Таиланда с доходностью до 12% годовых. Консультации с экспертами.",
    desc: "Недвижимость в Таиланде — главный лендинг",
    country: "Thailand", date: "9 апр", downloads: 15, rating: null,
    type: "HTML", isNew: false, tags: ["Таиланд", "Лендинг"]
  });
  add({ kind: "Посадочная страница", cat: "landings", brand: "brokerage",
    title: "Скидки до 20% от тайских застройщиков: рассрочки и меблировка в подарок.",
    desc: "Спецпредложения от застройщиков Таиланда",
    country: "Thailand", date: "1 фев", downloads: 1, rating: null,
    type: "HTML", isNew: false, tags: ["Таиланд", "Спецпредложения"]
  });
  add({ kind: "Посадочная страница", cat: "landings", brand: "brokerage",
    title: "English version: discounts up to 20% from Thai developers.",
    desc: "Special Offers from Thai Developers",
    country: "Thailand", date: "15 фев", downloads: 0, rating: null,
    type: "HTML", isNew: false, tags: ["Thailand", "EN"]
  });
  add({ kind: "Посадочная страница", cat: "landings", brand: "brokerage",
    title: "ЖК виллы Clover, Пхукет. Доходность 12% годовых, сдача Q1 2026.",
    desc: "Clover — виллы рядом со школой HeadStart",
    country: "Thailand", date: "1 фев", downloads: 15, rating: null,
    type: "HTML", isNew: false, tags: ["Пхукет", "Clover"]
  });
  add({ kind: "Посадочная страница", cat: "landings", brand: "brokerage",
    title: "77 апартаментов на пляже Сурин, Пхукет. Доходность 6%, сдача Q3 2026.",
    desc: "The Petit Tycoon — бутик-курорт на Сурине",
    country: "Thailand", date: "15 фев", downloads: 0, rating: null,
    type: "HTML", isNew: false, tags: ["Пхукет", "Сурин"]
  });

  // Teasers
  add({ kind: "Тизер / сторис", cat: "teasers", brand: "brokerage",
    title: "Тизер Аффилиаты: Гражданство Сан-Томе и Принсипи",
    desc: "Небрендированный тизер под портфельную инвестицию с Золотой визой",
    country: "SaoTome", date: "26 мар", downloads: 5, rating: null,
    type: "IMAGE", isNew: true, tags: ["ВНЖ"]
  });
  add({ kind: "Тизер / сторис", cat: "teasers", brand: "brokerage",
    title: "Тизер Tranio: Гражданство Сан-Томе и Принсипи",
    desc: "Тизер под портфельную инвестицию с Золотой визой Греции (ВНЖ)",
    country: "SaoTome", date: "27 мар", downloads: 3, rating: null,
    type: "IMAGE", isNew: true, tags: ["ВНЖ"]
  });
  add({ kind: "Тизер / сторис", cat: "teasers", brand: "brokerage",
    title: "Тизер-сторис: Рынок Омана в 2025-2026 гг.",
    desc: "Тизер к аналитическому отчёту по главным цифрам рынка Омана",
    country: "Oman", date: "11 апр", downloads: 11, rating: null,
    type: "IMAGE", isNew: true, tags: []
  });
  add({ kind: "Тизер / сторис", cat: "teasers", brand: "brokerage",
    title: "Тизеры с планировками Философии, Апрель 2026 года",
    desc: "Короткие тизеры с планировками для трёх интерьеров",
    country: "Greece", date: "9 апр", downloads: 9, rating: null,
    type: "IMAGE", isNew: true, tags: []
  });
  add({ kind: "Тизер / сторис", cat: "teasers", brand: "brokerage",
    title: "Тизеры, KedrInou: поквартирные (RU, EN)",
    desc: "Короткие тизеры с планировками",
    country: "Greece", date: "9 апр", downloads: 6, rating: null,
    type: "IMAGE", isNew: true, tags: []
  });

  // Presentations
  add({ kind: "Презентация", cat: "presentations", subCat: "regional", brand: "brokerage",
    title: "Золотая виза Греции: вертикальная презентация",
    desc: "",
    country: "Greece", date: "10 апр", downloads: 0, rating: null,
    type: "PDF", isNew: true, tags: ["ВНЖ"]
  });
  add({ kind: "Презентация", cat: "presentations", subCat: "regional", brand: "brokerage",
    title: "Greece Golden Visa, smartphone deck",
    desc: "",
    country: "Greece", date: "10 апр", downloads: 0, rating: null,
    type: "PDF", isNew: true, tags: ["ВНЖ"]
  });

  // More webinars (dark covers)
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Альтернативные инвестиции в России",
    desc: "Запись с конференции",
    country: "Russia", date: "10 мар", downloads: 7,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Возможно ли заработать в Дубае в 2026 году?",
    desc: "Tranio Global Conference 2026 — главная сцена в Москве",
    country: "Global", date: "1 фев", downloads: 15,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Главная сцена: полная запись",
    desc: "Tranio Global Conference 2026 — главная сцена в Москве",
    country: "Global", date: "15 фев", downloads: 15,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Риски 2026 года в инвестициях в зарубежную недвижимость",
    desc: "Tranio Global Conference 2026 — главная сцена в Москве",
    country: "Global", date: "15 фев", downloads: 15,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Трансграничная оплата",
    desc: "Tranio Global Property Day 2026",
    country: "Global", date: "15 фев", downloads: 8,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "ВНЖ и паспорта вместо виз",
    desc: "Tranio Global Property Day 2026",
    country: "Global", date: "15 фев", downloads: 6,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Tranio Global Property Day 2026",
    desc: "Запись главной сцены",
    country: "Global", date: "15 фев", downloads: 22,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });
  add({ kind: "Запись вебинара", cat: "webinars", brand: "brokerage",
    title: "Инвестиции в коммерческую недвижимость",
    desc: "Tranio Global Property Day 2026",
    country: "Global", date: "10 фев", downloads: 11,
    type: "VIDEO", isNew: false, tags: [], cover: "dark"
  });

  // Tranio Capital extras
  add({ kind: "Аналитика", cat: "analytics", brand: "capital",
    title: "Налогообложение, валютный контроль и обмен налоговой информацией между РФ и ОАЭ",
    desc: "Памятка для клиентов",
    country: "UAE", date: "ноябрь", downloads: 7, rating: null,
    type: "PDF", isNew: true, tags: ["ОАЭ", "Налоги"]
  });
  add({ kind: "Аналитика", cat: "analytics", brand: "capital",
    title: "Отчёт Tranio Capital по Дубаю за 2025 год",
    desc: "",
    country: "UAE", date: "—", downloads: 7, rating: null,
    type: "PDF", isNew: true, tags: ["Дубай"]
  });
  add({ kind: "Аналитика", cat: "analytics", brand: "capital",
    title: "Перегрет ли рынок жилья Дубая? Полный отчёт",
    desc: "Изучили предложения, спрос, динамику цен и другие фундаментальные факторы",
    country: "UAE", date: "25 ноя", downloads: 25, rating: null,
    type: "PDF", isNew: true, tags: ["Дубай"]
  });

  // Telegram channels feed
  const TG = [
    { ch: "Таиланд от Tranio", time: "16 апр, 14:47", title: "Премиальная недвижимость в Таиланде как инвестиционная стратегия",
      snip: "Массовый сегмент курортных кондоминиумов Таиланда последних лет…", views: 376 },
    { ch: "Таиланд от Tranio", time: "13 апр, 18:30", title: "Виллы с бассейнами в пешей доступности от пляжа Маенам, Самуи",
      snip: "13 вилл с 4 или 5 спальнями, офисом, прачечной, кладовой и террасой…", views: 405 },
    { ch: "Таиланд от Tranio", time: "10 апр, 13:30", title: "Неделя, когда весь Таиланд живёт в режиме фестиваля: Сонгкран 2026",
      snip: "Сонгкран — традиционный тайский Новый год, который отмечается…", views: 523 },
    { ch: "Таиланд от Tranio", time: "9 апр, 15:46", title: "145 млн долларов в Таиланде: россияне укрепили позиции в топ-3 инвесторов в 2025 году",
      snip: "Согласно последним данным регулятора…", views: 509 },
    { ch: "Таиланд от Tranio", time: "7 апр, 17:45", title: "Виллы с велнес-центром и 200 метров до пляжа в самом сердце тропиков",
      snip: "Осталось всего 4 эксклюзивные виллы с бассейнами в самом сердце тропиков…", views: 531 },
    { ch: "Tranio: недвижимость", time: "7 апр, 10:11", title: "Программа гражданства за инвестиции для альтернативного пути получения ВНЖ в Европе",
      snip: "С 2022 года некоторые европейские…", views: 769 },
    { ch: "Tranio: недвижимость", time: "2 апр, 18:30", title: "Аликанте — лидеры Испании в доле иностранных покупателей в 2025 году",
      snip: "В 2025 году Аликанте закрепился как лидер Испании по доле иностранцев…", views: 488 },
    { ch: "Tranio: недвижимость", time: "31 мар, 17:58", title: "Иностранцы всё активнее арендуют жильё в Греции",
      snip: "Греция мы уверенно закрепляется не только как место для отдыха, но и для инвестиций…", views: 615 },
    { ch: "Tranio: недвижимость", time: "27 мар, 18:43", title: "Дайджест",
      snip: "Число иностранцев с действующими ВНЖ в Испании достиг 7,5 миллионов человек на конец 2025 года (+4,5% за год). Среди…", views: 503 },
    { ch: "Tranio: недвижимость", time: "23 мар, 19:10", title: "Деноминация рынка: Франция возвращает иностранных покупателей в 2026 году",
      snip: "В 2026 году рынок недвижимости Франции…", views: 511 },
    { ch: "Дубай от Tranio", time: "10 мар, 10:25", title: "Вышел наш разговор с Иштаном Бушукиным про рынок Дубая на радио РБК",
      snip: "Чтобы сильно не подсветить, прозрачно поясняем кадры из отдела продаж застройщика Imtilaak…", views: 927 },
    { ch: "Дубай от Tranio", time: "4 мар, 16:46", title: "Влияет ли эскалация в регионе на рынок Дубая?",
      snip: "Безусловно, негативно. Встал ли рынок на паузу? В этот раз ответ заковыристее…", views: 1208 },
    { ch: "Дубай от Tranio", time: "3 мар, 12:18", title: "В эфире РБК с Павлом Демидовским и Кириллом Тонкаревым обсудили реакцию рынков Ближнего Востока…",
      snip: "В эфире обсудили реакцию рынков и конфигурацию конфликта быстро…", views: 847 },
    { ch: "Кипр от Tranio", time: "1 мар, 14:50", title: "В 10:00 начинаем сессию «Пересадочный аэропорт» с выступлением Армина Ахмета, главы Tranio на Ближнем Востоке",
      snip: "Аналитика рынка Кипра и регионов поблизости…", views: 612 },
    { ch: "Турция от Tranio", time: "27 фев, 10:54", title: "Совсем скоро начинаем Tranio Global Property Day 2026!", snip: "В карточках — расписание всех сессий…", views: 742 },
    { ch: "Греция от Tranio", time: "27 фев, 10:51", title: "Совсем скоро начинаем Tranio Global Property Day 2026!", snip: "В карточках — расписание всех сессий…", views: 728 },
    { ch: "Турция от Tranio", time: "26 фев, 13:33", title: "Завтра, 27 февраля, — Tranio Global Property Day 2026", snip: "Полная программа с описаниями сессий…", views: 415 },
    { ch: "Кипр от Tranio", time: "26 фев, 12:00", title: "Завтра — Tranio Global Property Day 2026", snip: "Программа доступна по ссылке…", views: 508 },
  ];

  // Download log
  const LOG = [
    { file: "«Золотая виза» Греции и рынок Афин в 2025 году",   user: "Наталья",            when: "Вчера, 20:02", action: "Скачивание", rating: null },
    { file: "Taxes in Greece in 2026. Guide",                     user: "Anastasia Shchepetova",when: "Вчера, 20:12", action: "Скачивание", rating: null },
    { file: "Инвестиции в недвижимость Таиланда с доходностью до 12%. Консультации с экспертами.", user: "Илья Шереметьев", when: "Вчера, 19:37", action: "Скачивание", rating: null },
    { file: "Кейс: Паспорт Вануату как инструмент получения ВНЖ в Европе", user: "Anastasia Shchepetova", when: "Вчера, 14:55", action: "Скачивание", rating: null },
    { file: "Отчёт Tranio Capital по Кипру за 2025 год",          user: "Наталья",            when: "Вчера, 13:21", action: "Скачивание", rating: null },
    { file: "Отчёт Tranio Capital по Кипру за 2025 год",          user: "Наталья",            when: "Вчера, 13:21", action: "Скачивание", rating: null },
    { file: "Куда сходить и как провести время в Афинах",         user: "Anastasia Shchepetova",when: "Вчера, 10:07", action: "Скачивание", rating: null },
    { file: "Greece Golden Visa, smartphone deck",                user: "Svetlana Larionova", when: "25.04 19:02", action: "Скачивание", rating: null },
    { file: "English: Golden Visa through property investment from €350,000.", user: "Svetlana Larionova", when: "25.04 19:02", action: "Скачивание", rating: null },
    { file: "Год по налогам в Греции",                            user: "Ксения Насс",        when: "25.04 11:30", action: "Скачивание", rating: null },
    { file: "Демографическое чудо Дубая: фундамент роста рынка недвижимости", user: "Илья Шереметьев", when: "24.04 19:50", action: "Скачивание", rating: 5.0 },
    { file: "Криптореализация на Кипре: памятка",                 user: "Екатерина Абрамчик", when: "24.04 18:15", action: "Скачивание", rating: null },
    { file: "Недвижимость на Бали от $100 000, доходность 12-15% годовых.", user: "Илья Шереметьев", when: "24.04 18:01", action: "Скачивание", rating: null },
    { file: "Инвестиции в недвижимость Таиланда с доходностью до 12% годовых. Консультации с экспертами.", user: "Илья Шереметьев", when: "24.04 18:00", action: "Скачивание", rating: null },
    { file: "Демографическое чудо Дубая: фундамент роста рынка недвижимости", user: "Полина Фёдорова", when: "24.04 16:32", action: "Скачивание", rating: 5.0 },
    { file: "Метаксургио: богемный кластер Афин в периоде трансформации", user: "Полина Фёдорова", when: "24.04 16:32", action: "Скачивание", rating: null },
    { file: "Тизер Tranio: Гражданство Сан-Томе и Принсипи",      user: "Полина Фёдорова",    when: "24.04 16:32", action: "Скачивание", rating: null },
    { file: "Гэхист: как управлять недвижимостью, чтобы она приносила доход, а не портилась", user: "Полина Фёдорова", when: "24.04 16:31", action: "Скачивание", rating: null },
    { file: "Кейс: Стартап-вилла Испании",                         user: "Полина Фёдорова",    when: "24.04 16:29", action: "Скачивание", rating: null },
  ];

  return { COUNTRIES, CATS, BRANDS, MATERIALS: M, TG, LOG };
})();
