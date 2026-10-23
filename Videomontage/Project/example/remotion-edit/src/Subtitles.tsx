import React from "react";
import { useCurrentFrame } from "remotion";
import { CAPTION_BOTTOM, FPS, P, SAFE, sec } from "./config";

export type Caption = {
  /**
   * Начало и конец в секундах. Каждая подпись - 1-2 слова, границы
   * берутся из честной пословной ASR-транскрибации (faster-whisper с
   * word_timestamps, см. skill video-montage), не из оценки по паузам
   * и не из пропорционального деления по числу символов - на реальном
   * материале такая оценка расходится с речью на секунды (см. п.11
   * ГРАБЛИ.md).
   */
  readonly from: number;
  readonly to: number;
  readonly text: string;
};

/**
 * Субтитры. Проявляются группами по 1-2 слова синхронно с речью - не
 * строка целиком, не побуквенная печать. Каждая запись `Caption` уже
 * атомарна: пришло её время - показали её текст целиком, коробка
 * появляется быстрым фейдом.
 *
 * Две вещи, на которых обычно спотыкаются.
 *
 * Первая: плашка почти непрозрачная. Полупрозрачная выглядит красивее в
 * макете, но под тёмным текстом продолжает жить видео, и строка перестаёт
 * читаться ровно там, где в кадре светлое пятно.
 *
 * Вторая: группы слов не должны перескакивать через реальную паузу в
 * речи (тишина ≥0.3с) - иначе на экране одновременно оказываются конец
 * одного предложения и начало следующего. Это делается на этапе сборки
 * данных (skill video-montage, Фаза 2), не здесь.
 */
export const Subtitles: React.FC<{
  readonly captions: readonly Caption[];
  /** Пока идёт хук-заголовок первого экрана (см. ui/Hook.tsx), субтитры
   * молчат - два текстовых блока одновременно перегружают первый экран,
   * а хук уже несёт ту же реплику. Секунды, до которых ничего не рисуем. */
  readonly suppressUntil?: number;
}> = ({ captions, suppressUntil = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < sec(suppressUntil)) {
    return null;
  }
  const now = captions.find((c) => frame >= sec(c.from) && frame < sec(c.to));
  if (!now) {
    return null;
  }

  // Быстрое проявление группы: резкая подмена текста читается как мигание.
  const t = Math.min(1, (frame - sec(now.from)) / (FPS * 0.08));

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: CAPTION_BOTTOM,
        translate: "-50% 0",
        width: SAFE.column,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          padding: "20px 30px 23px",
          borderRadius: P.radius,
          background: P.capBg,
          opacity: t,
          fontFamily: P.fontText,
          fontWeight: P.captionWeight,
          fontSize: P.scale.cap,
          lineHeight: 1.16,
          letterSpacing: "-0.02em",
          color: P.capInk,
          textAlign: "center",
        }}
      >
        {now.text}
      </div>
    </div>
  );
};
