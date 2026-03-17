import { SkipForward } from "lucide-solid";
import { Button } from "@/component/ui/Button";
import { next } from "@/lib/spotify/player";

const ForwardButton = () => {
  return (
    <Button variant="ghost" size="icon" class="l-btn" onClick={next}>
      <SkipForward size={20} fill="currentColor" />
    </Button>
  );
};

export default ForwardButton;
