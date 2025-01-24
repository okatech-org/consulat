import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';

if (!TWILIO_PHONE_NUMBER) {
  throw new Error('TWILIO_PHONE_NUMBER is not configured');
}

export async function sendSMS(to: string, message: string) {
  try {
    const response = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER, // Utilise le numéro Twilio, pas le numéro personnel
      to: formatPhoneNumber(to),
    });

    console.log('SMS sent successfully. SID:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

// Fonction utilitaire pour formater le numéro de téléphone
function formatPhoneNumber(phone: string): string {
  // Supprime tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');

  // Ajoute le + si nécessaire
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
}
