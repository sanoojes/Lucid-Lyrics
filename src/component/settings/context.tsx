import { type Accessor, createContext, useContext } from "solid-js";

export interface SettingsContextValue {
  searchQuery: Accessor<string>;
}

export const SettingsContext = createContext<SettingsContextValue>();

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
