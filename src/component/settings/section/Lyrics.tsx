import { useStore } from "@nanostores/solid";
import { For } from "solid-js";
import { SettingsRow } from "@/component/settings/Row";
import { $providers } from "@/stores/lyrics";
import { SettingsSection } from "@/component/settings/Section";
import { GripVertical } from "lucide-solid";
import { t } from "@/i18n";
import type { LyricsProviders } from "@/constants";

const providerLabels: Record<LyricsProviders, string> = {
  user: "User (TTML)",
  spotify: "Spotify",
  spicy: "Spicy",
} as const;

function LyricsSettings() {
  const providerList = useStore($providers);

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
                <span class="provider-label">{providerLabels[provider]}</span>
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
