import winston from 'winston';
import { maskSensitiveData } from './encryption';

// Champs sensibles qui doivent être masqués dans les logs
const sensitiveFields = [
  'password',
  'token',
  'otp',
  'apiKey',
  'secret',
  'key',
  'authorization',
  'cookie',
  'session',
  'jwt',
  'auth',
  'credential',
  'private',
  'email', // Masquer partiellement
  'phone', // Masquer partiellement
  'phoneNumber',
];

/**
 * Sanitise un objet en masquant les champs sensibles
 * @param obj - Objet à sanitiser
 * @returns Objet sanitisé
 */
const sanitizeObject = (obj: any): any => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some((field) => lowerKey.includes(field));

    if (isSensitive && typeof value === 'string') {
      // Masquer complètement les champs très sensibles
      if (
        ['password', 'token', 'otp', 'secret', 'key'].some((field) =>
          lowerKey.includes(field),
        )
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        // Masquer partiellement les autres champs sensibles
        sanitized[key] = maskSensitiveData(value, 2);
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Format personnalisé pour les logs qui sanitise automatiquement
 */
const sanitizerFormat = winston.format((info) => {
  // Sanitiser le message principal
  if (typeof info.message === 'object') {
    info.message = sanitizeObject(info.message);
  }

  // Sanitiser les métadonnées
  const { level, message, timestamp, ...meta } = info;
  const sanitizedMeta = sanitizeObject(meta);

  return {
    level,
    message,
    timestamp,
    ...sanitizedMeta,
  };
})();

/**
 * Configuration du logger Winston sécurisé
 */
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    sanitizerFormat,
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: {
    service: 'consulat-app',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Logs d'erreur dans un fichier dédié
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Tous les logs dans un fichier général
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
  // Ne pas quitter sur les erreurs non gérées
  exitOnError: false,
});

// Ajouter la console en développement
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

/**
 * Logger pour les événements de sécurité critiques
 */
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    sanitizerFormat,
    winston.format.json(),
  ),
  defaultMeta: {
    service: 'consulat-security',
    type: 'security_event',
  },
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      maxsize: 5242880, // 5MB
      maxFiles: 20, // Garder plus d'historique pour la sécurité
    }),
  ],
});

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
  identifier?: string; // email/phone
  ip?: string;
  userAgent?: string;
  success?: boolean;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Log un événement de sécurité
 * @param event - Événement de sécurité à logger
 */
export const logSecurityEvent = (event: SecurityEvent): void => {
  securityLogger.info('Security event', {
    ...event,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log une tentative de connexion
 */
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

/**
 * Log une génération d'OTP
 */
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

/**
 * Log une validation d'OTP
 */
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

/**
 * Log un dépassement de rate limit
 */
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

/**
 * Log un accès non autorisé
 */
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

/**
 * Helper pour logger les erreurs avec contexte
 */
export const logError = (
  message: string,
  error: any,
  context?: Record<string, any>,
): void => {
  logger.error(message, {
    error: {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    },
    context: context || {},
  });
};

/**
 * Helper pour logger les informations
 */
export const logInfo = (message: string, metadata?: Record<string, any>): void => {
  logger.info(message, metadata || {});
};

/**
 * Helper pour logger les warnings
 */
export const logWarn = (message: string, metadata?: Record<string, any>): void => {
  logger.warn(message, metadata || {});
};

/**
 * Helper pour logger les debug en développement
 */
export const logDebug = (message: string, metadata?: Record<string, any>): void => {
  logger.debug(message, metadata || {});
};
