import { Show } from "solid-js";
import { Button } from "~/component/ui/Button";
import { Globe } from "lucide-solid";
import { DISCORD_LINK, GITHUB_LINK, WEBSITE_LINK } from "~/constants";
import Github from "~/component/icon/Github";
import Discord from "~/component/icon/Discord";

type SocialButtonsProps = {
  variant?: "ghost" | "glass";
  size?: "icon" | "sm";
  shape?: "rounded" | "default";
  showWebsite?: boolean;
};

export function SocialButtons(props: SocialButtonsProps) {
  const variant = () => props.variant ?? "ghost";
  const size = () => props.size ?? "icon";
  const shape = () => props.shape ?? "rounded";
  const showWebsite = () => props.showWebsite ?? false;

  return (
    <>
      <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">
        <Button variant={variant()} size={size()} shape={shape()}>
          <Github size={size() === "icon" ? 20 : 14} />
          <Show when={size() === "sm"}>
            <span>GitHub</span>
          </Show>
        </Button>
      </a>
      <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
        <Button variant={variant()} size={size()} shape={shape()}>
          <Discord size={size() === "icon" ? 20 : 14} />
          <Show when={size() === "sm"}>
            <span>Discord</span>
          </Show>
        </Button>
      </a>
      <Show when={showWebsite()}>
        <a href={WEBSITE_LINK} target="_blank" rel="noopener noreferrer">
          <Button variant={variant()} size={size()} shape={shape()}>
            <Globe size={size() === "icon" ? 20 : 14} />
            <Show when={size() === "sm"}>
              <span>Website</span>
            </Show>
          </Button>
        </a>
      </Show>
    </>
  );
}

export default SocialButtons;
