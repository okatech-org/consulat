import { cookies } from 'next/headers';
import { SidebarProvider } from '../ui/sidebar';
import { Analytics } from '@vercel/analytics/react';
import { getMessages } from 'next-intl/server';
import { ChatProvider } from '@/contexts/chat-context';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ViewportDetector } from './viewport-detector';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getServerTheme } from '@/lib/theme-server';
import { ThemeSync } from './theme-sync';
import { ThemeWrapper } from './theme-wrapper';
import { AuthProvider } from '@/contexts/auth-context';
import { getCurrentUser } from '@/lib/auth/utils';

export async function Providers({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const [messages, serverTheme] = await Promise.all([getMessages(), getServerTheme()]);
  const cookieStore = await cookies();

  const sidebarState = cookieStore?.get('sidebar_state');

  return (
    <AuthProvider user={user}>
      <SidebarProvider
        defaultOpen={sidebarState?.value ? sidebarState.value === 'true' : true}
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 64)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <SpeedInsights />
        <Analytics />
        <NextIntlClientProvider messages={messages as AbstractIntlMessages}>
          <ThemeProvider
            attribute="class"
            defaultTheme={serverTheme}
            enableSystem
            enableColorScheme={false}
            disableTransitionOnChange
            storageKey="theme"
          >
            <ThemeWrapper>
              <ChatProvider>
                <ThemeSync />
                <ViewportDetector />
                {children}
                <Toaster />
              </ChatProvider>
            </ThemeWrapper>
          </ThemeProvider>
        </NextIntlClientProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
