import { Button } from '@/components/ui';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

const PlayerAPI = Spicetify?.Player;
const HeartButton: React.FC = () => {
  const [liked, setLiked] = useState(false);

  const handleClick = () => {
    PlayerAPI.toggleHeart();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const current = PlayerAPI?.getHeart() ?? false;
      setLiked(current);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Button onClick={handleClick} className="heart-btn">
      <Heart size="100%" strokeWidth={0.5} className={`${liked ? 'filled active' : ''}`} />
    </Button>
  );
};

export default HeartButton;
