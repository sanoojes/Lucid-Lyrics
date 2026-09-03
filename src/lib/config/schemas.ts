import {
  array,
  boolean,
  literal,
  number,
  object,
  optional,
  picklist,
  string,
  tuple,
  type InferOutput,
} from "valibot";

export const DisplayStateSchema = picklist(["hidden", "show"]);
export const PositionsSchema = picklist(["top", "bottom", "left", "right"]);
export const OnOffSchema = picklist(["on", "off"]);

export const WidgetSchema = object({
  variant: picklist(["simple", "light", "dark", "glass", "overlay"]),
  centerText: boolean(),
  hideTitle: boolean(),
  hideAlbum: boolean(),
  hideArtist: boolean(),
});

export const NowPlayingBarSchema = object({
  hideFullscreen: boolean(),
  hideSpotifyFullscreen: boolean(),
});

export const NpvSettingsSchema = object({
  hideBackground: boolean(),
  useStyles: boolean(),
  showLyrics: boolean(),
  autoHideCardHeader: boolean(),
  cardHeightPercent: number(),
  cardMinHeight: number(),
});

export const PageSchema = object({
  widget: DisplayStateSchema,
  romanize: boolean(),
  romanize_position: picklist(["top", "bottom", "replace"]),
  showCredits: boolean(),
  hideScrollbar: boolean(),
  showControls: boolean(),
  floatingPosition: PositionsSchema,
  hideStatus: boolean(),
});

export const FullscreenSchema = object({
  widget: DisplayStateSchema,
  showCredits: boolean(),
  hideScrollbar: boolean(),
  showControls: boolean(),
  floatingPosition: PositionsSchema,
  hideStatus: boolean(),
});

export const CssFilterSchema = object({
  brightness: number(),
  contrast: number(),
  saturation: number(),
  opacity: number(),
  blur: number(),
});

const ImageTypesSchema = picklist(["custom", "player", "local"]);
const LocalImagesSchema = object({
  time: number(),
  slideshow: boolean(),
  shuffle: boolean(),
  direction: picklist(["next", "prev"]),
  selectedId: optional(string()),
});

const ImageOptionsSchema = object({
  mode: ImageTypesSchema,
  scale: number(),
  filter: CssFilterSchema,
  customUrl: optional(string()),
  local: LocalImagesSchema,
});

const AnimatedOptionsSchema = object({
  mode: ImageTypesSchema,
  scale: number(),
  customUrl: optional(string()),
  filter: CssFilterSchema,
  transitionDuration: number(),
  rotationSpeed: number(),
});

const KawarpOptionsSchema = object({
  mode: ImageTypesSchema,
  customUrl: optional(string()),
  scale: number(),
  dithering: number(),
  saturation: number(),
  brightness: number(),
  warpIntensity: number(),
  animationSpeed: number(),
  blurPasses: number(),
  tintIntensity: number(),
  tintColor: tuple([number(), number(), number()]),
  transitionDuration: number(),
});

export const BackgroundSchema = object({
  mode: picklist(["color", "image", "animated", "kawarp"]),
  options: object({
    color: string(),
    image: ImageOptionsSchema,
    animated: AnimatedOptionsSchema,
    kawarp: KawarpOptionsSchema,
  }),
});

export const PictureInPictureSchema = object({
  widget: DisplayStateSchema,
  showCredits: boolean(),
  hideScrollbar: boolean(),
  showControls: boolean(),
  hideStatus: boolean(),
  depthEffects: boolean(),
});

export const BlurmapModeSchema = picklist([
  "default",
  "minimal",
  "smooth",
  "heavy",
  "none",
  "custom",
]);
export const CustomBlurmapSchema = array(number());
export const ProvidersSchema = array(picklist(["user", "spicy", "amll", "lrclib", "spotify"]));

export const CacheSettingsSchema = object({
  ttlDays: number(),
});

export const LocaleSchema = picklist(["en", "es", "ru", "sk"]);
export const TtmlModeSchema = picklist(["apple", "amll"]);

export const ConfigSchema = object({
  widget: WidgetSchema,
  npb: NowPlayingBarSchema,
  npvSettings: NpvSettingsSchema,
  page: PageSchema,
  fullscreen: FullscreenSchema,
  background: BackgroundSchema,
  pictureInPicture: PictureInPictureSchema,
  blurmapMode: BlurmapModeSchema,
  customBlurmap: CustomBlurmapSchema,
  providers: ProvidersSchema,
  cacheSettings: CacheSettingsSchema,
  developerMode: OnOffSchema,
  ttmlMakerMode: OnOffSchema,
  ttmlMode: TtmlModeSchema,
  locale: LocaleSchema,
});

export const ConfigFileSchema = object({
  app: literal("Lucid Lyrics"),
  version: string(),
  exportedAt: string(),
  config: ConfigSchema,
});

export type Config = InferOutput<typeof ConfigSchema>;
export type ConfigFile = InferOutput<typeof ConfigFileSchema>;
