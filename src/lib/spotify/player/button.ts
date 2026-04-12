import { render } from "solid-js/web";
import { waitForElement } from "~/lib/dom/wait";
import { atom } from "nanostores";
import type { JSXElement } from "solid-js";

export type ButtonProps = {
  label: string;
  icon: string | JSXElement;
  onClick?: (api: PlayerButtonAPI) => void;
  onMount?: (api: PlayerButtonAPI) => void;
  onUnmount?: (api: PlayerButtonAPI) => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  order?: number;
};

export type ButtonOptions = {
  placement?: "start" | "end";
  autoRegister?: boolean;
};

export type PlayerButtonAPI = {
  element: HTMLButtonElement;
  update: (props: Partial<ButtonProps>) => void;
  register: () => void;
  deregister: () => void;
  destroy: () => void;
};

interface TippyInstance {
  setContent: (content: string) => void;
  destroy: () => void;
}

export async function createButton(
  props: ButtonProps,
  options?: ButtonOptions,
): Promise<PlayerButtonAPI> {
  const opts = { autoRegister: true, placement: "start", ...options };
  const isPrepend = opts.placement === "start";

  const rightContainer = await waitForElement(
    ".main-nowPlayingBar-right .main-nowPlayingBar-extraControls",
    { timeout: 99999 },
  );

  if (!rightContainer) {
    throw new Error("Could not find the player container.");
  }

  const stateStore = atom<ButtonProps>(props);

  let isMounted = false;
  let disposeIcon: (() => void) | undefined;
  let tippyInstance: TippyInstance | undefined;

  const element = document.createElement("button");
  element.className = "main-genericButton-button l-player-btn";

  const initialClass = stateStore.get().className;
  if (initialClass) {
    element.classList.add(...initialClass.split(" ").filter(Boolean));
  }

  const iconElement = document.createElement("span");
  iconElement.className = "l-player-btn__wrapper";
  element.appendChild(iconElement);

  const applyIcon = (icon: string | JSXElement) => {
    disposeIcon?.();
    disposeIcon = undefined;
    iconElement.innerHTML = "";

    if (typeof icon === "string") {
      iconElement.innerHTML = icon;
    } else {
      disposeIcon = render(() => icon, iconElement);
    }
  };

  let prevState: Partial<ButtonProps> = {};
  const unsubscribe = stateStore.subscribe((nextState) => {
    if (nextState.label !== prevState.label) {
      element.setAttribute("aria-label", nextState.label);
      tippyInstance?.setContent(nextState.label);
    }

    if (nextState.icon !== prevState.icon && isMounted) {
      applyIcon(nextState.icon);
    }

    if (nextState.disabled !== prevState.disabled) {
      const isDisabled = !!nextState.disabled;
      element.disabled = isDisabled;
      element.classList.toggle("disabled", isDisabled);
    }

    if (nextState.active !== prevState.active) {
      const isActive = !!nextState.active;
      element.classList.toggle("main-genericButton-buttonActive", isActive);
      element.classList.toggle("main-genericButton-buttonActiveDot", isActive);
    }

    if (nextState.order !== prevState.order) {
      element.style.order =
        nextState.order !== undefined ? nextState.order.toString() : isPrepend ? "" : "9999";
    }

    prevState = { ...nextState };
  });

  const api: PlayerButtonAPI = {
    deregister: () => {
      if (!isMounted) return;
      const currentState = stateStore.get();
      currentState.onUnmount?.(api);

      tippyInstance?.destroy();
      tippyInstance = undefined;

      disposeIcon?.();
      disposeIcon = undefined;
      iconElement.innerHTML = "";

      element.remove();
      isMounted = false;
    },
    destroy: () => {
      api.deregister();
      unsubscribe();
    },
    element,
    register: () => {
      if (isMounted) return;
      const currentState = stateStore.get();

      if (!tippyInstance && typeof Spicetify !== "undefined" && Spicetify.Tippy) {
        tippyInstance = Spicetify.Tippy(element, {
          content: currentState.label,
          ...Spicetify.TippyProps,
        });
      }

      applyIcon(currentState.icon);

      if (isPrepend) {
        rightContainer.prepend(element);
      } else {
        rightContainer.append(element);
      }

      isMounted = true;
      currentState.onMount?.(api);
    },
    update: (next) => {
      stateStore.set({ ...stateStore.get(), ...next });
    },
  };

  element.addEventListener("click", () => {
    const currentState = stateStore.get();
    if (!currentState.disabled) currentState.onClick?.(api);
  });

  if (opts.autoRegister) {
    api.register();
  }

  return api;
}
