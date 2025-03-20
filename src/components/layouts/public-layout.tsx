import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
export interface BaseLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <SidebarProvider>
      <PublicHeader />
      <SidebarInset className="w-dvw relative overflow-x-hidden">
        <main className={'pt-16 flex size-full grow'}>{children}</main>

        <PublicFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
