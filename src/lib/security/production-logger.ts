/**
 * Logger sécurisé pour la production - Compatible avec tous les hébergeurs
 * Utilise uniquement console.log structuré pour éviter les problèmes de système de fichiers
 */

import { maskSensitiveData } from './encryption';

/**
 * Types d'événements de sécurité
 */
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  OTP_GENERATION = 'otp_generation',
  OTP_VALIDATION = 'otp_validation',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_ACCESS = 'data_access',
  FILE_UPLOAD = 'file_upload',
  SECURITY_VIOLATION = 'security_violation',
}

/**
 * Interface pour les événements de sécurité
 */
interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  identifier?: string;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  reason?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Logger de production sécurisé
 */
class ProductionLogger {
  private serviceName = 'consulat-app';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Sanitise les données sensibles
   */
  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};
    const sensitiveFields = [
      'password',
      'token',
      'otp',
      'secret',
      'key',
      'authorization',
    ];

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
   * Formate un log structuré
   */
  private formatLog(
    level: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): string {
    const sanitizedMeta = this.sanitize(metadata || {}) as Record<string, unknown>;
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      environment: process.env.NODE_ENV || 'development',
      message,
      ...sanitizedMeta,
    };

    return JSON.stringify(logEntry);
  }

  /**
   * Log d'information
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    if (this.isProduction) {
      console.log(this.formatLog('info', message, metadata));
    } else {
      console.log(`[INFO] ${message}`, metadata || {});
    }
  }

  /**
   * Log d'erreur
   */
  error(message: string, error?: unknown, context?: Record<string, unknown>): void {
    const errorData = {
      error: {
        message: (error as Error)?.message || 'Unknown error',
        stack: this.isProduction ? undefined : (error as Error)?.stack,
      },
      context: context || {},
    };

    if (this.isProduction) {
      console.error(this.formatLog('error', message, errorData));
    } else {
      console.error(`[ERROR] ${message}`, errorData);
    }
  }

  /**
   * Log de warning
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    if (this.isProduction) {
      console.warn(this.formatLog('warn', message, metadata));
    } else {
      console.warn(`[WARN] ${message}`, metadata || {});
    }
  }

  /**
   * Log d'événement de sécurité
   */
  securityEvent(event: SecurityEvent): void {
    const securityData = {
      eventCategory: 'security_event',
      timestamp: new Date().toISOString(),
      ...event,
    };

    if (this.isProduction) {
      console.log(this.formatLog('security', 'Security event', securityData));
    } else {
      console.log(`[SECURITY] ${event.type}`, securityData);
    }
  }

  /**
   * Log de debug (uniquement en développement)
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    if (!this.isProduction) {
      console.debug(`[DEBUG] ${message}`, metadata || {});
    }
  }
}

// Instance singleton
export const logger = new ProductionLogger();

/**
 * Helpers pour les événements de sécurité
 */
export const logSecurityEvent = (event: SecurityEvent): void => {
  logger.securityEvent(event);
};

export const logLoginAttempt = (
  identifier: string,
  ip: string,
  userAgent?: string,
  success: boolean = false,
  reason?: string,
): void => {
  logSecurityEvent({
    type: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILURE,
    identifier,
    ip,
    userAgent,
    success,
    reason,
  });
};

export const logOTPGeneration = (
  identifier: string,
  type: 'EMAIL' | 'PHONE',
  ip: string,
): void => {
  logSecurityEvent({
    type: SecurityEventType.OTP_GENERATION,
    identifier,
    ip,
    metadata: { otpType: type },
  });
};

export const logOTPValidation = (
  identifier: string,
  success: boolean,
  ip: string,
  reason?: string,
): void => {
  logSecurityEvent({
    type: SecurityEventType.OTP_VALIDATION,
    identifier,
    ip,
    success,
    reason,
  });
};

export const logRateLimitExceeded = (
  identifier: string,
  limitType: string,
  ip: string,
): void => {
  logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    identifier,
    ip,
    metadata: { limitType },
  });
};

export const logUnauthorizedAccess = (
  path: string,
  ip: string,
  userAgent?: string,
  userId?: string,
): void => {
  logSecurityEvent({
    type: SecurityEventType.UNAUTHORIZED_ACCESS,
    userId,
    ip,
    userAgent,
    metadata: { path },
  });
};

export const logError = (
  message: string,
  error: unknown,
  context?: Record<string, unknown>,
): void => {
  logger.error(message, error, context);
};

export const logInfo = (message: string, metadata?: Record<string, unknown>): void => {
  logger.info(message, metadata);
};

export const logWarn = (message: string, metadata?: Record<string, unknown>): void => {
  logger.warn(message, metadata);
};

export const logDebug = (message: string, metadata?: Record<string, unknown>): void => {
  logger.debug(message, metadata);
};
