import type { Component } from "solid-js";
import "@/styles/component/slider.scss";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  format?: (value: number) => string;
}

export const Slider: Component<SliderProps> = (props) => {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const step = () => props.step ?? 1;

  const displayValue = () => {
    const val = props.value;
    if (props.format) return props.format(val);
    return props.suffix ? `${val}${props.suffix}` : val.toString();
  };

  return (
    <div class="slider">
      <input
        type="range"
        class="slider__input"
        value={props.value}
        min={min()}
        max={max()}
        step={step()}
        onInput={(e) => props.onChange(Number(e.currentTarget.value))}
      />
      <span class="slider__value">{displayValue()}</span>
    </div>
  );
};
