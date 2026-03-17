import { toast } from "@/lib/sonner";
import { BrandHTML } from "@/component/icon/Brand";
import { createButton } from "@/lib/spotify/player";
import router from "@/router";
import { logger } from "@/utils/logger";
import { t } from "@/i18n";
import { BASE_ROUTE } from "@/constants";

const PAGE_PATH = BASE_ROUTE;
export async function setupPlayerButtons() {
  try {
    const toggleBtn = await createButton({
      label: t("menu.appName"),
      icon: BrandHTML({ size: 18 }),
      onClick: (api) => {
        const active = router.togglePath(PAGE_PATH);
        api.update({ active });
      },
    });

    toggleBtn.register();
    toggleBtn.update({
      active: router.state.get().path === PAGE_PATH,
    });

    router.state.listen(({ path }) => {
      toggleBtn.update({ active: path === PAGE_PATH });
    });
  } catch (e) {
    const msg = t("player.addButtons");
    logger.error(msg, e);
    toast.error(msg);
  }
}
