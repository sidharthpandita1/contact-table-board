import { useCallback, useState } from 'react'
import type { ViewMode } from '../types'

const PARAM = 'view'

function readView(): ViewMode {
  return new URLSearchParams(window.location.search).get(PARAM) === 'board' ? 'board' : 'table'
}

/**
 * The active view lives in `?view=` so it survives reloads and can be linked.
 * `replaceState`, not `pushState`: toggling views should not fill the back button history.
 */
export function useViewParam(): [ViewMode, (next: ViewMode) => void] {
  const [view, setView] = useState<ViewMode>(readView)

  const update = useCallback((next: ViewMode) => {
    setView(next)
    const url = new URL(window.location.href)
    url.searchParams.set(PARAM, next)
    window.history.replaceState(window.history.state, '', url)
  }, [])

  return [view, update]
}
