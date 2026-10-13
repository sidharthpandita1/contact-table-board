import { describe, expect, it } from 'vitest'
import { playSound, setSoundEnabled, soundSupported } from './sound'

describe('sound', () => {
  it('is a silent no-op where Web Audio is missing (jsdom, old browsers)', () => {
    expect(soundSupported()).toBe(false)
    expect(() => playSound('success')).not.toThrow()
  })

  it('remembers the mute setting', () => {
    setSoundEnabled(false)
    expect(window.localStorage.getItem('contacts.sound')).toBe('off')
    setSoundEnabled(true)
    expect(window.localStorage.getItem('contacts.sound')).toBe('on')
  })
})
