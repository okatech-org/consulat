import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: BaseLayoutProps) {
  return (
    <div>
      <PublicHeader />

      <main className={'pt-16 flex size-full grow'}>{children}</main>

      <PublicFooter />
    </div>
  );
}
