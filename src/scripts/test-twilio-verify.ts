/**
 * Script de test pour l'intégration Twilio Verify
 *
 * Utilisation :
 * 1. Assurez-vous que les variables d'environnement sont configurées
 * 2. Lancez avec : npx tsx src/scripts/test-twilio-verify.ts
 * 3. Suivez les instructions pour tester l'envoi et la vérification
 */

import { getTwilioVerifyService } from '@/server/services/twilio-verify';
import { getUnifiedVerifyService } from '@/server/services/unified-verify';
import { env } from '@/env';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testTwilioVerifyConfiguration() {
  log('\n=== Test de configuration Twilio Verify ===\n', 'bright');

  // Vérifier les variables d'environnement
  const requiredEnvVars = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_VERIFY_SERVICE_SID',
  ] as const;

  for (const envVar of requiredEnvVars) {
    if (env[envVar]) {
      logSuccess(`${envVar}: Configuré`);
    } else {
      logError(`${envVar}: Manquant dans .env`);
      return false;
    }
  }

  return true;
}

async function testTwilioVerifyService() {
  log('\n=== Test du service Twilio Verify ===\n', 'bright');

  try {
    const service = getTwilioVerifyService();
    logSuccess('Service Twilio Verify initialisé');

    // Test avec un numéro de test Twilio (ne consomme pas de crédits)
    const testPhone = '+15005550006'; // Numéro de test Twilio

    logInfo(`Test d'envoi de code vers ${testPhone}`);
    const sendResult = await service.sendVerificationCode(testPhone, 'sms');

    if (sendResult.success) {
      logSuccess(`Code envoyé avec succès. SID: ${sendResult.verificationSid}`);

      // Test de vérification avec code valide de test
      logInfo('Test de vérification avec code 123456 (code de test Twilio)');
      const verifyResult = await service.verifyCode(testPhone, '123456');

      if (verifyResult.success) {
        logSuccess(`Vérification réussie. Status: ${verifyResult.status}`);
      } else {
        logWarning(`Vérification échouée: ${verifyResult.error}`);
      }
    } else {
      logError(`Erreur envoi: ${sendResult.error}`);
    }

    return true;
  } catch (error: any) {
    logError(`Erreur service Twilio: ${error.message}`);
    return false;
  }
}

async function testUnifiedVerifyService() {
  log('\n=== Test du service unifié ===\n', 'bright');

  try {
    const service = getUnifiedVerifyService();
    logSuccess('Service unifié initialisé');

    // Test validation d'identifiants
    const testCases = [
      { id: '+33-123456789', expected: 'SMS' },
      { id: 'test@example.com', expected: 'EMAIL' },
      { id: 'invalid', expected: null },
    ];

    for (const testCase of testCases) {
      const validation = service.validateIdentifier(testCase.id);
      if (testCase.expected === null) {
        if (!validation.valid) {
          logSuccess(`❌ Validation échouée comme attendu pour: ${testCase.id}`);
        } else {
          logError(`Validation aurait dû échouer pour: ${testCase.id}`);
        }
      } else {
        if (validation.valid && validation.type === testCase.expected) {
          logSuccess(`✅ ${testCase.id} → ${validation.type}`);
        } else {
          logError(
            `Validation incorrecte pour ${testCase.id}: attendu ${testCase.expected}, reçu ${validation.type}`,
          );
        }
      }
    }

    // Test avec numéro de test Twilio
    const testPhone = '+15005550006';
    logInfo(`Test service unifié avec ${testPhone}`);

    const sendResult = await service.sendVerificationCode(testPhone);
    if (sendResult.success) {
      logSuccess(`Code envoyé via canal: ${sendResult.channel}`);
    } else {
      logWarning(`Erreur envoi unifié: ${sendResult.error}`);
    }

    return true;
  } catch (error: any) {
    logError(`Erreur service unifié: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('🚀 Début des tests Twilio Verify\n', 'bright');

  const configOk = await testTwilioVerifyConfiguration();
  if (!configOk) {
    logError('\n❌ Configuration invalide. Arrêt des tests.\n');
    process.exit(1);
  }

  const twilioOk = await testTwilioVerifyService();
  const unifiedOk = await testUnifiedVerifyService();

  log('\n=== Résumé des tests ===\n', 'bright');

  if (configOk) logSuccess('Configuration: OK');
  if (twilioOk) logSuccess('Service Twilio: OK');
  else logError('Service Twilio: ERREUR');

  if (unifiedOk) logSuccess('Service unifié: OK');
  else logError('Service unifié: ERREUR');

  if (twilioOk && unifiedOk) {
    logSuccess('\n🎉 Tous les tests sont passés !');
    logInfo("\nVous pouvez maintenant utiliser l'authentification Twilio Verify.");
    logInfo(
      '\nPour tester en production, remplacez le numéro de test par un vrai numéro.',
    );
  } else {
    logError('\n❌ Certains tests ont échoué. Vérifiez la configuration.');
  }
}

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
  runTests().catch((error) => {
    logError(`Erreur critique: ${error.message}`);
    process.exit(1);
  });
}

export { runTests };
