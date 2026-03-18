import { lyricsResource, lyricsResourceAction } from "@/api/solid";
import { t } from "@/i18n";
import {
  Switch,
  Match,
  Suspense,
  createMemo,
  createEffect,
  on,
  type JSXElement,
  children,
  Show,
} from "solid-js";

import LyricsLoader from "@/component/lyrics/Loader";
import LineLyrics from "@/component/lyrics/line/LineLyrics";
import StaticLyrics from "@/component/lyrics/static/StaticLyrics";
import LyricsStatus from "@/component/lyrics/LyricsStatus";
import SyllableLyrics from "@/component/lyrics/syllable/SyllableLyrics";
import SolidLenis from "@/component/ui/Lenis";
import { useRenderer } from "@/context/LyricsRenderer";
import LyricsCredits from "@/component/lyrics/LyricsCredits";

type LyricsProps = {
  widgetHidden: boolean;
  showCredits: boolean;
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
      options={{
        lerp: 0.08,
      }}
    >
      <Suspense fallback={<LyricsLoader />}>
        <Switch fallback={<LyricsStatus type="missing" message={t("lyrics.status.missing")} />}>
          <Match when={lyricsResource.loading}>
            <LyricsLoader />
          </Match>

          <Match when={response()?.status === "offline"}>
            <LyricsStatus
              type="offline"
              message={t("lyrics.status.offline")}
              desc={t("lyrics.status.offlineDesc")}
              onRetry={handleRetry}
            />
          </Match>

          <Match when={response()?.status === "missing_lyrics"}>
            <LyricsStatus type="missing" message={t("lyrics.status.missing")} />
          </Match>

          <Match when={response()?.status === "error" || response()?.status === "malformed"}>
            <LyricsStatus
              type="error"
              message={response()?.error?.message || t("lyrics.status.error")}
              code={response()?.error?.code}
              onRetry={handleRetry}
            />
          </Match>

          <Match when={response()?.status === "success" && response()?.data}>
            {(data) => {
              const d = data();

              if (d.Type !== "Syllable" && d.Type !== "Line" && d.Type !== "Static") {
                return <LyricsStatus type="missing" message={t("lyrics.status.unsupported")} />;
              }

              return (
                <LyricsSpacer>
                  {(() => {
                    switch (d.Type) {
                      case "Syllable":
                        return <SyllableLyrics lyrics={d} widgetHidden={props.widgetHidden} />;
                      case "Line":
                        return <LineLyrics lyrics={d} widgetHidden={props.widgetHidden} />;
                      case "Static":
                        return <StaticLyrics lyrics={d} />;
                    }
                  })()}
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
