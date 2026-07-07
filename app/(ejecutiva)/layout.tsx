import { AppHeader } from '@/components/console/app-header'

export default function EjecutivaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden">
      <AppHeader />
      {children}
    </div>
  )
}
