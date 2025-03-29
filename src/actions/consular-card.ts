'use server';

import { db } from '@/lib/prisma';

/**
 * Format: [PAYS][ANNÉE_DÉBUT][ANNÉE_FIN][MOIS_NAISSANCE][ANNÉE_NAISSANCE]-[SEQUENCE]
 * Example: FR24271282-00007
 * - PAYS: Code pays sur 2 lettres (FR)
 * - ANNÉE_DÉBUT: Année de début de validité sur 2 chiffres (24)
 * - ANNÉE_FIN: Année de fin de validité sur 2 chiffres (27)
 * - MOIS_NAISSANCE: Mois de naissance sur 2 chiffres (12)
 * - ANNÉE_NAISSANCE: Année de naissance sur 2 chiffres (82)
 * - SEQUENCE: Numéro séquentiel sur 5 chiffres (00007)
 */
export async function generateConsularCardNumber(
  profileId: string,
  countryCode: string | null,
): Promise<string> {
  // Récupérer le profil pour avoir la date de naissance
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { birthDate: true },
  });

  if (!profile?.birthDate) {
    throw new Error('Birth date is required to generate card number');
  }

  const birthDate = new Date(profile.birthDate);
  const currentYear = new Date().getFullYear();
  const validityYears = 3; // Durée de validité de 3 ans

  // Extraire les composants de la date de naissance
  const birthMonth = String(birthDate.getMonth() + 1).padStart(2, '0');
  const birthYear = birthDate.getFullYear().toString().slice(-2);

  // Calculer les années de validité
  const startYear = currentYear.toString().slice(-2);
  const endYear = (currentYear + validityYears).toString().slice(-2);

  // Trouver la dernière carte générée pour ce pays cette année
  const latestCard = await db.profile.findFirst({
    where: {
      AND: [{ cardNumber: { not: null } }],
    },
    orderBy: {
      cardNumber: 'desc',
    },
    select: {
      cardNumber: true,
    },
  });

  // Extraire le dernier numéro de séquence ou commencer à 1
  let sequence = 1;
  if (latestCard?.cardNumber) {
    const match = latestCard.cardNumber.match(/-(\d{5})$/);
    if (match?.[1]) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  // Formater le numéro de séquence sur 5 chiffres
  const sequenceFormatted = String(sequence).padStart(5, '0');

  // Assembler le numéro final
  return `${countryCode}${startYear}${endYear}${birthMonth}${birthYear}-${sequenceFormatted}`;
}
