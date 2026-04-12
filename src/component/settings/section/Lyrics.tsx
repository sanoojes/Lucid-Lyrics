import { useStore } from "@nanostores/solid";
import { Index, Show, createMemo } from "solid-js";
import { SettingsRow } from "~/component/settings/Row";
import {
  $blurmap_mode,
  $custom_blurmap,
  $providers,
  type BlurmapMode,
  setBlurmapMode,
  setCustomBlurmap,
} from "~/stores/lyrics";
import { SettingsSection } from "~/component/settings/Section";
import { SortableList } from "~/component/ui/SortableList";
import { t } from "~/i18n";
import { Select } from "~/component/ui/Select";
import { Slider } from "~/component/ui/Slider";
import { ALL_PROVIDERS, type LyricsProviders, getProviderName } from "~/constants";
import { $page_state, setRomanizePosition, type RomanizePosition } from "~/stores";

const BLURMAP_OPTIONS: { label: string; value: BlurmapMode }[] = [
  { label: t("lyrics.blurmapMode.default"), value: "default" },
  { label: t("lyrics.blurmapMode.minimal"), value: "minimal" },
  { label: t("lyrics.blurmapMode.smooth"), value: "smooth" },
  { label: t("lyrics.blurmapMode.heavy"), value: "heavy" },
  { label: t("lyrics.blurmapMode.custom"), value: "custom" },
];

function LyricsSettings() {
  const providerList = useStore($providers);
  const blurmapMode = useStore($blurmap_mode);
  const customBlurmap = useStore($custom_blurmap);
  const pageState = useStore($page_state);

  const reorderableProviders = () => providerList().slice(1);

  const providerItems = createMemo(() =>
    reorderableProviders().map((p) => ({
      id: p,
      label: getProviderName(p),
    })),
  );

  const availableProviderItems = createMemo(() => {
    const current = providerList();
    return ALL_PROVIDERS.filter((p) => !current.includes(p)).map((p) => ({
      id: p,
      label: getProviderName(p),
    }));
  });

  const handleReorder = (items: { id: string; label: string }[]) => {
    $providers.set(["user", ...items.map((i) => i.id as LyricsProviders)]);
  };

  const handleRemove = (id: string) => {
    const current = providerList();
    $providers.set(current.filter((p) => p !== id));
  };

  const handleAdd = (id: string) => {
    $providers.set([...providerList(), id as LyricsProviders]);
  };

  return (
    <SettingsSection title={t("lyrics.title")}>
      <SettingsRow label={t("page.romanizePosition")} description={t("page.romanizePositionDesc")}>
        <Select
          value={pageState().romanize_position}
          onChange={(v) => setRomanizePosition(v as RomanizePosition)}
          options={[
            { label: t("position.bottom"), value: "bottom" },
            { label: t("position.top"), value: "top" },
            { label: t("position.replace"), value: "replace" },
          ]}
        />
      </SettingsRow>
      <SettingsRow label={t("lyrics.blurmapMode")} description={t("lyrics.blurmapModeDesc")}>
        <Select
          value={blurmapMode()}
          onChange={(v) => setBlurmapMode(v as BlurmapMode)}
          options={BLURMAP_OPTIONS}
        />
      </SettingsRow>

      <Show when={blurmapMode() === "custom"}>
        <SettingsRow
          label={t("lyrics.customBlurmap")}
          description={t("lyrics.customBlurmapDesc")}
          column
        >
          <div class="blurmap-sliders">
            <Index each={customBlurmap()}>
              {(value, index) => (
                <div class="blurmap-slider-row">
                  <span class="blurmap-slider-label">{`Distance ${index} and -${index}`}</span>
                  <Slider
                    value={value()}
                    onChange={(v) => {
                      const newBlurmap = [...customBlurmap()];
                      newBlurmap[index] = v;
                      setCustomBlurmap(newBlurmap);
                    }}
                    min={0}
                    max={5}
                    step={0.5}
                    suffix="px"
                  />
                </div>
              )}
            </Index>
          </div>
        </SettingsRow>
      </Show>

      <SettingsRow
        label={t("lyrics.providerOrder")}
        description={t("lyrics.providerOrderDesc")}
        column
      >
        <SortableList
          items={providerItems()}
          availableItems={availableProviderItems()}
          minItems={1}
          addPlaceholder={t("settings.addProvider")}
          emptyMessage={t("lyrics.minProviderWarning")}
          removeTitle={t("common.remove")}
          onReorder={handleReorder}
          onRemove={handleRemove}
          onAdd={handleAdd}
        />
      </SettingsRow>
    </SettingsSection>
  );
}

export default LyricsSettings;
