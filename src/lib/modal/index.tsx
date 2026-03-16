import "@/styles/modal/alert.scss";
import { For, type JSXElement } from "solid-js";
import { createStore } from "solid-js/store";
import { Dialog, useDialog } from "@/lib/modal/component/Dialog";
import { render } from "solid-js/web";
import { logger } from "@/utils/logger";
import { Button } from "@/component/ui/Button";
import { t } from "@/i18n";
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
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, 300);
}

export function closeAllModals() {
  modals.forEach((m) => handleClose(m.id));
}

export function showAlert(
  message: string,
  onConfirm?: () => void,
  variant: "default" | "destructive" = "destructive",
  description?: string,
  confirmLabel?: string,
  secondaryAction?: {
    label: string;
    onClick: () => void;
  },
) {
  return showModal(() => {
    const { close } = useDialog();

    const handleConfirm = () => {
      if (onConfirm) onConfirm();
      close();
    };

    const handleSecondary = () => {
      if (secondaryAction?.onClick) secondaryAction.onClick();
      close();
    };

    return (
      <div class="alert-modal">
        <p class="alert-message">{message}</p>
        {description && <p class="alert-description">{description}</p>}
        <div class="alert-actions">
          <Button variant="glass" shape="rounded" size="lg" onClick={close}>
            {t("common.cancel")}
          </Button>
          {secondaryAction && (
            <Button variant="default" shape="rounded" size="lg" onClick={handleSecondary}>
              {secondaryAction.label}
            </Button>
          )}
          <Button variant={variant} shape="rounded" size="lg" onClick={handleConfirm}>
            {confirmLabel || t("common.confirm")}
          </Button>
        </div>
      </div>
    );
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
