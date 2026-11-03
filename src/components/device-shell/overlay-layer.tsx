"use client";

import { createContext, useContext, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Where popups render. The device shell provides one layer that covers the screen being shown (the phone screen,
 * or the page), so a popup always sits inside the device and is never cut off by the frame.
 */
export const OverlayLayerContext = createContext<HTMLElement | null>(null);

export function OverlayLayer({ children }: { children: ReactNode }) {
  const host = useContext(OverlayLayerContext);
  return host ? createPortal(children, host) : null;
}
