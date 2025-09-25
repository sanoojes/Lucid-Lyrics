import tempStore from '@/store/tempStore.ts';
import cx from '@cx';
import { useStore } from 'zustand';
import '@/styles/ui/widget.css';
import { HeartButton, Marquee, PlaybackControls, TimelineControls } from '@/components/ui';
import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

const Controls: React.FC<{ customButtons: React.ReactNode }> = ({ customButtons }) => {
  return (
    <div className={cx('media-controls', { 'has-custom-buttons': Boolean(customButtons) })}>
      {customButtons ? <div className="control-buttons">{customButtons}</div> : null}
      <div className="heart-control">
        <HeartButton />
      </div>
      <PlaybackControls />
      <TimelineControls />
    </div>
  );
};

const NowPlayingWidget: React.FC<{ className?: string; customButtons?: React.ReactNode }> = ({
  className,
  customButtons,
}) => {
  const { imageUrl, data } = useStore(tempStore, (s) => s.player.nowPlaying);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isCoverHovered, setIsCoverHovered] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setIsImageLoaded(false);
      setIsImageError(true);
      return;
    }

    setIsImageLoaded(false);
    setIsImageError(false);

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsImageLoaded(true);
    img.onerror = () => setIsImageError(true);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return (
    <div
      className={cx('now-playing-widget', className, {
        'cover-hovered': isCoverHovered,
      })}
    >
      <div
        className="cover-art-container"
        onMouseEnter={() => setIsCoverHovered(true)}
        onMouseLeave={() => setIsCoverHovered(false)}
      >
        <Controls customButtons={customButtons} />
        <a href={data?.album?.uri ?? ''} className="cover-link">
          <div
            className={cx('cover-img-wrapper', {
              'img-loaded': isImageLoaded,
              'img-loading': !isImageLoaded && !isImageError,
              'img-error': isImageError,
            })}
          >
            <div
              className="cover-img"
              style={{
                backgroundImage: isImageLoaded && !isImageError ? `url(${imageUrl})` : '',
              }}
            />
            {isImageError && (
              <div className="img-error-wrapper">
                <ImageOff />
              </div>
            )}
          </div>
        </a>
      </div>
      <div className="metadata-container">
        <div className="song-name">
          <Marquee>
            <a href={data?.album?.uri ?? ''}>{data?.name}</a>
          </Marquee>
        </div>
        {data?.artists?.[0]?.name ? (
          <div className="artists">
            <Marquee>
              {data?.artists?.map((artist, index) => (
                <a key={artist.uri} href={artist?.uri}>
                  {artist?.name}
                  {index < (data?.artists?.length ?? 0) - 1 ? ', ' : ''}
                </a>
              ))}
            </Marquee>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NowPlayingWidget;
