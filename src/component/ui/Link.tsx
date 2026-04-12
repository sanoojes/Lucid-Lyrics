import { type ComponentProps, type JSXElement, splitProps } from "solid-js";

interface LinkProps extends ComponentProps<"span"> {
  children: JSXElement;
  href?: string;
}

const Link = (props: LinkProps) => {
  const [local, others] = splitProps(props, ["children", "href"]);

  return (
    <a href={local.href}>
      <span {...others}>{local.children}</span>
    </a>
  );
};

export default Link;
