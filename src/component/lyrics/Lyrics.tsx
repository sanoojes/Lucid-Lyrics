import { lyricsResource, lyricsResourceAction } from "@/api/solid";
import { t } from "@/i18n";
import { Switch, Match, Suspense, createMemo, createEffect, on } from "solid-js";

import LyricsLoader from "@/component/lyrics/Loader";
import LineLyrics from "@/component/lyrics/line/LineLyrics";
import StaticLyrics from "@/component/lyrics/static/StaticLyrics";
import LyricsStatus from "@/component/lyrics/LyricsStatus";
import SyllableLyrics from "@/component/lyrics/syllable/SyllableLyrics";
import SolidLenis from "@/component/ui/Lenis";
import { $is_active_visible } from "@/stores";

type LyricsProps = {
  widgetHidden: boolean;
};
function Lyrics(props: LyricsProps) {
  const response = createMemo(() => lyricsResource());
  const lyricsData = createMemo(() => response()?.data);
  const handleRetry = () => lyricsResourceAction.refetch();
  const widgetHidden = () => props.widgetHidden;

  createEffect(
    on(response, () => {
      $is_active_visible.set(true);
    }),
  );

  return (
    <SolidLenis
      class="lyrics-area"
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
          <Match when={response()?.status === "success" && lyricsData()}>
            {(data) => {
              const d = data();
              switch (d.Type) {
                case "Syllable":
                  return <SyllableLyrics lyrics={d} widgetHidden={widgetHidden()} />;
                case "Line":
                  return <LineLyrics lyrics={d} widgetHidden={widgetHidden()} />;
                case "Static":
                  return <StaticLyrics lyrics={d} />;
                default:
                  return <LyricsStatus type="missing" message={t("lyrics.status.unsupported")} />;
              }
            }}
          </Match>
        </Switch>
      </Suspense>
    </SolidLenis>
  );
}

export default Lyrics;
