import './globals.css';
import './animation.css';
import { ThemeProvider } from '@/components/layouts/theme-provider';
import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Toaster } from '@/components/ui/toaster';
import { ChatToggle } from '@/components/chat/chat-toggle';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/auth';
import { ClientInit } from '@/components/ui/client-init';
import { env } from '@/lib/env/index';

const APP_DEFAULT_TITLE = 'Consulat.ga';
const APP_TITLE_TEMPLATE = '%s - Consulat.ga';
const APP_DESCRIPTION =
  'Initiative du CTRI pour la diaspora, Consulat.ga transforme la relation administrative entre le Gabon et ses citoyens en France. Participez activement à la construction du Gabon de demain!';

export const metadata: Metadata = {
  applicationName: env.NEXT_PUBLIC_APP_NAME,
  metadataBase: new URL(env.NEXT_PUBLIC_URL),
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
    siteName: env.NEXT_PUBLIC_APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    images:
      'https://rbvj2i3urx.ufs.sh/f/H4jCIhEWEyOibxPJi1LYxGmEboytI3PS7QDKqgNOVFnvWRli',
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    images:
      'https://rbvj2i3urx.ufs.sh/f/H4jCIhEWEyOibxPJi1LYxGmEboytI3PS7QDKqgNOVFnvWRli',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: {
    icon: '/favicon.ico',
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

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const session = await auth();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className + ' bg-muted'}>
        <ClientInit />
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
              <div className="flex fixed flex-col p-2 items-center bottom-2 translate-x-1/2 sm:translate-x-0 right-[50%] rounded-full sm:bottom-4 sm:right-6">
                <ChatToggle />
              </div>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
