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
