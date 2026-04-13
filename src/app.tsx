import "~/styles";
import { setupSonner, toast } from "~/lib/sonner";
import { logger } from "~/utils/logger";
import { setupPlayerButtons } from "~/player";
import router from "~/router";
import { preloadModules } from "~/lib/dom/load";
import exposeGlobals from "~/expose";
import { renderModalRoot } from "~/lib/modal";
import { setupSettingsMenu } from "~/menu";
import { GITHUB_ISSUES_LINK } from "~/constants";
import { dictResource, t } from "~/i18n";
import { setupNPV } from "~/npv";
import { setupFullscreen } from "~/fullscreen";

App();

type Task = {
  name: string;
  fn: () => void | Promise<void>;
};

async function App() {
  if (preventDuplicate()) return;
  try {
    const tasks: Task[] = [
      { fn: exposeGlobals, name: "expose" },
      {
        fn: () => {
          try {
            dictResource();
          } catch {}
        },
        name: "i18n",
      },
      { fn: setupSonner, name: "toast" },
      { fn: async () => await router.init(), name: "router" },
      { fn: setupPlayerButtons, name: "player" },
      { fn: setupNPV, name: "npv" },
      {
        fn: async () => {
          renderModalRoot();
          await setupSettingsMenu();
        },
        name: "ui",
      },
      {
        fn: async () => {
          setupFullscreen();
        },
        name: "cinema/fullscreen",
      },
      {
        fn: () => preloadModules(["pinyin", "kuromoji", "kuroshiro", "cyrillic-romanization"]),
        name: "preload",
      },
    ];

    await Promise.all(
      tasks.map(async ({ name, fn }) => {
        try {
          await fn();
        } catch (e) {
          logger.error(`${name}_fail`, e);
        }
      }),
    );

    if (__LUCID_DEV_MODE__) {
      const m = "In Development Mode !";
      logger.info(m);
      toast.info(m);

      router.navigate("/");
    }
  } catch (err) {
    toast.error(t("common.appLoadError"), {
      action: {
        label: t("common.report"),
        onClick: () => window.open(GITHUB_ISSUES_LINK, "_blank"),
      },
      description: t("common.reportIssue"),
      duration: Number.POSITIVE_INFINITY,
    });
    logger.error("fatal_crash", err);
  }
}

function preventDuplicate() {
  if (window.__lucid_lyrics_loaded) {
    const msg = "Another instance of Lucid Lyrics is already running.";
    toast.error(msg);
    logger.warn(msg);
    return true;
  }
  window.__lucid_lyrics_loaded = true;
  return false;
}
