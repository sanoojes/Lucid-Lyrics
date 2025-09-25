import { LyricsStateSchema } from '@/schemas/appStoreSchema.ts';
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
            id: 'hide-status',
            type: 'Toggle',
            label: 'Hide Status',
            tippy:
              'Hide Status message and show Now Playing Widget (when the lyrics is not Available and in Offline mode)',
            isChecked: state.lyrics.hideStatus,
            onChange: (hideStatus) => state.setLyrics('hideStatus', hideStatus),
          },
          {
            id: 'time-offset',
            type: 'Input',
            label: 'Time offset',
            inputType: 'number',
            tippy: 'Time Offset in ms',
            value: state.lyrics.timeOffset,
            placeholder: 'Offset in ms...',
            validation: (value) => LyricsStateSchema.shape.timeOffset.safeParse(value),
            onChange: (timeOffset) => state.setLyrics('timeOffset', timeOffset),
          },
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
            tippy: (
              <div>
                Disable Tooltip shown <br />
                Recommended (tooltip might cause performance issues)
              </div>
            ),
            isChecked: state.disableTippy,
            onChange: (disableTippy) => state.setDisableTippy(disableTippy),
          },
        ],
      },
    ],
  }) satisfies SectionProps;
