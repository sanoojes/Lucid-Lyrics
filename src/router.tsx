import { toast } from "@/lib/sonner";
import { render } from "solid-js/web";
import { ErrorBoundary } from "solid-js";
import Router, { $router_state } from "@/lib/spotify/router";
import { BASE_ROUTE } from "@/constants";
import LyricsPage from "@/component/page/LyricsPage";
import SpotifySettings from "@/component/page/SpotifySettings";
import { t } from "@/i18n";
import ErrorPage from "@/lib/spotify/router/component/ErrorPage";
import { computed } from "nanostores";
import { logger } from "@/utils/logger";

export const $in_lyrics_page = computed($router_state, ({ path }) => {
  return path === BASE_ROUTE;
});

const router = new Router(BASE_ROUTE, {
  "/": {
    onMount: (el) => {
      const dispose = render(
        () => (
          <ErrorBoundary
            fallback={(err) => {
              console.error(err);
              toast.error(t("router.lyricsPageError"));
              return (
                <ErrorPage
                  icon="error"
                  title="Something went wrong !"
                  message={`Failed to load lyrics page`}
                  errorDetails={String(err)}
                  showRetry
                  onRetry={() => router.navigate("/")}
                  onHome={() => router.navigate("/", true)}
                />
              );
            }}
          >
            <LyricsPage />
          </ErrorBoundary>
        ),
        el,
      );

      return () => {
        dispose();
        if (__LUCID_DEV_MODE__) logger.debug("Disposed: '/'");
      };
    },
    hideSiblings: true,
  },
  "/preferences": {
    absolute: true,
    selector:
      ".main-view-container__scroll-node-child .x-settings-container, .main-view-container__scroll-node-child .x-settings-container",
    onMount: (el) => {
      const dispose = render(
        () => (
          <ErrorBoundary
            fallback={(err) => {
              console.error(err);
              toast.error(t("router.settingsError"));
              return null;
            }}
          >
            <SpotifySettings />
          </ErrorBoundary>
        ),
        el,
      );

      return () => {
        dispose();
        if (__LUCID_DEV_MODE__) logger.debug("Disposed: '/preferences'");
      };
    },
  },
});

export default router;
