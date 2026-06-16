import { useState, useRef } from 'react'

/**
 * Handles drag-and-drop reordering for both desktop (HTML5 DnD) and mobile (touch).
 * Usage:
 *   const { activeIndex, overIndex, rowProps, handleProps } = useSortable(items, onReorder)
 *   - rowProps(index)   → spread on each draggable row div
 *   - handleProps(index)→ spread on the drag handle element
 */
export function useSortable(items, onReorder) {
  const [activeIndex, setActiveIndex] = useState(null)
  const [overIndex,   setOverIndex]   = useState(null)

  // Mutable ref so touch callbacks always read fresh values
  const r = useRef({ from: null, to: null })

  const commit = () => {
    const { from, to } = r.current
    if (from !== null && to !== null && from !== to) {
      const next = [...items]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      onReorder(next)
    }
    r.current.from = null
    r.current.to   = null
    setActiveIndex(null)
    setOverIndex(null)
  }

  // Props to spread on each row container
  const rowProps = (index) => ({
    'data-sort-index': index,
    onDragOver: (e) => {
      e.preventDefault()
      r.current.to = index
      setOverIndex(index)
    },
    onDrop: commit,
  })

  // Props to spread on the drag handle icon
  const handleProps = (index) => ({
    // ── Desktop ──
    draggable: true,
    onDragStart: () => {
      r.current.from = index
      setActiveIndex(index)
    },
    onDragEnd: commit,

    // ── Mobile touch ──
    onTouchStart: (e) => {
      r.current.from = index
      setActiveIndex(index)

      const onMove = (ev) => {
        ev.preventDefault()
        const touch = ev.touches[0]
        const el = document.elementFromPoint(touch.clientX, touch.clientY)
          ?.closest('[data-sort-index]')
        if (el) {
          const i = Number(el.dataset.sortIndex)
          r.current.to = i
          setOverIndex(i)
        }
      }

      const onEnd = () => {
        commit()
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchend',  onEnd)
      }

      window.addEventListener('touchmove', onMove, { passive: false })
      window.addEventListener('touchend',  onEnd)
    },
  })

  return { activeIndex, overIndex, rowProps, handleProps }
}
