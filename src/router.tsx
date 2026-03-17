import { toast } from "@/lib/sonner";
import { render } from "solid-js/web";
import { ErrorBoundary } from "solid-js";
import Router from "@/lib/spotify/router";
import { BASE_ROUTE } from "@/constants";
import LyricsPage from "@/component/page/LyricsPage";
import SpotifySettings from "@/component/page/SpotifySettings";
import { t } from "@/i18n";
import ErrorPage from "@/lib/spotify/router/component/ErrorPage";

const router = new Router(BASE_ROUTE, {
  "/": {
    onMount: (el) => {
      const clean = render(
        () => (
          <ErrorBoundary
            fallback={(err) => {
              const errorMessage = err instanceof Error ? err.message : String(err);
              console.error(err);
              toast.error(t("router.lyricsPageError"));
              return (
                <ErrorPage
                  icon="error"
                  message={errorMessage}
                  title="Something went wrong while loading lyrics"
                />
              );
            }}
          >
            <LyricsPage />
          </ErrorBoundary>
        ),
        el,
      );

      return () => clean();
    },
    hideSiblings: true,
  },
  "/preferences": {
    absolute: true,
    selector:
      ".main-view-container__scroll-node-child .x-settings-container, .main-view-container__scroll-node-child .x-settings-container",
    onMount: (el) => {
      const clean = render(
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

      return () => clean();
    },
  },
});

export default router;
