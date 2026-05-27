# Lab 11 — CI/CD с GitHub Actions

Простая веб-форма с автоматизированными UI-тестами (Selenium) и пайплайном CI/CD.

## Структура проекта

```
├── index.html              # Веб-форма регистрации
├── css/style.css           # Стили
├── js/app.js               # Логика формы
├── tests/test_form.py      # Selenium UI-тесты
├── .github/workflows/ci.yml # CI/CD пайплайн
└── requirements.txt        # Python-зависимости
```

## Ветки

| Ветка | Назначение |
|-------|-----------|
| `main`  | Продакшн, деплой на GitHub Pages |
| `dev`   | Основная ветка разработки |
| `fix`   | Ветка для задач (фичи, баги) |

## Локальный запуск

```bash
# Установка зависимостей
python -m pip install -r requirements.txt

# Запуск тестов (автоматически поднимает локальный сервер)
python -m pytest tests/test_form.py -v

# Просмотр формы
python -m http.server 8080
# Открыть http://127.0.0.1:8080/index.html
```

## CI/CD

- **CI**: тесты запускаются при каждом push и pull request в ветки `main`, `dev`, `fix`.
- **CD**: деплой на GitHub Pages происходит только при успешном проходе тестов в ветке `main`.

## Workflow разработки

1. Создать ветку от `dev` (например, `fix`)
2. Внести изменения, сделать commit и push
3. Создать Pull Request `fix` → `dev`
4. Дождаться прохождения тестов, выполнить merge
5. Создать Pull Request `dev` → `main`
6. После merge — автоматический деплой на GitHub Pages

## Публикация на GitHub

```powershell
# 1. Авторизация (один раз)
gh auth login

# 2. Создание репозитория и отправка веток
gh repo create lab11-ci-cd --public --source=. --remote=origin
git push -u origin main
git push -u origin dev
git push -u origin fix

# 3. Pull Request fix -> dev
gh pr create --base dev --head fix --title "fix: обновить текст формы"
gh pr merge --merge

# 4. Pull Request dev -> main
git checkout dev && git pull origin dev
gh pr create --base main --head dev --title "release: слияние dev в main"
gh pr merge --merge
```

Или запустите автоматический скрипт: `.\scripts\github-setup.ps1`

### Настройка GitHub Pages

Settings → Pages → Build and deployment → **Source: GitHub Actions**

Деплой запускается только при push в `main` после успешного прохождения тестов.

## Проверка падения тестов

При несоответствии текста кнопки и ожиданий в тестах CI завершится с ошибкой:

```bash
# Пример: измените кнопку на «Отправить», не обновив тесты
python -m pytest tests/test_form.py -v
# FAILED test_form_fields_are_visible
```
