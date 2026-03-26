import { get, set, del, clear } from "idb-keyval";
import { ttmlStore } from "@/stores/idb";
import { parse, type ParseResult } from "@/lib/ttml/parser";
import type { TTMLMode } from "@/stores/ttml";

export interface LocalTTML {
  id: string;
  songId: string;
  songName: string;
  artistNames: string;
  albumName: string;
  rawTTML: string;
  parsedTTML: ParseResult;
  type: TTMLMode;
  createdAt: number;
  updatedAt: number;
}

const TTML_KEY_PREFIX = "ttml_";
const MANIFEST_KEY = "__ttml_manifest__";

export interface TTMLManifestEntry {
  id: string;
  songId: string;
  createdAt: number;
}

export interface SaveTTMLResult {
  ttml: LocalTTML;
  isOverwrite: boolean;
  parseError: string | null;
}

export async function saveLocalTTML(
  songId: string,
  songName: string,
  artistNames: string,
  albumName: string,
  file: File,
  type: TTMLMode = "apple",
): Promise<SaveTTMLResult> {
  const existingManifest = (await get<TTMLManifestEntry[]>(MANIFEST_KEY, ttmlStore)) || [];
  const existingEntry = existingManifest.find((e) => e.songId === songId);

  const id = existingEntry?.id ?? crypto.randomUUID();
  const createdAt = existingEntry?.createdAt ?? Date.now();
  const text = await file.text();
  const parsedTTML = parse(text, { mode: type });
  console.log(type, parsedTTML);

  let parseError: string | null = null;
  if (!parsedTTML.success) {
    parseError = parsedTTML.error;
  }

  const ttml: LocalTTML = {
    id,
    songId,
    songName,
    artistNames,
    albumName,
    rawTTML: text,
    parsedTTML,
    type,
    createdAt,
    updatedAt: Date.now(),
  };

  await set(`${TTML_KEY_PREFIX}${id}`, ttml, ttmlStore);

  let manifest = existingManifest.filter((e) => e.songId !== songId);
  manifest.push({ id, songId, createdAt });
  manifest.sort((a, b) => b.createdAt - a.createdAt);
  await set(MANIFEST_KEY, manifest, ttmlStore);

  return {
    ttml,
    isOverwrite: !!existingEntry,
    parseError,
  };
}

export async function getLocalTTML(id: string): Promise<LocalTTML | undefined> {
  const ttml = await get<LocalTTML>(`${TTML_KEY_PREFIX}${id}`, ttmlStore);
  return ttml;
}

export async function getLocalTTMLBySongId(songId: string): Promise<LocalTTML | undefined> {
  const manifest = (await get<TTMLManifestEntry[]>(MANIFEST_KEY, ttmlStore)) || [];
  const entry = manifest.find((e) => e.songId === songId);
  if (!entry) return undefined;
  return await getLocalTTML(entry.id);
}

export async function getAllLocalTTML(): Promise<LocalTTML[]> {
  const manifest = (await get<TTMLManifestEntry[]>(MANIFEST_KEY, ttmlStore)) || [];

  const ttmalResults = await Promise.all(
    manifest.map(async (entry) => {
      const ttml = await getLocalTTML(entry.id);
      return ttml;
    }),
  );

  const validTTML = ttmalResults.filter((t): t is LocalTTML => t !== undefined);
  return validTTML.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function deleteLocalTTML(id: string): Promise<void> {
  await del(`${TTML_KEY_PREFIX}${id}`, ttmlStore);
  let manifest = (await get<TTMLManifestEntry[]>(MANIFEST_KEY, ttmlStore)) || [];
  manifest = manifest.filter((entry) => entry.id !== id);
  await set(MANIFEST_KEY, manifest, ttmlStore);
}

export async function deleteLocalTTMLBySongId(songId: string): Promise<void> {
  const manifest = (await get<TTMLManifestEntry[]>(MANIFEST_KEY, ttmlStore)) || [];
  const entry = manifest.find((e) => e.songId === songId);
  if (entry) {
    await deleteLocalTTML(entry.id);
  }
}

export async function resetLocalTTML(): Promise<void> {
  await clear(ttmlStore);
}
