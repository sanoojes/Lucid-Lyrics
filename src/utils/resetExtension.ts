import appStore from '@/store/appStore.ts';

export default function resetExtension() {
  appStore.getState().resetStore();
  location.reload();
}
