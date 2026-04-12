import type { Component } from "solid-js";
import "~/styles/component/toggle.scss";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: Component<ToggleProps> = (props) => {
  return (
    <label class="toggle">
      <input
        id="l-toggle"
        type="checkbox"
        checked={props.checked}
        onChange={(e) => props.onChange(e.currentTarget.checked)}
      />
      <span class="toggle__slider" />
    </label>
  );
};
