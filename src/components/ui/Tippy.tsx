import { CircleQuestionMark } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '@/styles/ui/tippy.css';
import { getOrCreateElement } from '@utils/dom';

type TippyProps = {
  label?: React.ReactNode;
  children?: React.ReactNode;
  hasIcon?: boolean;
  show?: boolean;
};

const tooltipRootId = 'tooltip-root';

const Tippy: React.FC<TippyProps> = ({ label = null, children, hasIcon = false, show = true }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
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
    setVisible(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mouseenter', showTooltip);
    container.addEventListener('mouseleave', hideTooltip);

    return () => {
      container.removeEventListener('mouseenter', showTooltip);
      container.removeEventListener('mouseleave', hideTooltip);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} style={{ display: show ? 'inline' : 'none' }} data-tippy-container>
        {children}
        {hasIcon && (
          <div className="tooltip-icon-wrapper">
            <CircleQuestionMark size={16} />
          </div>
        )}
      </div>

      {visible &&
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
          getOrCreateElement('div', tooltipRootId, document.body)
        )}
    </>
  );
};

export default Tippy;
