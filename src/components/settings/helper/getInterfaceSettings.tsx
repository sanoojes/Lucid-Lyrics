import type appStore from '@/store/appStore.ts';
import type { SectionProps } from '@/types/settingSchema.ts';

export const getInterfaceSettings = (state: ReturnType<typeof appStore.getState>): SectionProps =>
  ({
    id: 'interface-settings',
    sectionName: 'Interface',
    groups: [
      {
        id: 'interface',
        components: [
          {
            id: 'is-encore-font',
            type: 'Toggle',
            label: 'Use Spotify Mix Font',
            tippy: 'Toggle between (Spotify Mix or Default) Font',
            isChecked: state.lyrics.isSpotifyFont,
            onChange: (isSpotifyFont) => state.setLyrics('isSpotifyFont', isSpotifyFont),
          },
          {
            id: 'disable-tippy',
            type: 'Toggle',
            label: 'Disable Tooltip',
            tippy: 'Disable Tooltip shown (recommended if tooltip is causing performance issues)',
            isChecked: state.disableTippy,
            onChange: (disableTippy) => state.setDisableTippy(disableTippy),
          },
        ],
      },
    ],
  }) satisfies SectionProps;
