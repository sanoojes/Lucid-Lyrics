import { t } from "@/i18n";
import { Tippy } from "@/component/ui/Tippy";
import { showLinkAlert } from "@/lib/modal";
import { CreditItem } from "@/component/lyrics/credits/CreditItem";

type AmllGithubCreditProps = {
  username: string;
};

export function AmllGithubCredit(props: AmllGithubCreditProps) {
  const handleClick = (e: Event) => {
    e.preventDefault();
    showLinkAlert("github.com", () =>
      window.open(`https://github.com/${props.username}`, "_blank", "noopener,noreferrer"),
    );
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
