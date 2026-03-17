import {
  createContext,
  useContext,
  createEffect,
  splitProps,
  onCleanup,
  type ComponentProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import "@/styles/component/dialog.scss";

type DialogContextType = {
  close: () => void;
  isOpen: boolean;
};

export type DialogProps = ComponentProps<"dialog"> & {
  isOpen: boolean;
  onClose: () => void;
};

const DialogContext = createContext<DialogContextType>();

export function useDialog(): DialogContextType {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a Dialog");
  }
  return context;
}

export function Dialog(props: DialogProps) {
  let dialogRef!: HTMLDialogElement;

  const [local, others] = splitProps(props, ["isOpen", "onClose", "children", "class"]);

  createEffect(() => {
    const el = dialogRef;
    if (!el) return;

    if (local.isOpen) {
      el.showModal();
    } else {
      el.close();
    }
  });

  const handleClose = () => {
    if (local.onClose) local.onClose();
  };

  const handleCancel = (e: Event) => {
    e.preventDefault();
    handleClose();
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === dialogRef) {
      handleClose();
    }
  };

  onCleanup(() => {
    if (dialogRef && dialogRef.open) dialogRef.close();
  });

  return (
    <DialogContext.Provider
      value={{
        close: handleClose,
        get isOpen() {
          return local.isOpen;
        },
      }}
    >
      <Portal mount={getPortalMount()}>
        <dialog
          ref={dialogRef}
          onCancel={handleCancel}
          onClick={handleBackdropClick}
          class={`dialog ${local.class ?? ""}`.trim()}
          {...others}
        >
          {local.children}
        </dialog>
      </Portal>
    </DialogContext.Provider>
  );
}

function getPortalMount() {
  const portalId = "LucidModalPortal";
  let elem = document.getElementById(portalId);
  if (!elem) {
    elem = document.createElement("div");
    elem.id = portalId;
    elem.className = portalId;
    document.body.appendChild(elem);
  }

  return elem;
}
