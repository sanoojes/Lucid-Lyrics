import Modal from '@/components/Modal.tsx';
import { type CreateRendererAPI, createRenderer } from '@utils/dom';

type ModalProps = {
  title: string;
  content: React.ReactNode;
};

export function showModal({ title, content }: ModalProps) {
  let renderer: CreateRendererAPI | null = null;
  renderer = createRenderer({
    children: (
      <Modal
        title={title}
        onClose={() => {
          renderer?.unmount();
        }}
        className="lyrics-settings"
        isOpen
      >
        {content}
      </Modal>
    ),
    parent: document.body,
    rootId: 'modal-root',
  });
  renderer.mount();
}
