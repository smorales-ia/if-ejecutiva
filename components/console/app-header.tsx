import { currentUser } from '@clerk/nextjs/server'
import { Search } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { label: 'Consola', active: true },
  { label: 'Cola operativa', active: false },
  { label: 'Expediente', active: false },
]

export async function AppHeader() {
  const user = await currentUser()

  const initials = user
    ? [user.firstName, user.lastName]
        .filter(Boolean)
        .map((n) => n![0].toUpperCase())
        .join('')
        .slice(0, 2)
    : 'ME'

  const fullName = user?.fullName ?? ''

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-6 border-b border-border bg-card px-5">
      {/* Brand + nav */}
      <div className="flex items-center gap-6">
        <span className="text-lg font-bold tracking-tight text-brand">
          VProperty
        </span>
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href="#"
              aria-current={item.active ? 'page' : undefined}
              className={
                item.active
                  ? 'rounded-md bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand'
                  : 'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="relative mx-auto w-full max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Buscar por código VP-AAAA-NNNN, RUT o dirección..."
          className="h-9 w-full rounded-lg border border-input bg-background pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-muted-foreground xl:inline">
          En tu cartera:{' '}
          <span className="font-medium text-foreground">12 activas</span> ·{' '}
          <span className="font-medium text-[#b91c1c]">3 en SLA rojo</span>
        </span>
        <Avatar className="size-8">
          {user?.imageUrl && (
            <AvatarImage src={user.imageUrl} alt={fullName} />
          )}
          <AvatarFallback className="bg-brand text-xs font-semibold text-brand-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
