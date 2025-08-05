/**
 * Exemples d'utilisation des services Twilio Verify
 *
 * Ce fichier contient des exemples pratiques pour utiliser
 * les services de vérification Twilio dans différents contextes.
 */

import { getTwilioVerifyService } from '../twilio-verify';
import { getUnifiedVerifyService } from '../unified-verify';

/**
 * Exemple 1 : Utilisation directe du service Twilio Verify
 */
export async function exempleServiceTwilioVerify() {
  const service = getTwilioVerifyService();

  try {
    // Envoyer un code SMS
    const sendResult = await service.sendVerificationCode('+33-123456789', 'sms', {
      locale: 'fr-fr',
      customFriendlyName: 'Consulat.ga',
    });

    if (sendResult.success) {
      console.log('Code envoyé:', sendResult.verificationSid);

      // Vérifier le code (à faire quand l'utilisateur saisit le code)
      const verifyResult = await service.verifyCode('+33-123456789', '123456');

      if (verifyResult.success && verifyResult.status === 'approved') {
        console.log('Vérification réussie !');
      } else {
        console.log('Code invalide');
      }
    } else {
      console.error('Erreur envoi:', sendResult.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

/**
 * Exemple 2 : Utilisation du service unifié (recommandé)
 */
export async function exempleServiceUnifie() {
  const service = getUnifiedVerifyService();

  try {
    // Le service détecte automatiquement le type (SMS ou email)
    const identifiers = [
      '+33-123456789', // SMS via Twilio Verify
      'user@example.com', // Email via Resend
    ];

    for (const identifier of identifiers) {
      // Validation de l'identifiant
      const validation = service.validateIdentifier(identifier);
      if (!validation.valid) {
        console.error(`Identifiant invalide: ${identifier}`);
        continue;
      }

      console.log(`Envoi vers ${identifier} (type: ${validation.type})`);

      // Envoi du code
      const sendResult = await service.sendVerificationCode(identifier);

      if (sendResult.success) {
        console.log(
          `Code envoyé via ${sendResult.channel}, requestId: ${sendResult.requestId}`,
        );

        // Simulation de la vérification
        const verifyResult = await service.verifyCode(
          identifier,
          '123456',
          sendResult.requestId,
        );

        if (verifyResult.success) {
          console.log('Vérification réussie !');
        } else {
          console.log('Vérification échouée:', verifyResult.error);
        }
      } else {
        console.error('Erreur envoi:', sendResult.error);
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

/**
 * Exemple 3 : Gestion des erreurs détaillée
 */
export async function exempleGestionErreurs() {
  const service = getTwilioVerifyService();

  try {
    const result = await service.sendVerificationCode('+33-invalid', 'sms');

    if (!result.success) {
      // Gestion spécifique selon le type d'erreur
      switch (result.error) {
        case 'Numéro de téléphone invalide':
          console.log("Action: Demander à l'utilisateur de vérifier son numéro");
          break;
        case 'Numéro de téléphone non supporté':
          console.log('Action: Proposer un autre mode de vérification');
          break;
        case 'Trop de tentatives de vérification':
          console.log('Action: Bloquer temporairement et proposer un délai');
          break;
        default:
          console.log("Action: Afficher un message d'erreur générique");
      }
    }
  } catch (error) {
    console.error('Erreur critique:', error);
  }
}

/**
 * Exemple 4 : Configuration avancée pour un cas d'usage spécifique
 */
export async function exempleConfigurationAvancee() {
  const service = getTwilioVerifyService();

  // Cas d'usage : Vérification en deux étapes pour une action sensible
  const phoneNumber = '+33-123456789';

  try {
    // Envoi avec un message personnalisé
    const sendResult = await service.sendVerificationCode(phoneNumber, 'sms', {
      locale: 'fr-fr',
      customFriendlyName: 'Consulat.ga - Sécurité',
      customMessage:
        'Votre code de sécurité Consulat.ga est: {{code}}. Ne le partagez pas.',
    });

    if (sendResult.success) {
      console.log('Code de sécurité envoyé');

      // Obtenir le statut de la vérification
      const status = await service.getVerificationStatus(sendResult.verificationSid!);
      console.log('Statut:', status);

      // En cas d'annulation nécessaire
      // await service.cancelVerification(sendResult.verificationSid!);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

/**
 * Exemple 5 : Utilisation avec React Hook Form
 */
export function exempleReactIntegration() {
  return `
// Dans un composant React
import { signIn } from 'next-auth/react';

const handleSendCode = async (phoneNumber: string) => {
  try {
    const result = await signIn('unified-login', {
      identifier: phoneNumber,
      action: 'send',
      redirect: false,
    });

    if (result?.error && result.code === 'CODE_SENT') {
      // Succès - afficher le formulaire OTP
      setShowOtpForm(true);
    } else if (result?.error) {
      // Erreur - afficher le message
      setError(result.error);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};

const handleVerifyCode = async (code: string) => {
  try {
    const result = await signIn('unified-login', {
      identifier: phoneNumber,
      code,
      action: 'verify',
      redirect: false,
    });

    if (result?.ok) {
      // Succès - rediriger
      router.push('/dashboard');
    } else {
      // Erreur - afficher le message
      setError('Code invalide');
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
};
`;
}

/**
 * Exemple 6 : Tests et debugging
 */
export async function exempleTestsDebugging() {
  const service = getTwilioVerifyService();

  // Utiliser les numéros de test Twilio (ne consomment pas de crédits)
  const testNumbers = [
    '+15005550006', // Numéro de test valide
    '+15005550001', // Numéro de test avec erreur
  ];

  for (const testNumber of testNumbers) {
    console.log(`Test avec ${testNumber}`);

    try {
      const result = await service.sendVerificationCode(testNumber, 'sms');
      console.log('Résultat:', result);

      if (result.success) {
        // Tester avec le code de test Twilio
        const verifyResult = await service.verifyCode(testNumber, '123456');
        console.log('Vérification:', verifyResult);
      }
    } catch (error) {
      console.error('Erreur test:', error);
    }
  }
}

/**
 * Exemple 7 : Monitoring et métriques
 */
export async function exempleMonitoring() {
  const service = getUnifiedVerifyService();

  // Simulation de métriques d'usage
  const stats = {
    smsCount: 0,
    emailCount: 0,
    successRate: 0,
    errors: [] as string[],
  };

  const testCases = ['+33-123456789', 'user@example.com', '+1-5551234567'];

  for (const identifier of testCases) {
    try {
      const validation = service.validateIdentifier(identifier);

      if (validation.valid) {
        const result = await service.sendVerificationCode(identifier);

        if (result.success) {
          if (result.channel === 'sms') {
            stats.smsCount++;
          } else if (result.channel === 'email') {
            stats.emailCount++;
          }
        } else {
          stats.errors.push(result.error || 'Erreur inconnue');
        }
      }
    } catch (error: any) {
      stats.errors.push(error.message);
    }
  }

  stats.successRate = (stats.smsCount + stats.emailCount) / testCases.length;

  console.log("Statistiques d'usage:", stats);

  // En production, vous pourriez envoyer ces métriques à votre service de monitoring
  // await analytics.track('verify_service_usage', stats);
}

// Export de tous les exemples pour faciliter les tests
export const exemples = {
  exempleServiceTwilioVerify,
  exempleServiceUnifie,
  exempleGestionErreurs,
  exempleConfigurationAvancee,
  exempleTestsDebugging,
  exempleMonitoring,
};
