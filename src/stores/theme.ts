import { waitForElement } from "@/lib/dom/wait";
import { logger } from "@/utils/logger";
import { atom, onMount } from "nanostores";

export const $installed_theme = atom<string | null>(null);

onMount($installed_theme, () => {
  addThemeSpecificStyles();
});

type DetectorFn = (timeout: number) => boolean | Promise<boolean>;
type Detector = string | DetectorFn;

const themeDetectors: Record<string, Detector> = {
  glassify: ".glassify-bg,#glassify-bg",
  lucid: ".lucid-bg,#lucid-bg",
};

export async function addThemeSpecificStyles() {
  const timeout = 12000;
  const checks = Object.entries(themeDetectors).map(async ([themeName, detector]) => {
    try {
      let isPresent = false;
      if (typeof detector === "string") {
        isPresent = !!(await waitForElement(detector, { timeout }));
      } else if (typeof detector === "function") {
        isPresent = await detector(timeout);
      }
      if (isPresent) {
        $installed_theme.set(themeName);
      }
    } catch {
      logger.debug(`Timeout or error while checking for theme: ${themeName}`);
    }
  });
  await Promise.all(checks);
}
