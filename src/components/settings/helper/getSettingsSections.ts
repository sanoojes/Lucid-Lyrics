import { getAdvancedSettings } from '@/components/settings/helper/getAdvancedSettings.tsx';
import { getBackgroundSettings } from '@/components/settings/helper/getBackgroundSettings.tsx';
import appStore from '@/store/appStore.ts';
import type { SectionProps } from '@/types/settingSchema.ts';

export default function getSettingsSections(state = appStore.getState()): SectionProps[] {
  return [getBackgroundSettings(state), getAdvancedSettings(state)];
}
