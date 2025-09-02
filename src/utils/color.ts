import { Vibrant } from 'node-vibrant/browser';

export type ColorPalette = {
  Vibrant: string;
  Muted: string;
  DarkVibrant: string;
  DarkMuted: string;
  LightVibrant: string;
  LightMuted: string;
};

export async function getColorsFromImage(url: string): Promise<ColorPalette> {
  const img = new Image();

  if (!url.startsWith('spotify:')) {
    img.crossOrigin = 'anonymous';
  }

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });

  const vibrant = new Vibrant(img);
  const palette = await vibrant.getPalette();

  return {
    Vibrant: palette.Vibrant?.hex || '#000000',
    Muted: palette.Muted?.hex || '#000000',
    DarkVibrant: palette.DarkVibrant?.hex || '#000000',
    DarkMuted: palette.DarkMuted?.hex || '#000000',
    LightVibrant: palette.LightVibrant?.hex || '#000000',
    LightMuted: palette.LightMuted?.hex || '#000000',
  };
}
