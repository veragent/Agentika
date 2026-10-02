"use client"

import { useEffect } from 'react'

const ACTIVE_TAB_CLASS =
  'px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground whitespace-nowrap transition-colors'
const INACTIVE_TAB_CLASS =
  'px-4 py-2 text-sm font-medium rounded-full bg-muted text-muted-foreground whitespace-nowrap transition-colors hover:bg-muted/80'

export function ToolsFilter() {
  useEffect(() => {
    // NOTE: buttons and cards both carry data-category, so scope each
    // query to its own container. Never use a bare '[data-category]'.
    const buttons = document.querySelectorAll('#category-tabs [data-category]')
    const cards = document.querySelectorAll('#tools-grid [data-category]')
    const emptyState = document.getElementById('empty-state')
    const grid = document.getElementById('tools-grid')

    const handleClick = (btn: Element) => {
      const category = btn.getAttribute('data-category')
      if (!category) return

      // Update tab button styles only — never touch card classNames
      buttons.forEach((b) => {
        const isActive = b.getAttribute('data-category') === category
        b.className = isActive ? ACTIVE_TAB_CLASS : INACTIVE_TAB_CLASS
        b.setAttribute('aria-selected', String(isActive))
      })

      // Show/hide cards via display only — never overwrite their classes
      let visibleCount = 0
      cards.forEach((card) => {
        const show = category === 'all' || card.getAttribute('data-category') === category
        ;(card as HTMLElement).style.display = show ? '' : 'none'
        if (show) visibleCount++
      })

      // Toggle empty state
      if (emptyState && grid) {
        const isEmpty = visibleCount === 0
        emptyState.classList.toggle('hidden', !isEmpty)
        grid.classList.toggle('hidden', isEmpty)
      }
    }

    const cleanups: Array<() => void> = []
    buttons.forEach((btn) => {
      const listener = () => handleClick(btn)
      btn.addEventListener('click', listener)
      cleanups.push(() => btn.removeEventListener('click', listener))
    })

    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [])

  return null
}
