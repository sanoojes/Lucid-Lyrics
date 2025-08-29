import { waitForElement } from '@utils/dom';

type ButtonProps = {
  label: string;
  icon: string;
  onClick?: (buttonApi: ButtonAPI) => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
};

type ButtonAPI = {
  element: HTMLButtonElement;
  update: (newProps: Partial<ButtonProps>) => void;
  register: () => void;
  deregister: () => void;
};

export function createButton(props: ButtonProps): Promise<ButtonAPI | null> {
  return waitForElement('.main-nowPlayingBar-right > div')
    .then((rightContainer) => {
      if (!rightContainer) {
        console.error(
          "Spicetify: Could not find the button container '.main-nowPlayingBar-right > div'."
        );
        return null;
      }

      const { label, onClick = () => {} } = props;

      const element = document.createElement('button');
      element.className = `main-genericButton-button ${props.className ?? ''}`;

      Spicetify?.Tippy?.(element, {
        content: label,
        ...Spicetify?.TippyProps,
      });

      const iconElement = document.createElement('span');
      iconElement.className = 'Wrapper-sm-only Wrapper-small-only';
      element.appendChild(iconElement);

      const currentProps = { ...props };

      const applyProps = (props: Partial<ButtonProps>) => {
        if (props.label) {
          element.setAttribute('aria-label', props.label);
          element.setAttribute('title', props.label);
        }
        if (props.icon) {
          iconElement.innerHTML = props.icon;
        }

        const isDisabled = !!props.disabled;
        element.disabled = isDisabled;
        element.classList.toggle('disabled', isDisabled);

        const isActive = !!props.active;
        element.classList.toggle('main-genericButton-buttonActive', isActive);
        element.classList.toggle('main-genericButton-buttonActiveDot', isActive);
      };

      const api: ButtonAPI = {
        element,
        update: (newProps) => {
          Object.assign(currentProps, newProps);
          applyProps(currentProps);
        },
        register: () => {
          rightContainer.prepend(element);
        },
        deregister: () => {
          element.remove();
        },
      };

      element.onclick = () => onClick?.(api);

      applyProps(currentProps);

      return api;
    })
    .catch(() => null);
}
