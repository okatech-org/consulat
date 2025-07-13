import { ROUTES } from '@/schemas/routes';
import { hasAnyRole } from '@/lib/permissions/utils';
import type { SessionUser } from '@/types';

export type RedirectMethod = 'replace' | 'push' | 'server';

export interface RedirectOptions {
  method?: RedirectMethod;
  fallbackUrl?: string;
  preserveCallback?: boolean;
}

/**
 * Centralized redirect logic for consistent behavior across the app
 */
export class AuthRedirectManager {
  /**
   * Get the appropriate redirect URL based on user role and context
   */
  static getRedirectUrl(user?: SessionUser, callbackUrl?: string | null): string {
    // If there's a callback URL, use it (but validate it's safe)
    if (callbackUrl && this.isSafeCallbackUrl(callbackUrl)) {
      return callbackUrl;
    }

    // No user means go to login
    if (!user) {
      return ROUTES.auth.login;
    }

    // Priority: SUPER_ADMIN > ADMIN > MANAGER > AGENT > USER
    if (hasAnyRole(user, ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT'])) {
      return ROUTES.dashboard.base;
    }

    if (hasAnyRole(user, ['USER'])) {
      return ROUTES.user.base;
    }

    // Fallback to base route
    return ROUTES.base;
  }

  /**
   * Validate that callback URL is safe (prevent open redirects)
   */
  static isSafeCallbackUrl(url: string): boolean {
    try {
      // Only allow relative URLs or same origin
      return (
        url.startsWith('/') &&
        !url.startsWith('//') &&
        !url.includes('javascript:') &&
        !url.includes('data:') &&
        !url.includes('http:') &&
        !url.includes('https:')
      );
    } catch {
      return false;
    }
  }

  /**
   * Perform redirect with specified method
   */
  static performRedirect(url: string, method: RedirectMethod = 'replace'): void {
    if (typeof window === 'undefined') {
      throw new Error('performRedirect can only be called on client side');
    }

    switch (method) {
      case 'replace':
        window.location.replace(url);
        break;
      case 'push':
        window.location.href = url;
        break;
      default:
        window.location.replace(url);
    }
  }

  /**
   * Handle login success redirect
   */
  static handleLoginSuccess(
    user: SessionUser,
    callbackUrl?: string | null,
    options: RedirectOptions = {},
  ): void {
    const redirectUrl = this.getRedirectUrl(user, callbackUrl);

    // Small delay to prevent race conditions
    setTimeout(() => {
      this.performRedirect(redirectUrl, options.method || 'replace');
    }, 100);
  }

  /**
   * Handle logout redirect
   */
  static handleLogoutSuccess(options: RedirectOptions = {}): void {
    document.cookie =
      'better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie =
      'better-auth.dont_remember=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    const redirectUrl = options.fallbackUrl || ROUTES.base;
    this.performRedirect(redirectUrl, options.method || 'replace');
  }

  /**
   * Build login URL with callback
   */
  static buildLoginUrl(callbackUrl?: string): string {
    if (typeof window === 'undefined') {
      // Server-side version
      const loginUrl = new URL(ROUTES.auth.login, process.env.NEXT_PUBLIC_APP_URL);
      if (callbackUrl && this.isSafeCallbackUrl(callbackUrl)) {
        loginUrl.searchParams.set('callbackUrl', callbackUrl);
      }
      return loginUrl.pathname + loginUrl.search;
    }

    // Client-side version
    const loginUrl = new URL(ROUTES.auth.login, window.location.origin);
    if (callbackUrl && this.isSafeCallbackUrl(callbackUrl)) {
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }
    return loginUrl.toString();
  }
}
