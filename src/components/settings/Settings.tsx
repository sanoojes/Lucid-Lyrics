import getSettingsSections from '@/components/settings/helper/getSettingsSections.ts';
import Section from '@/components/settings/ui/Section.tsx';
import { Credits } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import type { SectionProps } from '@/types/settingSchema.ts';
import { useEffect, useState } from 'react';

// TODO: fix too many re-renders
const Settings = () => {
  const [sections, setSections] = useState<SectionProps[]>([]);

  useEffect(() => {
    document.body.classList.add('settings-open');

    const initialSections = getSettingsSections();
    setSections(initialSections);

    const unsubscribe = appStore.subscribe((state) => {
      const updatedSections = getSettingsSections(state);
      setSections(updatedSections);
    });
    return () => {
      document.body.classList.remove('settings-open');
      unsubscribe();
    };
  }, []);

  return (
    <div className="lucid-lyrics-settings">
      {sections.map((section) => (
        <Section key={section.id} {...section} />
      ))}
      <Credits />
    </div>
  );
};

export default Settings;
