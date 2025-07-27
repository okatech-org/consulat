import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import { db } from '@/server/db';
import { UserRole } from '@prisma/client';

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
  const phoneRegex = /^\+\d{3}-\d{9,}$/;

  if (emailRegex.test(identifier)) {
    return { type: 'EMAIL', channel: 'email' };
  } else if (phoneRegex.test(identifier)) {
    return { type: 'SMS', channel: 'sms' };
  } else {
    throw createAuthError(
      'invalid_identifier',
      "Format de numéro de téléphone ou d'email invalide",
    );
  }
}

// Générer un code OTP à 6 chiffres
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configuration du provider signup OTP personnalisable
interface CustomSignupOTPProviderConfig {
  sendOTP: OTPSendFunction;
  codeLength?: number;
  expiryMinutes?: number;
  maxAttempts?: number;
}

export function createSignupOTPProvider(config: CustomSignupOTPProviderConfig): Provider {
  const { sendOTP, codeLength = 6, expiryMinutes = 10, maxAttempts = 3 } = config;

  return CredentialsProvider({
    id: 'signup-auth',
    name: 'Signup OTP Auth',
    credentials: {
      // Données d'inscription
      firstName: { label: 'Prénom', type: 'text' },
      lastName: { label: 'Nom', type: 'text' },
      email: { label: 'Email', type: 'email' },
      phone: { label: 'Téléphone', type: 'tel' },
      countryCode: { label: 'Code pays', type: 'text' },
      verificationMethod: { label: 'Méthode', type: 'text' }, // "email" ou "sms"

      // Données de vérification
      code: { label: 'Code', type: 'text' },
      action: { label: 'Action', type: 'text' }, // "send" ou "verify"
    },
    async authorize(credentials) {
      const action = credentials?.action;
      if (typeof action !== 'string') {
        throw createAuthError('missing_action', 'Action requise');
      }

      const firstName = credentials?.firstName;
      const lastName = credentials?.lastName;
      const email = credentials?.email;
      const phone = credentials?.phone;
      const countryCode = credentials?.countryCode;
      const verificationMethod = credentials?.verificationMethod as 'email' | 'sms';

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !countryCode ||
        !verificationMethod
      ) {
        throw createAuthError(
          'missing_data',
          "Toutes les données d'inscription sont requises",
        );
      }

      // Validation des formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email as string)) {
        throw createAuthError('invalid_email', "Format d'email invalide");
      }

      const phoneRegex = /^\+\d{3}-\d{9,}$/;
      if (!phoneRegex.test(phone as string)) {
        throw createAuthError('invalid_phone', 'Format de téléphone invalide');
      }

      // Vérifier que le pays existe et est actif
      const country = await db.country.findFirst({
        where: {
          code: countryCode,
          status: 'ACTIVE',
        },
      });

      if (!country) {
        throw createAuthError('invalid_country', 'Pays non supporté');
      }

      // Vérifier que l'email et le téléphone ne sont pas déjà utilisés
      const existingUser = await db.user.findFirst({
        where: {
          OR: [{ email: email }, { phoneNumber: phone }],
        },
      });

      if (existingUser) {
        if (existingUser.email === email) {
          throw createAuthError('email_taken', 'Cette adresse email est déjà utilisée');
        } else {
          throw createAuthError('phone_taken', 'Ce numéro de téléphone est déjà utilisé');
        }
      }

      const identifier =
        verificationMethod === 'email' ? (email as string) : (phone as string);
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

        // Stocker le code avec les données d'inscription
        await db.oTPCode.upsert({
          where: {
            identifier_type: {
              identifier: `signup:${identifier}`, // Préfixe pour différencier de la connexion
              type: type,
            },
          },
          create: {
            identifier: `signup:${identifier}`,
            code: JSON.stringify({
              otpCode: otpCode,
              signupData: { firstName, lastName, email, phone, countryCode },
            }),
            type: type,
            expires: new Date(Date.now() + expiryMinutes * 60 * 1000),
          },
          update: {
            code: JSON.stringify({
              otpCode: otpCode,
              signupData: { firstName, lastName, email, phone, countryCode },
            }),
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

        // Récupérer les données d'inscription et le code OTP
        const otpCode = await db.oTPCode.findUnique({
          where: {
            identifier_type: {
              identifier: `signup:${identifier}`,
              type: type,
            },
          },
        });

        if (!otpCode) {
          throw createAuthError('no_code_pending', "Aucun code d'inscription en attente");
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
            "Trop de tentatives. Recommencez l'inscription.",
          );
        }

        // Extraire les données stockées
        const storedData = JSON.parse(otpCode.code);
        const storedOTPCode = storedData.otpCode;
        const signupData = storedData.signupData;

        // Vérifier le code
        if (storedOTPCode !== code) {
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

        // Créer l'utilisateur et son profil en une transaction
        const user = await db.$transaction(async (tx) => {
          // Créer l'utilisateur
          const newUser = await tx.user.create({
            data: {
              email: signupData.email,
              phoneNumber: signupData.phone,
              emailVerified: verificationMethod === 'email' ? new Date() : null,
              phoneNumberVerified: verificationMethod === 'sms' ? true : false,
              name: `${signupData.firstName} ${signupData.lastName}`,
              roles: [UserRole.USER],
              role: UserRole.USER,
              countryCode: signupData.countryCode,
            },
          });

          // Créer le profil associé
          const profile = await tx.profile.create({
            data: {
              userId: newUser.id,
              firstName: signupData.firstName,
              lastName: signupData.lastName,
              email: signupData.email,
              phoneNumber: signupData.phone,
              residenceCountyCode: signupData.countryCode,
              category: 'ADULT',
            },
          });

          // Mettre à jour l'utilisateur avec l'ID du profil
          const updatedUser = await tx.user.update({
            where: { id: newUser.id },
            data: { profileId: profile.id },
          });

          return updatedUser;
        });

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
