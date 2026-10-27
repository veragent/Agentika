import type { ComponentProps } from "react"

/**
 * Wrapper for GFM tables rendered inside `prose` article bodies.
 * Tailwind Typography styles the <table> itself; this wrapper only adds
 * horizontal scrolling so wide tables stay readable on narrow screens
 * instead of squeezing or overflowing the article column.
 */
export function Table({ children }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table>{children}</table>
    </div>
  )
}
