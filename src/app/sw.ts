import { Serwist } from 'serwist';

// Minimal type declaration for the service worker manifest
// Simplified to avoid confusing Serwist/Workbox injection
declare const self: {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
} & ServiceWorkerGlobalScope;

// Initialize Serwist with minimal configuration
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST, // Only reference to __SW_MANIFEST
  skipWaiting: true,
  clientsClaim: true,
});

serwist.addEventListeners();
