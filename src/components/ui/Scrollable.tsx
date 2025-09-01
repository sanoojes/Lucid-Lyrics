import {
  type HTMLProps,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type ScrollableProps = Omit<HTMLProps<HTMLDivElement>, "ref" | "id"> & {
  userScrollTimeout?: number;
};

export type ScrollableRef = {
  addScrollListener: (cb: () => void) => void;
  removeScrollListener: (cb: () => void) => void;
  isAutoScrollAllowed: () => boolean;
  getContainer: () => HTMLDivElement | null;
};

const Scrollable = forwardRef<ScrollableRef, ScrollableProps>(
  ({ children, className, userScrollTimeout = 2000, ...props }, ref) => {
    const contentRef = useRef<HTMLDivElement | null>(null);
    const scrollTrackRef = useRef<HTMLDivElement>(null);
    const observer = useRef<ResizeObserver | null>(null);

    const [thumbHeight, setThumbHeight] = useState(20);
    const [thumbY, setThumbTop] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [scrollStartPosition, setScrollStartPosition] = useState<number>(0);
    const [initialContentScrollTop, setInitialContentScrollTop] =
      useState<number>(0);

    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const [isScrollable, setIsScrollable] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const scrollTimeoutRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const userScrollListeners = useRef<Set<(isUserScrolling: boolean) => void>>(
      new Set()
    );

    useEffect(() => {
      userScrollListeners.current.forEach((cb) => {
        cb(isUserScrolling);
      });
    }, [isUserScrolling]);

    useImperativeHandle(
      ref,
      () => ({
        getContainer: () => contentRef.current,
        addScrollListener: (cb) => {
          contentRef.current?.addEventListener("scroll", cb);
        },
        removeScrollListener: (cb) => {
          contentRef.current?.removeEventListener("scroll", cb);
        },
        isAutoScrollAllowed: () => !isUserScrolling,
      }),
      [isUserScrolling]
    );

    const handleUserScroll = useCallback(() => {
      setIsUserScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsUserScrolling(false);
      }, userScrollTimeout);
    }, [userScrollTimeout]);

    const handleThumbPosition = useCallback(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        if (!contentRef.current || !scrollTrackRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const trackHeight = scrollTrackRef.current.clientHeight;

        const ratio = scrollTop / (scrollHeight - clientHeight);
        setThumbTop(ratio * (trackHeight - thumbHeight));
      });
    }, [thumbHeight]);

    const handleResize = useCallback(() => {
      if (!contentRef.current || !scrollTrackRef.current) return;

      const { clientHeight: trackSize } = scrollTrackRef.current;
      const { clientHeight: contentVisible, scrollHeight: contentTotalHeight } =
        contentRef.current;

      if (contentTotalHeight > contentVisible) {
        setThumbHeight(
          Math.max((contentVisible / contentTotalHeight) * trackSize, 20)
        );
        setIsScrollable(true);
      } else {
        setIsScrollable(false);
      }
    }, []);

    useEffect(() => {
      if (contentRef.current) {
        const content = contentRef.current;
        observer.current = new ResizeObserver(handleResize);
        observer.current.observe(content);

        content.addEventListener("scroll", handleThumbPosition, {
          passive: true,
        });
        content.addEventListener("scroll", handleUserScroll, { passive: true });

        return () => {
          observer.current?.disconnect();
          content.removeEventListener("scroll", handleThumbPosition);
          content.removeEventListener("scroll", handleUserScroll);
        };
      }
    }, [handleThumbPosition, handleResize, handleUserScroll]);

    const handleThumbMousedown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!contentRef.current) return;
      setScrollStartPosition(e.clientY);
      setInitialContentScrollTop(contentRef.current.scrollTop);
      setIsDragging(true);
    };

    const handleThumbMouseup = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleThumbMousemove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !contentRef.current) return;
        e.preventDefault();

        const { scrollHeight, clientHeight } = contentRef.current;
        const deltaY =
          (e.clientY - scrollStartPosition) * (clientHeight / thumbHeight);

        const newScrollTop = Math.min(
          initialContentScrollTop + deltaY,
          scrollHeight - clientHeight
        );

        contentRef.current.scrollTop = newScrollTop;
      },
      [isDragging, scrollStartPosition, thumbHeight, initialContentScrollTop]
    );

    useEffect(() => {
      document.addEventListener("mousemove", handleThumbMousemove);
      document.addEventListener("mouseup", handleThumbMouseup);
      return () => {
        document.removeEventListener("mousemove", handleThumbMousemove);
        document.removeEventListener("mouseup", handleThumbMouseup);
      };
    }, [handleThumbMousemove, handleThumbMouseup]);

    const isTrackVisible =
      isScrollable && (isHovered || isDragging || isUserScrolling);

    return (
      <div
        className="scrollable-container"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          {...props}
          className={`content ${className ?? ""}`}
          id="custom-scrollbars-content"
          ref={contentRef}
        >
          {children}
        </div>
        <div className="scrollbar">
          <div className="track-and-thumb" role="scrollbar">
            <div
              className={`track ${isTrackVisible ? "visible" : ""}`}
              ref={scrollTrackRef}
            >
              <span
                className={`thumb ${isDragging ? "dragging" : ""}`}
                onMouseDown={handleThumbMousedown}
                style={
                  {
                    "--height": `${thumbHeight}px`,
                    "--thumb-y": `${thumbY}px`,
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default Scrollable;
