import { wait } from "@/lib/dom/wait";
import { showModal } from "@/lib/modal";
import type { JSXElement } from "solid-js";

export const setupMenu = async (
  label: string,
  icon: string,
  render: () => JSXElement,
): Promise<() => void> => {
  const Item = await wait(() => Spicetify?.Menu?.Item);

  let closeModal: (() => void) | null = null;
  const onOpen = () => {
    const { close } = showModal(render);
    closeModal = close;
  };

  const entry = new Item(label, false, onOpen, icon);
  entry.register();

  return () => {
    entry?.deregister();
    closeModal?.();
  };
};
