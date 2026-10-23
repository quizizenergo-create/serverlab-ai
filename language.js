/* ServerLab AI language switcher.
   Kazakh interface is the source language. Common interface phrases work offline.
   Full dynamic lesson translation uses the site's server-side OPENAI_API_KEY when configured. */
(function () {
  'use strict';
  const storageKey = 'serverlab-ai-language-v2';
  const cacheKey = 'serverlab-ai-translation-cache-v1';
  const supported = ['kk', 'ru', 'en'];
  const labels = { kk: 'Қазақша', ru: 'Русский', en: 'English' };
  const local = {
    ru: {
      'ОҚУ · ТЕХНОЛОГИЯ · ДАМУ':'ОБУЧЕНИЕ · ТЕХНОЛОГИИ · РАЗВИТИЕ',
      'Өз болашағыңды':'Создавай своё будущее', 'ақылды түрде':'с умом',
      'Серверлік техникалық құралдарды меңгер, тесттер орында және оқу прогресіңді бақыла.':'Изучай серверное оборудование, проходи тесты и отслеживай прогресс.',
      '✓ 36 оқу параграфы':'✓ 36 учебных уроков','✓ Жеке оқу прогресі':'✓ Личный прогресс','✓ ИИ-тәлімгер және ойындар':'✓ ИИ-наставник и игры',
      'ҚОРҒАЛҒАН ОҚУ АККАУНТЫ':'ЗАЩИЩЁННЫЙ УЧЕБНЫЙ АККАУНТ','Кіру':'Вход','Тіркелу':'Регистрация','Қош келдің!':'Добро пожаловать!','Оқуыңды жалғастыру үшін аккаунтыңа кір.':'Войди в аккаунт, чтобы продолжить обучение.',
      'Электрондық пошта':'Электронная почта','Құпиясөз':'Пароль','Құпиясөзді енгіз':'Введите пароль','Жүйеге кіру':'Войти','Жаңа қолданушысың ба?':'Впервые здесь?','Аккаунт ашу':'Создать аккаунт',
      'Прогрессің жеке аккаунтыңда сақталады.':'Твой прогресс сохраняется в аккаунте.','Атың немесе лақап атың':'Имя или псевдоним','Тобы / сыныбы':'Группа / класс','(міндетті емес)':'(необязательно)','Кемінде 8 таңба':'Не менее 8 символов',
      'Оқу аккаунты мен нәтижелерім серверде сақталатынын түсінемін. Құпия немесе артық жеке дерек енгізбеймін.':'Я понимаю, что учебный аккаунт и результаты сохраняются на сервере. Я не буду вводить секретные или лишние личные данные.',
      'Аккаунтың бар ма?':'Уже есть аккаунт?','Демо режимде көру — аккаунтсыз':'Демо-режим без аккаунта','Басты бет':'Главная','Оқу курсы':'Учебный курс','Сервер зертханасы':'Серверная лаборатория','ИИ-тәлімгер':'ИИ-наставник','Тапсырмалар':'Задания','Тапсырмалар орталығы':'Центр заданий','Оқу ойындары':'Учебные игры','Менің прогресім':'Мой прогресс','Әкімші панелі':'Панель администратора','Жоба туралы':'О проекте','Жеке кабинет':'Личный кабинет','Профиль баптауы':'Настройки профиля',
      'Білім алушы':'Обучающийся','Білім алушы профилі':'Профиль обучающегося','Оқу орталығы':'УЧЕБНЫЙ ЦЕНТР','Сәтті оқу!':'УДАЧНОЙ УЧЁБЫ!','СӘТТІ ОҚУ!':'УДАЧНОЙ УЧЁБЫ!','Сенің бүгінгі жетістіктерің':'Твои сегодняшние достижения','Оқу көрсеткіштері':'Учебные показатели','Толық есеп':'Полный отчёт','Сабақ аяқталды':'Уроков завершено','орындалды':'выполнено','ОҚУ БАҒДАРЛАМАСЫ':'УЧЕБНАЯ ПРОГРАММА','Теория, мысалдар, практикалық тапсырмалар және әр тақырыптан кейінгі тест.':'Теория, примеры, практические задания и тест после каждой темы.',
      'Сабақ':'Урок','Курстарға оралу':'Вернуться к курсам','Бүгінгі оқу күні':'Сегодняшний учебный день','Оқуды жалғастыру':'Продолжить обучение','Өз қарқыныңмен алға жылжы.':'Продвигайся в своём темпе.','Менің прогресім':'Мой прогресс','Жалпы прогресс':'Общий прогресс','Аяқталған сабақ':'Завершённые уроки','Тәжірибе ұпайы':'Баллы опыта','Орташа тест нәтижесі':'Средний результат тестов',
      'Оқу ойындары':'Учебные игры','Сәйкестендіру':'Сопоставление','Флеш-карталар':'Флеш-карточки','Жылдам тест':'Быстрый тест','Есепті жүктеу':'Скачать отчёт','Профиль деректері':'Данные профиля','Өзгерістерді сақтау':'Сохранить изменения','Тобың':'Твоя группа','Оқу мақсаты':'Учебная цель','Негіздерді меңгеру':'Освоить основы','Тест нәтижесін жақсарту':'Улучшить результаты тестов','Практикалық дағдыны дамыту':'Развить практические навыки','Кәсіби даярлық':'Профессиональная подготовка',
      'АВТОР САЙТА':'АВТОР САЙТА','Ақшабаева Сымбат':'Ақшабаева Сымбат','Педагогикалық мәселе':'Педагогическая проблема','Мақсат және аудитория':'Цель и аудитория','ИИ құралдары':'Инструменты ИИ','Практикалық маңызы':'Практическая значимость','Кеңейту мүмкіндігі':'Возможность расширения','Адалдық және қауіпсіздік':'Честность и безопасность',
      'ҚОРҒАЛҒАН БАСҚАРУ':'ЗАЩИЩЁННОЕ УПРАВЛЕНИЕ','Тіркелген білім алушыларды және оқу нәтижелерін бақыла.':'Просмотр зарегистрированных обучающихся и результатов обучения.','CSV жүктеу':'Скачать CSV','Жаңарту':'Обновить','Топтар / сыныптар бойынша нәтиже':'Результаты по группам / классам','Білім алушылар':'Обучающиеся','Деректер құпиялығы':'Конфиденциальность данных','Тізімді жариялама және тек оқу мақсатына пайдалан.':'Не публикуй список и используй данные только в учебных целях.',
      'Сабақтардан кейін білімді тексер, тәжірибе жина және қиын тақырыптарды қайтала.':'Проверяй знания после уроков, набирай опыт и повторяй сложные темы.','Ойна және үйрен':'Играй и учись','Қателесу — үйренудің бір бөлігі.':'Ошибки — часть обучения.','Сәлем!':'Привет!','Тіл':'ЯЗЫК','Тілді таңдау':'Выбрать язык'
    },
    en: {
      'ОҚУ · ТЕХНОЛОГИЯ · ДАМУ':'LEARNING · TECHNOLOGY · GROWTH','Өз болашағыңды':'Build your future','ақылды түрде':'with intelligence',
      'Серверлік техникалық құралдарды меңгер, тесттер орында және оқу прогресіңді бақыла.':'Learn server hardware, take quizzes, and track your learning progress.',
      '✓ 36 оқу параграфы':'✓ 36 lessons','✓ Жеке оқу прогресі':'✓ Personal progress','✓ ИИ-тәлімгер және ойындар':'✓ AI tutor and games',
      'ҚОРҒАЛҒАН ОҚУ АККАУНТЫ':'SECURE LEARNING ACCOUNT','Кіру':'Sign in','Тіркелу':'Register','Қош келдің!':'Welcome!','Оқуыңды жалғастыру үшін аккаунтыңа кір.':'Sign in to continue learning.',
      'Электрондық пошта':'Email address','Құпиясөз':'Password','Құпиясөзді енгіз':'Enter password','Жүйеге кіру':'Sign in','Жаңа қолданушысың ба?':'New here?','Аккаунт ашу':'Create account',
      'Прогрессің жеке аккаунтыңда сақталады.':'Your progress is saved to your account.','Атың немесе лақап атың':'Name or nickname','Тобы / сыныбы':'Group / class','(міндетті емес)':'(optional)','Кемінде 8 таңба':'At least 8 characters',
      'Оқу аккаунты мен нәтижелерім серверде сақталатынын түсінемін. Құпия немесе артық жеке дерек енгізбеймін.':'I understand that my learning account and results are stored on the server. I will not enter sensitive or unnecessary personal data.',
      'Аккаунтың бар ма?':'Already have an account?','Демо режимде көру — аккаунтсыз':'Try demo mode without an account','Басты бет':'Home','Оқу курсы':'Learning course','Сервер зертханасы':'Server lab','ИИ-тәлімгер':'AI tutor','Тапсырмалар':'Assignments','Тапсырмалар орталығы':'Assignment center','Оқу ойындары':'Learning games','Менің прогресім':'My progress','Әкімші панелі':'Admin panel','Жоба туралы':'About the project','Жеке кабинет':'My account','Профиль баптауы':'Profile settings',
      'Білім алушы':'Learner','Білім алушы профилі':'Learner profile','Оқу орталығы':'LEARNING HUB','Сәтті оқу!':'HAPPY LEARNING!','СӘТТІ ОҚУ!':'HAPPY LEARNING!','Сенің бүгінгі жетістіктерің':'Your achievements today','Оқу көрсеткіштері':'Learning statistics','Толық есеп':'Full report','Сабақ аяқталды':'Lessons completed','орындалды':'completed','ОҚУ БАҒДАРЛАМАСЫ':'LEARNING PROGRAM','Теория, мысалдар, практикалық тапсырмалар және әр тақырыптан кейінгі тест.':'Theory, examples, practical tasks, and a quiz after each topic.',
      'Сабақ':'Lesson','Курстарға оралу':'Back to courses','Бүгінгі оқу күні':'Today’s learning day','Оқуды жалғастыру':'Continue learning','Өз қарқыныңмен алға жылжы.':'Move forward at your own pace.','Менің прогресім':'My progress','Жалпы прогресс':'Overall progress','Аяқталған сабақ':'Completed lessons','Тәжірибе ұпайы':'Experience points','Орташа тест нәтижесі':'Average quiz score',
      'Сәйкестендіру':'Match terms','Флеш-карталар':'Flashcards','Жылдам тест':'Quick quiz','Есепті жүктеу':'Download report','Профиль деректері':'Profile information','Өзгерістерді сақтау':'Save changes','Тобың':'Your group','Оқу мақсаты':'Learning goal','Негіздерді меңгеру':'Learn the basics','Тест нәтижесін жақсарту':'Improve quiz results','Практикалық дағдыны дамыту':'Build practical skills','Кәсіби даярлық':'Career preparation',
      'АВТОР САЙТА':'WEBSITE AUTHOR','Ақшабаева Сымбат':'Ақшабаева Сымбат','Педагогикалық мәселе':'Pedagogical challenge','Мақсат және аудитория':'Goal and audience','ИИ құралдары':'AI tools','Практикалық маңызы':'Practical value','Кеңейту мүмкіндігі':'Adaptability','Адалдық және қауіпсіздік':'Integrity and security',
      'ҚОРҒАЛҒАН БАСҚАРУ':'SECURE ADMINISTRATION','Тіркелген білім алушыларды және оқу нәтижелерін бақыла.':'Monitor registered learners and learning outcomes.','CSV жүктеу':'Download CSV','Жаңарту':'Refresh','Топтар / сыныптар бойынша нәтиже':'Results by group / class','Білім алушылар':'Learners','Деректер құпиялығы':'Data privacy','Тізімді жариялама және тек оқу мақсатына пайдалан.':'Do not publish the list; use the data only for learning purposes.',
      'Сабақтардан кейін білімді тексер, тәжірибе жина және қиын тақырыптарды қайтала.':'Check your knowledge after lessons, earn experience, and review difficult topics.','Ойна және үйрен':'Play and learn','Қателесу — үйренудің бір бөлігі.':'Mistakes are part of learning.','Сәлем!':'Hello!','ТІЛ':'LANGUAGE','Тілді таңдау':'Choose language'
    }
  };
  const originalNodes = new WeakMap();
  const originalAttrs = new WeakMap();
  let scanTimer = null;
  let status = { translationEnabled: false };
  let currentLang = localStorage.getItem(storageKey) || 'kk';
  let cache = {};
  try { cache = JSON.parse(localStorage.getItem(cacheKey) || '{}') || {}; } catch { cache = {}; }
  function setActive(lang) {
    document.querySelectorAll('[data-site-language]').forEach(button => {
      const active = button.dataset.siteLanguage === lang;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function normalize(s) { return String(s ?? '').replace(/\s+/g, ' ').trim(); }
  function localTranslate(source, lang) { return (local[lang] && local[lang][normalize(source)]) || source; }
  function preserveWhitespace(source, translated) {
    const match = String(source).match(/^(\s*)([\s\S]*?)(\s*)$/);
    return `${match?.[1] || ''}${translated}${match?.[3] || ''}`;
  }
  function eligibleTextNode(node) {
    const el = node.parentElement;
    if (!el || !normalize(node.nodeValue)) return false;
    if (el.closest('script,style,textarea,code,pre,svg,[hidden],[aria-hidden="true"],.native-language-buttons,#google_translate_element')) return false;
    if (el.closest('.page:not(.active)')) return false;
    return Boolean(el.getClientRects().length);
  }
  function activeRoot() {
    const gate = document.getElementById('authGate');
    if (gate && !gate.classList.contains('is-hidden')) return gate;
    return document.querySelector('.app-shell') || document.body;
  }
  function scanVisible() {
    const root = activeRoot();
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!eligibleTextNode(node)) continue;
      if (!originalNodes.has(node)) originalNodes.set(node, node.nodeValue);
      const original = originalNodes.get(node);
      if (normalize(original).length < 2 || !/\p{L}/u.test(original)) continue;
      nodes.push({ type: 'text', node, original, source: normalize(original) });
    }
    const attrNames = ['placeholder','title','aria-label'];
    for (const element of root.querySelectorAll(attrNames.map(a => `[${a}]`).join(','))) {
      if (!element.getClientRects().length || element.closest('.native-language-buttons')) continue;
      if (element.matches('input[type="email"],input[type="password"]')) continue;
      if (element.closest('.page:not(.active)')) continue;
      for (const attr of attrNames) {
        if (!element.hasAttribute(attr)) continue;
        let remembered = originalAttrs.get(element);
        if (!remembered) { remembered = {}; originalAttrs.set(element, remembered); }
        if (!(attr in remembered)) remembered[attr] = element.getAttribute(attr);
        const original = remembered[attr];
        if (normalize(original).length < 2 || !/\p{L}/u.test(original)) continue;
        nodes.push({ type: 'attr', element, attr, original, source: normalize(original) });
      }
    }
    return nodes;
  }
  function applyCached(nodes, lang) {
    for (const item of nodes) {
      if (item.type === 'text') {
        const translated = cache[`${lang}|${item.source}`] || localTranslate(item.original, lang);
        item.node.nodeValue = preserveWhitespace(item.original, translated);
      } else {
        const translated = cache[`${lang}|${item.source}`] || localTranslate(item.original, lang);
        item.element.setAttribute(item.attr, translated);
      }
    }
  }
  async function translateWithServer(items, lang) {
    const result = [];
    for (let i = 0; i < items.length; i += 40) {
      const batch = items.slice(i, i + 40);
      const response = await fetch('/api/translate', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, texts: batch.map(item => item.source) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !Array.isArray(data.translations)) {
        const error = new Error(data.message || data.error || 'Translation unavailable');
        error.code = data.error; throw error;
      }
      for (let j = 0; j < batch.length; j++) {
        const translated = String(data.translations[j] ?? batch[j].source);
        cache[`${lang}|${batch[j].source}`] = translated;
        result.push({ item: batch[j], translated });
      }
    }
    // Keep cache bounded to avoid exhausting browser local storage.
    const keys = Object.keys(cache);
    if (keys.length > 1800) cache = Object.fromEntries(keys.slice(-1200).map(key => [key, cache[key]]));
    try { localStorage.setItem(cacheKey, JSON.stringify(cache)); } catch { /* Translation still works for the current view. */ }
    return result;
  }
  function setItem(item, lang, translated) {
    const value = lang === 'kk' ? item.original : preserveWhitespace(item.original, translated);
    if (item.type === 'text') item.node.nodeValue = value;
    else item.element.setAttribute(item.attr, lang === 'kk' ? item.original : translated);
  }
  async function applyLanguage(lang, options = {}) {
    if (!supported.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(storageKey, lang);
    document.documentElement.lang = lang;
    setActive(lang);
    if (lang === 'kk') {
      const all = scanVisible();
      // Scan existing visible nodes, then restore their original Kazakh text.
      for (const item of all) setItem(item, 'kk', item.original);
      const root = activeRoot();
      const attrElements = root.querySelectorAll('[placeholder],[title],[aria-label]');
      for (const el of attrElements) {
        const remembered = originalAttrs.get(el);
        if (remembered) for (const [attr, value] of Object.entries(remembered)) el.setAttribute(attr, value);
      }
      document.getElementById('translationDisclosure')?.replaceChildren(document.createTextNode('Тіл таңдауы: қазақша · орысша · ағылшынша'));
      return;
    }
    const nodes = scanVisible();
    // First apply instant offline translations so the selector responds even without an API key.
    applyCached(nodes, lang);
    if (!status.translationEnabled) {
      document.getElementById('translationDisclosure')?.replaceChildren(document.createTextNode('Толық автоматты аударма үшін серверде OPENAI_API_KEY қажет.'));
      if (!options.silent) showNotice('Интерфейстің негізгі жазулары өзгерді. Толық сабақ мәтіндерін аудару үшін Render Environment ішінде OPENAI_API_KEY бапта.');
      return;
    }
    const missing = nodes.filter(item => !cache[`${lang}|${item.source}`] && !Object.prototype.hasOwnProperty.call(local[lang] || {}, item.source));
    // Only translate strings that haven't already been cached. Preserve order and map responses back to DOM nodes.
    if (!missing.length) {
      document.getElementById('translationDisclosure')?.replaceChildren(document.createTextNode(lang === 'ru' ? 'Перевод интерфейса и уроков включён.' : 'Interface and lesson translation enabled.'));
      return;
    }
    if (!options.silent) showNotice(lang === 'ru' ? 'Переводим текущий экран…' : 'Translating the current screen…');
    try {
      const translated = await translateWithServer(missing, lang);
      for (const entry of translated) setItem(entry.item, lang, entry.translated);
      document.getElementById('translationDisclosure')?.replaceChildren(document.createTextNode(lang === 'ru' ? 'Перевод интерфейса и уроков включён.' : 'Interface and lesson translation enabled.'));
    } catch (error) {
      if (error.code === 'TRANSLATION_NOT_CONFIGURED') {
        status.translationEnabled = false;
        document.getElementById('translationDisclosure')?.replaceChildren(document.createTextNode('Толық автоматты аударма үшін серверде OPENAI_API_KEY қажет.'));
      }
      if (!options.silent) showNotice('Кейбір мәтіндер аударылмады. API кілтін немесе байланысын тексер.');
    }
  }
  function showNotice(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showNotice.timer);
    showNotice.timer = setTimeout(() => toast.classList.remove('show'), 5200);
  }
  function scheduleDynamicTranslation() {
    if (currentLang === 'kk') return;
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => applyLanguage(currentLang, { silent: true }), 400);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-site-language]');
    if (button) applyLanguage(button.dataset.siteLanguage);
  });
  document.addEventListener('DOMContentLoaded', async () => {
    setActive(currentLang);
    try {
      const response = await fetch('/api/status');
      if (response.ok) status = await response.json();
    } catch { /* Local UI phrases remain available when the server is unreachable. */ }
    if (currentLang !== 'kk') await applyLanguage(currentLang, { silent: true });
    const observer = new MutationObserver(scheduleDynamicTranslation);
    observer.observe(document.body, { subtree: true, childList: true });
    window.ServerLabLanguage = { set: applyLanguage, get: () => currentLang, labels };
  });
})();
