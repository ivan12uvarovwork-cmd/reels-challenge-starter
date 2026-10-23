import React from "react";
import { Composition } from "remotion";
import { Example } from "./Example";
import { FPS, H, W } from "./config";

/**
 * Это стартер-кит, не рабочий проект - здесь только Example для проверки
 * стиля. В реальном проекте своя композиция строится из OffthreadVideo
 * (твой исходник с говорящей головой) + Subtitles + BRollStage, см.
 * `РАСКЛАДКИ.md` и `skills/video-montage/SKILL.md`.
 */
export const RemotionRoot: React.FC = () => (
  <Composition id="Example" component={Example} durationInFrames={FPS * 5} fps={FPS} width={W} height={H} />
);
