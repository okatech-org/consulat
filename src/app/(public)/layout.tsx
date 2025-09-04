import { PublicLayout } from '@/components/layouts/public-layout';

export const dynamic = 'force-dynamic';

export default function PublicRootLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
