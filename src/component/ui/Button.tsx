import { type ComponentProps, splitProps, Show } from "solid-js";

import "~/styles/component/button.scss";
import { Tippy } from "~/component/ui/Tippy";

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "glass"
  | "link"
  | "simple";

type Size = "default" | "sm" | "lg" | "icon" | "icon-sm";

type Shape = "default" | "rounded" | "square";

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  shape?: Shape;
  active?: boolean;
  title?: string;
  hide?: boolean;
};

export function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, [
    "variant",
    "size",
    "shape",
    "active",
    "class",
    "classList",
    "title",
    "hide",
  ]);

  const buttonElement = (
    <button
      class="l-btn"
      classList={{
        [`l-btn--${local.variant ?? "default"}`]: true,
        [`l-btn--${local.size ?? "default"}`]: true,
        [`l-btn--${local.shape}`]: !!local.shape && local.shape !== "default",
        "l-btn--active": !!local.active,
        ...(local.class ? { [local.class]: true } : {}),
        ...local.classList,
      }}
      {...others}
    />
  );

  return (
    <Show when={!local.hide}>
      <Show when={local.title} fallback={buttonElement}>
        {(title) => <Tippy title={title()}>{buttonElement}</Tippy>}
      </Show>
    </Show>
  );
}
