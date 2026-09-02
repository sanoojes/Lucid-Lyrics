import {
  type JSXElement,
  Match,
  Show,
  Suspense,
  Switch,
  children,
  createEffect,
  createMemo,
  on,
} from "solid-js";

import { lyricsResource, lyricsResourceAction } from "~/api/solid";
import LineLyrics from "~/component/lyrics/line/LineLyrics";
import LyricsLoader from "~/component/lyrics/Loader";
import LyricsCredits from "~/component/lyrics/LyricsCredits";
import LyricsStatus from "~/component/lyrics/LyricsStatus";
import StaticLyrics from "~/component/lyrics/static/StaticLyrics";
import SyllableLyrics from "~/component/lyrics/syllable/SyllableLyrics";
import SolidLenis from "~/component/ui/Lenis";
import { useRenderer } from "~/context/LyricsRenderer";
import { t } from "~/i18n";

type LyricsProps = {
  widgetHidden: boolean;
  showCredits: boolean;
  hideStatus: boolean;
};

function LyricsSpacer(props: { children: JSXElement }) {
  const resolved = children(() => props.children);
  return (
    <>
      <div class="top-spacer" />
      {resolved()}
      <div class="bottom-spacer" />
    </>
  );
}

function Lyrics(props: LyricsProps) {
  const response = createMemo(() => lyricsResource());
  const handleRetry = () => lyricsResourceAction.refetch();
  const { setIsActiveVisible, setJumpToActive } = useRenderer();

  createEffect(
    on(response, () => {
      setIsActiveVisible(true);
      setJumpToActive(null);
    }),
  );

  return (
    <SolidLenis
      class={`lyrics-area${props.widgetHidden ? " widget-hidden" : ""}`}
      options={{ lerp: 0.08 }}
    >
      <Suspense fallback={<LyricsLoader />}>
        <Switch
          fallback={
            <Show when={!props.hideStatus}>
              <LyricsStatus type="missing" message={t("lyrics.status.missing")} />
            </Show>
          }
        >
          <Match when={lyricsResource.loading}>
            <LyricsLoader />
          </Match>

          <Match when={response()?.status === "offline"}>
            <Show when={!props.hideStatus}>
              <LyricsStatus
                type="offline"
                message={t("lyrics.status.offline")}
                desc={t("lyrics.status.offlineDesc")}
                onRetry={handleRetry}
              />
            </Show>
          </Match>

          <Match when={response()?.status === "missing_lyrics"}>
            <Show when={!props.hideStatus}>
              <LyricsStatus type="missing" message={t("lyrics.status.missing")} />
            </Show>
          </Match>

          <Match when={response()?.status === "local_song"}>
            <Show when={!props.hideStatus}>
              <LyricsStatus type="local_song" message={t("lyrics.status.localSong")} />
            </Show>
          </Match>

          <Match when={response()?.status !== "success"}>
            <Show when={!props.hideStatus}>
              <LyricsStatus type="error" message={t("lyrics.status.error")} />
            </Show>
          </Match>

          <Match when={response()?.status === "success" && response()?.data}>
            {(data) => {
              const d = data();

              if (d.Type !== "Syllable" && d.Type !== "Line" && d.Type !== "Static") {
                return (
                  <Show when={!props.hideStatus}>
                    <LyricsStatus type="missing" message={t("lyrics.status.unsupported")} />
                  </Show>
                );
              }

              let content: JSXElement;
              switch (d.Type) {
                case "Syllable":
                  content = <SyllableLyrics lyrics={d} widgetHidden={props.widgetHidden} />;
                  break;
                case "Line":
                  content = <LineLyrics lyrics={d} widgetHidden={props.widgetHidden} />;
                  break;
                case "Static":
                  content = <StaticLyrics lyrics={d} />;
                  break;
              }

              return (
                <LyricsSpacer>
                  {content}
                  <Show when={props.showCredits}>
                    <LyricsCredits lyrics={d} />
                  </Show>
                </LyricsSpacer>
              );
            }}
          </Match>
        </Switch>
      </Suspense>
    </SolidLenis>
  );
}

export default Lyrics;
