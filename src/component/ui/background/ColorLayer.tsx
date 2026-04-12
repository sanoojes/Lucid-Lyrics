import { useStore } from "@nanostores/solid";
import { $color_options } from "~/stores";

const ColorLayer = () => {
  const color = useStore($color_options);

  return <div class="bg-color" style={{ "background-color": color() }} aria-hidden />;
};

export default ColorLayer;
