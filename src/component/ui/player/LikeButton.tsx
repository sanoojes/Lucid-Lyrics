import { Heart } from "lucide-solid";
import { useStore } from "@nanostores/solid";
import { $liked_state } from "@/stores";
import { toggleLiked } from "@/lib/spotify/player";
import { t } from "@/i18n";

const LikeButton = () => {
  const isLiked = useStore($liked_state);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLiked();
  };

  return (
    <button
      class="btn--like"
      classList={{
        "btn--active": isLiked(),
      }}
      onClick={handleClick}
      aria-label={isLiked() ? t("player.removeFromLibrary") : t("player.saveToLibrary")}
    >
      <Heart size="100%" fill={isLiked() ? "currentColor" : "none"} stroke-width={0.5} />
    </button>
  );
};

export default LikeButton;
