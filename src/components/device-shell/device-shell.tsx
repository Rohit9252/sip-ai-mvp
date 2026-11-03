"use client";

import { useState, type ReactNode } from "react";
import { useStoredChoice } from "@/hooks/use-stored-choice";
import { MonitorIcon, PhoneIcon } from "@/components/icons";
import { OverlayLayerContext } from "./overlay-layer";

export type DeviceMode = "desktop" | "phone";
const MODES = ["desktop", "phone"] as const;
const STORAGE_KEY = "sip-ai-device-view";

/**
 * On a wide screen, a switch shows the app inside a phone frame or as a page, so a reviewer can see both from one
 * link. On a real phone (under 640 px wide) there is no switch and no frame: the app fills the screen. That choice
 * is made by a CSS viewport query (see globals.css), not by JavaScript, so a phone never sees a flash.
 */
export function DeviceShell({ children }: { children: ReactNode }) {
  // The phone frame is the default on a wide screen: this is a phone-first app.
  const [mode, choose] = useStoredChoice<DeviceMode>(STORAGE_KEY, MODES, "phone");
  const [overlayHost, setOverlayHost] = useState<HTMLDivElement | null>(null);

  return (
    <OverlayLayerContext.Provider value={overlayHost}>
      <div className="shell" data-view={mode}>
        <div className="shell-switch" role="group" aria-label="View">
          <ViewButton label="Desktop" icon={<MonitorIcon />} active={mode === "desktop"} onClick={() => choose("desktop")} />
          <ViewButton label="Phone" icon={<PhoneIcon />} active={mode === "phone"} onClick={() => choose("phone")} />
        </div>
        <div className="shell-stage">
          <div className="device" data-testid="device">
            <div className="screen" data-testid="screen">
              <span className="notch" aria-hidden />
              {children}
              <span className="home-bar" aria-hidden />
              <div ref={setOverlayHost} className="overlay-host" />
            </div>
          </div>
        </div>
      </div>
    </OverlayLayerContext.Provider>
  );
}

function ViewButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
        active ? "bg-ink text-paper" : "bg-paper text-ink ring-1 ring-ink/10 hover:ring-ink/30"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
