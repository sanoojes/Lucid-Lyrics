import type { Lyrics } from "~/lib/api/types";

export type BuildOptions = {
  mode?: "amll" | "apple";
};

export const BUILD_TIME_MULTIPLIERS: Record<NonNullable<BuildOptions["mode"]>, number> = {
  amll: 1,
  apple: 60,
};

export const formatTime = (totalSeconds: number | undefined): string => {
  if (typeof totalSeconds !== "number" || isNaN(totalSeconds) || totalSeconds < 0) {
    return "00:00.000";
  }
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  const ms = Math.round((totalSeconds % 1) * 1000);

  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
};

export function hasOppositeAligned(data: Lyrics): boolean {
  if (data.Type === "Line" || data.Type === "Syllable") {
    return data.Content?.some((line) => line.OppositeAligned) ?? false;
  }
  return false;
}

export function buildStaticBody(data: import("~/lib/api/types").StaticData) {
  return { div: { p: data.Lines?.map((line) => line.Text || "") || [] } };
}

export function buildLineBody(data: import("~/lib/api/types").LineData, timeScale: number) {
  return {
    "@_dur": formatTime((data.EndTime ?? 0) * timeScale),
    div: {
      "@_begin": formatTime((data.StartTime ?? 0) * timeScale),
      "@_end": formatTime((data.EndTime ?? 0) * timeScale),
      p:
        data.Content?.map((line, index) => ({
          "#text": line.Text || "",
          "@_begin": formatTime((line.StartTime ?? 0) * timeScale),
          "@_end": formatTime((line.EndTime ?? 0) * timeScale),
          "@_itunes:key": `L${index + 1}`,
          "@_ttm:agent": line.OppositeAligned ? "v2" : "v1",
        })) || [],
    },
  };
}
