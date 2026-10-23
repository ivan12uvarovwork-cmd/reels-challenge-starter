import React from "react";
import { AbsoluteFill } from "remotion";
import { CAPTION_BOTTOM, H, SAFE, STAGE, W } from "../config";

/**
 * Проявочная сетка безопасных зон.
 *
 * Включается на время работы, выключается перед финальным рендером.
 * Смысл: коллизию видно глазами, а не вычисляется в голове. Красное -
 * то, что зритель не увидит, зелёное - рабочая полоса графики.
 */
export const SafeZones: React.FC<{ readonly show: boolean }> = ({ show }) => {
  if (!show) {
    return null;
  }

  const band = (top: number, height: number, color: string, label: string) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: W,
        height,
        background: color,
        borderTop: "2px dashed rgba(0,0,0,0.35)",
        borderBottom: "2px dashed rgba(0,0,0,0.35)",
        color: "rgba(0,0,0,0.75)",
        fontFamily: "monospace",
        fontSize: 22,
        padding: 8,
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {band(0, SAFE.top, "rgba(255,0,0,0.16)", `верх ${SAFE.top}`)}
      {band(H - SAFE.bottom, SAFE.bottom, "rgba(255,0,0,0.16)", `низ ${SAFE.bottom}`)}
      {band(STAGE.top, STAGE.bottom - STAGE.top, "rgba(0,180,0,0.10)", "полоса графики")}
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: CAPTION_BOTTOM,
          width: W,
          height: 3,
          background: "rgba(0,0,255,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: (W - SAFE.column) / 2,
          top: 0,
          width: SAFE.column,
          height: H,
          border: "2px dashed rgba(0,0,255,0.30)",
        }}
      />
    </AbsoluteFill>
  );
};
