import cx from '@cx';

type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
};

const Marquee: React.FC<MarqueeProps> = ({ children, className = '' }) => {
  return (
    <div className={cx('marquee-container', className)}>
      <div className="marquee-wrapper">{children}</div>
    </div>
  );
};

export default Marquee;
