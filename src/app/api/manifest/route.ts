import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Consulat.ga',
    short_name: 'CONSULAT',
    description: 'Application consulaire de la République Gabonaise',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'minimal-ui'],
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#17A34A',
    categories: ['government', 'utilities', 'productivity'],
    dir: 'ltr',
    lang: 'fr',
    prefer_related_applications: false,
    screenshots: [
      {
        src: '/cover-image-contact.ga.jpg',
        sizes: '1280x720',
        type: 'image/jpeg',
        form_factor: 'wide',
        label: 'Consulat.ga Homepage',
      },
    ],
    icons: [
      {
        src: '/android-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/android-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
    ],
    shortcuts: [
      {
        name: 'Profil Consulaire',
        url: '/my-space',
        description: 'Gérer votre profil consulaire',
      },
      {
        name: 'Feedback',
        url: '/feedback',
        description: 'Envoyer un feedback',
      },
    ],
  });
}
