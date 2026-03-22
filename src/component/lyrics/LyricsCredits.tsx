import { Show, type JSXElement } from "solid-js";
import { useStore } from "@nanostores/solid";
import type { Lyrics } from "@/lib/api/types";
import { $page_state } from "@/stores/page";
import { getProviderName } from "@/constants";

type LyricsCreditsProps = {
  lyrics: Lyrics;
};

type CreditItemProps = {
  label: string;
  class?: string;
  children: JSXElement;
};

function CreditItem(props: CreditItemProps) {
  return (
    <p class={`credit-item ${props.class ?? ""}`.trim()}>
      <span class="credit-label">{props.label}:</span> {props.children}
    </p>
  );
}

function LyricsCredits(props: LyricsCreditsProps) {
  const pageState = useStore($page_state);

  const artists = () => props.lyrics.Artists;
  const songwriters = () => props.lyrics.SongWriters;
  const provider = () => props.lyrics.Provider;
  const ttmlUpload = () => props.lyrics.TTMLUploadMetadata;

  const activeTtmlUser = () => {
    const meta = ttmlUpload();
    if (!meta) return null;

    const hasValidMaker = meta.Maker?.id || meta.Maker?.username;
    return hasValidMaker ? meta.Maker : meta.Uploader;
  };

  return (
    <Show when={pageState().showCredits}>
      <div class="lyrics-credits">
        <Show when={artists() && artists()!.length > 0}>
          <CreditItem label="Artists" class="artists">
            {artists()?.join(", ")}
          </CreditItem>
        </Show>

        <Show when={songwriters() && songwriters()!.length > 0}>
          <CreditItem label="Written By" class="written-by">
            {songwriters()?.join(", ")}
          </CreditItem>
        </Show>

        <Show when={activeTtmlUser()}>
          {(user) => (
            <CreditItem label="Made by" class="ttml-user">
              <span class="ttml-user-wrapper">
                <Show when={user().avatar}>
                  <img
                    src={user().avatar}
                    alt={`${user().username || "User"}'s avatar`}
                    class="ttml-user-avatar"
                    width={22}
                    height={22}
                  />
                </Show>
                <span class="ttml-user-name">{user().username || user().id}</span>
              </span>
            </CreditItem>
          )}
        </Show>

        <Show when={provider()}>
          <CreditItem label="Provider" class="provider">
            {getProviderName(provider() ?? "Unknown")}
            {ttmlUpload() ? " (community)" : ""}
          </CreditItem>
        </Show>
      </div>
    </Show>
  );
}

export default LyricsCredits;
