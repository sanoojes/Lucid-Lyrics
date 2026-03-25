import "@/styles/modal/alert.scss";
import { For, Show, type JSXElement } from "solid-js";
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

export function showModal(renderFunc: () => JSXElement) {
  const id = crypto.randomUUID();

  // Push to the end of the array to maintain proper DOM stacking order
  setModals((prev) => [...prev, { id, render: renderFunc, isOpen: true }]);

  return {
    id,
    close: () => handleClose(id),
  };
}

export function handleClose(id: string) {
  // 1. Trigger the exit animation by setting isOpen to false
  setModals((m) => m.id === id, "isOpen", false);
  
  // 2. Remove from DOM after animation completes (matched to 0.4s SCSS transition)
  setTimeout(() => {
    // FIXED: Use !== to keep the other modals and remove the closed one
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, 400); 
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
      e.stopPropagation();
      if (onConfirm) onConfirm();
      close();
    };

    const handleSecondary = (e: MouseEvent) => {
      e.stopPropagation();
      if (secondaryAction?.onClick) {
        secondaryAction.onClick();
      }
      close();
    };

    const handleCloseClick = (e: MouseEvent) => {
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
          <Show when={secondaryAction}>
            {(secondaryAction) => (
              <Button variant="default" shape="rounded" size="lg" onClick={handleSecondary}>
                {secondaryAction().label}
              </Button>
            )}
          </Show>
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
    <div id="LucidModalPortal" class="LucidModalPortal">
      <For each={modals}>
        {(modal) => (
          <Dialog 
            isOpen={modal.isOpen} 
            onClose={() => handleClose(modal.id)}
            data-modal-id={modal.id} 
          >
            {modal.render()}
          </Dialog>
        )}
      </For>
    </div>
  );
}

export function renderModalRoot(parent?: HTMLElement) {
  try {
    return render(() => <ModalRoot />, parent || document.body);
  } catch (e) {
    logger.error("failed_to_render_modal_root", e);
  }
}