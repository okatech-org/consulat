import { PublicHeader } from "@/components/public/header"
import { PublicFooter } from "@/components/public/footer"

export interface BaseLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen w-screen flex-col overflow-hidden">
      <PublicHeader />

      <main className={"flex size-full grow"}>
        {children}
      </main>

      <PublicFooter />
    </div>
  )
}