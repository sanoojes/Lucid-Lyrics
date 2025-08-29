import { type CSSFilter, serializeFilters } from '@utils/dom';
import type { FC } from 'react';

const StaticBackground: FC<{ imageSrc?: string | null; filter: CSSFilter }> = ({
  imageSrc,
  filter,
}) => {
  return (
    <div
      className="static lucid-lyrics-bg"
      style={
        imageSrc
          ? {
              backgroundImage: `url(${imageSrc})`,
              filter: serializeFilters(filter),
            }
          : {}
      }
    />
  );
};

export default StaticBackground;
