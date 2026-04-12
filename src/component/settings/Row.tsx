import { type Component, type JSXElement, Show, createMemo } from "solid-js";
import "~/styles/component/settings-row.scss";
import { useSettings } from "~/component/settings/context";

interface SettingsRowProps {
  label: string;
  description?: string;
  children: JSXElement;
  class?: string;
  column?: boolean;
}

function highlightMatch(text: string, query: string): JSXElement {
  if (!query) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, index)}
      <mark class="highlight">{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

export const SettingsRow: Component<SettingsRowProps> = (props) => {
  const { searchQuery } = useSettings();

  const isMatch = createMemo(() => {
    const q = searchQuery().trim();
    if (!q) return true;
    const lowerQ = q.toLowerCase();
    return (
      props.label.toLowerCase().includes(lowerQ) ||
      props.description?.toLowerCase().includes(lowerQ)
    );
  });

  return (
    <Show when={isMatch()}>
      <div
        class={`settings-row ${props.column ? "settings-row--column" : ""} ${props.class ?? ""}`.trim()}
      >
        <div class="settings-row__info">
          <span class="settings-row__label">{highlightMatch(props.label, searchQuery())}</span>
          {props.description && (
            <span class="settings-row__description">
              {highlightMatch(props.description, searchQuery())}
            </span>
          )}
        </div>
        <div class="settings-row__control">{props.children}</div>
      </div>
    </Show>
  );
};
