import "@/styles/modal/settings.scss";

import { t } from "@/i18n";
import { useDialog } from "@/lib/modal/component/Dialog";
import { showModal } from "@/lib/modal";
import { X, Search } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { SocialButtons } from "@/component/ui/button/SocialButtons";
import { createEffect, createSignal, on, Show } from "solid-js";
import { SettingsContext } from "@/component/settings/context";
import WidgetSettings from "@/component/settings/section/Widget";
import NowPlayingViewSettings from "@/component/settings/section/NowPlayingView";
import BackgroundSettings from "@/component/settings/section/Background";
import LyricsSettings from "@/component/settings/section/Lyrics";
import PageSettings from "@/component/settings/section/Page";
import FullscreenSettings from "@/component/settings/section/Fullscreen";
import LanguageSettings from "@/component/settings/section/Language";
import ResetSettings from "@/component/settings/section/Reset";
import AdvancedSettings from "@/component/settings/section/Advanced";
import MainList from "@/component/settings/MainList";
import SolidLenis from "@/component/ui/Lenis";
import { APP_NAME, APP_VERSION } from "@/constants";

export function SettingsModal() {
  let inputRef!: HTMLInputElement;

  const { close } = useDialog();
  const [searchQuery, setSearchQuery] = createSignal("");

  createEffect(
    on(
      () => inputRef,
      () => {
        setTimeout(() => {
          if (inputRef) {
            inputRef.focus();
          }
        });
      },
    ),
  );
  return (
    <div class="settings-modal">
      <header>
        <h2 class="title">{t("settings.title")}</h2>
        <div class="actions">
          <SocialButtons />
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
              <BackgroundSettings />
              <NowPlayingViewSettings />
              <PageSettings />
              <FullscreenSettings />
              <LyricsSettings />
              <AdvancedSettings />
              <ResetSettings />
            </MainList>
            <Show when={searchQuery().trim() === ""}>
              <div class="app-info">
                <div class="app-info--wrapper">
                  <span class="app-name">{APP_NAME}</span>
                  <span class="app-version">v{APP_VERSION}</span>
                </div>
                <div class="app-info--wrapper">
                  <SocialButtons variant="glass" size="sm" shape="default" showWebsite />
                </div>
              </div>
            </Show>
          </SettingsContext.Provider>
        </main>
      </SolidLenis>
    </div>
  );
}

export const showSettingsModal = () => showModal(() => <SettingsModal />);
