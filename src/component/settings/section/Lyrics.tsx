import { useStore } from "@nanostores/solid";
import { For, Index, Show } from "solid-js";
import { SettingsRow } from "@/component/settings/Row";
import {
  $providers,
  $blurmap_mode,
  $custom_blurmap,
  setBlurmapMode,
  setCustomBlurmap,
  type BlurmapMode,
} from "@/stores/lyrics";
import { SettingsSection } from "@/component/settings/Section";
import { GripVertical } from "lucide-solid";
import { t } from "@/i18n";
import { Select } from "@/component/ui/Select";
import { Slider } from "@/component/ui/Slider";
import { getProviderName } from "@/constants";

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

  const reorderableProviders = () => providerList().slice(1);

  const handleDragStart = (e: DragEvent, index: number) => {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    }
    const target = e.target as HTMLElement;
    target.classList.add("dragging");
  };

  const handleDragEnd = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    target.classList.remove("dragging");
  };

  const handleDragOver = (e: DragEvent, _targetIndex: number) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = Number(e.dataTransfer?.getData("text/plain"));
    if (isNaN(sourceIndex)) return;

    const reorderable = reorderableProviders();
    if (sourceIndex === targetIndex) return;
    if (sourceIndex < 0 || sourceIndex >= reorderable.length) return;
    if (targetIndex < 0 || targetIndex >= reorderable.length) return;

    const newReorderable = [...reorderable];
    const [moved] = newReorderable.splice(sourceIndex, 1);
    newReorderable.splice(targetIndex, 0, moved);

    $providers.set(["user", ...newReorderable]);
  };

  return (
    <SettingsSection title={t("lyrics.title")}>
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
        <div class="provider-order-list">
          <For each={reorderableProviders()}>
            {(provider, index) => (
              <div
                class="provider-item"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, index())}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index())}
                onDrop={(e) => handleDrop(e, index())}
              >
                <GripVertical size={16} class="drag-handle" />
                <span class="provider-label">{getProviderName(provider)}</span>
                <span class="provider-badge">{index() + 1}</span>
              </div>
            )}
          </For>
        </div>
      </SettingsRow>
    </SettingsSection>
  );
}

export default LyricsSettings;
