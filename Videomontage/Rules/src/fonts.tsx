import React from "react";
import { staticFile } from "remotion";

/**
 * Три шрифта: Unbounded (основной, вес 700), Montserrat и Days One
 * (опционально для хука, см. ui/Hook.tsx). Все три - официальные Google
 * Fonts с подтверждённой рендером кириллицей (см. ГРАБЛИ.md п.8: cmap
 * может врать, единственная надёжная проверка - отрендерить строку и
 * посмотреть на неё).
 *
 * font-display: block, а не swap. При swap первые кадры рендерятся
 * системным шрифтом, и в видео это остаётся навсегда: подмены никто не
 * увидит на экране разработчика, потому что рендер идёт быстрее загрузки
 * шрифта, а на выходном файле шрифт уже будет не тот.
 */
const f = (p: string) => staticFile(p);

export const FONT_CSS = `
@font-face{font-family:'Unbounded';font-style:normal;font-weight:700;font-display:block;src:url(${f("fonts/unbounded-700-cyrillic.woff2")}) format('woff2');unicode-range:U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;}
@font-face{font-family:'Unbounded';font-style:normal;font-weight:700;font-display:block;src:url(${f("fonts/unbounded-700-latin.woff2")}) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
@font-face{font-family:'Montserrat';font-style:normal;font-weight:800;font-display:block;src:url(${f("fonts/montserrat-800-cyrillic.woff2")}) format('woff2');unicode-range:U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;}
@font-face{font-family:'Montserrat';font-style:normal;font-weight:800;font-display:block;src:url(${f("fonts/montserrat-800-latin.woff2")}) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
@font-face{font-family:'Days One';font-style:normal;font-weight:400;font-display:block;src:url(${f("fonts/days-one-400-cyrillic.woff2")}) format('woff2');unicode-range:U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;}
@font-face{font-family:'Days One';font-style:normal;font-weight:400;font-display:block;src:url(${f("fonts/days-one-400-latin.woff2")}) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
`;

export const Fonts: React.FC = () => (
  <style dangerouslySetInnerHTML={{ __html: FONT_CSS }} />
);
