import {
  createSignal,
  createEffect,
  onCleanup,
  createMemo,
  createRoot,
  type Accessor,
  type Setter,
} from "solid-js";
import {
  getLocalImage,
  createBlobUrl,
  revokeBlobUrl,
  getRandomLocalImage,
  getAdjacentLocalImage,
} from "@/stores/idb/images";
import {
  $image_options,
  $slideshow,
  updateLocalSelectedId,
  updateSlideshowElapsed,
  updateSlideshowStart,
} from "@/stores";
import { useStore } from "@nanostores/solid";

interface LocalImageInstance {
  localUrl: Accessor<string | undefined>;
  isLoaded: Accessor<boolean>;
  setIsLoaded: Setter<boolean>;
}

let instance: LocalImageInstance | undefined;

export function useLocalImage(): LocalImageInstance {
  if (!instance) {
    instance = createRoot(() => {
      const options = useStore($image_options);
      const slideshow = useStore($slideshow);
      const local = () => options().local;

      const targetId = createMemo(() =>
        options().mode === "local" ? local().selectedId : undefined,
      );

      const [localUrl, setLocalUrl] = createSignal<string | undefined>(undefined);
      const [isLoaded, setIsLoaded] = createSignal(false);

      const cleanupLocalUrl = (url: string | undefined) => {
        if (!url) return;
        setTimeout(() => {
          revokeBlobUrl(url);
        }, 500);
      };

      createEffect(() => {
        const id = targetId();

        setIsLoaded(false);

        let isCancelled = false;

        if (id) {
          getLocalImage(id).then((imageData) => {
            if (isCancelled) return;

            if (imageData?.blob) {
              const url = createBlobUrl(imageData.blob);
              setLocalUrl((prevUrl) => {
                cleanupLocalUrl(prevUrl);
                return url;
              });
            } else {
              setLocalUrl((prevUrl) => {
                cleanupLocalUrl(prevUrl);
                return undefined;
              });
            }
          });
        } else {
          setLocalUrl((prevUrl) => {
            cleanupLocalUrl(prevUrl);
            return undefined;
          });
        }

        onCleanup(() => {
          isCancelled = true;
        });
      });

      onCleanup(() => {
        cleanupLocalUrl(localUrl());
      });

      async function changeUrl() {
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
            changeUrl();
            updateSlideshowStart(Date.now());
          }
          updateSlideshowElapsed(elapsed);
        };
        check();
        const interval = setInterval(check, 1000);
        onCleanup(() => clearInterval(interval));
      });

      return { localUrl, isLoaded, setIsLoaded };
    });
  }
  return instance;
}
