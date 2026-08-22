"use client"

import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"

/**
 * Dialog centrado sobre @base-ui/react. API mínima:
 * <Dialog open onOpenChange>
 *   <DialogContent><DialogTitle/><DialogDescription/>...</DialogContent>
 * </Dialog>
 */
export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  )
}

export function DialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-black/50 transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <BaseDialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-5 shadow-xl outline-none",
          "transition-all data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          className,
        )}
      >
        {children}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  )
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <BaseDialog.Title className={cn("text-lg font-bold text-foreground", className)}>
      {children}
    </BaseDialog.Title>
  )
}

export function DialogDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <BaseDialog.Description
      className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", className)}
    >
      {children}
    </BaseDialog.Description>
  )
}
