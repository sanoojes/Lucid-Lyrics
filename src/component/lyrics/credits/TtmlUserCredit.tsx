import { Show } from "solid-js";
import { t } from "@/i18n";
import { CreditItem } from "@/component/lyrics/credits/CreditItem";

type TtmlUserCreditProps = {
  user: { avatar?: string; username?: string; id?: string | number };
};

export function TtmlUserCredit(props: TtmlUserCreditProps) {
  return (
    <CreditItem label={t("lyricsCredits.madeBy")} class="ttml-user">
      <span class="ttml-user-wrapper">
        <Show when={props.user.avatar}>
          <img
            src={props.user.avatar}
            alt={`${props.user.username || "User"}'s avatar`}
            class="ttml-user-avatar"
            width={22}
            height={22}
            loading="lazy"
          />
        </Show>
        <span class="ttml-user-name">{props.user.username || props.user.id}</span>
      </span>
    </CreditItem>
  );
}
