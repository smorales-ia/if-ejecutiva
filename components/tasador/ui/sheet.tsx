"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

function SheetBackdrop({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  )
}

/**
 * Sheet lateral: entra desde abajo en móvil y desde la derecha en desktop (sm+).
 */
function SheetContent({
  className,
  children,
  ...props
}: SheetPrimitive.Popup.Props) {
  return (
    <SheetPortal>
      <SheetBackdrop />
      <SheetPrimitive.Popup
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-xl transition-all duration-300 ease-out",
          // Móvil: hoja inferior
          "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl border-t border-border",
          "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
          // Desktop: panel derecho
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:h-full sm:w-[28rem] sm:max-w-[90vw] sm:rounded-none sm:border-l sm:border-t-0",
          "sm:data-[starting-style]:translate-y-0 sm:data-[starting-style]:translate-x-full",
          "sm:data-[ending-style]:translate-y-0 sm:data-[ending-style]:translate-x-full",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-vp-text-secondary transition-colors hover:bg-vp-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-vp-primary"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-border px-5 py-4 pr-14",
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-vp-text-secondary", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
