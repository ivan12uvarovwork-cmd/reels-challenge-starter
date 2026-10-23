import React from "react";
import { AbsoluteFill } from "remotion";
import { Fonts } from "./fonts";
import { P } from "./config";
import { Subtitles, type Caption } from "./Subtitles";
import { SafeZones } from "./ui/SafeZones";

/**
 * Проверочная карточка стиля - без внешних медиа, чтобы её можно было
 * отрендерить `npx remotion still Example out/check.png --frame=90` сразу
 * после установки и увидеть, что шрифт и субтитры реально работают, а не
 * просто скомпилировались. Не тащи её в реальный проект как есть -
 * настоящая композиция строит фон из OffthreadVideo и BRollStage (см.
 * `РАСКЛАДКИ.md`), это только проверка кириллицы и смены групп слов.
 */
const CAPTIONS: readonly Caption[] = [
  { from: 0.2, to: 1.0, text: "Субтитры" },
  { from: 1.0, to: 1.8, text: "идут парами" },
  { from: 1.8, to: 2.6, text: "слов, синхронно" },
  { from: 2.6, to: 3.4, text: "с речью." },
  { from: 3.4, to: 4.6, text: "Unbounded, чёрный фон." },
];

export const Example: React.FC = () => (
  <AbsoluteFill style={{ background: P.bg }}>
    <Fonts />
    <Subtitles captions={CAPTIONS} />
    <SafeZones show={false} />
  </AbsoluteFill>
);
