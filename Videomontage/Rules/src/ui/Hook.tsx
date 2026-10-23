import React from "react";
import { useCurrentFrame } from "remotion";
import { CAPTION_BOTTOM, FPS, SAFE, sec } from "../config";
import { cue } from "./motion";

/**
 * Хук-заголовок первого экрана. Два яруса — крупное число/ключевое слово
 * сверху, мельче пояснение под ним. Без чёрной плашки под текст — текст
 * прямо на видео, держится тенью (`text-shadow`), не коробкой.
 *
 * Стоит на месте субтитров (низ кадра, тот же `CAPTION_BOTTOM`, что и
 * `Subtitles.tsx`), не вверху экрана: субтитры на это время всё равно
 * молчат (`suppressUntil`), а взгляд зрителя в шортсах привычно смотрит
 * вниз, не вверх. Пока хук на экране, Subtitles должны молчать - два
 * одновременных текстовых блока перегружают один и тот же угол экрана,
 * а хук уже несёт ту же информацию.
 *
 * Шрифт — НЕ обязательно тот же, что у субтитров (единственное осознанное
 * исключение из правила «один шрифт на стиль», см. РАСКЛАДКИ.md): для
 * заголовка можно взять Montserrat или Days One, оба добавлены в
 * fonts.tsx и должны быть проверены рендером на кириллицу, а не только по
 * cmap (см. ГРАБЛИ.md п.8).
 */
export type HookFont = "Unbounded" | "Montserrat" | "Days One";

export type HookProps = {
  /** Крупный ярус - число или ключевое слово, 1-3 слова максимум. */
  readonly big: string;
  /** Текст помельче под крупным ярусом - остаток мысли. */
  readonly small: string;
  readonly from?: number;
  readonly to?: number;
  readonly font?: HookFont;
};

const IN_DUR = FPS * 0.35;
const OUT_DUR = FPS * 0.25;

const SHADOW = "0 2px 20px rgba(0,0,0,0.85), 0 1px 4px rgba(0,0,0,0.9)";

export const HookTitle: React.FC<HookProps> = ({ big, small, from = 0, to = 4, font = "Montserrat" }) => {
  const frame = useCurrentFrame();
  const f0 = sec(from);
  const f1 = sec(to);
  if (frame < f0 || frame > f1) {
    return null;
  }
  const inT = cue(frame, f0, IN_DUR);
  const outT = 1 - cue(frame, f1 - OUT_DUR, OUT_DUR);
  const t = Math.min(inT, outT);
  if (t <= 0) {
    return null;
  }
  const fontFamily = `'${font}', system-ui, Arial, sans-serif`;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: CAPTION_BOTTOM,
        translate: "-50% 0",
        width: SAFE.column,
        textAlign: "center",
        opacity: t,
        transform: `translateY(${(1 - t) * 20}px)`,
      }}
    >
      <div
        style={{
          fontFamily,
          fontWeight: 800,
          fontSize: 108,
          lineHeight: 0.98,
          letterSpacing: "-0.02em",
          color: "#FFFFFF",
          textShadow: SHADOW,
        }}
      >
        {big}
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily,
          fontWeight: 700,
          fontSize: 40,
          lineHeight: 1.18,
          color: "#FFFFFF",
          textShadow: SHADOW,
        }}
      >
        {small}
      </div>
    </div>
  );
};
