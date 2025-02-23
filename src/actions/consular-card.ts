'use server';

import { db } from '@/lib/prisma';

/**
 * Format: [PAYS][ANNÉE][TYPE][SEQUENCE]-[CHECKSUM]
 * Example: FR24C0001234-A12B3
 * - PAYS: Code pays sur 2 lettres (FR)
 * - ANNÉE: Année sur 2 chiffres (24)
 * - TYPE: Type de carte (C pour Consulaire)
 * - SEQUENCE: Numéro séquentiel sur 7 chiffres (0001234)
 * - CHECKSUM: Hash de vérification alphanumérique sur 5 caractères
 */
export async function generateConsularCardNumber(
  profileId: string,
  countryCode: string | null,
): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const cardType = 'C'; // C pour Consulaire

  // Trouver la dernière carte générée pour ce pays cette année
  const latestCard = await db.profile.findFirst({
    where: {
      AND: [
        { cardNumber: { not: null } },
        { cardNumber: { startsWith: `${countryCode}${year}${cardType}` } },
      ],
    },
    orderBy: {
      cardNumber: 'desc',
    },
    select: {
      cardNumber: true,
    },
  });

  // Commencer à 1000000 pour avoir un format constant
  let sequence = 1000000;

  if (latestCard?.cardNumber) {
    const match = latestCard.cardNumber.match(/[A-Z](\d{7})-/);
    if (match?.[1]) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  // Générer un checksum alphanumérique basé sur les données uniques
  const checksumBase = `${countryCode}${year}${cardType}${sequence}${profileId}`;
  const checksum = Buffer.from(checksumBase)
    .toString('base64')
    .replace(/[^A-Z0-9]/gi, '')
    .slice(0, 5)
    .toUpperCase();

  // Assembler le numéro final
  return `${countryCode}${year}${cardType}${sequence}-${checksum}`;
}
