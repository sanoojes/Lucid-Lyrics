import "@/styles/component/controls.scss";
import ControlButton from "@/component/ui/player/ControlButton";
import ForwardButton from "@/component/ui/player/ForwardButton";
import BackButton from "@/component/ui/player/BackButton";
import ShuffleButton from "@/component/ui/player/ShuffleButton";
import RepeatButton from "@/component/ui/player/RepeatButton";

const Controls = () => {
  return (
    <div class="controls">
      <div class="controls--left">
        <ShuffleButton />
        <BackButton />
      </div>
      <ControlButton />
      <div class="controls--right">
        <ForwardButton />
        <RepeatButton />
      </div>
    </div>
  );
};

export default Controls;
