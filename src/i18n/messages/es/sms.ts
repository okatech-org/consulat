export default {
  otp: {
    app_name: 'Consulat.ga',
    message:
      '🔐 {appName}: {otp} est votre code de vérification.\n⏱️ Expire dans {expiry}.\n⚠️ Ne le partagez avec personne.',
    expiry_time: '10 minutes',
    logs: {
      success: 'Code OTP envoyé avec succès au {phone}',
      error: "Échec de l'envoi du code OTP par SMS",
    },
    errors: {
      invalid_config: 'Configuration Twilio invalide',
      send_failed: "Échec de l'envoi du code de vérification: {error}",
      unknown: "Échec de l'envoi du code de vérification",
    },
  },
} as const;
