import { cookies } from 'next/headers';
import { SidebarProvider } from '../ui/sidebar';
import { Analytics } from '@vercel/analytics/react';
import { getMessages } from 'next-intl/server';
import { ChatProvider } from '@/contexts/chat-context';
import { NextIntlClientProvider, AbstractIntlMessages } from 'next-intl';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ViewportDetector } from './viewport-detector';

export async function Providers({ children }: { children: React.ReactNode }) {
  const promises = [getMessages()];

  const [messages] = await Promise.all(promises);
  const cookieStore = await cookies();

  const sidebarState = cookieStore?.get('sidebar_state');

  return (
    <SidebarProvider defaultOpen={sidebarState?.value === 'true'}>
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
