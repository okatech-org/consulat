import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    name: 'Consulat.ga',
    short_name: 'Consulat',
    description: 'Application consulaire',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#17A34A',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  })
}