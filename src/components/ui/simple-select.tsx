import * as React from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePortalContainer } from "@/lib/portal-context"

interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export function SimpleSelect({ value, onValueChange, children }: SimpleSelectProps) {
  const [open, setOpen] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const portalContainer = usePortalContainer()
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 })

  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [open])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const options = React.Children.toArray(children) as React.ReactElement[]
  const selectedOption = options.find(child => child.props.value === value)

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: `${position.width}px`
      }}
      className={cn(
        "z-50 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95"
      )}
    >
      {options.map((option) => (
        <button
          key={option.props.value}
          type="button"
          onClick={() => {
            onValueChange(option.props.value)
            setOpen(false)
          }}
          className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
            "hover:bg-accent hover:text-accent-foreground",
            value === option.props.value && "bg-accent text-accent-foreground"
          )}
        >
          {option.props.children}
        </button>
      ))}
    </div>
  ) : null

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 items-center justify-between whitespace-nowrap rounded-md px-3 py-2 text-sm",
          "border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors",
          "hover:bg-accent hover:text-foreground",
          open && "bg-accent text-foreground"
        )}
      >
        <span>{selectedOption?.props.children || 'Select...'}</span>
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      </button>

      {portalContainer && dropdown ? createPortal(dropdown, portalContainer) : dropdown}
    </>
  )
}

export function SimpleSelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <div data-value={value}>{children}</div>
}
