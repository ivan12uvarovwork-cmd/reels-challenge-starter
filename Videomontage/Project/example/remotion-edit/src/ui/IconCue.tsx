import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CAPTION_BOTTOM, FPS, P, sec } from "../config";
import { window0 } from "./motion";

/**
 * Значок-акцент под конкретное слово в речи (не логотип продукта, не
 * файл-картинка) - "сохрани", "лайк", "поделись" и подобные CTA-моменты.
 * Инлайн SVG, не PNG: остаётся строго чёрно-белым без нового ассета в
 * проекте. Появляется с лёгким отскоком (scale 0.6→1.15→1.0), не просто
 * фейдом - для короткого акцентного значка отскок читается заметнее на
 * фоне общего сдержанного стиля переходов (см. РАСКЛАДКИ.md).
 *
 * Набор иконок пополняется по мере надобности - не плодить одноразовые
 * SVG в проектах, добавлять сюда.
 *
 * Позиция - прямо над субтитрами (`CAPTION_BOTTOM`): значок логически при
 * том же слове, что и подпись под ним, глазу естественнее держать их
 * рядом, а не разносить по экрану. Хук на это же место не претендует -
 * его окно приходится на самое начало ролика и обычно не пересекается по
 * времени с окнами CTA-значков дальше по таймлайну.
 */
const ICON_PATHS: Record<string, string> = {
  // Материальная "bookmark" - общепринятая форма значка "сохранить",
  // не логотип конкретного продукта.
  bookmark: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z",
};

export type IconCueName = keyof typeof ICON_PATHS;

export type IconCueSegment = {
  readonly from: number;
  readonly to: number;
  readonly icon: IconCueName;
};

const BOUNCE_FRAMES = FPS * 0.3;

const Cue: React.FC<{ readonly seg: IconCueSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const f0 = sec(seg.from);
  const f1 = sec(seg.to);
  const opacity = window0(frame, f0, f1, FPS * 0.15, FPS * 0.2);
  if (opacity <= 0) {
    return null;
  }
  const localFrame = frame - f0;
  // Отскок только на входе - дальше держит масштаб 1, не пружинит всё время.
  const scale = interpolate(localFrame, [0, BOUNCE_FRAMES * 0.55, BOUNCE_FRAMES], [0.6, 1.15, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const path = ICON_PATHS[seg.icon];

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: CAPTION_BOTTOM + 120,
        translate: "-50% 0",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 32,
          background: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        }}
      >
        <svg width={64} height={64} viewBox="0 0 24 24" fill={P.bg}>
          <path d={path} />
        </svg>
      </div>
    </div>
  );
};

export const IconCueStage: React.FC<{ readonly segments: readonly IconCueSegment[] }> = ({ segments }) => (
  <>
    {segments.map((seg) => (
      <Cue key={`icon-${seg.from}`} seg={seg} />
    ))}
  </>
);
