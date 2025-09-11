import Settings from '@/components/settings/Settings.tsx';
import { showModal } from '@/utils/modal/showModal.tsx';
import { Icons } from '@constants';
import { waitForGlobal } from '@utils/dom';

let settingsEntry: Spicetify.Menu.Item | Spicetify.Topbar.Button | null = null;

export default async function addSettings() {
  await addSettingsEntry(openModal);
}

export function openModal() {
  showModal({ title: 'Lucid Lyrics Settings', content: <Settings /> });
}

async function addSettingsEntry(openModal: () => void) {
  const Item = await waitForGlobal(() => Spicetify?.Menu?.Item);
  settingsEntry = new Item('Lucid Lyrics', false, openModal, Icons.Brand16);
  settingsEntry?.register();
}
