import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import { db } from '@/server/db';

// Types pour les fonctions d'envoi personnalisées
export type OTPSendFunction = (
  channel: 'email' | 'sms',
  target: string,
  code: string,
) => Promise<{ success: boolean; error?: string }>;

// Factory pour créer des erreurs d'authentification avec des codes spécifiques
function createAuthError(code: string, message: string) {
  class CustomCredentialsSignin extends CredentialsSignin {
    code = code;
  }
  const error = new CustomCredentialsSignin();
  error.message = message;
  return error;
}

// Nouvelle erreur spécifique pour l'envoi de code
function createCodeSentError(message: string) {
  class CodeSentError extends CredentialsSignin {
    code = 'CODE_SENT';
  }
  const error = new CodeSentError();
  error.message = message;
  return error;
}

// Déterminer le type et le canal selon l'identifiant
function getIdentifierType(identifier: string): {
  type: 'SMS' | 'EMAIL';
  channel: 'email' | 'sms';
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{2}-\d{9,}$/;

  if (emailRegex.test(identifier)) {
    return { type: 'EMAIL', channel: 'email' };
  } else if (phoneRegex.test(identifier)) {
    return { type: 'SMS', channel: 'sms' };
  } else {
    throw createAuthError('invalid_identifier', "Format d'identifiant invalide");
  }
}

// Générer un code OTP à 6 chiffres
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configuration du provider OTP personnalisable
interface CustomOTPProviderConfig {
  sendOTP: OTPSendFunction;
  codeLength?: number;
  expiryMinutes?: number;
  maxAttempts?: number;
}

export function createOTPAuthProvider(config: CustomOTPProviderConfig): Provider {
  const { sendOTP, codeLength = 6, expiryMinutes = 5, maxAttempts = 3 } = config;

  return CredentialsProvider({
    id: 'otp-auth',
    name: 'OTP Auth',
    credentials: {
      identifier: { label: 'Identifier', type: 'text' }, // email ou phone
      code: { label: 'Code', type: 'text' },
      action: { label: 'Action', type: 'text' }, // "send" ou "verify"
    },
    async authorize(credentials) {
      // Vérification de type pour identifier
      const identifier = credentials?.identifier;
      if (!identifier || typeof identifier !== 'string') {
        throw createAuthError('missing_identifier', 'Email ou téléphone requis');
      }

      // Vérification de type pour action
      const action = credentials?.action;
      if (typeof action !== 'string') {
        throw createAuthError('missing_action', 'Action requise');
      }

      // Déterminer le type d'identifiant
      const { type, channel } = getIdentifierType(identifier);

      // Si on demande l'envoi du code
      if (action === 'send') {
        // Générer un nouveau code OTP
        const otpCode = generateOTPCode();

        // Envoyer le code via la fonction personnalisée
        const result = await sendOTP(channel, identifier, otpCode);

        if (!result.success) {
          throw createAuthError(
            'send_failed',
            result.error || "Erreur lors de l'envoi du code",
          );
        }

        // Stocker le code dans la base de données
        await db.oTPCode.upsert({
          where: {
            identifier_type: {
              identifier: identifier,
              type: type,
            },
          },
          create: {
            identifier: identifier,
            code: otpCode,
            type: type,
            expires: new Date(Date.now() + expiryMinutes * 60 * 1000),
          },
          update: {
            code: otpCode,
            attempts: 0,
            verified: false,
            expires: new Date(Date.now() + expiryMinutes * 60 * 1000),
          },
        });

        // Lancer une erreur spéciale pour indiquer que le code a été envoyé
        throw createCodeSentError('Code envoyé avec succès');
      }

      // Si on vérifie le code
      if (action === 'verify') {
        const code = credentials?.code;
        if (!code || typeof code !== 'string') {
          throw createAuthError('missing_code', 'Code de vérification requis');
        }

        if (code.length !== codeLength) {
          throw createAuthError(
            'invalid_code_length',
            `Le code doit contenir ${codeLength} chiffres`,
          );
        }

        // Récupérer le code OTP de la base de données
        const otpCode = await db.oTPCode.findUnique({
          where: {
            identifier_type: {
              identifier: identifier,
              type: type,
            },
          },
        });

        if (!otpCode) {
          throw createAuthError('no_code_pending', 'Aucun code en attente');
        }

        if (otpCode.verified) {
          throw createAuthError('code_already_used', 'Code déjà utilisé');
        }

        if (new Date() > otpCode.expires) {
          throw createAuthError('code_expired', 'Code expiré');
        }

        if (otpCode.attempts >= maxAttempts) {
          throw createAuthError(
            'too_many_attempts',
            'Trop de tentatives. Demandez un nouveau code.',
          );
        }

        // Vérifier le code
        if (otpCode.code !== code) {
          await db.oTPCode.update({
            where: { id: otpCode.id },
            data: { attempts: { increment: 1 } },
          });

          throw createAuthError('invalid_code', 'Code invalide');
        }

        // Marquer comme vérifié
        await db.oTPCode.update({
          where: { id: otpCode.id },
          data: { verified: true },
        });

        // Récupérer l'utilisateur existant (ne pas créer)
        let user;
        if (type === 'EMAIL') {
          user = await db.user.findUnique({
            where: { email: identifier },
          });

          if (!user) {
            throw createAuthError('user_not_found', 'Aucun compte associé à cet email');
          }

          // Mettre à jour la vérification email si nécessaire
          if (!user.emailVerified) {
            await db.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            });
          }
        } else {
          user = await db.user.findUnique({
            where: { phoneNumber: identifier },
          });

          if (!user) {
            throw createAuthError(
              'user_not_found',
              'Aucun compte associé à ce téléphone',
            );
          }

          // Mettre à jour la vérification téléphone si nécessaire
          if (!user.phoneNumberVerified) {
            await db.user.update({
              where: { id: user.id },
              data: { phoneNumberVerified: true },
            });
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          phoneNumber: user.phoneNumber,
        };
      }

      throw createAuthError('invalid_action', 'Action invalide');
    },
  });
}
