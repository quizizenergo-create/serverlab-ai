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
  // Offline translations for course modules, lesson titles and lesson summaries.
  // Longer lesson paragraphs are translated on demand by /api/translate when OPENAI_API_KEY is configured.
  const courseTranslations = {
    ru: {
      'Сервер архитектурасының негіздері':'Основы архитектуры серверов',
      'Процессор, жедел жад және аналық тақша':'Процессор, оперативная память и материнская плата',
      'Серверлік сақтау жүйелері':'Системы хранения серверов',
      'Желілік серверлік жабдықтар':'Сетевое серверное оборудование',
      'Виртуализация және бұлттық орта':'Виртуализация и облачная среда',
      'Сервер қауіпсіздігі':'Безопасность серверов',
      'Мониторинг және ақауды анықтау':'Мониторинг и поиск неисправностей',
      'Дата-орталық және кәсіби практика':'Центр обработки данных и профессиональная практика',
      'Операциялық жүйелер және серверді басқару':'Операционные системы и управление сервером',
      'Веб және деректер базасы серверлері':'Веб-серверы и серверы баз данных',
      'Сенімділік, масштабтау және жоғары қолжетімділік':'Надёжность, масштабирование и высокая доступность',
      'Практикалық зертхана және ақауды іздеу':'Практическая лаборатория и поиск неисправностей',
      'Сервер деген не?':'Что такое сервер?',
      'Сервер түрлері және олардың қызметі':'Виды серверов и их назначение',
      'Клиент-сервер архитектурасы':'Клиент-серверная архитектура',
      'Серверлік процессор (CPU)':'Серверный процессор (CPU)',
      'Жедел жад (RAM) және ECC':'Оперативная память (RAM) и ECC',
      'Аналық тақша, қуат көзі және салқындату':'Материнская плата, блок питания и охлаждение',
      'HDD, SSD және NVMe':'HDD, SSD и NVMe',
      'RAID деңгейлері':'Уровни RAID',
      'Резервтік көшіру және қалпына келтіру':'Резервное копирование и восстановление',
      'Коммутатор және маршрутизатор':'Коммутатор и маршрутизатор',
      'IP мекенжай, DNS және DHCP':'IP-адрес, DNS и DHCP',
      'Ethernet, өткізу қабілеті және кідіріс':'Ethernet, пропускная способность и задержка',
      'Виртуалды машина және гипервизор':'Виртуальная машина и гипервизор',
      'Контейнерлер және Docker ұғымы':'Контейнеры и основы Docker',
      'Бұлттық есептеу және қызмет модельдері':'Облачные вычисления и модели услуг',
      'Қолжетімділікті басқару және MFA':'Управление доступом и MFA',
      'Жаңарту, антивирус және желілік сүзгі':'Обновления, антивирус и сетевой фильтр',
      'Журналдар, аудит және инцидентке жауап':'Журналы, аудит и реагирование на инциденты',
      'CPU, RAM, диск және желі мониторингі':'Мониторинг CPU, RAM, диска и сети',
      'Ақауды диагностикалау әдісі':'Методы диагностики неисправностей',
      'Қолжетімділік, SLA және резервтеу':'Доступность, SLA и резервирование',
      'Сервер бөлмесі және дата-орталық':'Серверная комната и дата-центр',
      'Энергия тиімділігі және экология':'Энергоэффективность и экология',
      'Кәсіби рөл, құжаттама және этика':'Профессиональная роль, документация и этика',
      'Серверлік операциялық жүйелер':'Серверные операционные системы',
      'Пайдаланушылар, топтар және файл рұқсаттары':'Пользователи, группы и права на файлы',
      'Сервер қызметтері, SSH және журналдар':'Службы сервера, SSH и журналы',
      'HTTP/HTTPS және веб-сервер':'HTTP/HTTPS и веб-сервер',
      'Деректер базасы сервері және SQL негіздері':'Сервер баз данных и основы SQL',
      'API, қолданба сервері және жариялау':'API, сервер приложений и публикация',
      'Жүктемені теңгеру (Load Balancing)':'Балансировка нагрузки (Load Balancing)',
      'Жоғары қолжетімділік және failover':'Высокая доступность и переключение при отказе (failover)',
      'Масштабтау, кэш және сыйымдылық жоспары':'Масштабирование, кэш и планирование ресурсов',
      'Сервер архитектурасын жобалау кейсі':'Кейс проектирования серверной архитектуры',
      'Ақауды кезең-кезеңімен диагностикалау':'Пошаговая диагностика неисправностей',
      'Техникалық есеп және кәсіби қорытынды':'Технический отчёт и профессиональные выводы',
      'Сервердің қызметі мен клиенттен айырмашылығы.':'Назначение сервера и его отличие от клиента.',
      'Веб, файл, пошта және деректер базасы серверлері.':'Веб-серверы, файловые, почтовые серверы и серверы баз данных.',
      'Сұрау мен жауап қалай алмасатынын түсіну.':'Как происходит обмен запросами и ответами.',
      'Ядро, ағын, жиілік және жүктеме.':'Ядра, потоки, частота и нагрузка.',
      'Жедел жад не үшін керек және ECC нені түзетеді?':'Для чего нужна оперативная память и какие ошибки исправляет ECC?',
      'Компоненттердің үйлесімділігі мен тұрақты жұмысы.':'Совместимость компонентов и стабильная работа.',
      'Сақтау құрылғыларының айырмашылығы.':'Различия между устройствами хранения.',
      'RAID 0, RAID 1, RAID 5 және RAID 10 негіздері.':'Основы RAID 0, RAID 1, RAID 5 и RAID 10.',
      'Backup түрлері мен қалпына келтіру жоспары.':'Виды резервного копирования и план восстановления.',
      'Жергілікті желі мен желілер арасындағы бағыттау.':'Локальная сеть и маршрутизация между сетями.',
      'Мекенжай беру және домен атын табу.':'Назначение адресов и поиск доменных имён.',
      'Жылдамдық, ping және дерек жеткізу.':'Скорость, ping и передача данных.',
      'Виртуалды сервер қалай жұмыс істейді?':'Как работает виртуальный сервер?',
      'Контейнер мен виртуалды машинаның айырмашылығы.':'Разница между контейнером и виртуальной машиной.',
      'IaaS, PaaS және SaaS негізгі ұғымдары.':'Основные понятия IaaS, PaaS и SaaS.',
      'Ең аз құқық қағидасы және көп факторлы аутентификация.':'Принцип минимальных привилегий и многофакторная аутентификация.',
      'Қауіпсіздік жаңартуларын жоспарлау.':'Планирование обновлений безопасности.',
      'Оқиғаларды тіркеу және қауіпсіздік оқиғасын талдау.':'Регистрация событий и анализ инцидентов безопасности.',
      'Негізгі өлшемдер мен шекті мәндер.':'Основные метрики и пороговые значения.',
      'Белгіні жинау, болжам жасау және тексеру.':'Сбор симптомов, формирование гипотез и проверка.',
      'Қызметтің тұрақты жұмыс істеуін өлшеу.':'Измерение стабильности работы сервиса.',
      'Рэк, ауа ағыны, қуат және физикалық қауіпсіздік.':'Стойки, воздушные потоки, питание и физическая безопасность.',
      'Қуат тұтыну мен ресурсты жауапты пайдалану.':'Потребление энергии и ответственное использование ресурсов.',
      'Жүйелік әкімшінің күнделікті міндеттері және жауапты жұмыс.':'Ежедневные задачи системного администратора и ответственная работа.',
      'Linux және Windows Server жүйелерінің міндеттері мен таңдау өлшемдері.':'Назначение Linux и Windows Server и критерии выбора.',
      'Ең аз артықшылық қағидасы және файлдық жүйені басқару.':'Принцип минимальных привилегий и управление файловой системой.',
      'Қызметтің күйін тексеру және қауіпсіз қашықтан басқару.':'Проверка состояния служб и безопасное удалённое управление.',
      'Сұрау, жауап, порт және веб-сервердің міндеті.':'Запрос, ответ, порт и назначение веб-сервера.',
      'Кесте, сұрау, индекс және дерек тұтастығы.':'Таблицы, запросы, индексы и целостность данных.',
      'Frontend, backend және деректер қабаты арасындағы байланыс.':'Связь между frontend, backend и слоем данных.',
      'Сұрауларды бірнеше сервер арасында тарату.':'Распределение запросов между несколькими серверами.',
      'Резервтік түйіндер, істен шығу және қызметті қалпына келтіру.':'Резервные узлы, отказ и восстановление сервиса.',
      'Жүктеме артқанда ресурс пен жауап уақытын басқару.':'Управление ресурсами и временем ответа при росте нагрузки.',
      'Қажеттіліктен бастап CPU, RAM, сақтау, желі және backup таңдауға дейін.':'От определения требований до выбора CPU, RAM, хранилища, сети и резервного копирования.',
      'Белгіні бекіту, ықтимал себепті тексеру және шешімнің әсерін бақылау.':'Фиксация симптомов, проверка вероятных причин и контроль результата.',
      'Нәтиже, тәуекел, ұсыныс және келесі қадамды қысқа есепке түсіру.':'Краткая фиксация результатов, рисков, рекомендаций и следующих шагов.'
    },
    en: {
      'Сервер архитектурасының негіздері':'Server Architecture Fundamentals',
      'Процессор, жедел жад және аналық тақша':'CPU, RAM and Motherboard',
      'Серверлік сақтау жүйелері':'Server Storage Systems',
      'Желілік серверлік жабдықтар':'Server Networking Equipment',
      'Виртуализация және бұлттық орта':'Virtualization and Cloud Environments',
      'Сервер қауіпсіздігі':'Server Security',
      'Мониторинг және ақауды анықтау':'Monitoring and Troubleshooting',
      'Дата-орталық және кәсіби практика':'Data Centres and Professional Practice',
      'Операциялық жүйелер және серверді басқару':'Operating Systems and Server Management',
      'Веб және деректер базасы серверлері':'Web and Database Servers',
      'Сенімділік, масштабтау және жоғары қолжетімділік':'Reliability, Scaling and High Availability',
      'Практикалық зертхана және ақауды іздеу':'Practical Lab and Fault Finding',
      'Сервер деген не?':'What Is a Server?',
      'Сервер түрлері және олардың қызметі':'Server Types and Their Roles',
      'Клиент-сервер архитектурасы':'Client–Server Architecture',
      'Серверлік процессор (CPU)':'Server CPU',
      'Жедел жад (RAM) және ECC':'RAM and ECC',
      'Аналық тақша, қуат көзі және салқындату':'Motherboard, Power Supply and Cooling',
      'HDD, SSD және NVMe':'HDD, SSD and NVMe',
      'RAID деңгейлері':'RAID Levels',
      'Резервтік көшіру және қалпына келтіру':'Backup and Recovery',
      'Коммутатор және маршрутизатор':'Switches and Routers',
      'IP мекенжай, DNS және DHCP':'IP Addressing, DNS and DHCP',
      'Ethernet, өткізу қабілеті және кідіріс':'Ethernet, Bandwidth and Latency',
      'Виртуалды машина және гипервизор':'Virtual Machines and Hypervisors',
      'Контейнерлер және Docker ұғымы':'Containers and Docker Basics',
      'Бұлттық есептеу және қызмет модельдері':'Cloud Computing and Service Models',
      'Қолжетімділікті басқару және MFA':'Access Control and MFA',
      'Жаңарту, антивирус және желілік сүзгі':'Updates, Antivirus and Network Filtering',
      'Журналдар, аудит және инцидентке жауап':'Logs, Auditing and Incident Response',
      'CPU, RAM, диск және желі мониторингі':'CPU, RAM, Disk and Network Monitoring',
      'Ақауды диагностикалау әдісі':'Troubleshooting Methods',
      'Қолжетімділік, SLA және резервтеу':'Availability, SLA and Redundancy',
      'Сервер бөлмесі және дата-орталық':'Server Rooms and Data Centres',
      'Энергия тиімділігі және экология':'Energy Efficiency and the Environment',
      'Кәсіби рөл, құжаттама және этика':'Professional Roles, Documentation and Ethics',
      'Серверлік операциялық жүйелер':'Server Operating Systems',
      'Пайдаланушылар, топтар және файл рұқсаттары':'Users, Groups and File Permissions',
      'Сервер қызметтері, SSH және журналдар':'Server Services, SSH and Logs',
      'HTTP/HTTPS және веб-сервер':'HTTP/HTTPS and Web Servers',
      'Деректер базасы сервері және SQL негіздері':'Database Servers and SQL Basics',
      'API, қолданба сервері және жариялау':'APIs, Application Servers and Deployment',
      'Жүктемені теңгеру (Load Balancing)':'Load Balancing',
      'Жоғары қолжетімділік және failover':'High Availability and Failover',
      'Масштабтау, кэш және сыйымдылық жоспары':'Scaling, Caching and Capacity Planning',
      'Сервер архитектурасын жобалау кейсі':'Server Architecture Design Case',
      'Ақауды кезең-кезеңімен диагностикалау':'Step-by-Step Troubleshooting',
      'Техникалық есеп және кәсіби қорытынды':'Technical Report and Professional Summary',
      'Сервердің қызметі мен клиенттен айырмашылығы.':'A server’s role and how it differs from a client.',
      'Веб, файл, пошта және деректер базасы серверлері.':'Web, file, mail and database servers.',
      'Сұрау мен жауап қалай алмасатынын түсіну.':'Understand how requests and responses are exchanged.',
      'Ядро, ағын, жиілік және жүктеме.':'Cores, threads, clock speed and workload.',
      'Жедел жад не үшін керек және ECC нені түзетеді?':'What RAM is for and which errors ECC can correct.',
      'Компоненттердің үйлесімділігі мен тұрақты жұмысы.':'Component compatibility and stable operation.',
      'Сақтау құрылғыларының айырмашылығы.':'Differences between storage devices.',
      'RAID 0, RAID 1, RAID 5 және RAID 10 негіздері.':'RAID 0, RAID 1, RAID 5 and RAID 10 fundamentals.',
      'Backup түрлері мен қалпына келтіру жоспары.':'Backup types and a recovery plan.',
      'Жергілікті желі мен желілер арасындағы бағыттау.':'Local networks and routing between networks.',
      'Мекенжай беру және домен атын табу.':'Address assignment and domain-name lookup.',
      'Жылдамдық, ping және дерек жеткізу.':'Speed, ping and data delivery.',
      'Виртуалды сервер қалай жұмыс істейді?':'How a virtual server works.',
      'Контейнер мен виртуалды машинаның айырмашылығы.':'The difference between a container and a virtual machine.',
      'IaaS, PaaS және SaaS негізгі ұғымдары.':'Core concepts of IaaS, PaaS and SaaS.',
      'Ең аз құқық қағидасы және көп факторлы аутентификация.':'The principle of least privilege and multi-factor authentication.',
      'Қауіпсіздік жаңартуларын жоспарлау.':'Planning security updates.',
      'Оқиғаларды тіркеу және қауіпсіздік оқиғасын талдау.':'Recording events and analysing security incidents.',
      'Негізгі өлшемдер мен шекті мәндер.':'Core metrics and threshold values.',
      'Белгіні жинау, болжам жасау және тексеру.':'Collect symptoms, form hypotheses and test them.',
      'Қызметтің тұрақты жұмыс істеуін өлшеу.':'Measuring service reliability.',
      'Рэк, ауа ағыны, қуат және физикалық қауіпсіздік.':'Racks, airflow, power and physical security.',
      'Қуат тұтыну мен ресурсты жауапты пайдалану.':'Power consumption and responsible use of resources.',
      'Жүйелік әкімшінің күнделікті міндеттері және жауапты жұмыс.':'Daily tasks of a system administrator and responsible practice.',
      'Linux және Windows Server жүйелерінің міндеттері мен таңдау өлшемдері.':'Purposes of Linux and Windows Server and selection criteria.',
      'Ең аз артықшылық қағидасы және файлдық жүйені басқару.':'Least privilege and file-system management.',
      'Қызметтің күйін тексеру және қауіпсіз қашықтан басқару.':'Checking service status and secure remote administration.',
      'Сұрау, жауап, порт және веб-сервердің міндеті.':'Requests, responses, ports and the role of a web server.',
      'Кесте, сұрау, индекс және дерек тұтастығы.':'Tables, queries, indexes and data integrity.',
      'Frontend, backend және деректер қабаты арасындағы байланыс.':'How the frontend, backend and data layer interact.',
      'Сұрауларды бірнеше сервер арасында тарату.':'Distributing requests across multiple servers.',
      'Резервтік түйіндер, істен шығу және қызметті қалпына келтіру.':'Standby nodes, failures and service recovery.',
      'Жүктеме артқанда ресурс пен жауап уақытын басқару.':'Managing resources and response times as load grows.',
      'Қажеттіліктен бастап CPU, RAM, сақтау, желі және backup таңдауға дейін.':'From requirements to selecting CPU, RAM, storage, networking and backups.',
      'Белгіні бекіту, ықтимал себепті тексеру және шешімнің әсерін бақылау.':'Record symptoms, test likely causes and verify the fix.',
      'Нәтиже, тәуекел, ұсыныс және келесі қадамды қысқа есепке түсіру.':'Summarise results, risks, recommendations and next steps.'
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
  function localTranslate(source, lang) { const key = normalize(source); return (local[lang] && local[lang][key]) || (courseTranslations[lang] && courseTranslations[lang][key]) || source; }
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
