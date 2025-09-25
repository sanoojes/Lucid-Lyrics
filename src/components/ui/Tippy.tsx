import { CircleQuestionMark } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/ui/tippy.css';
import appStore from '@/store/appStore.ts';
import { getOrCreateElement } from '@utils/dom';
import { useStore } from 'zustand';

type TippyProps = {
  label?: React.ReactNode;
  children?: React.ReactNode;
  container?: HTMLElement;
  hasIcon?: boolean;
  show?: boolean;
};

const tooltipRootId = 'tooltip-root';

const Tippy: React.FC<TippyProps> = ({
  label = null,
  children,
  hasIcon = false,
  show = true,
  container = document.body,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const disableTippy = useStore(appStore, (s) => s.disableTippy);

  useEffect(() => {
    if (disableTippy) return;

    const container = containerRef.current;
    if (!container) return;

    const showTooltip = () => {
      if (disableTippy) return;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX + rect.width / 2,
        });
        setVisible(true);
      }
    };

    const hideTooltip = () => {
      if (disableTippy) return;
      setVisible(false);
    };

    container.addEventListener('mouseenter', showTooltip);
    container.addEventListener('mouseleave', hideTooltip);

    return () => {
      container.removeEventListener('mouseenter', showTooltip);
      container.removeEventListener('mouseleave', hideTooltip);
    };
  }, [disableTippy]);

  return (
    <>
      <div ref={containerRef} style={{ display: show ? 'inline' : 'none' }} data-tippy-container>
        {children}
        {hasIcon && !disableTippy && (
          <div className="tooltip-icon-wrapper">
            <CircleQuestionMark size={16} />
          </div>
        )}
      </div>

      {!disableTippy &&
        visible &&
        label &&
        createPortal(
          <div
            role="tooltip"
            className="tooltip-content"
            style={{
              top: `${coords.top - 44}px`,
              left: `${coords.left}px`,
            }}
          >
            {label}
          </div>,
          getOrCreateElement('div', tooltipRootId, container)
        )}
    </>
  );
};

export default Tippy;
