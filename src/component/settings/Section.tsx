import { type Component, type JSXElement, Show, children, createMemo } from "solid-js";
import { Button } from "~/component/ui/Button";
import { Tippy } from "~/component/ui/Tippy";
import { showAlert } from "~/lib/modal";
import { t } from "~/i18n";
import { RotateCcw } from "lucide-solid";

interface SettingsSectionProps {
  title: string;
  children: JSXElement;
  onReset?: () => void;
  resetLabel?: string;
}

export const SettingsSection: Component<SettingsSectionProps> = (props) => {
  const resolved = children(() => props.children);
  const hasItems = createMemo(() => resolved.toArray().some((item) => item !== undefined));

  const handleReset = () => {
    const section = props.resetLabel ?? props.title;
    showAlert({
      description: t("settings.resetSectionDesc"),
      title: t("settings.resetSectionConfirm", { section }),
      onConfirm: props.onReset,
      variant: "destructive",
    });
  };

  return (
    <Show when={hasItems()}>
      <section class="settings-section">
        <h3 class="section-title">
          <span class="section-title__text">{props.title}</span>
          <span class="section-title__separator" />
          <Show when={props.onReset}>
            <Tippy title={t("settings.resetSection", { section: props.resetLabel ?? props.title })}>
              <Button
                class="settings-section__reset"
                variant="ghost"
                size="icon-sm"
                shape="rounded"
                onClick={handleReset}
              >
                <RotateCcw size={14} />
              </Button>
            </Tippy>
          </Show>
        </h3>
        <div class="section-items">{resolved()}</div>
      </section>
    </Show>
  );
};
