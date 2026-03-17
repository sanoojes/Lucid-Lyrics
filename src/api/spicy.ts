import { sendSpicyRequest } from "@/lib/api/spicy";
import type { Lyrics, APIResponse, FetchOptions } from "@/lib/api/types";
import { getAuthToken } from "@/lib/spotify";

export async function fetchSpicy({ id }: FetchOptions): Promise<APIResponse<Lyrics>> {
  try {
    const response = await _fetchSpicy(id);
    const queryResult = response?.queries?.[0];

    if (!response || !queryResult) {
      return {
        status: "error",
        data: null,
        error: { code: "FETCH_FAILED", message: "Network or Validation failed" },
      };
    }

    const {
      result: { data: lyricData, httpStatus },
    } = queryResult;

    const isMissing =
      httpStatus === 404 || ("error" in lyricData && lyricData.error === "MISSING_LYRICS");

    if (isMissing) {
      return { status: "missing_lyrics", data: null };
    }

    if (httpStatus !== 200 || "error" in lyricData) {
      return {
        status: "error",
        data: null,
        error: { code: "PROVIDER_FAILED", message: "Unexpected Error from Spicy" },
      };
    }
    const data = lyricData;
    data.Provider = "spicy";
    return { status: "success", data };
  } catch (err) {
    return {
      status: "error",
      data: null,
      error: {
        code: "FETCH_FAILED",
        message: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

type LyricsError = {
  error: string;
  message?: string;
  code?: number;
};

type LyricsResult = {
  format: "json";
} & ({ httpStatus: 200; data: Lyrics } | { httpStatus: 401 | 403 | 404 | 500; data: LyricsError });

type SpicyQuery = {
  operation: "lyrics";
  operationId: string;
  result: LyricsResult;
};

type SpicyResponse = {
  queries: SpicyQuery[];
};

type SpicyVariables = {
  id: string;
  auth: "SpicyLyrics-WebAuth";
};

type SpicyRequestPayload = {
  operation: "lyrics";
  variables: SpicyVariables;
};

export async function _fetchSpicy(id: string): Promise<SpicyResponse> {
  const token = await getAuthToken();
  const bearerToken = `Bearer ${token}`;

  const payload: SpicyRequestPayload[] = [
    {
      operation: "lyrics",
      variables: {
        id,
        auth: "SpicyLyrics-WebAuth",
      },
    },
  ];

  return await sendSpicyRequest(payload, bearerToken);
}
