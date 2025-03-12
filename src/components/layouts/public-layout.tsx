import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export async function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <div className="flex h-dvh w-dvw overflow-x-hidden flex-col">
      <PublicHeader />

      <main className={'grow min-h-screen w-screen'}>{children}</main>

      <PublicFooter />
    </div>
  );
}
