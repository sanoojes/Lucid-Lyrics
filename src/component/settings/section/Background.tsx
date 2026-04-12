import { t } from "~/i18n";
import { For, Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import { Select } from "~/component/ui/Select";
import { Slider } from "~/component/ui/Slider";
import { Color } from "~/component/ui/Color";
import { Toggle } from "~/component/ui/Toggle";
import { Button } from "~/component/ui/Button";
import { SettingsRow } from "~/component/settings/Row";
import { SettingsSection } from "~/component/settings/Section";
import {
  $background,
  $bg_mode,
  $kawarp_options,
  updateAnimatedFilter,
  updateAnimatedOptions,
  updateBackground,
  updateColorOption,
  updateImageFilter,
  updateImageOptions,
  updateKawarpOptions,
  updateLocalImageOptions,
} from "~/stores/background";
import type { BGTypes, BackgroundState, ImageTypes } from "~/stores/background";
import Input from "~/component/ui/Input";
import { showLocalImagesModal } from "~/component/settings/LocalImagesModal";
import { Image } from "lucide-solid";

type CSSFilter = BackgroundState["options"]["image"]["filter"];

const BG_MODE_OPTIONS = (): { label: string; value: BGTypes }[] => [
  { label: t("bg.mode.color"), value: "color" },
  { label: t("bg.mode.image"), value: "image" },
  { label: t("bg.mode.animated"), value: "animated" },
  { label: t("bg.mode.kawarp"), value: "kawarp" },
];

const IMG_MODE_OPTIONS = (): { label: string; value: ImageTypes }[] => [
  { label: t("bg.albumArt"), value: "player" },
  { label: t("bg.customUrl"), value: "custom" },
  { label: t("bg.local"), value: "local" },
];

const FILTERS = (): {
  key: keyof CSSFilter;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}[] => [
  { key: "blur", label: t("bg.blur"), max: 256, min: 0, step: 1, suffix: "px" },
  {
    key: "saturation",
    label: t("bg.saturation"),
    max: 500,
    min: 0,
    step: 1,
    suffix: "%",
  },
  {
    key: "brightness",
    label: t("bg.brightness"),
    max: 200,
    min: 0,
    step: 1,
    suffix: "%",
  },
  { key: "contrast", label: t("bg.contrast"), max: 200, min: 0, step: 1, suffix: "%" },
  { key: "opacity", label: t("bg.opacity"), max: 100, min: 0, step: 5, suffix: "%" },
];

function BackgroundSettings() {
  const bg = useStore($background);
  const mode = useStore($bg_mode);
  const imageMode = () => bg().options.image.mode;
  const kawarpOptions = useStore($kawarp_options);

  return (
    <SettingsSection title={t("bg.title")}>
      <SettingsRow label={t("bg.mode")}>
        <Select
          value={mode()}
          onChange={(v) => updateBackground((s) => ({ ...s, mode: v as BGTypes }))}
          options={BG_MODE_OPTIONS()}
        />
      </SettingsRow>

      <Show when={mode() === "color"}>
        <SettingsRow label={t("bg.color")} description={t("bg.solidColor")}>
          <Color value={bg().options.color} onChange={updateColorOption} />
        </SettingsRow>
      </Show>

      <Show when={mode() === "image"}>
        <SettingsRow label={t("bg.imageSource")} description={t("bg.whereImage")}>
          <Select
            value={imageMode()}
            onChange={(v) => updateImageOptions({ mode: v as ImageTypes })}
            options={IMG_MODE_OPTIONS()}
          />
        </SettingsRow>

        <Show when={imageMode() === "custom"}>
          <SettingsRow label={t("bg.customUrl")}>
            <Input
              value={bg().options.image.customUrl}
              onChange={(v) => updateImageOptions({ customUrl: v })}
              placeholder="https://example.com/image.jpg"
              validateUrl
            />
          </SettingsRow>
        </Show>

        <Show when={imageMode() === "local"}>
          <LocalImagesSettings local={bg().options.image.local} />
        </Show>

        <SettingsRow label={t("bg.scale")} description={t("bg.scaleOf")}>
          <Slider
            value={bg().options.image.scale}
            onChange={(v) => updateImageOptions({ scale: v })}
            min={100}
            max={200}
            step={10}
            suffix="%"
          />
        </SettingsRow>

        <For each={FILTERS()}>
          {(filter) => (
            <SettingsRow label={filter.label} description={`${filter.label} ${t("bg.forImage")}`}>
              <Slider
                value={bg().options.image.filter[filter.key]}
                onChange={(v) => updateImageFilter(filter.key, v)}
                min={filter.min}
                max={filter.max}
                step={filter.step}
                suffix={filter.suffix}
              />
            </SettingsRow>
          )}
        </For>
      </Show>

      <Show when={mode() === "animated"}>
        <SettingsRow label={t("bg.source")} description={t("bg.whereAnimated")}>
          <Select
            value={bg().options.animated.mode}
            onChange={(v) => updateAnimatedOptions({ mode: v as ImageTypes })}
            options={IMG_MODE_OPTIONS()}
          />
        </SettingsRow>

        <Show when={bg().options.animated.mode === "custom"}>
          <SettingsRow label={t("bg.customUrl")}>
            <Input
              value={bg().options.animated.customUrl ?? ""}
              onChange={(v) => updateAnimatedOptions({ customUrl: v })}
              placeholder="https://example.com/image.jpg"
              validateUrl
            />
          </SettingsRow>
        </Show>

        <Show when={bg().options.animated.mode === "local"}>
          <LocalImagesSettings local={bg().options.image.local} />
        </Show>

        <SettingsRow label={t("bg.scale")} description={t("bg.scaleOf")}>
          <Slider
            value={bg().options.animated.scale}
            onChange={(v) => updateAnimatedOptions({ scale: v })}
            min={100}
            max={200}
            step={10}
            suffix="%"
          />
        </SettingsRow>

        <For each={FILTERS()}>
          {(filter) => (
            <SettingsRow
              label={filter.label}
              description={`${filter.label} ${t("bg.forAnimated")}`}
            >
              <Slider
                value={bg().options.animated.filter[filter.key as keyof CSSFilter] as number}
                onChange={(v) => updateAnimatedFilter(filter.key, v)}
                min={filter.min}
                max={filter.max}
                step={filter.step}
                suffix={filter.suffix}
              />
            </SettingsRow>
          )}
        </For>

        <SettingsRow
          label={t("bg.transitionDuration")}
          description={t("bg.transitionDurationDesc")}
        >
          <Slider
            value={bg().options.animated.transitionDuration}
            onChange={(v) => updateAnimatedOptions({ transitionDuration: v })}
            min={0.1}
            max={2}
            step={0.1}
            suffix="s"
          />
        </SettingsRow>

        <SettingsRow label={t("bg.rotationSpeed")} description={t("bg.rotationSpeedDesc")}>
          <Slider
            value={bg().options.animated.rotationSpeed}
            onChange={(v) => updateAnimatedOptions({ rotationSpeed: v })}
            min={0}
            max={3}
            step={0.1}
            suffix="x"
          />
        </SettingsRow>
      </Show>

      <Show when={mode() === "kawarp"}>
        <SettingsRow label={t("bg.source")}>
          <Select
            value={kawarpOptions().mode}
            onChange={(v) => updateKawarpOptions({ mode: v as ImageTypes })}
            options={IMG_MODE_OPTIONS()}
          />
        </SettingsRow>

        <Show when={kawarpOptions().mode === "custom"}>
          <SettingsRow label={t("bg.customUrl")}>
            <Input
              value={kawarpOptions().customUrl ?? ""}
              onChange={(v) => updateKawarpOptions({ customUrl: v })}
              placeholder="https://example.com/image.jpg"
              validateUrl
            />
          </SettingsRow>
        </Show>

        <Show when={kawarpOptions().mode === "local"}>
          <LocalImagesSettings local={bg().options.image.local} />
        </Show>

        <SettingsRow
          label={t("bg.kawarp.warpIntensity")}
          description={t("bg.kawarp.warpIntensityDesc")}
        >
          <Slider
            value={kawarpOptions().warpIntensity}
            onChange={(v) => updateKawarpOptions({ warpIntensity: v })}
            min={0}
            max={2}
            step={0.1}
          />
        </SettingsRow>

        <SettingsRow label={t("bg.kawarp.blurPasses")} description={t("bg.kawarp.blurPassesDesc")}>
          <Slider
            value={kawarpOptions().blurPasses}
            onChange={(v) => updateKawarpOptions({ blurPasses: Math.floor(v) })}
            min={1}
            max={40}
            step={1}
          />
        </SettingsRow>

        <SettingsRow
          label={t("bg.kawarp.animationSpeed")}
          description={t("bg.kawarp.animationSpeedDesc")}
        >
          <Slider
            value={kawarpOptions().animationSpeed}
            onChange={(v) => updateKawarpOptions({ animationSpeed: v })}
            min={0.1}
            max={5}
            step={0.1}
            suffix="x"
          />
        </SettingsRow>

        <SettingsRow
          label={t("bg.kawarp.transitionDuration")}
          description={t("bg.kawarp.transitionDurationDesc")}
        >
          <Slider
            value={kawarpOptions().transitionDuration}
            onChange={(v) => updateKawarpOptions({ transitionDuration: v })}
            min={100}
            max={5000}
            step={100}
            suffix="ms"
          />
        </SettingsRow>

        <SettingsRow label={t("bg.kawarp.saturation")} description={t("bg.kawarp.saturationDesc")}>
          <Slider
            value={kawarpOptions().saturation}
            onChange={(v) => updateKawarpOptions({ saturation: v })}
            min={0}
            max={10}
            step={0.1}
          />
        </SettingsRow>

        <SettingsRow
          label={t("bg.kawarp.tintIntensity")}
          description={t("bg.kawarp.tintIntensityDesc")}
        >
          <Slider
            value={kawarpOptions().tintIntensity}
            onChange={(v) => updateKawarpOptions({ tintIntensity: v })}
            min={0}
            max={1}
            step={0.05}
          />
        </SettingsRow>

        <SettingsRow label={t("bg.kawarp.brightness")} description={t("bg.kawarp.brightnessDesc")}>
          <Slider
            value={kawarpOptions().brightness}
            onChange={(v) => updateKawarpOptions({ brightness: v })}
            min={0}
            max={2}
            step={0.1}
          />
        </SettingsRow>

        <SettingsRow label={t("bg.kawarp.tintColor")} description={t("bg.kawarp.tintColorDesc")}>
          <Color
            value={`#${kawarpOptions()
              .tintColor.map((v) =>
                Math.round(v * 255)
                  .toString(16)
                  .padStart(2, "0"),
              )
              .join("")}`}
            onChange={(v) => {
              const r = parseInt(v.slice(1, 3), 16) / 255;
              const g = parseInt(v.slice(3, 5), 16) / 255;
              const b = parseInt(v.slice(5, 7), 16) / 255;
              updateKawarpOptions({ tintColor: [r, g, b] });
            }}
          />
        </SettingsRow>

        <SettingsRow label={t("bg.kawarp.dithering")} description={t("bg.kawarp.ditheringDesc")}>
          <Slider
            value={kawarpOptions().dithering}
            onChange={(v) => updateKawarpOptions({ dithering: v })}
            min={0}
            max={0.05}
            step={0.001}
          />
        </SettingsRow>

        <SettingsRow label={t("bg.scale")} description={t("bg.scaleOf")}>
          <Slider
            value={kawarpOptions().scale}
            onChange={(v) => updateKawarpOptions({ scale: v })}
            min={1}
            max={2}
            step={0.1}
            suffix="x"
          />
        </SettingsRow>
      </Show>
    </SettingsSection>
  );
}

type LocalImageOptions = {
  slideshow: boolean;
  time: number;
  shuffle: boolean;
  direction: "next" | "prev";
};

function LocalImagesSettings(props: { local: LocalImageOptions }) {
  return (
    <>
      <SettingsRow label={t("bg.localImages")}>
        <Button variant="outline" onClick={showLocalImagesModal}>
          <Image size={16} />
          {t("bg.manageImages")}
        </Button>
      </SettingsRow>
      <SettingsRow label={t("bg.slideshow")} description={t("bg.slideshowDesc")}>
        <Toggle
          checked={props.local.slideshow}
          onChange={(v) => updateLocalImageOptions({ slideshow: v })}
        />
      </SettingsRow>
      <Show when={props.local.slideshow}>
        <SettingsRow label={t("bg.slideTime")} description={t("bg.slideTimeDesc")}>
          <Input
            value={formatSlideTime(props.local.time)}
            onChange={(v) => {
              const parsed = parseSlideTime(v);
              if (!Number.isNaN(parsed)) updateLocalImageOptions({ time: parsed });
            }}
            placeholder="30s"
          />
        </SettingsRow>
        <SettingsRow label={t("bg.shuffle")} description={t("bg.shuffleDesc")}>
          <Toggle
            checked={props.local.shuffle}
            onChange={(v) => updateLocalImageOptions({ shuffle: v })}
          />
        </SettingsRow>
        <Show when={!props.local.shuffle}>
          <SettingsRow label={t("bg.direction")} description={t("bg.directionDesc")}>
            <Select
              value={props.local.direction}
              onChange={(v) => updateLocalImageOptions({ direction: v as "next" | "prev" })}
              options={[
                { label: t("bg.forward"), value: "next" },
                { label: t("bg.backward"), value: "prev" },
              ]}
            />
          </SettingsRow>
        </Show>
      </Show>
    </>
  );
}

function formatSlideTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  if (seconds < 3600) {
    const mins = seconds / 60;
    return `${+mins.toFixed(2)}m`;
  }

  if (seconds < 86400) {
    const hrs = seconds / 3600;
    return `${+hrs.toFixed(2)}h`;
  }

  const days = seconds / 86400;
  return `${+days.toFixed(2)}d`;
}

function parseSlideTime(value: string): number {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)([smhd])$/);
  if (!match) return NaN;

  const num = parseFloat(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return num;
    case "m":
      return num * 60;
    case "h":
      return num * 3600;
    case "d":
      return num * 86400;
    default:
      return NaN;
  }
}

export default BackgroundSettings;
