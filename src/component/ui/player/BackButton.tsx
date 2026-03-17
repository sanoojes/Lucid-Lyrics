import { Button } from "@/component/ui/Button";
import { prev } from "@/lib/spotify/player";
import { SkipBack } from "lucide-solid";

const BackButton = () => {
  return (
    <Button variant="ghost" size="icon" class="l-btn" onClick={prev}>
      <SkipBack size={20} fill="currentColor" />
    </Button>
  );
};

export default BackButton;
