import { VPropertyLogo } from "@/components/tasador/vproperty-logo"

export function AppHeader({ userName = "Roberto Pérez" }: { userName?: string }) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <VPropertyLogo />
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-medium text-foreground sm:inline">{userName}</span>
        <span
          aria-label={userName}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-vp-primary text-sm font-semibold text-white"
        >
          {initials}
        </span>
      </div>
    </header>
  )
}
