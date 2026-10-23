# Установка

Всё, что нужно поставить один раз на машину, прежде чем монтировать первый ролик.
Все команды ниже выполняются из папки `Videomontage/`.

## Для агента: ставь без пароля

Агент в редакторе не может ввести пароль администратора, поэтому не используй
`sudo` и не ставь Homebrew, если его ещё нет:

- Node 22 — через nvm (ставится в домашнюю папку пользователя);
- ffmpeg/ffprobe — если `brew` уже есть, через него, иначе статическая сборка
  в `~/.local/bin` (macOS) или `winget install Gyan.FFmpeg` (Windows);
- faster-whisper — `pip3 install --user faster-whisper`.

Если какой-то шаг всё же требует пароль или окно подтверждения, остановись и
скажи пользователю, что именно нажать.

## 1. Node.js 22 (не 24)

Remotion-сборщик на Node 24 падает на подсчёте хэшей внутри webpack — ошибка
нечитаемая, без слова «Node» в тексте (см. `Rules/ГРАБЛИ.md`, п.1). Ставь
именно 22 через [nvm](https://github.com/nvm-sh/nvm) или официальный
установщик:

```bash
nvm install 22
nvm use 22
node -v   # должно быть v22.x
```

## 2. ffmpeg и ffprobe

Нужны отдельно от Remotion — Remotion везёт свою урезанную сборку ffmpeg без
части фильтров (см. `Rules/ГРАБЛИ.md`, п.3), тяжёлую обработку (цвет,
скорость, HDR-тонмаппинг, вырезка превью-кадров) делай полным ffmpeg до
сборки композиции.

```bash
brew install ffmpeg   # macOS
# или apt install ffmpeg / choco install ffmpeg
ffmpeg -version
```

## 3. faster-whisper — честная пословная транскрибация

Работает локально на CPU, GPU не нужен. Ставится один раз:

```bash
pip3 install faster-whisper
```

На 40-секундном ролике модель `small` отрабатывает около минуты. Используется
на Фазе 1 skill'а `video-montage` — без него субтитры и якоря b-roll
придётся ставить на глаз, а расхождение с реальной речью тогда доходит до
пары секунд (`Rules/ГРАБЛИ.md`, п.11).

## 4. Путь без кириллицы (важно на Windows)

ffmpeg на Windows спотыкается о кириллицу в пути к файлам — ошибка выглядит
как «файла нет», хотя файл на месте (`Rules/ГРАБЛИ.md`, п.2). Держи
исходники и проект в папке с латинским именем: `D:\reels\work`, а не
`D:\Мои видео\Рилсы`.

## 5. Сам Remotion-проект

`Rules/` — это не проект, а источник кода/правил: своего `package.json` в
ней нет. Проект создаётся отдельно и получает копию `src/`/`public/` из
`Rules/`.

Самый быстрый способ увидеть, что всё работает — запустить готовый пример:

```bash
cd Project/example/remotion-edit
npm install
npm run still   # рендерит один кадр в out/check.png
```

Если в `out/check.png` виден белый текст на чёрном фоне ("Субтитры идут
парами...") — установка прошла, шрифт и субтитры реально работают.

Для нового собственного проекта:

```bash
mkdir -p "Project/<название>/remotion-edit"
cp -R Rules/src "Project/<название>/remotion-edit/"
cp -R Rules/public "Project/<название>/remotion-edit/"
cp Project/example/remotion-edit/package.json "Project/<название>/remotion-edit/"
cp Project/example/remotion-edit/tsconfig.json "Project/<название>/remotion-edit/"
cp Project/example/remotion-edit/remotion.config.ts "Project/<название>/remotion-edit/"
cd "Project/<название>/remotion-edit"
npm install
npm run dev      # remotion studio — предпросмотр
```

## 6. Дальше

- Структура папок и что куда класть — [`AGENTS.md`](AGENTS.md).
- Сам процесс монтажа (фазы, СТОПы, спецификация кадра) —
  [`Rules/skills/video-montage/SKILL.md`](Rules/skills/video-montage/SKILL.md).
- Раскладки b-roll, хук, субтитры, шрифт — [`Rules/РАСКЛАДКИ.md`](Rules/РАСКЛАДКИ.md).
- Типовые проблемы без понятной ошибки — [`Rules/ГРАБЛИ.md`](Rules/ГРАБЛИ.md).
