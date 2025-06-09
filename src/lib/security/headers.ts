import { NextResponse } from 'next/server';

/**
 * Headers de sécurité recommandés pour protéger l'application
 */
export const securityHeaders = {
  // Content Security Policy - Protection contre XSS
  'Content-Security-Policy': `
    default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://uploadthing.com https://placehold.co https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://*.vercel-scripts.com;
  child-src 'self' https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com;
  frame-src 'self' https://rbvj2i3urx.ufs.sh https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://utfs.io https://utfs.io/f;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' https://flagcdn.com https://placehold.co https://utfs.io https://rbvj2i3urx.ufs.sh https://qld7pfnhxe.ufs.sh https://i.ytimg.com blob: data:;
  object-src 'self' data:;
  media-src 'self' https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com;
  connect-src 'self' https://api.openai.com https://api.anthropic.com https://api.resend.com https://uploadthing.com https://*.uploadthing.com https://utfs.io https://utfs.io/f/* https://api.twilio.com https://lottie.host https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://flagcdn.com https://*.vercel-scripts.com https://*.vercel-insights.com https://*.vercel-analytics.com https://*.ufs.sh https://*.ufs.sh/f/* ${process.env.NODE_ENV === 'development' ? 'http://localhost:* ws://localhost:*' : ''} wss://*.uploadthing.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  manifest-src 'self';
  worker-src 'self' blob:;
  upgrade-insecure-requests;
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim(),

  // Forcer HTTPS (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Empêcher la mise en cache de contenu sensible
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'Surrogate-Control': 'no-store',

  // Protection contre le clickjacking
  'X-Frame-Options': 'DENY',

  // Protection MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Protection XSS intégrée du navigateur
  'X-XSS-Protection': '1; mode=block',

  // Contrôle du référent
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy (anciennement Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()',
  ].join(', '),
};

/**
 * Applique les headers de sécurité à une réponse
 * @param response - La réponse NextResponse
 * @param additionalHeaders - Headers supplémentaires optionnels
 * @returns La réponse avec les headers de sécurité
 */
export const applySecurityHeaders = (
  response: NextResponse,
  additionalHeaders?: Record<string, string>,
): NextResponse => {
  // Appliquer les headers de sécurité de base
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Appliquer les headers supplémentaires si fournis
  if (additionalHeaders) {
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
};

/**
 * Headers spécifiques pour les API routes
 */
export const apiSecurityHeaders = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
  'Access-Control-Allow-Origin':
    process.env.NODE_ENV === 'production'
      ? 'https://consulat.ga'
      : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 heures
};

/**
 * Applique les headers de sécurité spécifiques aux API
 * @param response - La réponse NextResponse
 * @returns La réponse avec les headers API sécurisés
 */
export const applyApiSecurityHeaders = (response: NextResponse): NextResponse => {
  return applySecurityHeaders(response, apiSecurityHeaders);
};

/**
 * Nonce pour CSP - généré de manière sécurisée
 * @returns Un nonce unique pour CSP
 */
export const generateCSPNonce = (): string => {
  // Utilisation de crypto.randomUUID si disponible (Edge Runtime compatible)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback compatible Edge Runtime
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Dernier fallback (moins sécurisé mais compatible)
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
