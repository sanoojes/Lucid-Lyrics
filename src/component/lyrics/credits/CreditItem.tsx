import { type JSXElement } from "solid-js";

type CreditItemProps = {
  label: string;
  class?: string;
  children: JSXElement;
};

export function CreditItem(props: CreditItemProps) {
  return (
    <p class={`credit-item ${props.class ?? ""}`.trim()}>
      <span class="credit-label">{props.label}:</span> {props.children}
    </p>
  );
}
