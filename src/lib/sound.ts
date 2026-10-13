import {
  defineSound,
  definePatch,
  ensureReady,
  setMasterVolume,
  type AudioPatch,
  type PlayOptions,
  type SoundPatch,
} from '@web-kits/audio'
import { useSyncExternalStore } from 'react'
import minimal from '../sounds/minimal.json'

/**
 * The app's sound vocabulary, organised the way Kobra's Sound component is: presses,
 * toggles, surfaces and outcomes. App code names the moment; this file decides the sound,
 * so swapping the patch is a one-line change.
 *
 * Sounds come from the "Minimal" patch of @web-kits/audio (MIT, Raphael Salaja): short sine
 * tones synthesised in the browser, no audio files. "blocked" is our own, since Minimal has none.
 */
export type Cue =
  | 'press' // a small confirming press
  | 'select' // a tab or a stage; callers pitch it by position
  | 'toggleOn' // rises
  | 'toggleOff' // falls
  | 'open' // a surface arriving: slower than a press, because the room changed
  | 'close' // the surface leaving
  | 'pickup' // taking hold of a card
  | 'success' // two notes up: a save or a move resolved
  | 'warning' // the same note twice: "are you sure?"
  | 'destructive' // lower and heavier, so a discard lands
  | 'blocked' // a press that will not be answered, dead on purpose
  | 'undo'
  | 'copy' // two clicks, like a shutter
  | 'clear' // emptying a field or a filter
  | 'limit' // a column edge reaching its minimum or maximum: the quietest, lowest tick
  | 'fit' // a column gliding to fit its content, or back to its default
  | 'unmute'

const CUES: Record<Exclude<Cue, 'blocked'>, { sound: string; volume?: number; detune?: number }> = {
  press: { sound: 'tap' },
  select: { sound: 'select' },
  toggleOn: { sound: 'toggle-on' },
  toggleOff: { sound: 'toggle-off' },
  open: { sound: 'expand' },
  close: { sound: 'collapse' },
  pickup: { sound: 'tap', volume: 0.8, detune: 300 },
  success: { sound: 'success' },
  warning: { sound: 'warning' },
  destructive: { sound: 'delete' },
  undo: { sound: 'undo' },
  copy: { sound: 'copy' },
  clear: { sound: 'deselect' },
  limit: { sound: 'click', volume: 0.6, detune: -700 },
  fit: { sound: 'slide' },
  unmute: { sound: 'swoosh' },
}

/** Major-pentatonic steps in cents, so a row of options rises like a scale (Lead → Customer). */
export const PITCH_STEPS = [0, 200, 400, 700, 900]

/** Minimal is mixed very quietly (peaks around 0.1); lift it a little, well short of clipping. */
const MASTER_VOLUME = 1.8
const STORAGE_KEY = 'contacts.sound'

let patch: AudioPatch | null = null
let blocked: ((opts?: PlayOptions) => unknown) | null = null
let primed = false

function supported(): boolean {
  return typeof window !== 'undefined' && typeof window.AudioContext === 'function'
}

function readEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

let enabled = typeof window === 'undefined' ? false : readEnabled()
const listeners = new Set<() => void>()

/**
 * Plays a cue if sound is on. Always called from a user gesture, which is what lets the
 * browser start the AudioContext. Fails silently: sound is never load-bearing.
 */
export function playSound(cue: Cue, opts?: PlayOptions): void {
  if (!enabled || !supported()) return
  void ensureReady()
    .then(() => {
      if (!primed) {
        setMasterVolume(MASTER_VOLUME)
        primed = true
      }
      if (cue === 'blocked') {
        blocked ??= defineSound({
          source: { type: 'triangle', frequency: { start: 170, end: 120 } },
          filter: { type: 'lowpass', frequency: 600 },
          envelope: { attack: 0, decay: 0.07, sustain: 0, release: 0.02 },
          gain: 0.12,
        })
        blocked(opts)
        return
      }
      patch ??= definePatch(minimal as SoundPatch)
      const { sound, volume = 1, detune = 0 } = CUES[cue]
      patch.play(sound, {
        ...opts,
        volume: volume * (opts?.volume ?? 1),
        detune: detune + (opts?.detune ?? 0),
      })
    })
    .catch(() => {})
}

export function setSoundEnabled(next: boolean): void {
  enabled = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
  } catch {
    // Private mode or blocked storage: the setting just won't persist.
  }
  listeners.forEach((notify) => notify())
  if (next) playSound('unmute')
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify)
      return () => listeners.delete(notify)
    },
    () => enabled,
    () => false,
  )
}

/** Whether this browser can play sound at all (false in tests and very old browsers). */
export const soundSupported = supported
