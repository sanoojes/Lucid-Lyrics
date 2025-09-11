import { BackgroundStateSchema } from '@/schemas/appStoreSchema.ts';
import CSSFilterSchema from '@/schemas/cssFilterSchema.ts';
import type appStore from '@/store/appStore.ts';
import type { SectionProps } from '@/types/settingSchema.ts';
import { DEFAULT_APP_STATE } from '@constants';

export const getBackgroundSettings = (
  state: ReturnType<typeof appStore.getState>
): SectionProps => {
  const { bg } = state;
  const { mode, options } = bg;
  const { filter: bgFilter, imageMode } = options;

  return {
    id: 'background-settings',
    sectionName: 'Background',
    groups: [
      {
        id: 'background-mode',
        groupName: 'Mode',
        components: [
          {
            id: 'mode',
            type: 'Dropdown',
            label: 'Background Style',
            value: mode,
            options: [
              ['Static Image', 'static'],
              ['Animated', 'animated'],
              ['Solid Color', 'solid'],
            ],
            onChange: (mode) => state.setBg({ mode }),
          },
        ],
      },
      {
        id: 'bg-animated',
        visible: () => mode === 'animated',
        components: [
          {
            id: 'auto-stop-anim',
            type: 'Toggle',
            label: 'Pause When Inactive',
            tippy: 'Stops animation when Spotify is not the active window.',
            isChecked: options.autoStopAnimation,
            onChange: (autoStopAnimation) => state.setBgOptions({ autoStopAnimation }),
          },
        ],
      },
      {
        id: 'background-color',
        groupName: 'Solid Color Settings',
        visible: () => mode === 'solid',
        components: [
          {
            id: 'color',
            type: 'Color',
            label: 'Select Background Color',
            tippy: 'Pick a solid color for the background.',
            color: options.color,
            initialColor: DEFAULT_APP_STATE.bg.options.color,
            onChange: (color) => state.setBgOptions({ color }),
          },
        ],
      },
      {
        id: 'background-image',
        groupName: 'Image Settings',
        visible: () => mode !== 'solid',
        components: [
          {
            id: 'img-mode',
            type: 'Dropdown',
            label: 'Image Source',
            value: imageMode,
            options: [
              ['Now Playing Track', 'player'],
              ['Custom Image URL', 'custom'],
            ],
            onChange: (imageMode) => state.setBgOptions({ imageMode }),
          },
          {
            id: 'img-src',
            type: 'Input',
            label: 'Custom Image URL',
            inputType: 'text',
            value: options.customUrl ?? undefined,
            placeholder: 'Paste your image URL here...',
            visible: () => imageMode === 'custom',
            validation: (value) =>
              BackgroundStateSchema.shape.options.shape.customUrl.safeParse(value),
            onChange: (customUrl) => state.setBgOptions({ customUrl }),
          },
        ],
      },
      {
        id: 'background-filter',
        groupName: 'Filters',
        visible: () => mode !== 'solid',
        components: [
          {
            id: 'blur',
            type: 'Input',
            label: 'Blur',
            inputType: 'number',
            tippy:
              mode === 'animated' &&
              'Set Blur (Blur in range 30px - 50px recommended to avoid artifacts)',
            value: bgFilter.blur,
            validation: (value) => CSSFilterSchema.shape.blur.safeParse(value),
            onChange: (blur) => state.setBgFilter({ blur }),
          },
          {
            id: 'brightness',
            type: 'Input',
            label: 'Brightness',
            inputType: 'number',
            value: bgFilter.brightness,
            validation: (value) => CSSFilterSchema.shape.brightness.safeParse(value),
            onChange: (brightness) => state.setBgFilter({ brightness }),
          },
          {
            id: 'contrast',
            type: 'Input',
            label: 'Contrast',
            inputType: 'number',
            value: bgFilter.contrast,
            validation: (value) => CSSFilterSchema.shape.contrast.safeParse(value),
            onChange: (contrast) => state.setBgFilter({ contrast }),
          },
          {
            id: 'saturate',
            type: 'Input',
            label: 'Saturation',
            inputType: 'number',
            value: bgFilter.saturation,
            validation: (value) => CSSFilterSchema.shape.saturation.safeParse(value),
            onChange: (saturation) => state.setBgFilter({ saturation }),
          },
          {
            id: 'opacity',
            type: 'Input',
            label: 'Opacity',
            inputType: 'number',
            value: bgFilter.opacity,
            validation: (value) => CSSFilterSchema.shape.opacity.safeParse(value),
            onChange: (opacity) => state.setBgFilter({ opacity }),
          },
        ],
      },
    ],
  } satisfies SectionProps;
};
