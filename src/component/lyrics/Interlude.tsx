import "@/styles/component/interlude.scss";
import { createMemo, For } from "solid-js";

type InterludeIndicatorProps = {
  start: number;
  end: number;
  currentPos: number;
  oppAligned?: boolean;
  rtl?: boolean;
};

export function Interlude(props: InterludeIndicatorProps) {
  const progress = createMemo(() => {
    if (props.currentPos <= props.start) return 0;
    if (props.currentPos >= props.end) return 1;
    return (props.currentPos - props.start) / (props.end - props.start);
  });

  const isActive = createMemo(
    () => props.currentPos >= props.start && props.currentPos < props.end - 0.2,
  );

  return (
    <div
      class="interlude-indicator"
      classList={{ active: isActive(), "opp-aligned": props.oppAligned, rtl: props.rtl }}
    >
      <For each={[0, 1, 2]}>
        {(index) => {
          const state = createMemo(() => {
            const p = progress();
            const startThreshold = index * 0.3;
            const endThreshold = startThreshold + 0.3;

            if (p >= endThreshold) return { jump: 0, fill: 1 };

            if (p > startThreshold) {
              const local = (p - startThreshold) / 0.3;
              return {
                jump: Math.sin(local * Math.PI),
                fill: local <= 0.5 ? Math.sin(local * Math.PI) : 1,
              };
            }

            return { jump: 0, fill: 0 };
          });

          return (
            <div
              class="interlude-dot"
              style={{
                opacity: 0.3 + state().fill * 0.7,
                transform: `translateY(${-state().jump * 10}px) scale(${1 + state().fill * 0.5})`,
                "box-shadow": `0 ${state().jump * 5}px ${state().fill * 10}px rgba(255,255,255,${state().fill * 0.5})`,
              }}
            />
          );
        }}
      </For>
    </div>
  );
}
