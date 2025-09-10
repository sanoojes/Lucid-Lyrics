import { Next, Pause, Play, Previous, RepeatOne, Shuffle } from '@/components/icons';
import Repeat from '@/components/icons/Repeat.tsx';
import { Button } from '@/components/ui';
import { useEffect, useState } from 'react';

const PlayerAPI = Spicetify.Player;

const PlaybackControls = () => {
  const [isPlaying, setIsPlaying] = useState(PlayerAPI.isPlaying() ?? false);
  const [shuffle, setShuffle] = useState(PlayerAPI.getShuffle());
  const [repeat, setRepeat] = useState<number>(PlayerAPI.getRepeat());

  const togglePlaying = () => {
    if (!PlayerAPI) return;
    PlayerAPI?.togglePlay();
  };

  const toggleRepeat = () => {
    if (!PlayerAPI) return;
    const nextRepeat = (repeat + 1) % 3;
    PlayerAPI.setRepeat(nextRepeat);
    setRepeat(nextRepeat);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!PlayerAPI) return;
      setIsPlaying(PlayerAPI.isPlaying?.() ?? false);
      setShuffle(PlayerAPI.getShuffle?.() ?? false);
      setRepeat(PlayerAPI.getRepeat?.() ?? 0);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="playback-controls">
      <Button variant="icon" onClick={() => PlayerAPI.setShuffle?.(!shuffle)}>
        <Shuffle active={shuffle} />
      </Button>
      <Button variant="icon" onClick={() => PlayerAPI.back?.()}>
        <Previous />
      </Button>
      <Button variant="icon" onClick={() => togglePlaying()} className="play-pause-btn">
        {isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button variant="icon" onClick={() => PlayerAPI.next?.()}>
        <Next />
      </Button>
      <Button variant="icon" onClick={toggleRepeat}>
        {repeat === 2 ? <RepeatOne active /> : <Repeat active={repeat !== 0} />}
      </Button>
    </div>
  );
};

export default PlaybackControls;
