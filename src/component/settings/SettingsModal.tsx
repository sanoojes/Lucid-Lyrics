import "@/styles/modal/settings.scss";
import { useDialog } from "@/lib/modal/component/Dialog";
import { showModal } from "@/lib/modal";
import { X, Search } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { createSignal, Show } from "solid-js";
import { SettingsContext } from "@/component/settings/context";
import WidgetSettings from "@/component/settings/section/Widget";
import NowPlayingViewSettings from "@/component/settings/section/NowPlayingView";
import BackgroundSettings from "@/component/settings/section/Background";
import LyricsSettings from "@/component/settings/section/Lyrics";
import LanguageSettings from "@/component/settings/section/Language";
import ResetSettings from "@/component/settings/section/Reset";
import AdvancedSettings from "@/component/settings/section/Advanced";
import MainList from "@/component/settings/MainList";
import { t } from "@/i18n";
import SolidLenis from "@/component/ui/Lenis";

export function SettingsModal() {
  let inputRef!: HTMLInputElement;

  const { close } = useDialog();
  const [searchQuery, setSearchQuery] = createSignal("");

  return (
    <div class="settings-modal">
      <header>
        <h2 class="title">{t("settings.title")}</h2>
        <div class="actions">
          <Button onClick={close} variant="ghost" size="icon" shape="rounded">
            <X size={20} />
          </Button>
        </div>
      </header>

      <SolidLenis class="content">
        <main>
          <div class="search-wrapper">
            <Search size={16} class="search-icon" />
            <input
              ref={inputRef}
              type="text"
              class="search-input"
              placeholder={t("settings.searchPlaceholder")}
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.currentTarget.value)}
              autofocus
            />
            <Show when={searchQuery()}>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  inputRef.focus();
                }}
                variant="ghost"
                size="icon"
                class="search-clear"
              >
                <X size={16} />
              </Button>
            </Show>
          </div>
          <SettingsContext.Provider value={{ searchQuery }}>
            <MainList searchQuery={searchQuery()}>
              <LanguageSettings />
              <WidgetSettings />
              <NowPlayingViewSettings />
              <BackgroundSettings />
              <LyricsSettings />
              <AdvancedSettings />
              <ResetSettings />
            </MainList>
          </SettingsContext.Provider>
        </main>
      </SolidLenis>
    </div>
  );
}

export const showSettingsModal = () => showModal(() => <SettingsModal />);
