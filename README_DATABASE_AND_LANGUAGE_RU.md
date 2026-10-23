# ServerLab AI — база данных и языки (инструкция по-русски)

## Чтобы общая база учеников действительно работала
1. Открой https://dashboard.render.com/.
2. Нажми **New + → PostgreSQL**, назови базу `serverlab-ai-db` и выбери регион такой же, как у Web Service `serverlab-ai`.
3. Когда база создастся, открой её страницу → **Connect** → скопируй **Internal Database URL**. Не публикуй это значение и не присылай его в чат.
4. Открой Render → Web Service `serverlab-ai` → **Environment** → **Add Environment Variable**.
5. Добавь `DATABASE_URL` со значением Internal Database URL.
6. Добавь `ADMIN_EMAIL` (email администратора), `ADMIN_PASSWORD` (сильный пароль не короче 12 символов) и `ADMIN_NAME` (`Ақшабаева Сымбат`). Значения придумывай сам и не публикуй.
7. Для настоящего ИИ и полной автоматической перевода длинных уроков добавь `OPENAI_API_KEY`. Ключ использует сервер; не вставляй его в HTML и не загружай в GitHub. Использование API может быть платным. Без него основные фразы интерфейса переключаются локальным словарём, но длинные материалы остаются на казахском.
8. Нажми **Save, rebuild, and deploy**. Подожди, пока статус не станет `Live`.
9. Открой `https://ТВОЙ-АДРЕС.onrender.com/api/status`. Должны быть `"dbConfigured":true`, `"dbConnected":true`. Если `dbConnected:false`, проверь, что вставлен Internal Database URL и база с сайтом находится в одном регионе.
10. Открой сайт, зарегистрируй тестовый аккаунт обучающегося. Для проверки админки выйди из аккаунта и войди с email/password, заданными в `ADMIN_EMAIL` и `ADMIN_PASSWORD`.

## GitHub / Render
Файлы проекта находятся в подпапке `serverlab_ai`. Загружай именно её содержимое в корень GitHub репозитория, затем нажми **Commit changes**. На Render Build Command=`npm install`, Start Command=`npm start`, Root Directory пустой при условии, что файлы находятся в корне репозитория.

**Важно:** бесплатная Render PostgreSQL база истекает через 30 дней. Для постоянного хранения данных не полагайся на бесплатную временную базу.
