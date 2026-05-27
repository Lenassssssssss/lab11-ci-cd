# Скрипт публикации проекта на GitHub и выполнения сценария PR
# Перед запуском выполните: gh auth login

$ErrorActionPreference = "Stop"
$gh = "C:\Program Files\GitHub CLI\gh.exe"

Write-Host "=== Lab11: GitHub CI/CD Setup ===" -ForegroundColor Cyan

# Проверка авторизации
& $gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Сначала выполните: gh auth login" -ForegroundColor Red
    exit 1
}

# Имя репозитория (можно изменить)
$repoName = Read-Host "Введите имя репозитория (например, lab11-ci-cd)"
if (-not $repoName) { $repoName = "lab11-ci-cd" }

# Создание репозитория на GitHub
Write-Host "`nСоздание репозитория $repoName..." -ForegroundColor Yellow
& $gh repo create $repoName --public --source=. --remote=origin --push=false

# Отправка всех веток
Write-Host "`nОтправка веток main, dev, fix..." -ForegroundColor Yellow
git push -u origin main
git push -u origin dev
git push -u origin fix

Write-Host "`n=== Шаг 1: Pull Request fix -> dev ===" -ForegroundColor Cyan
$pr1 = & $gh pr create --base dev --head fix --title "fix: обновить текст формы" --body "Изменены заголовок и текст кнопки формы регистрации."
Write-Host $pr1

Write-Host "`nОжидание прохождения CI..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
& $gh pr checks --watch
& $gh pr merge --merge --delete-branch=false

Write-Host "`n=== Шаг 2: Pull Request dev -> main ===" -ForegroundColor Cyan
git checkout dev
git pull origin dev
$pr2 = & $gh pr create --base main --head dev --title "release: слияние dev в main" --body "Финальная проверка и деплой на GitHub Pages."
Write-Host $pr2

Write-Host "`nОжидание прохождения CI и деплоя..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
& $gh pr checks --watch
& $gh pr merge --merge

Write-Host "`n=== Настройка GitHub Pages ===" -ForegroundColor Cyan
Write-Host @"
В GitHub откройте Settings -> Pages -> Build and deployment:
  Source: GitHub Actions

После merge в main сайт будет доступен по адресу:
  https://<ваш-username>/$repoName/
"@ -ForegroundColor Green

Write-Host "`nГотово!" -ForegroundColor Green
