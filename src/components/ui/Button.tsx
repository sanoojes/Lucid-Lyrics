import { Tippy } from '@/components/ui';
import type { ButtonProps } from '@/types/uiSchema.ts';
import cx from '@cx';

const Button: React.FC<ButtonProps> = ({
  buttonText = null,
  children,
  onClick,
  className = null,
  variant = 'default',
  tippyContent = null,
  show = true,
}) => {
  return (
    <Tippy label={tippyContent} show={show}>
      <button
        type="button"
        onClick={onClick}
        className={`lucid-lyrics-btn ${variant} ${show ? 'show' : 'hide'} ${className ?? ''}`}
      >
        {buttonText}
        {children}
      </button>
    </Tippy>
  );
};

export default Button;
