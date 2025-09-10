export default function seekTo(progress: number) {
  try {
    Spicetify?.Player?.seek(progress);
    // Spicetify?.Player?.play();
  } catch {}
}
