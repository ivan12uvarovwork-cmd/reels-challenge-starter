# Установка

Всё, что нужно поставить один раз на машину, прежде чем монтировать первый ролик.
Все команды ниже выполняются из папки `Videomontage/`.

## Что ставим

| Что | Зачем | macOS | Windows |
|---|---|---|---|
| Node.js 22 (не 24) | на нём работает Remotion | nvm | nvm-windows или официальный установщик 22 LTS с nodejs.org |
| ffmpeg и ffprobe | нарезка, цвет, скорость, превью-кадры | `brew install ffmpeg`, если brew уже есть; иначе статическая сборка в `~/.local/bin` | `winget install Gyan.FFmpeg` |
| Python 3 | нужен для faster-whisper | уже есть или ставится вместе с Command Line Tools (`xcode-select --install`) | `winget install Python.Python.3.12` |
| faster-whisper | пословная расшифровка речи для субтитров | `pip3 install --user faster-whisper` | `pip install --user faster-whisper` |
| Remotion | сам монтаж: сборка и рендер роликов | `npm install` в папке проекта | `npm install` в папке проекта |

Remotion отдельно и глобально не ставится: это зависимость проекта, её версия
записана в `package.json`. Команда `npm install` в папке проекта ставит Remotion
и всё, что ему нужно (п.5).

## Для агента: ставь без пароля

Агент в редакторе не может ввести пароль администратора, поэтому не используй
`sudo`, `choco` и не ставь Homebrew, если его ещё нет. Иди по таблице выше:
всё в ней ставится в папку пользователя.

Порядок: Node 22 → ffmpeg → Python и faster-whisper → Remotion-пример (п.5).
После каждого шага проверь версию командой из чек-листа ниже. Если новая
программа не находится сразу после установки, открой новый терминал: на
Windows `PATH` обновляется только в новом окне.

Если какой-то шаг всё же требует пароль или окно подтверждения (например,
установка Command Line Tools на Mac), остановись и скажи пользователю, что
именно нажать.

## Чек-лист: всё стоит

```bash
node -v                                   # v22.x
ffmpeg -version                           # первая строка: ffmpeg version ...
ffprobe -version
python3 -c "import faster_whisper; print('ok')"   # на Windows: python -c ...
cd Project/example/remotion-edit && npm install && npm run still
```

Последняя команда ставит Remotion и рендерит кадр в
`Project/example/remotion-edit/out/check.png`. Белый субтитр «с речью.» на
чёрном фоне значит, что всё работает.

## 1. Node.js 22 (не 24)

Remotion-сборщик на Node 24 падает на подсчёте хэшей внутри webpack: ошибка
нечитаемая, без слова «Node» в тексте (см. `Rules/ГРАБЛИ.md`, п.1).

macOS, через [nvm](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
# открыть новый терминал
nvm install 22
nvm use 22
node -v   # должно быть v22.x
```

Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows)
(`nvm install 22`, `nvm use 22`) или установщик Node 22 LTS с nodejs.org.

## 2. ffmpeg и ffprobe

Нужны отдельно от Remotion: Remotion везёт свою урезанную сборку ffmpeg без
части фильтров (см. `Rules/ГРАБЛИ.md`, п.3), тяжёлую обработку (цвет,
скорость, HDR-тонмаппинг, вырезка превью-кадров) делай полным ffmpeg до
сборки композиции.

macOS без brew: скачать статические `ffmpeg` и `ffprobe` (например, с
evermeet.cx), положить в `~/.local/bin`, сделать исполняемыми
(`chmod +x`) и добавить `~/.local/bin` в `PATH` в `~/.zshrc`.

```bash
ffmpeg -version
ffprobe -version
```

## 3. faster-whisper: честная пословная транскрибация

Работает локально на CPU, GPU не нужен. Нужен Python 3 (см. таблицу).

```bash
pip3 install --user faster-whisper
```

На 40-секундном ролике модель `small` отрабатывает около минуты, при первом
запуске она скачивается (около 500 МБ). Используется на Фазе 1 skill'а
`video-montage`: без него субтитры и якоря b-roll придётся ставить на глаз,
а расхождение с реальной речью тогда доходит до пары секунд
(`Rules/ГРАБЛИ.md`, п.11).

## 4. Путь без кириллицы (важно на Windows)

ffmpeg на Windows спотыкается о кириллицу в пути к файлам: ошибка выглядит
как «файла нет», хотя файл на месте (`Rules/ГРАБЛИ.md`, п.2). Держи
исходники и проект в папке с латинским именем: `C:\reels`, а не
`D:\Мои видео\Рилсы`.

## 5. Remotion

`Rules/` это не проект, а источник кода и правил: своего `package.json` в
ней нет. Проект создаётся отдельно и получает копию `src/` и `public/` из
`Rules/`. Remotion ставится в каждый проект командой `npm install`.

Самый быстрый способ поставить Remotion и проверить, что всё работает:

```bash
cd Project/example/remotion-edit
npm install     # ставит Remotion и зависимости в node_modules/
npm run still   # рендерит один кадр в out/check.png
```

Если в `out/check.png` внизу экрана белый субтитр на чёрном фоне (на этом
кадре: «с речью.»), установка прошла, шрифт и субтитры реально работают.

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
npm run dev      # remotion studio, предпросмотр
```

## 6. Дальше

- Структура папок и что куда класть: [`AGENTS.md`](AGENTS.md).
- Сам процесс монтажа (фазы, СТОПы, спецификация кадра):
  [`Rules/skills/video-montage/SKILL.md`](Rules/skills/video-montage/SKILL.md).
- Раскладки b-roll, хук, субтитры, шрифт: [`Rules/РАСКЛАДКИ.md`](Rules/РАСКЛАДКИ.md).
- Типовые проблемы без понятной ошибки: [`Rules/ГРАБЛИ.md`](Rules/ГРАБЛИ.md).
