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

export async function Providers({ children }: { children: React.ReactNode }) {
  const promises = [getMessages()];

  const [messages] = await Promise.all(promises);
  const cookieStore = await cookies();

  const sidebarState = cookieStore?.get('sidebar_state');

  return (
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
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ChatProvider>
            <ViewportDetector />
            {children}
            <Toaster />
          </ChatProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </SidebarProvider>
  );
}
