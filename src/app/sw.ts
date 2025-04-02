import { defaultCache } from '@serwist/next/worker';
import { NetworkFirst } from 'serwist';
import { Serwist } from 'serwist';

// Minimal type declaration for the service worker manifest
// Simplified to avoid confusing Serwist/Workbox injection
declare const self: {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
} & ServiceWorkerGlobalScope;

// Define offline fallback strategy
const offlineFallbackStrategy = new NetworkFirst({
  cacheName: 'navigation-cache',
  networkTimeoutSeconds: 3,
  plugins: [
    {
      handlerDidError: async () => {
        // Try to get the offline page from cache
        const offlineResponse = await caches.match('/offline.html');
        if (offlineResponse) {
          return offlineResponse;
        }
        // Simple fallback text response if offline.html isn't in cache
        return new Response('You are currently offline. Please check your connection.', {
          headers: { 'Content-Type': 'text/plain' },
          status: 503,
        });
      },
    },
  ],
});

// Initialize Serwist with minimal configuration
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // Only reference to __SW_MANIFEST
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // Handle navigation requests with offline fallback
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: offlineFallbackStrategy,
    },
    // Include default cache strategies
    ...defaultCache,
  ],
});

serwist.addEventListeners();
