import type { LineData } from '@/types/lyrics.ts';
import React, { type CSSProperties, forwardRef } from 'react';
import Interlude from './Interlude.tsx';

interface LyricLineProps {
  line: LineData['Content'][0];
  isActive: boolean;
  progress: number;
  blurAmount: number;
  className: string;
  onSeek: (ms: number) => void;
}

const LyricLine = forwardRef<HTMLDivElement, LyricLineProps>(
  ({ line, isActive, progress, blurAmount, className, onSeek }, ref) => {
    console.log('Line', line);

    return (
      <div ref={ref} onClick={() => onSeek(line.StartTime)} className="lyric-line">
        {line.Text !== '' ? (
          <p
            className={`lyric-text ${className}`}
            style={
              {
                '--blur-amount': `${blurAmount}px`,
                '--fill-progress': `${progress}%`,
                '--scale': `${1 + progress / 200}`,
              } as CSSProperties
            }
          >
            {line.Text}
          </p>
        ) : (
          <Interlude isActive={isActive} progress={progress} />
        )}
      </div>
    );
  }
);

LyricLine.displayName = 'LyricLine';
export default LyricLine;
