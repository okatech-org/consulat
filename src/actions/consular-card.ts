'use server';

import { db } from '@/server/db';

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
  organizationId: string | null,
): Promise<string> {
  // Récupérer le profil pour avoir la date de naissance
  const profile = await db.profile.findUnique({
    where: { id: profileId },
    select: { birthDate: true },
  });

  if (!profile?.birthDate) {
    throw new Error('Birth date is required to generate card number');
  }

  const lastSequence = await db.sequence.findFirst({
    where: {
      countryCode: countryCode ?? '',
      organizationId: organizationId ?? '',
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, value: true },
  });

  const birthDate = new Date(profile.birthDate);
  const currentYear = new Date().getFullYear();
  const validityYears = 3; // Durée de validité de 3 ans

  // Extraire les composants de la date de naissance
  const birthMonth = String(birthDate.getMonth() + 1).padStart(2, '0');
  const birthYear = birthDate.getFullYear().toString().slice(-2);

  // Calculer les années de validité
  const startYear = currentYear.toString().slice(-2);
  const endYear = (currentYear + validityYears).toString().slice(-2);

  // Extraire le dernier numéro de séquence ou commencer à 1
  let sequence = Number('00010');
  if (lastSequence?.value) {
    sequence = Number(lastSequence.value) + 1;
    await db.sequence.update({
      where: { id: lastSequence.id },
      data: { value: sequence.toString(), profileId: profileId },
    });
  } else {
    await db.sequence.create({
      data: {
        value: '00001',
        countryCode: countryCode ?? '',
        organizationId: organizationId ?? '',
        profileId: profileId,
      },
    });
  }

  // Formater le numéro de séquence sur 5 chiffres
  const sequenceFormatted = String(sequence).padStart(5, '0');

  // Assembler le numéro final
  return `${countryCode}${startYear}${endYear}${birthMonth}${birthYear}-${sequenceFormatted}`;
}
