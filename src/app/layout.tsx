import './globals.css';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import React from 'react';
import { GeistSans } from 'geist/font/sans';
import type { Metadata, Viewport } from 'next';
import {
  APP_DEFAULT_TITLE,
  APP_DESCRIPTION,
  APP_NAME,
  APP_TITLE_TEMPLATE,
} from '@/lib/utils';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { ChatToggle } from '@/components/chat/chat-toggle';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    images: '/images/cover-image-contact.ga.jpg',
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    images: '/images/cover-image-contact.ga.jpg',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: '/images/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#17A34A',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  width: 'device-width',
  userScalable: false,
  colorScheme: 'light dark',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await auth();

  console.log('session', session);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={GeistSans.className + ' bg-muted'}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider session={session}>
              {children}
              <Toaster />
              <div className="hidden sm:flex fixed flex-col p-2 items-center bottom-10 right-4 rounded-full md:bottom-4 md:right-6">
                <ChatToggle />
              </div>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
