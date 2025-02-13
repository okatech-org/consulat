import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { SidebarProvider } from '@/components/ui/sidebar';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/schemas/routes';
import { getUserById } from '@/lib/user/getters';

export default async function AuthenticatedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const dbUser = await getUserById(session?.user?.id);
  const headersList = await headers();
  const pathname = headersList.get('x-current-path') || '/';
  const fallbackUrl = `${ROUTES.auth.login}?callbackUrl=${encodeURIComponent(pathname)}`;

  if (!session?.user) {
    redirect(fallbackUrl);
  }

  if (!dbUser) {
    redirect(fallbackUrl);
  }

  return (
    <SessionProvider session={session}>
      <SidebarProvider>{children}</SidebarProvider>
    </SessionProvider>
  );
}
