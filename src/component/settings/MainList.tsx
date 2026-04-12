import { type JSXElement, Show, children, createMemo } from "solid-js";
import { t } from "~/i18n";

function MainList(props: { children: JSXElement; searchQuery: string }) {
  const resolved = children(() => props.children);
  const hasAny = createMemo(() => resolved.toArray().some((node) => node instanceof Element));

  return (
    <>
      {resolved()}
      <Show when={!hasAny()}>
        <div class="settings-fallback">
          <p>{t("settings.noResults", { searchQuery: props.searchQuery })}</p>
        </div>
      </Show>
    </>
  );
}
export default MainList;
