export const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://uploadthing.com https://placehold.co https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://*.vercel-scripts.com;
  child-src 'self' https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com;
  frame-src 'self' https://rbvj2i3urx.ufs.sh https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com https://utfs.io https://utfs.io/f;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' https://flagcdn.com https://placehold.co https://utfs.io https://rbvj2i3urx.ufs.sh https://qld7pfnhxe.ufs.sh https://i.ytimg.com blob: data:;
  object-src 'self' data:;
  media-src 'self' https://player.vimeo.com https://www.youtube.com https://www.youtube-nocookie.com;
  connect-src 'self'
    https://api.openai.com
    https://api.anthropic.com
    https://api.resend.com
    https://uploadthing.com
    https://*.uploadthing.com
    https://utfs.io
    https://api.twilio.com
    https://lottie.host
    https://player.vimeo.com
    https://www.youtube.com
    https://www.youtube-nocookie.com
    https://flagcdn.com
    https://*.vercel-scripts.com
    https://*.vercel-insights.com
    https://*.vercel-analytics.com
    https://rbvj2i3urx.ufs.sh
    https://qld7pfnhxe.ufs.sh
    ${process.env.NODE_ENV === 'development' ? 'http://localhost:* ws://localhost:*' : ''}
    wss://*.uploadthing.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  manifest-src 'self';
  worker-src 'self' blob:;
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
