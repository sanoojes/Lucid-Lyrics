import type { Component } from "solid-js";
import { For } from "solid-js";
import "@/styles/component/select.scss";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[] | SelectOption[];
}

export const Select: Component<SelectProps> = (props) => {
  return (
    <div class="select-container">
      <select value={props.value} onInput={(e) => props.onChange(e.currentTarget.value)}>
        <For each={props.options}>
          {(option) => <option value={option.value}>{option.label}</option>}
        </For>
      </select>
      <svg
        class="select__icon"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
};
