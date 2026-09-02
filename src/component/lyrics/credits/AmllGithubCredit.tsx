import { CreditItem } from "~/component/lyrics/credits/CreditItem";
import { Tippy } from "~/component/ui/Tippy";
import { t } from "~/i18n";
import { showLinkAlert } from "~/lib/modal";

type AmllGithubCreditProps = {
  username: string;
};

export function AmllGithubCredit(props: AmllGithubCreditProps) {
  const handleClick = (e: Event) => {
    e.preventDefault();
    const url = `https://github.com/${props.username}`;
    showLinkAlert("github.com", () => window.open(url, "_blank", "noopener,noreferrer"));
  };

  return (
    <CreditItem label={t("lyricsCredits.madeBy")} class="ttml-user">
      <span class="ttml-user-wrapper">
        <img
          src={`https://avatars.githubusercontent.com/${props.username}`}
          alt={`${props.username}'s avatar`}
          class="ttml-user-avatar"
          width={22}
          height={22}
          loading="lazy"
        />
        <Tippy title={t("lyricsCredits.goToGithubProfile", { username: props.username })}>
          <a
            href={`https://github.com/${props.username}`}
            class="ttml-user-name"
            onClick={handleClick}
          >
            {props.username}
          </a>
        </Tippy>
      </span>
    </CreditItem>
  );
}
