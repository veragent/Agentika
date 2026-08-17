"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

type DropdownMenuProps = {
  children: React.ReactNode
  className?: string
}

function DropdownMenu({ children, className }: DropdownMenuProps) {
  return <div className={cn("relative inline-block", className)}>{children}</div>
}

function DropdownMenuTrigger({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </button>
  )
}

type DropdownMenuContentProps = {
  children: React.ReactNode
  align?: "start" | "end"
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function DropdownMenuContent({ children, align = "start", className, open = false, onOpenChange }: DropdownMenuContentProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.target as Node)) {
      setIsOpen(false)
      onOpenChange?.(false)
    }
  }

  return (
    <div
      className={cn(
        "fixed z-50 min-w-[160px] max-h-96 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        className
      )}
      onClick={handleClickOutside}
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({ children, className, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setTimeout(() => {
      // Close dropdown after click
      const dropdown = document.querySelector('[data-slot="dropdown-menu"]')
      if (dropdown) {
        const event = new CustomEvent("dropdown-close")
        dropdown.dispatchEvent(event)
      }
    }, 0)
  }

  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}