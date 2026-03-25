import "@/styles/modal/alert.scss";
import { For, type JSXElement } from "solid-js";
import { createStore } from "solid-js/store";
import { Dialog, useDialog } from "@/lib/modal/component/Dialog";
import { render } from "solid-js/web";
import { logger } from "@/utils/logger";
import { Button } from "@/component/ui/Button";
import { t } from "@/i18n";
import { BadgeAlert, CircleAlert, ShieldAlert } from "lucide-solid";
export { useDialog };

type ModalItem = {
  id: string;
  render: () => JSXElement;
  isOpen: boolean;
};

const [modals, setModals] = createStore<ModalItem[]>([]);

export function showModal(render: () => JSXElement) {
  const id = crypto.randomUUID();

  setModals((prev) => [...prev, { id, render, isOpen: true }]);

  return {
    close: () => handleClose(id),
  };
}

export function handleClose(id: string) {
  setModals((m) => m.id === id, "isOpen", false);
  setTimeout(() => {
    setModals((prev) => prev.filter((m) => m.id === id));
  }, 300);
}

export function closeAllModals() {
  modals.forEach((m) => handleClose(m.id));
}

const DefaultIcons = {
  destructive: <BadgeAlert />,
  warning: <ShieldAlert />,
  default: <CircleAlert />,
} as const;

export type AlertOptions = {
  title: string;
  onConfirm?: () => void;
  variant?: "default" | "destructive" | "warning";
  description?: string;
  confirmLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  icon?: JSXElement;
};

export function showAlert(options: AlertOptions) {
  const {
    title,
    onConfirm,
    variant = "destructive",
    description,
    confirmLabel,
    secondaryAction,
    icon,
  } = options;

  const defaultIcon = DefaultIcons[variant];
  const displayIcon = icon ?? defaultIcon;

  return showModal(() => {
    const { close } = useDialog();

    const handleConfirm = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (onConfirm) onConfirm();
      close();
    };

    const handleSecondary = () => {
      if (secondaryAction?.onClick) secondaryAction.onClick();
      close();
    };

    const handleCloseClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      close();
    };

    return (
      <div class={`alert-modal alert-modal--${variant}`}>
        <div class="alert-icon">{displayIcon}</div>
        <h2 class="alert-title">{title}</h2>
        {description && <p class="alert-description">{description}</p>}
        <div class="alert-actions">
          <Button variant="glass" shape="rounded" size="lg" onClick={handleCloseClick}>
            {t("common.cancel")}
          </Button>
          {secondaryAction && (
            <Button variant="default" shape="rounded" size="lg" onClick={handleSecondary}>
              {secondaryAction.label}
            </Button>
          )}
          <Button
            variant={variant === "warning" ? "default" : variant}
            shape="rounded"
            size="lg"
            onClick={handleConfirm}
          >
            {confirmLabel || t("common.confirm")}
          </Button>
        </div>
      </div>
    );
  });
}

export function showLinkAlert(url: string, onOpen?: () => void) {
  return showAlert({
    title: t("alerts.externalLink.title"),
    onConfirm: onOpen,
    variant: "warning",
    description: t("alerts.externalLink.description", { url }),
    confirmLabel: t("alerts.externalLink.open"),
  });
}

export function ModalRoot() {
  return (
    <For each={modals}>
      {(modal) => (
        <Dialog isOpen={modal.isOpen} onClose={() => handleClose(modal.id)}>
          {modal.render()}
        </Dialog>
      )}
    </For>
  );
}

export function renderModalRoot(parent?: HTMLElement) {
  try {
    return render(() => <ModalRoot />, parent || document.body);
  } catch (e) {
    logger.error("failed_to_render_modal_root", e);
  }
}
