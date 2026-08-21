"use client"

import { useState, useEffect } from 'react'

export function ToolsFilter() {
  const [activeCategory, setActiveCategory] = useState<string>("all")

  useEffect(() => {
    const buttons = document.querySelectorAll('[data-category]')
    const cards = document.querySelectorAll('[data-category]')
    const emptyState = document.getElementById('empty-state')
    const grid = document.getElementById('tools-grid')

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category')
        if (!category) return

        setActiveCategory(category)

        // Update button styles
        buttons.forEach((b) => {
          if (b.getAttribute('data-category') === category) {
            b.className = 'px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground whitespace-nowrap transition-colors'
            b.setAttribute('aria-selected', 'true')
          } else {
            b.className = 'px-4 py-2 text-sm font-medium rounded-full bg-muted text-muted-foreground whitespace-nowrap transition-colors hover:bg-muted/80'
            b.setAttribute('aria-selected', 'false')
          }
        })

        // Filter cards
        let visibleCount = 0
        cards.forEach((card) => {
          const cardCategory = card.getAttribute('data-category')
          if (category === 'all' || cardCategory === category) {
            ;(card as HTMLElement).style.display = ''
            visibleCount++
          } else {
            ;(card as HTMLElement).style.display = 'none'
          }
        })

        // Toggle empty state
        if (emptyState && grid) {
          if (visibleCount === 0) {
            emptyState.classList.remove('hidden')
            grid.classList.add('hidden')
          } else {
            emptyState.classList.add('hidden')
            grid.classList.remove('hidden')
          }
        }
      })
    })
  }, [activeCategory])

  return null
}