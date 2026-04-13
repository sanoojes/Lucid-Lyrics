import { type ComponentProps, splitProps } from "solid-js";
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
  const [local, others] = splitProps(props, ["variant", "size", "shape", "class", "title", "hide"]);
  if (local.hide !== undefined) return null;

  const variant = () => local.variant ?? "default";
  const size = () => local.size ?? "default";
  const shape = () => local.shape ?? "default";

  const classes = () =>
    [
      "l-btn",
      `l-btn--${variant()}`,
      `l-btn--${size()}`,
      shape() !== "default" ? `l-btn--${shape()}` : "",
      props.active ? `l-btn--active` : "",
      local.class,
    ]
      .filter(Boolean)
      .join(" ");

  if (local.title) {
    return (
      <Tippy title={local.title}>
        <button class={classes()} {...others} />
      </Tippy>
    );
  }

  return <button class={classes()} {...others} />;
}
