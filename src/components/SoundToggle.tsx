import { Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { setSoundEnabled, soundSupported, useSoundEnabled } from '../lib/sound'

/** Interface sounds on or off. Remembered per browser; unmuting plays a cue so you hear the level. */
export function SoundToggle() {
  const enabled = useSoundEnabled()
  if (!soundSupported()) return null

  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label="Interface sounds"
      title={enabled ? 'Mute interface sounds' : 'Turn interface sounds on'}
      onClick={() => setSoundEnabled(!enabled)}
      className="inline-flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-[background-color,color,scale] duration-150 hover:bg-neutral-900/[0.05] hover:text-neutral-900 active:scale-[0.94]"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={enabled ? 'on' : 'off'}
          initial={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 0.5, opacity: 0, filter: 'blur(4px)' }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className="inline-flex"
        >
          {enabled ? (
            <Volume2 aria-hidden="true" className="size-4" />
          ) : (
            <VolumeX aria-hidden="true" className="size-4" />
          )}
        </m.span>
      </AnimatePresence>
    </button>
  )
}
