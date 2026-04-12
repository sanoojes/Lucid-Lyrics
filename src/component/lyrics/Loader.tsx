import "~/styles/component/lyrics-loading.scss";
import { type Component, For } from "solid-js";

interface Segment {
  x: number;
  width: number;
}

interface Line {
  segments: Segment[];
}

interface Block {
  isInterlude: boolean;
  lines: Line[];
  yOffset: number;
}

const config = {
  blockCount: 15,
  blockGap: 16,
  gap: 16,
  interludeGap: 8,
  interludeSize: 28,
  lineHeight: 62,
  maxLineWidth: 95,
  maxSegmentWidth: 62,
  minSegmentWidth: 30,
  radius: 8,
  segmentGapPct: 1.5,
} as const;

const step = config.lineHeight + config.gap;
const interludeSquares = [0, 1, 2] as const;

const LyricsLoader: Component = () => {
  let currentY = 0;
  const blocks: Block[] = [];

  for (let index = 0; index < config.blockCount; index++) {
    const isInterlude = index % 4 === 0;
    const yOffset = currentY;
    let blockHeight = 0;
    const lines: Line[] = [];

    if (isInterlude) {
      blockHeight = config.interludeSize;
    } else {
      const lineCount = ((Math.random() * 3) | 0) + 2;

      for (let l = 0; l < lineCount; l++) {
        const numSegments = ((Math.random() * 2) | 0) + 1;
        const segments: Segment[] = [];
        let currentX = 0;

        for (let s = 0; s < numSegments; s++) {
          const remainingSpace = config.maxLineWidth - currentX;

          if (remainingSpace < config.minSegmentWidth) break;

          const maxAllowed = Math.min(config.maxSegmentWidth, remainingSpace);
          const minAllowed = Math.min(config.minSegmentWidth, maxAllowed);

          const width = ((Math.random() * (maxAllowed - minAllowed + 1)) | 0) + minAllowed;

          segments.push({ width, x: currentX });
          currentX += width + config.segmentGapPct;
        }
        lines.push({ segments });
      }

      blockHeight = lineCount * config.lineHeight + (lineCount - 1) * config.gap;
    }

    blocks.push({ isInterlude, lines, yOffset });
    currentY += blockHeight + config.blockGap;
  }

  const totalSvgHeight = currentY;

  return (
    <div class="lyrics-loading">
      <div class="loading-wrapper">
        <svg
          viewBox={`0 0 1000 ${totalSvgHeight}`}
          width="100%"
          class="loading-svg"
          preserveAspectRatio="xMinYMin slice"
          fill="currentColor"
          style={{ opacity: 0.2 }}
        >
          <For each={blocks}>
            {(block) => (
              <g transform={`translate(0, ${block.yOffset})`}>
                {block.isInterlude ? (
                  <g class="interlude-squares">
                    {interludeSquares.map((num) => (
                      <rect
                        x={num * (config.interludeSize + config.interludeGap)}
                        y="0"
                        width={config.interludeSize}
                        height={config.interludeSize}
                        rx={config.radius}
                      />
                    ))}
                  </g>
                ) : (
                  <g class="lyric-lines">
                    <For each={block.lines}>
                      {(line, i) => (
                        <g transform={`translate(0, ${i() * step})`}>
                          <For each={line.segments}>
                            {(segment) => (
                              <rect
                                x={`${segment.x}%`}
                                y="0"
                                width={`${segment.width}%`}
                                height={config.lineHeight}
                                rx={config.radius}
                              />
                            )}
                          </For>
                        </g>
                      )}
                    </For>
                  </g>
                )}
              </g>
            )}
          </For>
        </svg>
      </div>
    </div>
  );
};

export default LyricsLoader;
