import '@/styles/ui/credits.css';
const Credits: React.FC = () => {
  return (
    <div className="section">
      <h2 className="section-header">Credits</h2>
      <div className="section-wrapper">
        <div className="setting-row credits-row providers">
          <p>
            Lyrics provided from Spicy Lyrics API by{' '}
            <a href="https://github.com/spikerko" target="_blank" rel="noopener noreferrer">
              Spikerko
            </a>{' '}
            (
            <a href="https://spicylyrics.org/" target="_blank" rel="noopener noreferrer">
              spicylyrics.org
            </a>
            )
          </p>
        </div>
        <div className="setting-row credits-row made-by">
          <p>
            Made with ❤️ by{' '}
            <a href="https://github.com/sanoojes" target="_blank" rel="noopener noreferrer">
              Sachu (Sanoojes)
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Credits;
