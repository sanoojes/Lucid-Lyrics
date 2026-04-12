import { clear, del, entries, get, set } from "idb-keyval";
import { imageStore } from "~/stores/idb";

export interface LocalImage {
  id: string;
  name: string;
  type: string;
  blob: Blob;
  thumbnail?: Blob;
  createdAt: number;
  thumbnailFailed?: boolean;
}

export interface ImageManifestEntry {
  id: string;
  createdAt: number;
}

const IMAGE_KEY_PREFIX = "img_";
const MANIFEST_KEY = "image_manifest";

async function createThumbnail(
  file: Blob,
  size = 200,
): Promise<{ blob: Blob | undefined; failed: boolean }> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const bmp = await createImageBitmap(file);
    const scale = Math.max(size / bmp.width, size / bmp.height);
    const w = bmp.width * scale;
    const h = bmp.height * scale;
    ctx.drawImage(bmp, (size - w) / 2, (size - h) / 2, w, h);
    bmp.close();

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob([], { type: "image/webp" })), "image/webp", 0.8);
    });

    return { blob, failed: false };
  } catch {
    return { blob: undefined, failed: true };
  }
}

async function retryThumbnailIfNeeded(image: LocalImage): Promise<LocalImage> {
  if (image.thumbnailFailed) {
    const { blob, failed } = await createThumbnail(image.blob);

    if (!failed) {
      image.thumbnail = blob;
      image.thumbnailFailed = false;
      await set(`${IMAGE_KEY_PREFIX}${image.id}`, image, imageStore);
    } else {
      image.thumbnail = blob;
    }
  }
  return image;
}

export async function saveLocalImage(file: File): Promise<LocalImage> {
  const id = crypto.randomUUID();

  const { blob: thumbnail, failed } = await createThumbnail(file);

  const image: LocalImage = {
    blob: file,
    createdAt: Date.now(),
    id,
    name: file.name,
    thumbnail,
    thumbnailFailed: failed,
    type: file.type,
  };

  await set(`${IMAGE_KEY_PREFIX}${id}`, image, imageStore);

  const manifest = (await get<ImageManifestEntry[]>(MANIFEST_KEY, imageStore)) || [];
  manifest.push({ createdAt: image.createdAt, id });
  manifest.sort((a, b) => a.createdAt - b.createdAt);
  await set(MANIFEST_KEY, manifest, imageStore);

  return image;
}

export async function getLocalImage(id: string): Promise<LocalImage | undefined> {
  const image = await get<LocalImage>(`${IMAGE_KEY_PREFIX}${id}`, imageStore);
  if (!image) return undefined;
  return retryThumbnailIfNeeded(image);
}

export async function getAdjacentLocalImage(
  currentId: string,
  direction: "next" | "prev" = "next",
): Promise<LocalImage | undefined> {
  const manifest = (await get<ImageManifestEntry[]>(MANIFEST_KEY, imageStore)) || [];

  if (manifest.length === 0) return undefined;

  const currentIndex = manifest.findIndex((entry) => entry.id === currentId);

  if (currentIndex === -1) {
    return await getLocalImage(manifest[0].id);
  }

  let targetIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

  if (targetIndex >= manifest.length) {
    targetIndex = 0;
  } else if (targetIndex < 0) {
    targetIndex = manifest.length - 1;
  }

  const targetId = manifest[targetIndex].id;
  return await getLocalImage(targetId);
}

export async function getRandomLocalImage(excludeId?: string): Promise<LocalImage | undefined> {
  const manifest = (await get<ImageManifestEntry[]>(MANIFEST_KEY, imageStore)) || [];

  const availableImages = excludeId ? manifest.filter((entry) => entry.id !== excludeId) : manifest;

  if (availableImages.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * availableImages.length);
  const randomId = availableImages[randomIndex].id;

  return await getLocalImage(randomId);
}

export async function getAllLocalImages(): Promise<LocalImage[]> {
  const allEntries = await entries(imageStore);

  const images = allEntries
    .filter(([key]) => typeof key === "string" && key.startsWith(IMAGE_KEY_PREFIX))
    .map(([, value]) => value as LocalImage);

  const results = await Promise.all(images.map((image) => retryThumbnailIfNeeded(image)));
  const sortedResults = results.sort((a, b) => a.createdAt - b.createdAt);
  const updatedManifest: ImageManifestEntry[] = sortedResults.map((img) => ({
    createdAt: img.createdAt,
    id: img.id,
  }));
  await set(MANIFEST_KEY, updatedManifest, imageStore);

  return sortedResults;
}

export async function deleteLocalImage(id: string): Promise<void> {
  await del(`${IMAGE_KEY_PREFIX}${id}`, imageStore);
  let manifest = (await get<ImageManifestEntry[]>(MANIFEST_KEY, imageStore)) || [];
  manifest = manifest.filter((entry) => entry.id !== id);
  await set(MANIFEST_KEY, manifest, imageStore);
}

export async function deleteAllLocalImages(): Promise<void> {
  await clear(imageStore);
}

export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokeBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}
