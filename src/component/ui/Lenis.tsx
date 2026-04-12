import {
  type JSX,
  Show,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import Tempus from "@darkroom.engineering/tempus";
import Lenis, { type LenisOptions, type ScrollCallback } from "lenis";

export type LenisContextValue = {
  readonly lenis: Lenis;
  readonly contentRef: HTMLDivElement | undefined;
  addCallback: (callback: ScrollCallback, priority: number) => void;
  removeCallback: (callback: ScrollCallback) => void;
};

export interface LenisProps extends JSX.HTMLAttributes<HTMLDivElement> {
  root?: boolean;
  options?: LenisOptions;
  autoRaf?: boolean;
  rafPriority?: number;
  childProps?: JSX.HTMLAttributes<HTMLDivElement>;
}

export const LenisContext = createContext<LenisContextValue>();
const [rootLenisContext, setRootLenisContext] = createSignal<LenisContextValue>();

export function useLenis(callback?: ScrollCallback, priority = 0): () => Lenis {
  const localContext = useContext(LenisContext);

  const getContext = () => {
    const ctx = localContext ?? rootLenisContext();
    if (!ctx) {
      throw new Error(
        "useLenis must be used inside a SolidLenis Provider, or after it has initialized.",
      );
    }
    return ctx;
  };

  createEffect(() => {
    if (!callback) return;
    const ctx = getContext();

    ctx.addCallback(callback, priority);
    callback(ctx.lenis);

    onCleanup(() => {
      ctx.removeCallback(callback);
    });
  });

  return () => getContext().lenis;
}

export function useLenisContent(): () => HTMLDivElement | undefined {
  const ctx = useContext(LenisContext) ?? rootLenisContext();
  return () => ctx?.contentRef;
}

export function SolidLenis(props: LenisProps) {
  const [local, domProps] = splitProps(props, [
    "root",
    "options",
    "autoRaf",
    "rafPriority",
    "children",
    "childProps",
  ]);

  let wrapperRef: HTMLDivElement | undefined;
  let contentRef: HTMLDivElement | undefined;

  const [lenis, setLenis] = createSignal<Lenis>();

  const callbacksRefs: { callback: ScrollCallback; priority: number }[] = [];

  const addCallback: LenisContextValue["addCallback"] = (callback, priority) => {
    callbacksRefs.push({ callback, priority });
    callbacksRefs.sort((a, b) => a.priority - b.priority);
  };

  const removeCallback: LenisContextValue["removeCallback"] = (callback) => {
    const index = callbacksRefs.findIndex((cb) => cb.callback === callback);
    if (index !== -1) callbacksRefs.splice(index, 1);
  };

  onMount(() => {
    const lenisInstance = new Lenis({
      ...local.options,
      ...(!local.root && {
        content: contentRef,
        wrapper: wrapperRef,
      }),
    });

    setLenis(lenisInstance);

    if (local.autoRaf !== false) {
      const rafId = Tempus.add((time: number) => lenisInstance.raf(time), local.rafPriority ?? -1);
      onCleanup(() => rafId());
    }

    if (local.root) {
      setRootLenisContext({
        addCallback,
        contentRef: undefined,
        lenis: lenisInstance,
        removeCallback,
      });
      onCleanup(() => setRootLenisContext(undefined));
    }

    const onScroll: ScrollCallback = (data) => {
      for (const cbRef of callbacksRefs) {
        cbRef.callback(data);
      }
    };

    lenisInstance.on("scroll", onScroll);

    onCleanup(() => {
      lenisInstance.off("scroll", onScroll);
      lenisInstance.destroy();
    });
  });

  return (
    <>
      {local.root ? (
        <Show when={lenis()}>
          {(readyLenis) => (
            <LenisContext.Provider
              value={{
                addCallback,
                contentRef: undefined,
                lenis: readyLenis(),
                removeCallback,
              }}
            >
              {local.children}
            </LenisContext.Provider>
          )}
        </Show>
      ) : (
        <div ref={wrapperRef} {...domProps} class={`${domProps.class || ""} lenis`.trim()}>
          <div
            ref={contentRef}
            {...local.childProps}
            class={`${local.childProps?.class || ""} lenis-content`}
          >
            <Show when={lenis()}>
              {(readyLenis) => (
                <LenisContext.Provider
                  value={{
                    addCallback,
                    contentRef,
                    lenis: readyLenis(),
                    removeCallback,
                  }}
                >
                  {local.children}
                </LenisContext.Provider>
              )}
            </Show>
          </div>
        </div>
      )}
    </>
  );
}

export default SolidLenis;
