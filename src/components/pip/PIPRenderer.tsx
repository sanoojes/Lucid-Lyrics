import PIPContents from '@/components/pip/PIPContents.tsx';
import tempStore from '@/store/tempStore.ts';
import { useEffect } from 'react';
import { useStore } from 'zustand';

const PipRenderer = () => {
  const pipRoot = useStore(tempStore, (s) => s.pipInstance.pipRoot);

  useEffect(() => {
    const handleUnload = () => tempStore.getState().closePiP();

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, []);

  const renderHead = () => {
    if (!pipRoot) return null;

    const stylesFromBody = Array.from(
      document.head.querySelectorAll<HTMLStyleElement>('style[id^="lucid-lyrics-"]')
    ).map((el) => (
      <style key={el.id} id={el.id} dangerouslySetInnerHTML={{ __html: el.innerHTML }} />
    ));

    return (
      <>
        <title>Lucid Lyrics</title>
        {stylesFromBody}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/sanoojes/Lucid-Lyrics@main/fonts/styles.css"
        />
        <style>{`
a{text-decoration: none;}a:hover{text-decoration: underline;}
:root{--encore-variable-font-stack: SpotifyMixUITitleVariable, CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, var(--fallback-fonts, sans-serif);}
html { box-sizing: border-box; height: 100%; overflow:hidden; }
*, *::before, *::after { box-sizing: border-box; font-family: var(--lucid-lyrics-font-family); }
body { margin: 0; padding: 0; height: 100%; overflow:hidden;}
.lucid-lyrics-pip-root .lyrics-container {--lucid-lyrics-horizontal-padding: 0 12cqw 0 12cqw;}`}</style>
      </>
    );
  };

  return (
    pipRoot && (
      <>
        {pipRoot.renderHead?.(renderHead)}
        {pipRoot.render(<PIPContents />)}
      </>
    )
  );
};
export default PipRenderer;
