import { NotificationsMenu } from '@/components/notifications/notifications-menu'

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-4">
          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}