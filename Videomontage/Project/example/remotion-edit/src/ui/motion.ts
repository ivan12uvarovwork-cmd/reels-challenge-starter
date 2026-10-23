import { interpolate } from "remotion";

/**
 * Появление элемента: 0 до старта, 1 после.
 *
 * Отдельная функция нужна, чтобы характер движения задавался пресетом,
 * а не переписывался в каждой сцене.
 */
export const cue = (frame: number, at: number, dur: number) =>
  interpolate(frame, [at, at + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Окно «появился - живёт - ушёл». Возвращает 0, когда элемента нет. */
export const window0 = (
  frame: number,
  from: number,
  to: number,
  inDur: number,
  outDur: number
) => {
  if (frame < from || frame > to) {
    return 0;
  }
  const a = cue(frame, from, inDur);
  const b = 1 - cue(frame, to - outDur, outDur);
  return Math.min(a, b);
};

/**
 * Медленный дрейф на несколько пикселей.
 *
 * Нужен, чтобы статичная графика не выглядела приклеенной картинкой.
 * Амплитуда больше 4 px уже заметна как болтанка.
 */
export const drift = (frame: number, amp: number, periodSec: number, fps = 30) =>
  Math.sin((frame / (fps * periodSec)) * Math.PI * 2) * amp;
