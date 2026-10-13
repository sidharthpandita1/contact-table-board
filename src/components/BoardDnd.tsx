import { Accessibility, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom'
import { DragDropProvider } from '@dnd-kit/react'
import type { ReactNode } from 'react'
import { playSound } from '../lib/sound'
import { isStage, type Stage } from '../types'

/**
 * Drag-and-drop wiring, kept in one file because @dnd-kit/react is still pre-1.0.
 *
 * - The whole card is the drag element, but a drag only starts after 5px of movement
 *   (250ms hold on touch), so an ordinary click still opens the panel.
 * - The Accessibility plugin is removed: it would turn the <article> into a second button.
 *   Keyboard users move cards with the panel's Stage control or Alt+Shift+Arrow.
 */
const sensors = [
  PointerSensor.configure({
    activationConstraints: (event) =>
      event.pointerType === 'touch'
        ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 5 })]
        : [new PointerActivationConstraints.Distance({ value: 5 })],
    preventActivation: (event, source) => !source.element?.contains(event.target as Node),
  }),
]

/** dnd-kit drops its click blocker on pointerup, before the browser fires click. */
function swallowNextClick() {
  const stop = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()
  }
  window.addEventListener('click', stop, { capture: true, once: true })
  setTimeout(() => window.removeEventListener('click', stop, { capture: true }))
}

interface BoardDndProps {
  onMove: (id: string, stage: Stage) => void
  children: ReactNode
}

export function BoardDnd({ onMove, children }: BoardDndProps) {
  return (
    <DragDropProvider
      sensors={sensors}
      plugins={(defaults) => defaults.filter((plugin) => plugin !== Accessibility)}
      onDragStart={() => playSound('pickup')}
      onDragEnd={({ canceled, operation: { source, target } }) => {
        swallowNextClick()
        const stage = target ? String(target.id) : ''
        if (!canceled && source && isStage(stage)) onMove(String(source.id), stage)
      }}
    >
      {children}
    </DragDropProvider>
  )
}
