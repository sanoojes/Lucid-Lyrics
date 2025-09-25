import { Tippy } from '@/components/ui';
import type { ButtonProps } from '@/types/uiSchema.ts';

const Button: React.FC<ButtonProps> = ({
  buttonText = null,
  children,
  onClick,
  className = null,
  variant = 'default',
  tippyContent = null,
  tippyContainer,
  show = true,
}) => {
  return (
    <Tippy label={tippyContent} show={show} container={tippyContainer}>
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
