import '@/styles/globals.css';

import { type Metadata, type Viewport } from 'next';
import { Geist } from 'next/font/google';

import { TRPCReactProvider } from '@/trpc/react';
import { SessionProvider } from 'next-auth/react';
import { env } from '@/env';
import { Providers } from '@/components/layouts/providers';
import { auth } from '@/server/auth';
import { getLocale } from 'next-intl/server';
import { RoleBasedDataProvider } from '@/contexts/role-data-context';
import { loadRoleBasedData } from '@/lib/role-data-loader';
import ErrorBoundary from '@/components/error-boundary';

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
  const session = await auth();

  const roleData = session ? await loadRoleBasedData() : null;
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <ErrorBoundary>
          <TRPCReactProvider>
            <SessionProvider session={session}>
              <RoleBasedDataProvider initialData={roleData}>
                <Providers>{children}</Providers>
              </RoleBasedDataProvider>
            </SessionProvider>
          </TRPCReactProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
