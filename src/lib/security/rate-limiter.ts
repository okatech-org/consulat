import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Rate limiter pour les tentatives d'OTP
 * 5 tentatives par 15 minutes, bloqué pendant 30 minutes en cas de dépassement
 */
export const otpLimiter = new RateLimiterMemory({
  points: 5, // 5 tentatives
  duration: 900, // par 15 minutes (900 secondes)
  blockDuration: 1800, // bloquer pendant 30 minutes (1800 secondes)
  keyPrefix: 'otp_limit',
});

/**
 * Rate limiter pour les tentatives de connexion
 * 10 tentatives par 15 minutes, bloqué pendant 15 minutes en cas de dépassement
 */
export const loginLimiter = new RateLimiterMemory({
  points: 10, // 10 tentatives
  duration: 900, // par 15 minutes
  blockDuration: 900, // bloquer pendant 15 minutes
  keyPrefix: 'login_limit',
});

/**
 * Rate limiter pour la génération d'OTP
 * 3 OTP par 5 minutes par identifier (email/phone)
 */
export const otpGenerationLimiter = new RateLimiterMemory({
  points: 3, // 3 générations d'OTP
  duration: 300, // par 5 minutes (300 secondes)
  blockDuration: 600, // bloquer pendant 10 minutes
  keyPrefix: 'otp_gen_limit',
});

/**
 * Rate limiter global par IP
 * 100 requêtes par minute par IP
 */
export const globalLimiter = new RateLimiterMemory({
  points: 100, // 100 requêtes
  duration: 60, // par minute
  blockDuration: 300, // bloquer pendant 5 minutes
  keyPrefix: 'global_limit',
});

/**
 * Utilitaire pour obtenir l'identifiant de rate limiting
 * @param identifier - Email, téléphone ou IP
 * @param type - Type d'identifiant pour le préfixe
 */
export const getRateLimitKey = (identifier: string, type?: string): string => {
  const prefix = type ? `${type}_` : '';
  return `${prefix}${identifier}`;
};

/**
 * Vérifie et consomme un point du rate limiter
 * @param limiter - Instance du rate limiter
 * @param key - Clé unique pour l'utilisateur/IP
 * @returns Promise avec le résultat de la vérification
 */
export const checkRateLimit = async (
  limiter: RateLimiterMemory,
  key: string,
): Promise<{
  allowed: boolean;
  remainingPoints?: number;
  msBeforeNext?: number;
}> => {
  try {
    const resRateLimiter = await limiter.consume(key);

    return {
      allowed: true,
      remainingPoints: resRateLimiter.remainingPoints,
      msBeforeNext: resRateLimiter.msBeforeNext,
    };
  } catch (rejRes) {
    // L'erreur de rate limiting contient les informations de rejet
    const rateLimitError = rejRes as {
      remainingPoints?: number;
      msBeforeNext?: number;
    };

    return {
      allowed: false,
      remainingPoints: rateLimitError.remainingPoints || 0,
      msBeforeNext: rateLimitError.msBeforeNext || 0,
    };
  }
};

/**
 * Formate le temps d'attente en format lisible
 * @param ms - Millisecondes d'attente
 * @returns Temps formaté en minutes/secondes
 */
export const formatWaitTime = (ms: number): string => {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} et ${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
  }

  return `${remainingSeconds} seconde${remainingSeconds > 1 ? 's' : ''}`;
};
