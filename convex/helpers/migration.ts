import {
  OrganizationStatus,
  OrganizationType,
  ServiceCategory,
  ServiceStatus,
  ServiceStepType,
  ProcessingMode,
  DeliveryMode,
} from '../lib/constants';
import type { Doc, Id } from '../_generated/dataModel';
import type { ActivityType } from '../lib/constants';

// Fonction pour créer une organisation par défaut
export function createDefaultOrganization(): Omit<
  Doc<'organizations'>,
  '_id' | '_creationTime'
> {
  return {
    code: 'DEFAULT_ORG',
    name: 'Organisation par défaut',
    type: OrganizationType.Consulate,
    status: OrganizationStatus.Active,
    countryIds: ['FR'], // À adapter selon vos besoins
    memberIds: [],
    serviceIds: [],
    childIds: [], // Ajout du champ manquant
    settings: [],
    metadata: {
      isDefault: true,
    },
  };
}

// Fonction pour créer des services par défaut
export function createDefaultServices(
  organizationId: Id<'organizations'>,
): Array<Omit<Doc<'services'>, '_id' | '_creationTime'>> {
  return [
    {
      code: 'PASSPORT_RENEWAL',
      name: 'Renouvellement de passeport',
      description: 'Service de renouvellement de passeport',
      category: ServiceCategory.TravelDocument,
      status: ServiceStatus.Active,
      organizationId,
      config: {
        requiredDocuments: ['passport', 'photo', 'proof_of_address'],
        optionalDocuments: ['birth_certificate'],
        steps: [
          {
            order: 1,
            name: 'Soumission de la demande',
            type: ServiceStepType.Form,
            required: true,
          },
          {
            order: 2,
            name: 'Vérification des documents',
            type: ServiceStepType.Review,
            required: true,
          },
          {
            order: 3,
            name: 'Paiement des frais',
            type: ServiceStepType.Payment,
            required: true,
          },
          {
            order: 4,
            name: 'Fabrication du passeport',
            type: ServiceStepType.Review,
            required: true,
          },
        ],
        pricing: {
          amount: 86, // Euros
          currency: 'EUR',
        },
      },
      steps: [
        {
          order: 1,
          title: 'Soumission de la demande',
          description: 'Remplir le formulaire de demande',
          isRequired: true,
          type: ServiceStepType.Form,
          fields: {},
          validations: {},
        },
        {
          order: 2,
          title: 'Vérification des documents',
          description: 'Vérifier les documents fournis',
          isRequired: true,
          type: ServiceStepType.Review,
          fields: {},
          validations: {},
        },
        {
          order: 3,
          title: 'Paiement des frais',
          description: 'Effectuer le paiement',
          isRequired: true,
          type: ServiceStepType.Payment,
          fields: {},
          validations: {},
        },
        {
          order: 4,
          title: 'Fabrication du passeport',
          description: 'Fabrication du document',
          isRequired: true,
          type: ServiceStepType.Review,
          fields: {},
          validations: {},
        },
      ],
      processingMode: ProcessingMode.PresenceRequired,
      deliveryModes: [DeliveryMode.InPerson],
      requiresAppointment: true,
      appointmentDuration: 30,
      appointmentInstructions: 'Apportez tous les documents requis',
      deliveryAppointment: true,
      deliveryAppointmentDuration: 15,
      deliveryAppointmentDesc: 'Récupération du passeport',
      isFree: false,
      price: 86,
      currency: 'EUR',
    },
    {
      code: 'BIRTH_CERTIFICATE',
      name: 'Certificat de naissance',
      description: "Service d'obtention de certificat de naissance",
      category: ServiceCategory.CivilStatus,
      status: ServiceStatus.Active,
      organizationId,
      config: {
        requiredDocuments: ['id_document', 'proof_of_birth'],
        optionalDocuments: ['family_book'],
        steps: [
          {
            order: 1,
            name: 'Soumission de la demande',
            type: ServiceStepType.Form,
            required: true,
          },
          {
            order: 2,
            name: 'Vérification des documents',
            type: ServiceStepType.Review,
            required: true,
          },
          {
            order: 3,
            name: 'Émission du certificat',
            type: ServiceStepType.Review,
            required: true,
          },
        ],
        pricing: {
          amount: 15,
          currency: 'EUR',
        },
      },
      steps: [
        {
          order: 1,
          title: 'Soumission de la demande',
          description: 'Remplir le formulaire de demande',
          isRequired: true,
          type: ServiceStepType.Form,
          fields: {},
          validations: {},
        },
        {
          order: 2,
          title: 'Vérification des documents',
          description: 'Vérifier les documents fournis',
          isRequired: true,
          type: ServiceStepType.Review,
          fields: {},
          validations: {},
        },
        {
          order: 3,
          title: 'Émission du certificat',
          description: 'Émission du certificat de naissance',
          isRequired: true,
          type: ServiceStepType.Review,
          fields: {},
          validations: {},
        },
      ],
      processingMode: ProcessingMode.PresenceRequired,
      deliveryModes: [DeliveryMode.InPerson],
      requiresAppointment: true,
      appointmentDuration: 20,
      appointmentInstructions: 'Apportez tous les documents requis',
      deliveryAppointment: true,
      deliveryAppointmentDuration: 10,
      deliveryAppointmentDesc: 'Récupération du certificat',
      isFree: false,
      price: 15,
      currency: 'EUR',
    },
  ];
}

// Fonction pour générer un numéro de demande unique
export function generateRequestNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `REQ-${timestamp}-${random}`.toUpperCase();
}

// Fonction pour créer une activité de demande
export function createRequestActivity(
  type: ActivityType,
  actorId?: Id<'users'>,
  data?: any,
): Doc<'requests'>['metadata']['activities'][0] {
  return {
    type,
    actorId,
    data,
    timestamp: Date.now(),
  };
}
