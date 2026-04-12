import "~/styles/component/tippy.scss";
import {
  type ComponentProps,
  type JSXElement,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";

export interface TippyProps extends ComponentProps<"span"> {
  title?: string;
  children: JSXElement;
  delay?: number;
  hideDelay?: number;
  offset?: number;
  interactive?: boolean;
}

const ROOT_ID = "lucid-tippy-root";

function getTippyRoot(): HTMLDivElement {
  let root = document.getElementById(ROOT_ID) as HTMLDivElement;
  if (!root) {
    root = document.createElement("div");
    root.id = ROOT_ID;
    document.body.appendChild(root);
  }
  return root;
}

export function Tippy(props: TippyProps) {
  const [local, others] = splitProps(props, [
    "title",
    "children",
    "delay",
    "hideDelay",
    "offset",
    "interactive",
  ]);
  const [visible, setVisible] = createSignal(false);
  const [coords, setCoords] = createSignal({ placement: "top", x: 0, y: 0 });

  let triggerRef: HTMLSpanElement | undefined;
  let tooltipRef: HTMLDivElement | undefined;
  let timer: ReturnType<typeof setTimeout>;

  const updatePosition = () => {
    if (!triggerRef || !tooltipRef) return;

    const triggerRect = triggerRef.getBoundingClientRect();
    const tooltipRect = tooltipRef.getBoundingClientRect();
    const margin = local.offset ?? 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let placement = "top";
    let y = triggerRect.top - tooltipRect.height - margin;

    if (y < 0) {
      y = triggerRect.bottom + margin;
      placement = "bottom";
    } else if (placement === "bottom" && y + tooltipRect.height > viewportHeight) {
      y = triggerRect.top - tooltipRect.height - margin;
      placement = "top";
    }

    let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    if (x < margin) {
      x = margin;
    } else if (x + tooltipRect.width > viewportWidth - margin) {
      x = viewportWidth - tooltipRect.width - margin;
    }

    setCoords({ placement, x: x + window.scrollX, y: y + window.scrollY });
  };

  createEffect(() => {
    if (visible()) {
      requestAnimationFrame(updatePosition);
      window.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("resize", updatePosition);
    } else {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    }
  });

  const handleShow = () => {
    clearTimeout(timer);
    if (visible()) return;
    timer = setTimeout(() => setVisible(true), local.delay ?? 150);
  };

  const handleHide = () => {
    clearTimeout(timer);
    timer = setTimeout(() => setVisible(false), local.hideDelay ?? 100);
  };

  onCleanup(() => {
    clearTimeout(timer);
    window.removeEventListener("scroll", updatePosition);
    window.removeEventListener("resize", updatePosition);
  });

  return (
    <span
      ref={triggerRef}
      onMouseEnter={handleShow}
      onMouseLeave={handleHide}
      class="tippy-trigger"
      {...others}
    >
      {local.children}

      <Show when={visible() && local.title}>
        <Portal mount={getTippyRoot()}>
          <div
            ref={tooltipRef}
            class="lucid-tippy"
            role="tooltip"
            onMouseEnter={handleShow}
            onMouseLeave={handleHide}
            data-placement={coords().placement}
            classList={{ "lucid-tippy--visible": visible() }}
            style={{
              left: `${coords().x}px`,
              "pointer-events": local.interactive ? "auto" : "none",
              position: "absolute",
              top: `${coords().y}px`,
              "user-select": local.interactive ? "auto" : "none",
              visibility: coords().x === 0 ? "hidden" : "visible",
            }}
          >
            {local.title}
          </div>
        </Portal>
      </Show>
    </span>
  );
}
