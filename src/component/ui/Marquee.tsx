import "@/styles/component/marquee.scss";
import { type JSXElement, onMount, createSignal } from "solid-js";

type MarqueeProps = {
  children: JSXElement;
  speed?: number;
  minTime?: number;
  maxTime?: number;
};

function Marquee(props: MarqueeProps) {
  let container!: HTMLDivElement;
  let wrapper!: HTMLSpanElement;

  const speed = () => props.speed ?? 16;
  const minTime = () => props.minTime ?? 4;
  const maxTime = () => props.maxTime ?? 40;

  const [animating, setAnimating] = createSignal(false);

  const restartAnimation = () => {
    wrapper.style.animation = "none";
    wrapper.offsetHeight;
    wrapper.style.animation = "";
  };

  const update = () => {
    const overflow = Math.max(wrapper.scrollWidth - container.clientWidth, 0);

    container.style.setProperty("--move", `${overflow}px`);

    if (overflow === 0) return;

    const duration = Math.min(maxTime(), Math.max(minTime(), overflow / speed()));

    container.style.setProperty("--marquee-anim-time", `${duration}s`);

    restartAnimation();
  };

  const handleLeave = () => {
    if (!animating()) restartAnimation();
  };

  onMount(() => {
    update();

    const ro = new ResizeObserver(update);
    ro.observe(container);
    ro.observe(wrapper);
  });

  return (
    <div class="l-marquee" ref={container} onMouseLeave={handleLeave}>
      <span
        class="l-marquee--wrapper"
        ref={wrapper}
        onAnimationStart={() => setAnimating(true)}
        onAnimationEnd={() => setAnimating(false)}
      >
        {props.children}
      </span>
    </div>
  );
}

export default Marquee;
