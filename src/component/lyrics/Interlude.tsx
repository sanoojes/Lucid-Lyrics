import "@/styles/component/interlude.scss";
import { createMemo, For } from "solid-js";

type InterludeIndicatorProps = {
  start: number;
  end: number;
  currentPos: number;
  oppAligned?: boolean;
  rtl?: boolean;
};

const DOTS = [
  { start: 0.0, end: 0.3 },
  { start: 0.3, end: 0.6 },
  { start: 0.6, end: 0.9 },
];

export function Interlude(props: InterludeIndicatorProps) {
  const isActive = createMemo(
    () => props.currentPos >= props.start && props.currentPos < props.end - 0.2,
  );

  const progress = createMemo(() => {
    if (props.currentPos <= props.start) return 0;
    if (props.currentPos >= props.end) return 1;
    return (props.currentPos - props.start) / (props.end - props.start);
  });

  const wrapperScale = createMemo(() => {
    if (!isActive()) return 0;

    const timeRemaining = props.end - props.currentPos;

    const wave = (1 - Math.cos(props.currentPos * Math.PI * 2)) / 2;
    const normalScale = 0.8 + wave * 0.25;

    if (timeRemaining <= 0.8) {
      const t = Math.max(0, 0.8 - timeRemaining) / 0.8;

      const ease = t * t * (3 - 2 * t);

      return normalScale * (1 - ease) + 1.2 * ease;
    }

    return normalScale;
  });

  return (
    <div
      class="interlude-indicator"
      classList={{ active: isActive(), "opp-aligned": props.oppAligned, rtl: props.rtl }}
    >
      <div class="interlude-dots-wrapper" style={{ transform: `scale(${wrapperScale()})` }}>
        <For each={DOTS}>
          {(dot) => {
            return (
              <div
                class="interlude-dot"
                style={(() => {
                  const p = progress();

                  if (p <= dot.start)
                    return { transform: "translateY(0px) scale(1)", opacity: 0.3 };

                  if (p >= dot.end)
                    return {
                      transform: "translateY(0px) scale(1.5)",
                      opacity: 1,
                      "box-shadow": "0 0px 10px rgba(255,255,255,0.5)",
                    };

                  const local = (p - dot.start) / 0.3;
                  const jump = Math.sin(local * Math.PI);
                  const fill = local <= 0.5 ? jump : 1;

                  return {
                    opacity: 0.3 + fill * 0.7,
                    transform: `translateY(${-jump * 10}px) scale(${1 + fill * 0.5})`,
                    "box-shadow": `0 ${jump * 5}px ${fill * 10}px rgba(255,255,255,${fill * 0.5})`,
                  };
                })()}
              />
            );
          }}
        </For>
      </div>
    </div>
  );
}
