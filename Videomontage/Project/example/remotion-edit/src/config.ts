import { STYLE } from "./style";

/** Единственный стиль - см. style.ts. Смени значения там под свой бренд. */
export const P = STYLE;

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Секунды в кадры. Все тайминги в проекте задаются в секундах. */
export const sec = (s: number) => Math.round(s * FPS);

/**
 * Безопасные зоны вертикали 1080x1920.
 *
 * Сверху интерфейс приложения (Reels/TikTok/Shorts), снизу подпись,
 * аватар и кнопки. Всё важное живёт между ними. Это не рекомендация:
 * то, что попало в эти полосы, зритель физически не увидит за UI платформы.
 */
export const SAFE = {
  top: 210,
  bottom: 470,
  /** Ширина текстовой колонки. Шире - строки становятся нечитаемыми. */
  column: 760,
} as const;

/** Полоса, в которой живёт b-roll: под верхней зоной, над субтитрами. */
export const STAGE = {
  top: SAFE.top + 120,
  bottom: H - SAFE.bottom - 190,
} as const;

/** Строка субтитров стоит над нижней безопасной зоной. */
export const CAPTION_BOTTOM = SAFE.bottom + 40;
