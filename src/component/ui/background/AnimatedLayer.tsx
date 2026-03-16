import { useStore } from "@nanostores/solid";
import { $animated_options } from "@/stores";

const AnimatedLayer = () => {
  const options = useStore($animated_options);

  return <div>{JSON.stringify(options())}</div>;
};
export default AnimatedLayer;
