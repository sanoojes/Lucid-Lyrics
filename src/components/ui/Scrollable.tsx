import {
  type HTMLProps,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

type ScrollableProps = Omit<HTMLProps<HTMLDivElement>, 'ref' | 'id'>;

export type ScrollableRef = {
  scrollTo: (top: number, behavior?: 'smooth' | 'instant' | 'auto') => void;
  getClientHeight: () => number | undefined;
  getOffsetTop: () => number | undefined;
  addScrollListener: (cb: () => void) => void;
  removeScrollListener: (cb: () => void) => void;
};

const Scrollable = forwardRef<ScrollableRef, ScrollableProps>(
  ({ children, className, ...props }, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const scrollThumbRef = useRef<HTMLDivElement>(null);
    const observer = useRef<ResizeObserver | null>(null);

    const [thumbHeight, setThumbHeight] = useState(20);
    const [isDragging, setIsDragging] = useState(false);
    const [scrollStartPosition, setScrollStartPosition] = useState<number>(0);
    const [initialContentScrollTop, setInitialContentScrollTop] = useState<number>(0);

    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (top, behavior = 'smooth') => {
          contentRef.current?.scrollTo({
            top,
            behavior,
          });
        },
        getClientHeight: () => contentRef.current?.clientHeight,
        getOffsetTop: () => contentRef.current?.offsetTop,
        addScrollListener: (cb) => {
          contentRef.current?.addEventListener('scroll', cb);
        },
        removeScrollListener: (cb) => {
          contentRef.current?.removeEventListener('scroll', cb);
        },
      }),
      []
    );

    useEffect(() => {
      if (contentRef.current) {
        const content = contentRef.current;
        observer.current = new ResizeObserver(() => {
          handleResize();
        });
        observer.current.observe(content);
        content.addEventListener('scroll', handleThumbPosition);
        return () => {
          observer.current?.unobserve(content);
          content.removeEventListener('scroll', handleThumbPosition);
        };
      }
    }, []);

    function handleResize() {
      if (scrollTrackRef.current && contentRef.current) {
        const { clientHeight: trackSize } = scrollTrackRef.current;
        const { clientHeight: contentVisible, scrollHeight: contentTotalHeight } =
          contentRef.current;
        setThumbHeight(Math.max((contentVisible / contentTotalHeight) * trackSize, 20));
      }
    }

    function handleThumbPosition() {
      if (!contentRef.current || !scrollTrackRef.current || !scrollThumbRef.current) {
        return;
      }

      const { scrollTop: contentTop, scrollHeight: contentHeight } = contentRef.current;
      const { clientHeight: trackHeight } = scrollTrackRef.current;

      const newTop = Math.min(
        (contentTop / contentHeight) * trackHeight,
        trackHeight - thumbHeight
      );

      const thumb = scrollThumbRef.current;
      requestAnimationFrame(() => {
        thumb.style.top = `${newTop}px`;
      });
    }

    function handleThumbMousedown(e: React.MouseEvent<HTMLDivElement>) {
      e.preventDefault();
      e.stopPropagation();
      setScrollStartPosition(e.clientY);
      if (contentRef.current) setInitialContentScrollTop(contentRef.current.scrollTop);
      setIsDragging(true);
    }

    function handleThumbMouseup(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      if (isDragging) {
        setIsDragging(false);
      }
    }

    function handleThumbMousemove(e: MouseEvent) {
      if (contentRef.current) {
        e.preventDefault();
        e.stopPropagation();
        if (isDragging) {
          const { scrollHeight: contentScrollHeight, clientHeight: contentClientHeight } =
            contentRef.current;

          const deltaY = (e.clientY - scrollStartPosition) * (contentClientHeight / thumbHeight);

          const newScrollTop = Math.min(
            initialContentScrollTop + deltaY,
            contentScrollHeight - contentClientHeight
          );

          contentRef.current.scrollTop = newScrollTop;
        }
      }
    }

    useEffect(() => {
      document.addEventListener('mousemove', handleThumbMousemove);
      document.addEventListener('mouseup', handleThumbMouseup);
      return () => {
        document.removeEventListener('mousemove', handleThumbMousemove);
        document.removeEventListener('mouseup', handleThumbMouseup);
      };
    }, [handleThumbMousemove, handleThumbMouseup]);

    function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
      e.preventDefault();
      e.stopPropagation();
      const { current: track } = scrollTrackRef;
      const { current: content } = contentRef;
      if (track && content) {
        const { clientY } = e;
        const target = e.target as HTMLDivElement;
        const rect = target.getBoundingClientRect();
        const trackTop = rect.top;
        const thumbOffset = -(thumbHeight / 2);
        const clickRatio = (clientY - trackTop + thumbOffset) / track.clientHeight;
        const scrollAmount = Math.floor(clickRatio * content.scrollHeight);
        content.scrollTo({
          top: scrollAmount,
          behavior: 'smooth',
        });
      }
    }

    function handleContentMouseEnter() {
      if (scrollTrackRef.current) scrollTrackRef.current.style.opacity = '1';
    }
    function handleContentMouseLeave() {
      if (scrollTrackRef.current) scrollTrackRef.current.style.opacity = '0';
    }

    return (
      <div className="scrollable-container">
        <div
          {...props}
          className={`content ${className ? className : ''}`}
          id="custom-scrollbars-content"
          ref={contentRef}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
        >
          {children}
        </div>
        <div className="scrollbar">
          <div
            className="track-and-thumb"
            role="scrollbar"
            aria-controls="custom-scrollbars-content"
          >
            <div
              className="track"
              ref={scrollTrackRef}
              onClick={handleTrackClick}
              style={{ opacity: 0, cursor: isDragging ? 'grabbing' : '' }}
            >
              <span
                className="thumb"
                ref={scrollThumbRef}
                onMouseDown={handleThumbMousedown}
                style={{
                  height: `${thumbHeight}px`,
                  cursor: isDragging ? 'grabbing' : 'grab',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default Scrollable;
