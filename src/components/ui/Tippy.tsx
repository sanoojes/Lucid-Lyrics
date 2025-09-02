import { CircleQuestionMark } from 'lucide-react';

type TippyProps = {
  label: React.ReactNode;
  children?: React.ReactNode;
  hasIcon?: boolean;
};

const Tippy: React.FC<TippyProps> = ({ label, children, hasIcon = true }) => {
  if (!label || !Spicetify?.ReactComponent?.TooltipWrapper) return null;

  return (
    <Spicetify.ReactComponent.TooltipWrapper
      label={label}
      showDelay={0}
      placement="top"
      trigger="mouseenter"
    >
      <div>
        {children}
        {hasIcon ? (
          <div className="tooltip-icon-wrapper">
            <CircleQuestionMark size="16" />
          </div>
        ) : null}
      </div>
    </Spicetify.ReactComponent.TooltipWrapper>
  );
};

export default Tippy;
