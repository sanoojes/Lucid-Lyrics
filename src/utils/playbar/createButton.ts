import { logger } from '@/lib/logger.ts';
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

export async function createButton(props: ButtonProps, prepend = true): Promise<ButtonAPI | null> {
  return waitForElement('.main-nowPlayingBar-right .main-nowPlayingBar-extraControls')
    .then((rightContainer) => {
      if (!rightContainer) {
        logger.error('Could not find the player container.');
        return null;
      }

      const { label, onClick = () => {} } = props;

      const element = document.createElement('button');
      element.className = 'main-genericButton-button';
      if (props.className) element.classList.add(props.className);
      if (!prepend) element.style.order = '9999';

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
          rightContainer[prepend ? 'prepend' : 'append'](element);
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
