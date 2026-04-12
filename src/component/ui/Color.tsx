import type { Component } from "solid-js";
import "~/styles/component/color.scss";

interface ColorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Color: Component<ColorProps> = (props) => {
  return (
    <div class="color">
      <input
        type="color"
        class="color__input"
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
      />
      <span class="color__value">{props.value}</span>
    </div>
  );
};
