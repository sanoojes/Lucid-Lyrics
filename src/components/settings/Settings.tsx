import getSettingsSections from '@/components/settings/helper/getSettingsSections.ts';
import Section from '@/components/settings/ui/Section.tsx';
import { Loader } from '@/components/ui';
import appStore from '@/store/appStore.ts';
import type { SectionProps } from '@/types/settingSchema.ts';
import { useEffect, useState } from 'react';

const Settings = () => {
  const [sections, setSections] = useState<SectionProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('settings-open');

    const initialSections = getSettingsSections();
    setSections(initialSections);
    setLoading(false);

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
      {loading ? <Loader /> : sections.map((section) => <Section key={section.id} {...section} />)}
    </div>
  );
};

export default Settings;
