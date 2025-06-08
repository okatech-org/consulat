/**
 * Logger compatible avec l'Edge Runtime de Next.js
 * N'utilise pas le système de fichiers (fs) pour fonctionner dans le middleware
 */

import { maskSensitiveData } from './encryption';

/**
 * Types d'événements de sécurité pour l'edge runtime
 */
export enum EdgeSecurityEventType {
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MIDDLEWARE_ERROR = 'middleware_error',
}

/**
 * Interface pour les événements de sécurité edge
 */
interface EdgeSecurityEvent {
  type: EdgeSecurityEventType;
  identifier?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

/**
 * Logger simple pour l'edge runtime qui utilise console.log structuré
 */
class EdgeLogger {
  private serviceName = 'consulat-edge-security';

  /**
   * Sanitise les données sensibles pour l'edge runtime
   */
  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sanitized: any = {};
    const sensitiveFields = ['password', 'token', 'otp', 'secret', 'key'];

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveFields.some((field) => lowerKey.includes(field));

      if (isSensitive && typeof value === 'string') {
        sanitized[key] = '[REDACTED]';
      } else if (
        typeof value === 'string' &&
        (lowerKey.includes('email') || lowerKey.includes('phone'))
      ) {
        sanitized[key] = maskSensitiveData(value, 2);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Formate un log pour l'edge runtime
   */
  private formatLog(level: string, message: string, metadata?: any): string {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...this.sanitize(metadata || {}),
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Log d'information
   */
  info(message: string, metadata?: any): void {
    console.log(this.formatLog('info', message, metadata));
  }

  /**
   * Log d'erreur
   */
  error(message: string, metadata?: any): void {
    console.error(this.formatLog('error', message, metadata));
  }

  /**
   * Log de warning
   */
  warn(message: string, metadata?: any): void {
    console.warn(this.formatLog('warn', message, metadata));
  }

  /**
   * Log d'événement de sécurité
   */
  securityEvent(event: EdgeSecurityEvent): void {
    this.info('Security event', {
      type: 'security_event',
      ...event,
    });
  }
}

// Instance singleton pour l'edge runtime
export const edgeLogger = new EdgeLogger();

/**
 * Log un dépassement de rate limit (edge-compatible)
 */
export const logEdgeRateLimitExceeded = (
  identifier: string,
  limitType: string,
  ip: string,
): void => {
  edgeLogger.securityEvent({
    type: EdgeSecurityEventType.RATE_LIMIT_EXCEEDED,
    identifier,
    ip,
    metadata: { limitType },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log un accès non autorisé (edge-compatible)
 */
export const logEdgeUnauthorizedAccess = (
  path: string,
  ip: string,
  userAgent?: string,
): void => {
  edgeLogger.securityEvent({
    type: EdgeSecurityEventType.UNAUTHORIZED_ACCESS,
    ip,
    userAgent,
    path,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log une erreur du middleware (edge-compatible)
 */
export const logEdgeMiddlewareError = (
  message: string,
  error: any,
  context?: Record<string, any>,
): void => {
  edgeLogger.error(message, {
    error: {
      message: error?.message,
      name: error?.name,
    },
    context: context || {},
  });
};
