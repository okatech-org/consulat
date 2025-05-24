import './globals.css';
import './animation.css';
import React from 'react';
import { Inter } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import { getLocale } from 'next-intl/server';
import { env } from '@/lib/env/index';
import { Providers } from '@/components/layouts/providers';

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

const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale as string} suppressHydrationWarning dir="ltr">
      <body className={inter.className + ' bg-muted'}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
