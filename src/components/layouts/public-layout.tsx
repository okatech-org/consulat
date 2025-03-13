import { PublicHeader } from '@/components/public/header';
import { PublicFooter } from '@/components/public/footer';
import { auth } from '@/auth';

export interface BaseLayoutProps {
  children: React.ReactNode;
}

export async function PublicLayout({ children }: BaseLayoutProps) {
  const session = await auth();

  return (
    <div>
      <PublicHeader session={session} />

      <main className={'flex size-full grow'}>{children}</main>

      <PublicFooter />
    </div>
  );
}
