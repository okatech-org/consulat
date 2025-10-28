import '@/styles/globals.css';

import { type Metadata, type Viewport } from 'next';
import { Geist } from 'next/font/google';

import { env } from '@/env';
import { getLocale, getMessages } from 'next-intl/server';
import ErrorBoundary from '@/components/error-boundary';
import { ClerkProvider } from '@clerk/nextjs';
import { frFR, enUS } from '@clerk/localizations';
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl';

import { cookies } from 'next/headers';
import { getServerTheme } from '@/lib/theme-server';
import { ThemeSync } from '@/components/layouts/theme-sync';
import { ThemeWrapper } from '@/components/layouts/theme-wrapper';
import { ViewportDetector } from '@/components/layouts/viewport-detector';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AuthProvider } from '@/contexts/auth-context';
import { ChatProvider } from '@/contexts/chat-context';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ConvexProvider } from './convex-provider';

const localizations = {
  fr: frFR,
  en: enUS,
};

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
    startupImage: [
      {
        url: '/apple-touch-icon.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
    date: false,
    url: false,
  },
  keywords: ['consulat', 'gabon', 'diaspora', 'administration', 'services consulaires'],
  category: 'government',
  creator: 'Okatech',
  publisher: 'Okatech',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: env.NEXT_PUBLIC_APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    images: [
      {
        url: '/cover-image-contact.ga.jpg',
        width: 1280,
        height: 720,
        alt: 'Consulat.ga - Application consulaire de la République Gabonaise',
      },
    ],
    description: APP_DESCRIPTION,
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: '/cover-image-contact.ga.jpg',
        width: 1280,
        height: 720,
        alt: 'Consulat.ga - Application consulaire de la République Gabonaise',
      },
    ],
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    creator: '@RepubliqueGabonaise',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/android-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        url: '/android-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        rel: 'apple-touch-startup-image',
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#04367D',
  initialScale: 1,
  minimumScale: 1,
  width: 'device-width',
  userScalable: false,
  colorScheme: 'light dark',
  viewportFit: 'cover',
};

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [messages, locale, serverTheme, cookieStore] = await Promise.all([
    getMessages(),
    getLocale(),
    getServerTheme(),
    cookies(),
  ]);

  return (
    <NextIntlClientProvider messages={messages as AbstractIntlMessages}>
      <ClerkProvider localization={localizations[locale as keyof typeof localizations]}>
        <ConvexProvider>
          <html lang={locale} className={geist.variable} suppressHydrationWarning>
            <body suppressHydrationWarning>
              <ErrorBoundary>
                <AuthProvider>
                  <SidebarProvider
                    defaultOpen={
                      cookieStore?.get('sidebar_state')?.value
                        ? cookieStore.get('sidebar_state')?.value === 'true'
                        : true
                    }
                    style={
                      {
                        '--sidebar-width': 'calc(var(--spacing) * 64)',
                        '--header-height': 'calc(var(--spacing) * 12)',
                      } as React.CSSProperties
                    }
                  >
                    <SpeedInsights />
                    <Analytics />

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
                  </SidebarProvider>
                </AuthProvider>
              </ErrorBoundary>
            </body>
          </html>
        </ConvexProvider>
      </ClerkProvider>
    </NextIntlClientProvider>
  );
}
