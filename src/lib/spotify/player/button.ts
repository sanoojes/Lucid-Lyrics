import { waitForElement } from "@/lib/dom/wait";

export type ButtonProps = {
  label: string;
  icon: string;
  onClick?: (api: PlayerButtonAPI) => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
};

export type PlayerButtonAPI = {
  element: HTMLButtonElement;
  update: (props: Partial<ButtonProps>) => void;
  register: () => void;
  deregister: () => void;
};

export async function createButton(props: ButtonProps, prepend = true): Promise<PlayerButtonAPI> {
  const rightContainer = await waitForElement(
    ".main-nowPlayingBar-right .main-nowPlayingBar-extraControls",
    { timeout: 99999 },
  );

  if (!rightContainer) throw new Error("Could not find the player container.");

  const state = { ...props };
  const element = document.createElement("button");

  element.className = `main-genericButton-button l-player-btn ${props.className || ""}`;
  if (!prepend) element.style.order = "9999";
  element.setAttribute("aria-label", props.label);

  const tippyInstance = Spicetify?.Tippy?.(element, {
    content: props.label,
    ...Spicetify?.TippyProps,
  });

  const iconElement = document.createElement("span");
  iconElement.className = "Wrapper-sm-only Wrapper-small-only l-player-btn__wrapper";
  iconElement.innerHTML = props.icon;
  element.appendChild(iconElement);

  const update = (next: Partial<ButtonProps>) => {
    if (next.label !== undefined && next.label !== state.label) {
      state.label = next.label;
      element.setAttribute("aria-label", state.label);
      tippyInstance?.setContent(state.label);
    }

    if (next.icon !== undefined && next.icon !== state.icon) {
      state.icon = next.icon;
      iconElement.innerHTML = state.icon;
    }

    if (next.disabled !== undefined && next.disabled !== state.disabled) {
      state.disabled = !!next.disabled;
      element.disabled = state.disabled;
      element.classList.toggle("disabled", state.disabled);
    }

    if (next.active !== undefined && next.active !== state.active) {
      state.active = !!next.active;
      element.classList.toggle("main-genericButton-buttonActive", state.active);
      element.classList.toggle("main-genericButton-buttonActiveDot", state.active);
    }

    if (next.onClick !== undefined) state.onClick = next.onClick;
  };

  const api: PlayerButtonAPI = {
    element,
    update,
    register: () => {
      rightContainer[prepend ? "prepend" : "append"](element);
    },
    deregister: () => {
      tippyInstance?.destroy();
      element.remove();
    },
  };

  element.onclick = () => state.onClick?.(api);
  if (state.active || state.disabled) update(state);

  return api;
}
