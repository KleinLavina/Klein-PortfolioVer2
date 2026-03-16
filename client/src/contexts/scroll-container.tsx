import { createContext, useContext, RefObject } from "react";

export const ScrollContainerContext = createContext<RefObject<HTMLElement> | null>(null);

export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}
