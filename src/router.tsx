import { toast } from "@/lib/sonner";
import { render } from "solid-js/web";
import Router from "@/lib/spotify/router";
import { BASE_ROUTE } from "@/constants";
import LyricsPage from "@/component/page/LyricsPage";
import SpotifySettings from "@/component/page/SpotifySettings";
import { t } from "@/i18n";

const router = new Router(BASE_ROUTE, {
  "/": {
    onMount: (el) => {
      try {
        const clean = render(() => <LyricsPage />, el);
        return () => {
          clean?.();
        };
      } catch (err) {
        toast.error(t("router.lyricsPageError"));
        throw err;
      }
    },
    hideSiblings: true,
  },
  "/preferences": {
    absolute: true,
    selector:
      ".main-view-container__scroll-node-child .x-settings-container, .main-view-container__scroll-node-child .x-settings-container",
    onMount: (el) => {
      try {
        const clean = render(() => <SpotifySettings />, el);
        return () => {
          clean?.();
        };
      } catch {
        toast.error(t("router.settingsError"));
      }
    },
  },
});

export default router;
