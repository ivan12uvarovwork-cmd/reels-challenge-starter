import { interpolate, useCurrentFrame } from "remotion";
import { sec } from "../config";

/**
 * Лёгкий Ken Burns на растянутых кадрах чистого аватара (без b-roll).
 * Статичный говорящий на весь экран дольше пары секунд без движения
 * кадра читается как зависание, не как монтажная пауза - используй
 * здесь, а не оставляй масштаб 1 на весь такой отрезок.
 */
export type ZoomSegment = {
  readonly from: number;
  readonly to: number;
  readonly direction: "in" | "out";
};

/**
 * Насколько меняется масштаб за сегмент. Больше - заметная тряска.
 * Эффект нормирован на длительность сегмента (interpolate по всему
 * from-to), не на абсолютное время - на коротком отрезке зум и так
 * быстрее, чем на длинном при том же ZOOM_AMOUNT.
 */
const ZOOM_AMOUNT = 0.18;

export const useAvatarZoom = (zooms: readonly ZoomSegment[]): number => {
  const frame = useCurrentFrame();
  for (const z of zooms) {
    const f0 = sec(z.from);
    const f1 = sec(z.to);
    if (frame >= f0 && frame < f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return z.direction === "in" ? 1 + ZOOM_AMOUNT * t : 1 + ZOOM_AMOUNT * (1 - t);
    }
  }
  return 1;
};

/**
 * Пунч-ин на акцентный кадр внутри b-roll (скриншот, скринкаст) - не на
 * лицо. В отличие от useAvatarZoom якорь не центр контейнера, а конкретная
 * точка внутри вставки (растущая цифра, кнопка, выделенная строка
 * интерфейса), поэтому нужен свой focus, а не общий центр.
 *
 * Планируется на Фазе 3 skill'а video-montage только там, где в b-roll
 * реально есть на что смотреть крупнее - не на каждую вставку подряд, и не
 * взамен, а в дополнение к обрезке (trimStartSec/trimEndSec на
 * BRollMedia), которая выбирает нужный момент по времени.
 */
export type BRollZoom = {
  readonly from: number;
  readonly to: number;
  readonly direction: "in" | "out";
  /**
   * Точка схождения зума как CSS transform-origin ("62% 28%"). Дефолт -
   * центр кадра. Для акцента на конкретном элементе координаты снимаются
   * с реального превью-кадра вставки (не на глаз) - см. Фазу 3 skill'а
   * video-montage, раздел «Монтаж внутри b-roll».
   */
  readonly focus?: string;
};

/**
 * Меньше, чем ZOOM_AMOUNT у аватара (0.18) - вставка на весь STAGE и без
 * того крупнее лица в кадре, более резкий зум там же сильнее заметен и
 * рискует вынести акцентный элемент за пределы контейнера при focus не по
 * центру.
 */
const BROLL_ZOOM_AMOUNT = 0.14;

export const useBRollZoom = (zooms: readonly BRollZoom[]): { readonly scale: number; readonly origin: string } => {
  const frame = useCurrentFrame();
  for (const z of zooms) {
    const f0 = sec(z.from);
    const f1 = sec(z.to);
    if (frame >= f0 && frame < f1) {
      const t = interpolate(frame, [f0, f1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      const scale = z.direction === "in" ? 1 + BROLL_ZOOM_AMOUNT * t : 1 + BROLL_ZOOM_AMOUNT * (1 - t);
      return { scale, origin: z.focus ?? "50% 50%" };
    }
  }
  return { scale: 1, origin: "50% 50%" };
};
