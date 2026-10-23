import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { FPS, H, P, SAFE, W, sec } from "../config";
import { cue, window0 } from "./motion";
import { useBRollZoom, type BRollZoom } from "./zoom";

/**
 * Три раскладки b-roll (см. РАСКЛАДКИ.md).
 *
 * Это не про фото и не про цвет - это про то, где на экране в данный
 * момент говорящая голова, а где вставка. Три состояния переключаются по
 * ходу ролика через BRollStage, и переключение всегда анимированное -
 * жёсткий рез между раскладками запрещён правилами стиля.
 */

export type BRollMedia = {
  readonly kind: "image" | "video";
  readonly src: string;
  /**
   * Обрезка исходника (только "video") - какой момент внутри файла
   * показывать, не обязательно с начала. В секундах от начала файла, не
   * от начала сегмента в композиции. Подбирается на Фазе 3 skill'а
   * video-montage по реально просмотренным превью-кадрам исходника
   * (`ffmpeg -ss <t> -i src -frames:v 1`), не наугад по имени файла.
   */
  readonly trimStartSec?: number;
  /** Секунда внутри файла, на которой обрезка заканчивается. Без неё - до
   * конца файла (или пока не истечёт `to` сегмента). */
  readonly trimEndSec?: number;
  /**
   * Скорость воспроизведения (только "video"), 1 - без изменений.
   * `0.5-0.7` - замедление для акцентного момента (клик, реакция,
   * результат), которому нужен вес; `1.4-1.8` - ускорение для проходного
   * действия (долгий скролл, набор текста), чтобы не провисало экранное
   * время. Звук вставки всегда muted, менять питч не о чем. Каждое
   * изменение скорости отмечай в плане Фазы 3 явно, не подставляй молча.
   */
  readonly speed?: number;
  /**
   * Пунш-ин на акцентный кадр внутри самой вставки (см. useBRollZoom).
   * Не для каждой вставки - только там, где внутри реально есть
   * конкретный фокусный элемент (цифра, кнопка, строка интерфейса).
   */
  readonly zoom?: readonly BRollZoom[];
};

/**
 * "cover" ломает landscape-скриншоты (сайты, десктопный интерфейс) в
 * портретном кадре - при aspect ratio ~16:9 в контейнере 9:16 видна
 * только вертикальная полоска по центру, всё остальное содержимое
 * обрезано и нечитаемо (проверяй рендером кадра, не на глаз - см. п.9 в
 * ГРАБЛИ.md). "contain" вместо этого показывает скриншот целиком с
 * чёрными полями - менее эффектно, зато читаемо. Используй "cover"
 * только там, где контейнер сам не портретный (сплит-экран, кружок) или
 * источник - видео, снятое под вертикаль.
 *
 * objectPosition по умолчанию "50% 50%" (центр) — для говорящей головы в
 * маленьком контейнере (сплит, кружок) это отрезает лоб/волосы вплотную к
 * бровям: контейнер кроет только часть кадра по высоте, а лицо в
 * исходнике обычно сидит в верхней трети, не по центру. Раскладки, где в
 * контейнере говорящая голова (Split/Pip), передают свой objectPosition
 * со сдвигом вверх - не меняй дефолт здесь молча, он верен для b-roll
 * (лого/скриншоты), не для лица.
 *
 * zoom из BRollMedia растягивает изображение/видео вокруг своего focus
 * (transformOrigin), не сдвигая и не искажая контейнер раскладки -
 * overflow:hidden у Split/Full/Pip уже скрывает вылезающие за карточку
 * края сами по себе, отдельного клипа здесь не нужно.
 */
const Media: React.FC<{
  readonly media: BRollMedia;
  readonly muted?: boolean;
  readonly fit?: "cover" | "contain";
  readonly objectPosition?: string;
}> = ({ media, muted = true, fit = "cover", objectPosition = "50% 50%" }) => {
  const { scale, origin } = useBRollZoom(media.zoom ?? []);
  const zoomStyle: React.CSSProperties =
    scale !== 1 ? { transform: `scale(${scale})`, transformOrigin: origin } : {};
  return media.kind === "video" ? (
    <OffthreadVideo
      src={staticFile(media.src)}
      style={{ width: "100%", height: "100%", objectFit: fit, objectPosition, display: "block", ...zoomStyle }}
      muted={muted}
      trimBefore={media.trimStartSec !== undefined ? sec(media.trimStartSec) : undefined}
      trimAfter={media.trimEndSec !== undefined ? sec(media.trimEndSec) : undefined}
      playbackRate={media.speed}
    />
  ) : (
    <Img
      src={staticFile(media.src)}
      style={{ width: "100%", height: "100%", objectFit: fit, objectPosition, display: "block", ...zoomStyle }}
    />
  );
};

/** Сдвиг вверх для говорящей головы в маленьком контейнере — оставляет
 * лоб/волосы в кадре, обрезка уходит в грудь/стол вместо лица. Подобрано
 * под типовой ростовой план (лицо в верхней трети кадра), проверь
 * рендером кадра на своём конкретном исходнике, не считай универсальной
 * константой для любой съёмки. */
const AVATAR_POSITION = "50% 18%";

/**
 * 1. Сплит-экран. Сверху b-roll, снизу аватар - оба в кадре одновременно.
 * Аудио берётся из аватара (b-roll всегда muted), чтобы не было двух
 * дорожек сразу.
 *
 * Верхняя карточка со скруглёнными НИЖНИМИ углами (не прямая линия
 * раздела) - под ней всегда играет базовый полноэкранный аватар-видео
 * (композиция рендерит его фоном под BRollStage), поэтому в скруглении
 * естественно проглядывает фон аватара, а не пустота. Так и задумано -
 * не убирай базовый слой видео из композиции, иначе в углах будет чёрное.
 *
 * splitRatio — доля высоты кадра под b-roll (верхняя карточка), 0-1,
 * дефолт 0.5. Не всегда нужно ровно пополам: высокий портретный скрин
 * читается лучше с большей долей (0.6-0.65), маленькая иконка/лого -
 * наоборот, можно сузить (0.35-0.4), оставив больше места говорящему.
 * Планируется на Фазе 3 skill'а video-montage по факту конкретного файла
 * (реальные пропорции — ffprobe/Read, не на глаз), не жёстко 50/50.
 */
export const SplitBRoll: React.FC<{
  readonly broll: BRollMedia;
  readonly avatar: BRollMedia;
  readonly splitRatio?: number;
}> = ({ broll, avatar, splitRatio = 0.5 }) => {
  const topH = H * splitRatio;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: W,
          height: topH,
          overflow: "hidden",
          borderRadius: "0 0 32px 32px",
        }}
      >
        <Media media={broll} muted />
      </div>
      <div style={{ position: "absolute", top: topH, left: 0, width: W, height: H - topH, overflow: "hidden" }}>
        <Media media={avatar} muted={false} objectPosition={AVATAR_POSITION} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * 2. Полный экран. Аватар пропадает из кадра совсем - остаётся только
 * b-roll и субтитр внизу. Самая сильная раскладка из трёх: используй её
 * там, где зритель должен смотреть только на вставку, а не на говорящего.
 *
 * Подложка под "полный экран" со скриншотом/скринкастом: чёрный фон +
 * белая сетка + лёгкий синий градиент снизу. Видна только там, где
 * "contain" оставляет чёрные поля вокруг вставки (landscape-скрин в
 * портретном кадре) - если вставка сама вертикальная и идёт "cover" на
 * весь кадр, подложка перекрыта целиком и не имеет значения. Сетка -
 * едва заметная (низкая непрозрачность), это фон для контента, не
 * отдельный элемент дизайна, которому нужно внимание зрителя.
 *
 * ⚠️ Это CSS-свойства ОДНОГО элемента (background/backgroundImage), не
 * отдельный компонент-сиблинг перед `<Img>`. Два непрозрачных полноэкранных
 * слоя подряд, второй из которых - асинхронно загружаемая картинка, дают
 * баг компоновки в Chrome headless: `<Img>` не отрисовывается вообще
 * (пустой кадр вместо картинки, хотя файл существует и путь верный - см.
 * ГРАБЛИ.md п.14). Не разноси подложку на отдельный `<AbsoluteFill>` без
 * повторной проверки реальным рендером.
 *
 * Вставка не на всю ширину - слева и справа отступ, скруглённые углы
 * (карточка на подложке, не край-в-край). Синий градиент снизу - не
 * статика, а медленная волна по непрозрачности свечения, вычисляется по
 * кадру и подставляется в тот же background-image ЭТОГО же элемента - не
 * отдельным слоем поверх (см. предупреждение о баге с двумя сиблингами
 * выше).
 */
const IMAGE_INSET = 56;
const IMAGE_RADIUS = 28;

/**
 * fit по умолчанию "contain" (см. предупреждение выше) - для landscape-
 * скриншотов. Если вставка сама вертикальная (портретное видео/скрин
 * мобильного приложения, пропорции близки к 9:16) - передай fit="cover",
 * тогда она займёт весь кадр без чёрных полей. Определяется на Фазе 3
 * skill'а video-montage по реальным пропорциям файла (ffprobe/Read), не
 * угадывается автоматически здесь.
 */
export const FullBleedBRoll: React.FC<{
  readonly broll: BRollMedia;
  readonly avatarAudio?: BRollMedia;
  readonly fit?: "cover" | "contain";
}> = ({ broll, avatarAudio, fit = "contain" }) => {
  const frame = useCurrentFrame();
  // Период 2.2с, амплитуда по непрозрачности (не только позиции стопа -
  // смещение стопа в пару процентных пунктов на глаз почти не читается).
  // Прозрачность 0.20-0.55 - куда более заметный "вдох-выдох" синего
  // свечения, и за 2.2с укладывается даже в короткий 2-3-секундный сегмент.
  const wavePhase = Math.sin((frame / (FPS * 2.2)) * Math.PI * 2); // -1..1
  const glowOpacity = 0.375 + wavePhase * 0.175; // 0.20-0.55
  const gradientStop = 40 + wavePhase * 6; // 34%-46%, второй слой движения
  const backingStyle: React.CSSProperties = {
    background: "#000000",
    backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(0deg, rgba(30,64,175,${glowOpacity}) 0%, rgba(30,64,175,0) ${gradientStop}%)`,
    backgroundSize: "54px 54px, 54px 54px, 100% 100%",
  };
  return (
    <AbsoluteFill style={backingStyle}>
      <div
        style={{
          position: "absolute",
          left: IMAGE_INSET,
          right: IMAGE_INSET,
          top: 0,
          bottom: 0,
          borderRadius: IMAGE_RADIUS,
          overflow: "hidden",
        }}
      >
        <Media media={broll} muted fit={fit} />
      </div>
      {/* Аватар не в кадре, но озвучка продолжается - отдельный невидимый
          аудио-элемент, а не переключение звука на b-roll. */}
      {avatarAudio ? (
        <div style={{ display: "none" }}>
          <Media media={avatarAudio} muted={false} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/**
 * 3. Кружок. Аватар уходит в маленький круглый PIP слева, b-roll занимает
 * всё остальное пространство фоном.
 */
export const PipBRoll: React.FC<{ readonly broll: BRollMedia; readonly avatar: BRollMedia }> = ({
  broll,
  avatar,
}) => (
  <AbsoluteFill>
    <Media media={broll} muted />
    <div
      style={{
        position: "absolute",
        left: 60,
        bottom: 260,
        width: 300,
        height: 300,
        borderRadius: "50%",
        overflow: "hidden",
        border: `3px solid ${P.line}`,
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      }}
    >
      <Media media={avatar} muted={false} objectPosition={AVATAR_POSITION} />
    </div>
  </AbsoluteFill>
);

export type BRollVariant = "split" | "full" | "pip";

export type BRollSegment = {
  readonly from: number;
  readonly to: number;
  readonly variant: BRollVariant;
  readonly broll: BRollMedia;
  /** Не нужен для "full" - там аватар не в кадре (звук см. avatarAudio). */
  readonly avatar?: BRollMedia;
  readonly avatarAudio?: BRollMedia;
  /** Только для "split" - доля высоты под b-roll, 0-1, дефолт 0.5. */
  readonly splitRatio?: number;
  /** Только для "full" - "cover" для вертикальной вставки на весь кадр
   * без полей, "contain" (дефолт) для landscape-скриншотов. */
  readonly fit?: "cover" | "contain";
};

/** Вход/выход раскладки: масштаб и прозрачность, не рез. */
const TRANSITION_SEC = 0.28;

/**
 * "full" не может входить/выходить через opacity - раскладка обязана
 * либо полностью скрывать лицо, либо не быть показанной вовсе, а
 * полупрозрачность на переходе на пару кадров показывает и то и другое
 * разом: лицо буквально проступает сквозь вставку. Шторка (clip-path)
 * вместо фейда: в любой момент пиксель либо на 100% b-roll, либо на 100%
 * аватар, полутона нет физически. Split/Pip это не задевает - там аватар
 * и в устоявшемся состоянии частично виден, лёгкий блендинг на переходе
 * не создаёт нового эффекта.
 */
const Segment: React.FC<{ readonly seg: BRollSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const inDur = FPS * TRANSITION_SEC;
  const t = window0(frame, sec(seg.from), sec(seg.to), inDur, inDur);
  if (t <= 0) {
    return null;
  }

  if (seg.variant === "full") {
    const hiddenTop = (1 - t) * 100; // % кадра сверху ещё скрыто шторкой
    return (
      <AbsoluteFill style={{ clipPath: `inset(${hiddenTop}% 0 0 0)` }}>
        <FullBleedBRoll broll={seg.broll} avatarAudio={seg.avatarAudio} fit={seg.fit} />
      </AbsoluteFill>
    );
  }

  const scale = 0.94 + 0.06 * t;
  return (
    <AbsoluteFill style={{ opacity: t, transform: `scale(${scale})` }}>
      {seg.variant === "split" && seg.avatar ? (
        <SplitBRoll broll={seg.broll} avatar={seg.avatar} splitRatio={seg.splitRatio} />
      ) : null}
      {seg.variant === "pip" && seg.avatar ? <PipBRoll broll={seg.broll} avatar={seg.avatar} /> : null}
    </AbsoluteFill>
  );
};

/**
 * Таймлайн переключений раскладки. Сегменты не обязаны примыкать друг к
 * другу впритык - оставь между ними 0.15-0.25с зазора (или лёгкий
 * нахлёст), тогда вход одной раскладки и выход другой пересекутся по
 * времени и получится кросс-фейд, а не «пропала-появилась» с чёрным
 * кадром между. cue()/window0() уже есть в motion.ts - не пиши анимацию
 * входа/выхода заново на каждый новый сегмент.
 */
export const BRollStage: React.FC<{ readonly segments: readonly BRollSegment[] }> = ({ segments }) => (
  <>
    {segments.map((seg) => (
      <Segment key={`${seg.variant}-${seg.from}`} seg={seg} />
    ))}
  </>
);

// cue реэкспортируется, чтобы сегменты b-roll можно было анимировать тем
// же приёмом, что и остальную графику стиля, не изобретая параллельный.
export { cue };

/**
 * Значок инструмента/сервиса поверх кадра - лёгкая альтернатива полной
 * раскладке (Split/Full/Pip), когда нужно просто назвать/подписать что-то
 * (лого продукта, бренд), а не занимать половину экрана вставкой. Не
 * переключает раскладку - живёт поверх обычного полноэкранного аватара
 * (или поверх любой другой раскладки, если понадобится). Белая
 * скруглённая плашка - иконка + опциональный текст рядом.
 *
 * Крупно и по центру, не мелко в углу - мелкое теряется в кадре. По
 * умолчанию - над головой говорящего, в верхней части STAGE: там обычно
 * фон, а не лицо. Это ориентир, не гарантия для любого исходника - на
 * конкретной съёмке, где в кадре мало места сверху, самостоятельно
 * подвинь `top` и проверь рендером кадра (см. Фазу 5 skill'а
 * video-montage), не сдвигай координаты вслепую.
 */
export type BadgeSegment = {
  readonly from: number;
  readonly to: number;
  readonly icon: BRollMedia;
  /** Название сервиса рядом с иконкой. Без текста - только иконка. */
  readonly label?: string;
};

const BADGE_TRANSITION_FRAMES = FPS * 0.24;

const LogoBadge: React.FC<{ readonly seg: BadgeSegment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const t = window0(frame, sec(seg.from), sec(seg.to), BADGE_TRANSITION_FRAMES, BADGE_TRANSITION_FRAMES);
  if (t <= 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: SAFE.top - 130,
        translate: "-50% 0",
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: seg.label ? "22px 40px 22px 22px" : 22,
        background: "#FFFFFF",
        borderRadius: 32,
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
        opacity: t,
        transform: `translateY(${(1 - t) * 16}px)`,
      }}
    >
      <div style={{ width: 96, height: 96, flex: "none" }}>
        <Media media={seg.icon} fit="contain" />
      </div>
      {seg.label ? (
        <span style={{ fontFamily: P.fontText, fontWeight: P.captionWeight, fontSize: 48, color: "#0A0A0A" }}>
          {seg.label}
        </span>
      ) : null}
    </div>
  );
};

export const BadgeStage: React.FC<{ readonly segments: readonly BadgeSegment[] }> = ({ segments }) => (
  <>
    {segments.map((seg) => (
      <LogoBadge key={`badge-${seg.from}`} seg={seg} />
    ))}
  </>
);
