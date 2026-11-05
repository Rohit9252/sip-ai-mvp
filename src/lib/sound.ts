import { readStoredChoice } from "@/hooks/use-stored-choice";

/**
 * Two quiet sounds, made in the browser with Web Audio (no sound files to load):
 *  - "helper": a soft two-note chime when the helper steps in at the first setback.
 *  - "reason": one short warm note when the reason arrives.
 * Never a sound for a loss itself: a fall must not sound like an alarm to someone already worried.
 * The person can turn sounds off in the top bar; the choice is remembered. Any failure is silent.
 */

export const SOUND_KEY = "sip-ai-sound";
export const SOUND_CHOICES = ["on", "off"] as const;
export type SoundChoice = (typeof SOUND_CHOICES)[number];

export type SoundName = "helper" | "reason";

const NOTES: Record<SoundName, { freq: number; at: number; length: number }[]> = {
  helper: [
    { freq: 659.25, at: 0, length: 0.22 },
    { freq: 880, at: 0.12, length: 0.32 },
  ],
  reason: [{ freq: 523.25, at: 0, length: 0.26 }],
};

let context: AudioContext | null = null;

export function soundOn(): boolean {
  return readStoredChoice(SOUND_KEY) !== "off";
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || !soundOn()) return;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context ??= new Ctor();
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    for (const note of NOTES[name]) {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = "sine";
      osc.frequency.value = note.freq;
      // A quick rise and a slow fade, kept quiet.
      gain.gain.setValueAtTime(0, now + note.at);
      gain.gain.linearRampToValueAtTime(0.06, now + note.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.length);
      osc.connect(gain).connect(context.destination);
      osc.start(now + note.at);
      osc.stop(now + note.at + note.length + 0.05);
    }
  } catch {
    // Sound is a nicety: the app works the same without it.
  }
}
