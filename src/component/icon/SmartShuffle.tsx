import { type Component, type ComponentProps, splitProps } from "solid-js";

type SmartShuffleProps = ComponentProps<"svg"> & {
  size?: number | string;
};

const SmartShuffle: Component<SmartShuffleProps> = (props) => {
  const [local, others] = splitProps(props, ["size"]);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={local.size ?? 24}
      height={local.size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      {...others}
      class={`lucide lucide-shuffle-smart ${others.class ?? ""}`}
    >
      <path d="m18 14 4 4-4 4m0-20 4 4-4 4" />
      <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22m0 12h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
      <path
        d="M5.502 1a.637.637 0 0 1 .634.58 4.84 4.84 0 0 0 .81 2.184c.515.739 1.297 1.356 2.487 1.486a.637.637 0 0 1 0 1.267c-1.19.13-1.972.747-2.487 1.487a4.8 4.8 0 0 0-.81 2.185.637.637 0 0 1-1.268 0 4.8 4.8 0 0 0-.81-2.185C3.543 7.265 2.76 6.648 1.57 6.518a.637.637 0 0 1 0-1.268c1.19-.13 1.972-.747 2.487-1.486a4.84 4.84 0 0 0 .81-2.185A.637.637 0 0 1 5.502 1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
};

export default SmartShuffle;
