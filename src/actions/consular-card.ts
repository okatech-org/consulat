'use server';

import { db } from '@/lib/prisma';

interface ConsularCardNumber {
  countryCode: string;
  year: string;
  sequence: string;
  checksum: string;
}

/**
 * Parse un numéro de carte consulaire
 */
function parseCardNumber(cardNumber: string): ConsularCardNumber | null {
  const match = cardNumber.match(/^([A-Z]{2})(\d{2})(\d{7})-(\d{5})$/);
  if (!match) return null;

  const [, countryCode = '', year = '', sequence = '', checksum = ''] = match;

  return { countryCode, year, sequence, checksum };
}

/**
 * Génère un numéro de carte consulaire unique
 * Format: [PAYS][ANNÉE][SEQUENCE]-[CHECKSUM]
 * Example: FR24270173-00021
 * de 000001 à 00050 sont réservés
 */
export async function generateConsularCardNumber(
  profileId: string,
  countryCode: string | null,
): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);

  // Trouver la dernière carte générée pour ce pays cette année
  const latestCard = await db.profile.findFirst({
    where: {
      AND: [
        { cardNumber: { not: null } },
        { cardNumber: { startsWith: `${countryCode}${year}` } },
      ],
    },
    orderBy: {
      cardNumber: 'desc',
    },
    select: {
      cardNumber: true,
    },
  });

  let sequence: number;

  if (latestCard?.cardNumber) {
    const parsed = parseCardNumber(latestCard.cardNumber);
    if (parsed) {
      // Incrémenter la séquence du dernier numéro
      sequence = parseInt(parsed.sequence) + 1;
    } else {
      sequence = 1;
    }
  } else {
    sequence = 1;
  }

  // Formater la séquence sur 7 chiffres
  const sequenceStr = sequence.toString().padStart(7, '0');

  // Générer le checksum basé sur l'ID du profil et la séquence
  const checksumBase = profileId + sequenceStr;
  const checksum = checksumBase
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    .toString()
    .slice(-5)
    .padStart(5, '0');

  // Assembler le numéro final
  const cardNumber = `${countryCode || 'XX'}${year}${sequenceStr}-${checksum}`;

  // Sauvegarder le numéro dans le profil
  await db.profile.update({
    where: { id: profileId },
    data: { cardNumber },
  });

  return cardNumber;
}
