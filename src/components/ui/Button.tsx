import type { ButtonProps } from '@/types/uiSchema.ts';

const Button: React.FC<ButtonProps> = ({
  buttonText,
  children,
  onClick,
  className = '',
  variant = 'default',
}) => {
  return (
    <button type="button" onClick={onClick} className={`lucid-lyrics-btn ${variant} ${className}`}>
      {buttonText}
      {children}
    </button>
  );
};

export default Button;
