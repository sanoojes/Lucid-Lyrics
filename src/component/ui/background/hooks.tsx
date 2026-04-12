import {
  type Accessor,
  type Setter,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  onCleanup,
} from "solid-js";
import { getAdjacentLocalImage, getLocalImage, getRandomLocalImage } from "~/stores/idb/images";
import {
  $image_options,
  $slideshow,
  type ImageTypes,
  updateLocalSelectedId,
  updateSlideshowElapsed,
  updateSlideshowStart,
} from "~/stores";
import { useStore } from "@nanostores/solid";

interface LocalBlobInstance {
  localBlob: Accessor<Blob | undefined>;
  isLoaded: Accessor<boolean>;
  setIsLoaded: Setter<boolean>;
}

export function useLocalBlob(mode: Accessor<ImageTypes>): LocalBlobInstance {
  return createRoot(() => {
    const options = useStore($image_options);
    const slideshow = useStore($slideshow);
    const local = () => options().local;

    const targetId = createMemo(() => (mode() === "local" ? local().selectedId : undefined));

    const [localBlob, setLocalBlob] = createSignal<Blob | undefined>(undefined);
    const [isLoaded, setIsLoaded] = createSignal(false);

    createEffect(() => {
      const id = targetId();

      setIsLoaded(false);

      let isCancelled = false;

      if (id) {
        getLocalImage(id).then((imageData) => {
          if (isCancelled) return;

          setLocalBlob(imageData?.blob || undefined);
        });
      } else {
        setLocalBlob(undefined);
      }

      onCleanup(() => {
        isCancelled = true;
      });
    });

    async function changeImage() {
      try {
        const id = targetId();

        if (!id) {
          return updateLocalSelectedId((await getRandomLocalImage())?.id);
        }

        if (local().shuffle) {
          return updateLocalSelectedId((await getRandomLocalImage(id))?.id);
        }

        return updateLocalSelectedId((await getAdjacentLocalImage(id, local().direction))?.id);
      } catch {}
    }

    createEffect(() => {
      const id = targetId();
      const isSlideshow = local().slideshow;
      const slideTime = local().time;

      if (!id || !isSlideshow) {
        updateSlideshowStart(-1);
        return;
      }

      if (slideshow().startTime === -1) {
        updateSlideshowStart(Date.now());
      }

      const check = () => {
        const elapsed = Date.now() - $slideshow.get().startTime;
        if (elapsed >= slideTime * 1000) {
          changeImage();
          updateSlideshowStart(Date.now());
        }
        updateSlideshowElapsed(elapsed);
      };

      check();
      const interval = setInterval(check, 1000);
      onCleanup(() => clearInterval(interval));
    });

    return { isLoaded, localBlob, setIsLoaded };
  });
}
