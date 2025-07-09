'use server';

import { checkAuth } from '@/lib/auth/action';
import { UserRole } from '@prisma/client';
import { db } from '@/server/db';
import { tryCatch } from '@/lib/utils';
import { AircallConfigSchema, AircallCallActionSchema, type AircallConfig, type AircallCallAction } from '@/schemas/aircall';

/**
 * Mettre à jour la configuration Aircall pour une organisation
 */
export async function updateAircallConfig(
  organizationId: string,
  countryCode: string,
  config: AircallConfig
) {
  await checkAuth([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER]);

  const { data: validatedConfig, error: validationError } = await tryCatch(
    async () => AircallConfigSchema.parse(config)
  );

  if (validationError) {
    return { error: 'Configuration Aircall invalide' };
  }

  try {
    // Récupérer l'organisation actuelle
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    });

    if (!organization) {
      return { error: 'Organisation non trouvée' };
    }

    // Préparer les métadonnées mises à jour
    const currentMetadata = organization.metadata 
      ? JSON.parse(organization.metadata as string) 
      : {};

    if (!currentMetadata[countryCode]) {
      currentMetadata[countryCode] = { settings: {} };
    }

    currentMetadata[countryCode].settings.aircall = validatedConfig;

    // Mettre à jour l'organisation
    const updatedOrganization = await db.organization.update({
      where: { id: organizationId },
      data: {
        metadata: JSON.stringify(currentMetadata),
      },
    });

    return { data: updatedOrganization };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration Aircall:', error);
    return { error: 'Erreur lors de la mise à jour de la configuration Aircall' };
  }
}

/**
 * Récupérer la configuration Aircall pour une organisation et un pays
 */
export async function getAircallConfig(
  organizationId: string,
  countryCode: string
): Promise<{ data?: AircallConfig; error?: string }> {
  await checkAuth();

  try {
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { metadata: true },
    });

    if (!organization) {
      return { error: 'Organisation non trouvée' };
    }

    const metadata = organization.metadata 
      ? JSON.parse(organization.metadata as string) 
      : {};

    const aircallConfig = metadata[countryCode]?.settings?.aircall;

    if (!aircallConfig) {
      return { 
        data: {
          enabled: false,
          workspaceSize: 'medium',
          events: {
            onLogin: true,
            onLogout: true,
            onCallStart: true,
            onCallEnd: true,
            onCallAnswer: true,
          },
          permissions: {
            canMakeOutboundCalls: true,
            canReceiveInboundCalls: true,
            canTransferCalls: true,
            canRecordCalls: false,
          },
        }
      };
    }

    return { data: aircallConfig };
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration Aircall:', error);
    return { error: 'Erreur lors de la récupération de la configuration Aircall' };
  }
}

/**
 * Enregistrer une action d'appel (pour l'historique et les statistiques)
 */
export async function logAircallAction(action: AircallCallAction) {
  const { user } = await checkAuth();

  const { data: validatedAction, error: validationError } = await tryCatch(
    async () => AircallCallActionSchema.parse(action)
  );

  if (validationError) {
    return { error: 'Action Aircall invalide' };
  }

  try {
    const actionData = validatedAction as AircallCallAction;
    
    // Créer une note dans la demande pour tracer l'appel
    const note = await db.note.create({
      data: {
        content: `Appel téléphonique vers ${actionData.phoneNumber}${
          actionData.userDisplayName ? ` (${actionData.userDisplayName})` : ''
        }${actionData.notes ? `\n\nNotes: ${actionData.notes}` : ''}`,
        type: 'INTERNAL',
        authorId: user.id,
        serviceRequestId: actionData.requestId,
      },
    });

    return { data: note };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'action Aircall:', error);
    return { error: 'Erreur lors de l\'enregistrement de l\'action' };
  }
}

/**
 * Vérifier si Aircall est configuré et activé pour une organisation
 */
export async function isAircallEnabled(
  organizationId: string,
  countryCode: string
): Promise<{ enabled: boolean; error?: string }> {
  try {
    const { data: config, error } = await getAircallConfig(organizationId, countryCode);
    
    if (error) {
      return { enabled: false, error };
    }

    return { enabled: config?.enabled || false };
  } catch (error) {
    console.error('Erreur lors de la vérification du statut Aircall:', error);
    return { enabled: false, error: 'Erreur lors de la vérification' };
  }
} 