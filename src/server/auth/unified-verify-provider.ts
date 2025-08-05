import type { Provider } from 'next-auth/providers';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import { db } from '@/server/db';
import { UserRole, type User } from '@prisma/client';
import { unifiedVerifyService } from '@/server/services/unified-verify';

/**
 * Factory pour créer des erreurs d'authentification avec des codes spécifiques
 */
function createAuthError(code: string, message: string) {
  class CustomCredentialsSignin extends CredentialsSignin {
    code = code;
  }
  const error = new CustomCredentialsSignin();
  error.message = message;
  return error;
}

/**
 * Erreur spécifique pour l'envoi de code réussi
 */
function createCodeSentError(message: string) {
  class CodeSentError extends CredentialsSignin {
    code = 'CODE_SENT';
  }
  const error = new CodeSentError();
  error.message = message;
  return error;
}

/**
 * Déterminer le type d'identifiant
 */
function getIdentifierType(identifier: string): {
  type: 'SMS' | 'EMAIL';
  isValid: boolean;
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+\d{1,4}-?\d{9,}$/;

  if (emailRegex.test(identifier)) {
    return { type: 'EMAIL', isValid: true };
  } else if (phoneRegex.test(identifier)) {
    return { type: 'SMS', isValid: true };
  } else {
    return { type: 'SMS', isValid: false };
  }
}

/**
 * Provider unifié pour connexion OTP
 * Utilise Twilio Verify pour SMS/call et Resend pour emails
 */
export const unifiedLoginProvider: Provider = CredentialsProvider({
  id: 'unified-login',
  name: 'Unified Login',
  credentials: {
    identifier: { label: 'Identifier', type: 'text' }, // email ou phone
    code: { label: 'Code', type: 'text' },
    action: { label: 'Action', type: 'text' }, // "send" ou "verify"
  },
  async authorize(credentials) {
    const identifier = credentials?.identifier;
    if (!identifier || typeof identifier !== 'string') {
      throw createAuthError('missing_identifier', 'Email ou téléphone requis');
    }

    const action = credentials?.action;
    if (typeof action !== 'string') {
      throw createAuthError('missing_action', 'Action requise');
    }

    // Valider le format de l'identifiant
    const { type, isValid } = getIdentifierType(identifier);
    if (!isValid) {
      throw createAuthError(
        'invalid_identifier',
        "Format de numéro de téléphone ou d'email invalide",
      );
    }

    // Si on demande l'envoi du code
    if (action === 'send') {
      return handleLoginSendAction(identifier, type);
    }

    // Si on vérifie le code
    if (action === 'verify') {
      return handleLoginVerifyAction(identifier, type, credentials?.code as string);
    }

    throw createAuthError('invalid_action', 'Action invalide');
  },
});

/**
 * Provider unifié pour inscription
 */
export const unifiedSignupProvider: Provider = CredentialsProvider({
  id: 'unified-signup',
  name: 'Unified Signup',
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

    const phoneRegex = /^\+\d{1,4}-?\d{9,}$/;
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

    const identifier = verificationMethod === 'email' ? email : phone;
    const { type } = getIdentifierType(identifier as string);

    // Si on demande l'envoi du code
    if (action === 'send') {
      return handleSendAction(
        identifier as string,
        type,
        firstName as string,
        lastName as string,
        email as string,
        phone as string,
        countryCode as string,
        'signup',
      );
    }

    // Si on vérifie le code
    if (action === 'verify') {
      return handleVerifyAction(
        identifier as string,
        type,
        credentials?.code as string,
        verificationMethod,
        'signup',
      );
    }

    throw createAuthError('invalid_action', 'Action invalide');
  },
});

async function createUserWithProfile(
  signupData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    countryCode: string;
  },
  verificationMethod: 'email' | 'sms',
): Promise<Pick<User, 'id' | 'name' | 'email' | 'image' | 'role' | 'phoneNumber'>> {
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

async function handleSendAction(
  identifier: string,
  type: 'SMS' | 'EMAIL',
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  countryCode: string,
  action: 'signup' | 'login',
): Promise<never> {
  // Envoyer le code via le service unifié
  const result = await unifiedVerifyService.sendVerificationCode(identifier as string);

  if (!result.success) {
    throw createAuthError(
      'send_failed',
      result.error || "Nous n'avons pas pu envoyer le code de vérification",
    );
  }

  // Stocker les données d'inscription
  if (type === 'SMS') {
    // Pour SMS, stocker avec le requestId Twilio
    await db.oTPCode.upsert({
      where: {
        identifier_type: {
          identifier: `${action}:${identifier}`,
          type: type,
        },
      },
      create: {
        identifier: `${action}:${identifier}`,
        code: JSON.stringify({
          requestId: result.requestId,
          signupData: { firstName, lastName, email, phone, countryCode },
        }),
        type: type,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
      update: {
        code: JSON.stringify({
          requestId: result.requestId,
          signupData: { firstName, lastName, email, phone, countryCode },
        }),
        attempts: 0,
        verified: false,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  } else {
    // Pour EMAIL, stocker seulement les données d'inscription
    // Le code OTP est géré par le service unifié
    await db.oTPCode.upsert({
      where: {
        identifier_type: {
          identifier: `${action}:${identifier}`,
          type: type,
        },
      },
      create: {
        identifier: `${action}:${identifier}`,
        code: JSON.stringify({
          signupData: { firstName, lastName, email, phone, countryCode },
        }),
        type: type,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
      update: {
        code: JSON.stringify({
          signupData: { firstName, lastName, email, phone, countryCode },
        }),
        attempts: 0,
        verified: false,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  // Lancer une erreur spéciale pour indiquer que le code a été envoyé
  throw createCodeSentError('Code envoyé avec succès');
}

async function handleVerifyAction(
  identifier: string,
  type: 'SMS' | 'EMAIL',
  code: string,
  verificationMethod: 'email' | 'sms',
  action: 'signup' | 'login',
) {
  if (!code || typeof code !== 'string') {
    throw createAuthError('missing_code', 'Code de vérification requis');
  }

  if (code.length !== 6) {
    throw createAuthError('invalid_code_length', 'Le code doit contenir 6 chiffres');
  }

  // Récupérer les données d'inscription et le requestId
  const otpCode = await db.oTPCode.findUnique({
    where: {
      identifier_type: {
        identifier: `${action}:${identifier}`,
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

  if (otpCode.attempts >= 3) {
    throw createAuthError(
      'too_many_attempts',
      "Trop de tentatives. Recommencez l'inscription.",
    );
  }

  // Extraire les données stockées
  const storedData = JSON.parse(otpCode.code);
  const signupData = storedData.signupData;

  // Pour les emails, vérifier directement avec le service unifié sur l'identifier sans préfixe
  let verificationResult;
  if (type === 'EMAIL') {
    // Vérifier le code avec l'identifier original (sans préfixe signup:)
    verificationResult = await unifiedVerifyService.verifyCode(
      identifier.replace('signup:', ''),
      code,
    );
  } else {
    // Pour SMS, utiliser le service unifié normalement
    verificationResult = await unifiedVerifyService.verifyCode(
      identifier as string,
      code,
    );
  }

  if (!verificationResult.success) {
    await db.oTPCode.update({
      where: { id: otpCode.id },
      data: { attempts: { increment: 1 } },
    });

    throw createAuthError('invalid_code', 'Code invalide');
  }

  // Nettoyer les entrées d'inscription après succès
  await db.oTPCode
    .delete({
      where: { id: otpCode.id },
    })
    .catch(() => {}); // Ignorer si déjà supprimé

  // Pour les emails, le service unifié a déjà supprimé l'entrée principale
  // Rien d'autre à faire

  // Créer l'utilisateur et son profil
  return createUserWithProfile(signupData, verificationMethod);
}

async function handleLoginSendAction(
  identifier: string,
  type: 'SMS' | 'EMAIL',
): Promise<never> {
  // Vérifier que l'utilisateur existe
  let user;
  if (type === 'EMAIL') {
    user = await db.user.findUnique({
      where: { email: identifier },
    });
  } else {
    user = await db.user.findUnique({
      where: { phoneNumber: identifier },
    });
  }

  if (!user) {
    throw createAuthError(
      'user_not_found',
      type === 'EMAIL'
        ? 'Aucun compte associé à cet email'
        : 'Aucun compte associé à ce téléphone',
    );
  }

  // Envoyer le code via le service unifié
  const result = await unifiedVerifyService.sendVerificationCode(identifier);

  if (!result.success) {
    throw createAuthError(
      'send_failed',
      result.error || "Erreur lors de l'envoi du code",
    );
  }

  // Pour SMS, stocker les informations de vérification Twilio en base
  // Pour EMAIL, le service unifié a déjà stocké le code, ne pas l'écraser !
  if (type === 'SMS') {
    await db.oTPCode.upsert({
      where: {
        identifier_type: {
          identifier: identifier,
          type: type,
        },
      },
      create: {
        identifier: identifier,
        code: result.requestId || 'unified-verify',
        type: type,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
      update: {
        code: result.requestId || 'unified-verify',
        attempts: 0,
        verified: false,
        expires: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
  }
  // Pour EMAIL : ne rien faire, le service unifié a déjà tout géré !

  // Lancer une erreur spéciale pour indiquer que le code a été envoyé
  throw createCodeSentError('Code envoyé avec succès');
}

async function handleLoginVerifyAction(
  identifier: string,
  type: 'SMS' | 'EMAIL',
  code: string,
): Promise<Pick<User, 'id' | 'name' | 'email' | 'image' | 'role' | 'phoneNumber'>> {
  if (!code || typeof code !== 'string') {
    throw createAuthError('missing_code', 'Code de vérification requis');
  }

  if (code.length !== 6) {
    throw createAuthError('invalid_code_length', 'Le code doit contenir 6 chiffres');
  }

  // Récupérer les informations de vérification
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

  if (otpCode.attempts >= 3) {
    throw createAuthError(
      'too_many_attempts',
      'Trop de tentatives. Demandez un nouveau code.',
    );
  }

  // Vérifier le code avec le service unifié
  const verificationResult = await unifiedVerifyService.verifyCode(identifier, code);

  if (!verificationResult.success) {
    await db.oTPCode.update({
      where: { id: otpCode.id },
      data: { attempts: { increment: 1 } },
    });

    throw createAuthError('invalid_code', 'Code invalide');
  }

  // Pour les emails, le service unifié a déjà supprimé le code
  // Pour les SMS, on doit supprimer l'entrée de login
  if (type === 'SMS') {
    await db.oTPCode
      .delete({
        where: { id: otpCode.id },
      })
      .catch(() => {}); // Ignorer si déjà supprimé
  }

  // Récupérer l'utilisateur
  let user;
  if (type === 'EMAIL') {
    user = await db.user.findUnique({
      where: { email: identifier },
    });

    if (user && !user.emailVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }
  } else {
    user = await db.user.findUnique({
      where: { phoneNumber: identifier },
    });

    if (user && !user.phoneNumberVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { phoneNumberVerified: true },
      });
    }
  }

  if (!user) {
    throw createAuthError('user_not_found', 'Utilisateur introuvable');
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
