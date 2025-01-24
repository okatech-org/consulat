export const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://uploadthing.com https://placehold.co https://player.vimeo.com;
  child-src 'self' https://player.vimeo.com;
  frame-src 'self' https://player.vimeo.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' https://flagcdn.com https://placehold.co https://utfs.io blob: data:;
  media-src 'self' https://player.vimeo.com;
  connect-src 'self'
    https://api.openai.com
    https://api.anthropic.com
    https://api.resend.com
    https://uploadthing.com
    https://utfs.io
    https://api.twilio.com
    https://lottie.host
    https://player.vimeo.com
    https://flagcdn.com
    ${process.env.NODE_ENV === 'development' ? 'http://localhost:* ws://localhost:*' : ''}
    wss://*.uploadthing.com;
  frame-ancestors 'none';
  object-src 'self data:';
  base-uri 'self';
  form-action 'self';
  manifest-src 'self';
  worker-src 'self blob:;
  upgrade-insecure-requests;
`;

export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Permissions-Policy',
    value: ['camera=()', 'microphone=()', 'geolocation=()'].join(', '),
  },
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },
];
