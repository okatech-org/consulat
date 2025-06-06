import { NextResponse } from 'next/server';

/**
 * Headers de sécurité recommandés pour protéger l'application
 */
export const securityHeaders = {
  // Content Security Policy - Protection contre XSS
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.uploadthing.com https://*.uploadthing.com;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
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

  // Protection contre les attaques de timing
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
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
  // Utilisation de crypto.randomUUID si disponible, sinon fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback pour les environnements sans crypto.randomUUID
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};
