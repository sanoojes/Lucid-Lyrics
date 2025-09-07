export default function seekTo(progress: number) {
  try {
    Spicetify?.Player?.seek(progress * 1000);
    // Spicetify?.Player?.play();
  } catch {}
}
