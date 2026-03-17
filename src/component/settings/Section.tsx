import { children, createMemo, Show, type Component, type JSXElement } from "solid-js";

interface SettingsSectionProps {
  title: string;
  children: JSXElement;
}

export const SettingsSection: Component<SettingsSectionProps> = (props) => {
  const resolved = children(() => props.children);
  const hasItems = createMemo(() => resolved.toArray().some((item) => item !== undefined));

  return (
    <Show when={hasItems()}>
      <section class="settings-section">
        <h3 class="section-title">{props.title}</h3>
        <div class="section-items">{resolved()}</div>
      </section>
    </Show>
  );
};
