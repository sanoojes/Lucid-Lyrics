import {
  type Accessor,
  type JSX,
  type Setter,
  createContext,
  createSignal,
  useContext,
} from "solid-js";

export type JumpToActive = (() => void) | null;

export interface RendererContextValue {
  isActiveVisible: Accessor<boolean>;
  setIsActiveVisible: Setter<boolean>;
  jumpToActive: Accessor<JumpToActive>;
  setJumpToActive: Setter<JumpToActive>;
}

export const RendererContext = createContext<RendererContextValue>();

export function LyricsRendererProvider(props: { children: JSX.Element }) {
  const [isActiveVisible, setIsActiveVisible] = createSignal<boolean>(true);
  const [jumpToActive, setJumpToActive] = createSignal<JumpToActive>(null);
  return (
    <RendererContext.Provider
      value={{
        isActiveVisible,
        jumpToActive,
        setIsActiveVisible,
        setJumpToActive,
      }}
    >
      {props.children}
    </RendererContext.Provider>
  );
}

export function useRenderer(): RendererContextValue {
  const context = useContext(RendererContext);
  if (!context) {
    throw new Error("useRenderer must be used within RendererProvider");
  }
  return context;
}
