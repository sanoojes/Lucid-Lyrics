import { Show } from "solid-js";
import { useStore } from "@nanostores/solid";
import type { Lyrics } from "~/lib/api/types";
import { $page_state } from "~/stores/page";
import { getProviderName } from "~/constants";
import { t } from "~/i18n";
import { CreditItem } from "~/component/lyrics/credits/CreditItem";
import { TtmlUserCredit } from "~/component/lyrics/credits/TtmlUserCredit";
import { AmllGithubCredit } from "~/component/lyrics/credits/AmllGithubCredit";

type LyricsCreditsProps = {
  lyrics: Lyrics;
};

export function LyricsCredits(props: LyricsCreditsProps) {
  const pageState = useStore($page_state);

  const artists = () => props.lyrics.Artists;
  const songwriters = () => props.lyrics.SongWriters;
  const provider = () => props.lyrics.Provider;
  const ttmlUpload = () => props.lyrics.TTMLUploadMetadata;
  const amll = () => props.lyrics.Amll;

  const githubUsername = () => amll()?.ttmlAuthorGithubLogin || amll()?.ttmlAuthorGithub;

  const activeTtmlUser = () => {
    const meta = ttmlUpload();
    if (!meta) return null;

    const hasValidMaker = meta.Maker?.id || meta.Maker?.username;
    return hasValidMaker ? meta.Maker : meta.Uploader;
  };

  return (
    <Show when={pageState().showCredits}>
      <div class="lyrics-credits">
        <Show when={artists()?.length}>
          <CreditItem label={t("lyricsCredits.artists")} class="artists">
            {artists()!.join(", ")}
          </CreditItem>
        </Show>

        <Show when={songwriters()?.length}>
          <CreditItem label={t("lyricsCredits.writtenBy")} class="written-by">
            {songwriters()!.join(", ")}
          </CreditItem>
        </Show>

        <Show when={activeTtmlUser()}>{(user) => <TtmlUserCredit user={user()} />}</Show>

        <Show when={githubUsername()}>
          {(username) => <AmllGithubCredit username={username()} />}
        </Show>

        <Show when={provider()}>
          <CreditItem label={t("lyricsCredits.provider")} class="provider">
            {getProviderName(provider() ?? "Unknown")}
            {ttmlUpload() ? " (community)" : ""}
          </CreditItem>
        </Show>
      </div>
    </Show>
  );
}

export default LyricsCredits;
