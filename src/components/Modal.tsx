/** biome-ignore-all lint/a11y: nahh need for a11y now */

import { HeaderButtons } from '@/components/ui/index.ts';
import { type FC, type ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

type ModalProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  headerChildren?: ReactNode;
  className?: string;
  hasSocialButton?: boolean;
  onClose: () => void;
};

const Modal: FC<ModalProps> = ({
  isOpen,
  title,
  children,
  headerChildren,
  hasSocialButton = true,
  onClose,
  className,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="GenericModal__overlay lyrics-modal" style={{ zIndex: 20 }} onClick={onClose}>
      <div
        className={`GenericModal lyrics-modal ${className ?? ''} `}
        role="dialog"
        aria-label={title}
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="main-embedWidgetGenerator-container">
          <div className="main-trackCreditsModal-header">
            <h1 className="encore-text encore-text-title-small encore-internal-color-text-base">
              {title}
            </h1>
            <div className="btn-wrapper">
              {headerChildren}
              <HeaderButtons closeModal={onClose} hasSocialButton={hasSocialButton} />
            </div>
          </div>
          <div className="main-trackCreditsModal-mainSection">
            <main className="main-trackCreditsModal-originalCredits">{children}</main>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
