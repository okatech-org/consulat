import { Serwist } from 'serwist';

// Minimal type declaration for the service worker manifest
// Simplified to avoid confusing Serwist/Workbox injection
declare const self: {
  __SW_MANIFEST: Array<string | { url: string; revision: string | null }>;
} & ServiceWorkerGlobalScopeEventMap;

// Initialize Serwist with minimal configuration
const serwist = new Serwist();

serwist.addEventListeners();
