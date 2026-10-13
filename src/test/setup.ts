import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'motion/react'
import { afterEach, vi } from 'vitest'

// Animations finish instantly in tests.
MotionGlobalConfig.skipAnimations = true

// jsdom has no matchMedia. Default to the wide, docked-panel layout.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Node 25 exposes its own experimental localStorage, which shadows jsdom's and has no
// working methods unless Node is given a storage file. Swap in an in-memory store.
if (typeof window.localStorage?.getItem !== 'function') {
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
      key: (i: number) => [...store.keys()][i] ?? null,
      get length() {
        return store.size
      },
    } satisfies Storage,
  })
}

// Browser APIs dnd-kit and Motion expect that jsdom lacks.
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver
Document.prototype.getAnimations ??= () => []
Element.prototype.getAnimations ??= () => []
Element.prototype.animate ??= function () {
  return {
    finished: Promise.resolve(),
    cancel() {},
    finish() {},
    onfinish: null,
  } as unknown as Animation
}
Document.prototype.elementFromPoint ??= () => null
Element.prototype.setPointerCapture ??= () => {}
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.scrollIntoView ??= () => {}

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})
