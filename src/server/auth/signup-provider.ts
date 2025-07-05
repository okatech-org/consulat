import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import { db } from '@/server/db';
import { vonageService } from '@/server/services/vonage';
import { UserRole } from '@prisma/client';
import type { Channels } from '@vonage/verify2';

// Factory pour créer des erreurs d'authentification avec des codes spécifiques
function createAuthError(code: string, message: string) {
  class CustomCredentialsSignin extends CredentialsSignin {
    code = code;
  }
  const error = new CustomCredentialsSignin();
  error.message = message;
  return error;
}

// Déterminer le type d'identifiant pour la vérification
function getVerificationInfo(
  email: string,
  phone: string,
  method: 'email' | 'sms',
): { identifier: string; type: 'EMAIL' | 'SMS'; channel: Channels } {
  if (method === 'email') {
    return { identifier: email, type: 'EMAIL', channel: 'email' as Channels };
  } else {
    return { identifier: phone, type: 'SMS', channel: 'sms' as Channels };
  }
}

export const signupProvider: Provider = CredentialsProvider({
  id: 'signup',
  name: 'Signup',
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

    // Validation des formats (on sait maintenant qu'ils ne sont pas undefined)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email as string)) {
      throw createAuthError('invalid_email', "Format d'email invalide");
    }

    const phoneRegex = /^\+\d{2}-\d{9,}$/;
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

    const { identifier, type, channel } = getVerificationInfo(
      email as string,
      phone as string,
      verificationMethod,
    );

    // Si on demande l'envoi du code
    if (action === 'send') {
      const formattedIdentifier = channel === 'sms' ? identifier.replace('-', '') : identifier;
      // Envoyer le code via Vonage
      const result = await vonageService.sendVerificationCode(formattedIdentifier, channel);

      if (!result.success) {
        throw createAuthError(
          'send_failed',
          result.error || "Erreur lors de l'envoi du code",
        );
      }

      // Stocker le requestId avec les données d'inscription
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
            requestId: result.requestId,
            signupData: { firstName, lastName, email, phone, countryCode },
          }),
          type: type,
          expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes pour l'inscription
        },
        update: {
          code: JSON.stringify({
            requestId: result.requestId,
            signupData: { firstName, lastName, email, phone, countryCode },
          }),
          attempts: 0,
          verified: false,
          expires: new Date(Date.now() + 10 * 60 * 1000),
        },
      });

      // Retourner un utilisateur temporaire
      return {
        id: 'temp-sending-signup-code',
        name: 'Sending Signup Code',
        email: null,
        image: null,
      };
    }

    // Si on vérifie le code
    if (action === 'verify') {
      const code = credentials?.code;
      if (!code || typeof code !== 'string') {
        throw createAuthError('missing_code', 'Code de vérification requis');
      }

      // Récupérer les données d'inscription et le requestId
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

      // Extraire les données stockées
      const storedData = JSON.parse(otpCode.code);
      const requestId = storedData.requestId;
      const signupData = storedData.signupData;

      // Vérifier le code avec l'API Vonage
      const verificationResult = await vonageService.verifyCode(requestId, code);

      if (!verificationResult.success) {
        await db.oTPCode.update({
          where: { id: otpCode.id },
          data: { attempts: { increment: 1 } },
        });

        if (otpCode.attempts >= 3) {
          throw createAuthError(
            'too_many_attempts',
            "Trop de tentatives. Recommencez l'inscription.",
          );
        }

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
