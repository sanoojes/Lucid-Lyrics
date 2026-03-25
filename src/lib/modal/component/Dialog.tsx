import {
  createContext,
  useContext,
  splitProps,
  type ComponentProps,
} from "solid-js";
import "@/styles/component/dialog.scss";

type DialogContextType = {
  close: () => void;
  isOpen: boolean;
};

export type DialogProps = ComponentProps<"div"> & {
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
  const [local, others] = splitProps(props, ["isOpen", "onClose", "children", "class"]);

  const handleClose = () => {
    if (local.onClose) local.onClose();
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <DialogContext.Provider
      value={{
        close: handleClose,
        get isOpen() {
          return local.isOpen;
        },
      }}
    >
      <div
        class="dialog-overlay"
        classList={{ "is-open": local.isOpen }}
        onClick={handleBackdropClick}
      >
        <div
          role="dialog"
          aria-modal="true"
          class={`dialog-content ${local.class ?? ""}`.trim()}
          {...others}
        >
          {local.children}
        </div>
      </div>
    </DialogContext.Provider>
  );
}