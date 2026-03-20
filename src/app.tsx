import "@/styles";
import { setupSonner, toast } from "@/lib/sonner";
import { logger } from "@/utils/logger";
import { setupPlayerButtons } from "@/player";
import router from "@/router";
import { preloadModules } from "@/lib/dom/load";
import exposeGlobals from "@/expose";
import { renderModalRoot } from "@/lib/modal";
import { setupSettingsMenu } from "@/menu";
import { GITHUB_ISSUES_LINK } from "@/constants";
import { dictResource, t } from "@/i18n";
import { setupNPV } from "@/npv";

type Task = {
  name: string;
  fn: () => void | Promise<void>;
};

async function App() {
  try {
    const tasks: Task[] = [
      { name: "expose", fn: exposeGlobals },
      {
        name: "i18n",
        fn: () => {
          try {
            dictResource();
          } catch {}
        },
      },
      { name: "toast", fn: setupSonner },
      { name: "router", fn: async () => await router.onReady() },
      { name: "player", fn: setupPlayerButtons },
      { name: "npv", fn: setupNPV },
      {
        name: "ui",
        fn: async () => {
          renderModalRoot();
          await setupSettingsMenu();
        },
      },
      {
        name: "preload",
        fn: () =>
          preloadModules([
            "pinyin",
            "franc",
            "kuromoji",
            "kuroshiro",
            "cyrillic-romanization",
            "greek-transliteration",
            "arabic-transliteration",
            "hebrew-transliteration",
            "armenian-transliteration",
          ]),
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
      window.LucidLyrics?.clearLyricsCache?.();
    }
  } catch (err) {
    toast.error(t("common.appLoadError"), {
      description: t("common.reportIssue"),
      action: {
        label: t("common.report"),
        onClick: () => window.open(GITHUB_ISSUES_LINK, "_blank"),
      },
      duration: Number.POSITIVE_INFINITY,
    });
    logger.error("fatal_crash", err);
  }
}

App();
