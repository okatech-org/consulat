import { z } from 'zod';

/**
 * Schéma de validation pour les variables d'environnement
 */
const envSchema = z.object({
  // Variables de base Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL doit être une URL valide'),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET doit faire au moins 32 caractères'),

  // Base de données
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL doit être une URL de base de données valide'),

  // Chiffrement et sécurité
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY doit faire au moins 32 caractères'),

  // UploadThing
  UPLOADTHING_SECRET: z.string().min(1, 'UPLOADTHING_SECRET est requis'),
  UPLOADTHING_APP_ID: z.string().min(1, 'UPLOADTHING_APP_ID est requis'),

  // Email (optionnel en développement)
  RESEND_API_KEY: z.string().optional(),

  // SMS/Téléphone (optionnel en développement)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Configuration de sécurité avancée (optionnelles)
  RATE_LIMIT_REDIS_URL: z.string().url().optional(),
  SECURITY_WEBHOOK_URL: z.string().url().optional(),

  // Monitoring (optionnel)
  SENTRY_DSN: z.string().url().optional(),
});

/**
 * Type TypeScript inféré du schéma
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Variables d'environnement validées
 */
let validatedEnv: EnvConfig | null = null;

/**
 * Valide les variables d'environnement au démarrage de l'application
 * @throws Error si la validation échoue
 */
export const validateEnvironment = (): EnvConfig => {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`,
      );

      const message = `❌ Erreur de configuration d'environnement:\n${errorMessages.join('\n')}`;

      // Logger l'erreur en production, console.error en développement
      if (process.env.NODE_ENV === 'production') {
        // En production, on peut avoir un logger basique
        console.error(message);
      } else {
        console.error('\n' + '='.repeat(60));
        console.error('🚨 ERREUR DE CONFIGURATION ENVIRONNEMENT');
        console.error('='.repeat(60));
        console.error(message);
        console.error('='.repeat(60) + '\n');
      }

      throw new Error("Configuration d'environnement invalide");
    }

    throw error;
  }
};

/**
 * Récupère une variable d'environnement validée
 * @param key - Clé de la variable d'environnement
 * @returns Valeur de la variable
 */
export const getEnvVar = <K extends keyof EnvConfig>(key: K): EnvConfig[K] => {
  const env = validateEnvironment();
  return env[key];
};

/**
 * Vérifie si l'environnement est en production
 */
export const isProduction = (): boolean => {
  return getEnvVar('NODE_ENV') === 'production';
};

/**
 * Vérifie si l'environnement est en développement
 */
export const isDevelopment = (): boolean => {
  return getEnvVar('NODE_ENV') === 'development';
};

/**
 * Vérifie si l'environnement est en test
 */
export const isTest = (): boolean => {
  return getEnvVar('NODE_ENV') === 'test';
};

/**
 * Récupère l'URL de base de l'application
 */
export const getBaseUrl = (): string => {
  return getEnvVar('NEXTAUTH_URL');
};

/**
 * Récupère la clé de chiffrement
 */
export const getEncryptionKey = (): string => {
  return getEnvVar('ENCRYPTION_KEY');
};

/**
 * Récupère les configuration de base de données
 */
export const getDatabaseUrl = (): string => {
  return getEnvVar('DATABASE_URL');
};

/**
 * Vérifie si le service d'email est configuré
 */
export const isEmailConfigured = (): boolean => {
  const apiKey = getEnvVar('RESEND_API_KEY');
  return !!apiKey && apiKey.length > 0;
};

/**
 * Vérifie si le service SMS est configuré
 */
export const isSmsConfigured = (): boolean => {
  const accountSid = getEnvVar('TWILIO_ACCOUNT_SID');
  const authToken = getEnvVar('TWILIO_AUTH_TOKEN');
  const phoneNumber = getEnvVar('TWILIO_PHONE_NUMBER');

  return !!(accountSid && authToken && phoneNumber);
};

/**
 * Récupère la configuration Redis pour le rate limiting (si disponible)
 */
export const getRedisConfig = (): string | null => {
  return getEnvVar('RATE_LIMIT_REDIS_URL') || null;
};

/**
 * Affiche un résumé de la configuration de sécurité au démarrage
 */
export const displaySecurityConfig = (): void => {
  if (isDevelopment()) {
    console.log('\n' + '🛡️'.repeat(30));
    console.log('🔒 CONFIGURATION DE SÉCURITÉ');
    console.log('🛡️'.repeat(30));
    console.log(`📍 Environnement: ${getEnvVar('NODE_ENV')}`);
    console.log(`🔐 Chiffrement: ${getEncryptionKey() ? '✅ Configuré' : '❌ Manquant'}`);
    console.log(`📧 Email: ${isEmailConfigured() ? '✅ Configuré' : '⚠️ Non configuré'}`);
    console.log(`📱 SMS: ${isSmsConfigured() ? '✅ Configuré' : '⚠️ Non configuré'}`);
    console.log(`💾 Redis: ${getRedisConfig() ? '✅ Configuré' : '⚠️ Mémoire locale'}`);
    console.log('🛡️'.repeat(30) + '\n');
  }
};

// Validation automatique au chargement du module (uniquement si pas en test)
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment();
  displaySecurityConfig();
}
