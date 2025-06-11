'use client';

import { useState, useMemo, useEffect } from 'react';
import { z, ZodSchema } from 'zod';
import { DocumentType } from '@prisma/client';
import { ConsularServiceItem, ServiceField, ServiceStep } from '@/types/consular-service';
import {
  DateSchema,
  EmailSchema,
  NumberSchema,
  TextSchema,
  UserDocumentSchema,
  PhoneNumberSchema,
  AddressSchema,
  SelectSchema,
  TextareaSchema,
  PictureFileSchema,
  BasicAddressSchema,
} from '@/schemas/inputs';
import { FullProfile } from '@/types/profile';
import { createFormStorage } from '@/lib/form-storage';
import { useStoredTabs } from './use-tabs';
import { useTranslations } from 'next-intl';
import { CountryCode } from '@/lib/autocomplete-datas';

type StepFormValues = Record<string, unknown>;

// Configuration des mappings DocumentType -> nom de champ
const documentTypeToField: Partial<Record<DocumentType, string>> = {
  [DocumentType.PASSPORT]: 'passport',
  [DocumentType.BIRTH_CERTIFICATE]: 'birthCertificate',
  [DocumentType.RESIDENCE_PERMIT]: 'residencePermit',
  [DocumentType.PROOF_OF_ADDRESS]: 'addressProof',
  [DocumentType.IDENTITY_PHOTO]: 'identityPicture',
} as const;

export type ServiceForm = {
  id?: string;
  title: string;
  description?: string;
  schema: ZodSchema;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValues: Record<string, any>;
  stepData?: ServiceStep;
};
export function useServiceForm(service: ConsularServiceItem, userProfile: FullProfile) {
  const { clearData, saveData } = createFormStorage('consular_form_data' + service.id);
  const tInputs = useTranslations('inputs');
  const [formData, setFormData] = useState<Record<string, StepFormValues>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour créer un schéma dynamique basé sur les champs du formulaire
  const createDynamicSchema = useMemo(() => {
    return (fields: ServiceField[]) => {
      // Vérifier si fields est un tableau, sinon retourner un objet vide
      if (!Array.isArray(fields)) {
        console.error("fields n'est pas un tableau:", fields);
        return z.object({});
      }

      const schemaFields = fields.reduce(
        (acc, field) => {
          switch (field.type) {
            case 'text':
              acc[field.name] = field.required ? TextSchema : TextSchema.optional();
              break;
            case 'email':
              acc[field.name] = field.required ? EmailSchema : EmailSchema.optional();
              break;
            case 'number':
              acc[field.name] = field.required ? NumberSchema : NumberSchema.optional();
              break;
            case 'date':
              acc[field.name] = field.required ? DateSchema : DateSchema.optional();
              break;
            case 'file':
              acc[field.name] = field.required
                ? z.object(
                    {
                      ...UserDocumentSchema.shape,
                    },
                    {
                      required_error: 'messages.errors.doc_required',
                      invalid_type_error: 'messages.errors.invalid_field',
                    },
                  )
                : z
                    .object({
                      ...UserDocumentSchema.shape,
                    })
                    .optional();
              break;
            case 'phone':
              acc[field.name] = field.required
                ? PhoneNumberSchema
                : PhoneNumberSchema.optional();
              break;
            case 'address':
              acc[field.name] = field.required
                ? z.object(
                    {
                      ...AddressSchema.shape,
                    },
                    {
                      required_error: 'messages.errors.doc_required',
                      invalid_type_error: 'messages.errors.invalid_field',
                    },
                  )
                : z
                    .object(
                      {
                        ...BasicAddressSchema.shape,
                      },
                      {
                        invalid_type_error: 'messages.errors.invalid_field',
                      },
                    )
                    .optional();
              break;
            case 'select':
              if (field.options && field.options.length > 0) {
                const values = field.options.map((opt) => opt.value) as [
                  string,
                  ...string[],
                ];
                const selectSchema = z.enum(values, {
                  required_error: 'messages.errors.field_required',
                });
                acc[field.name] = field.required ? selectSchema : selectSchema.optional();
              } else {
                acc[field.name] = field.required ? SelectSchema : SelectSchema.optional();
              }
              break;
            case 'checkbox':
              if (field.options && field.options.length > 0) {
                // Multiple checkboxes
                acc[field.name] = field.required
                  ? z.array(z.string()).min(1, 'messages.errors.field_required')
                  : z.array(z.string()).optional();
              } else {
                // Single checkbox
                acc[field.name] = field.required
                  ? z
                      .boolean()
                      .refine((val) => val === true, 'messages.errors.field_required')
                  : z.boolean().optional();
              }
              break;
            case 'radio':
              if (field.options && field.options.length > 0) {
                const values = field.options.map((opt) => opt.value) as [
                  string,
                  ...string[],
                ];
                const radioSchema = z.enum(values, {
                  required_error: 'messages.errors.field_required',
                });
                acc[field.name] = field.required ? radioSchema : radioSchema.optional();
              } else {
                acc[field.name] = field.required ? z.string() : z.string().optional();
              }
              break;
            case 'textarea':
              acc[field.name] = field.required
                ? TextareaSchema
                : TextareaSchema.optional();
              break;
            case 'document':
              acc[field.name] = field.required
                ? z.object(
                    {
                      ...UserDocumentSchema.shape,
                    },
                    {
                      required_error: 'messages.errors.doc_required',
                      invalid_type_error: 'messages.errors.invalid_field',
                    },
                  )
                : z
                    .object(
                      {
                        ...UserDocumentSchema.shape,
                      },
                      {
                        invalid_type_error: 'messages.errors.invalid_field',
                      },
                    )
                    .optional();
              break;
            case 'photo':
              acc[field.name] = field.required
                ? PictureFileSchema
                : PictureFileSchema.optional();
              break;
            // Fallback for any other types
            default:
              console.warn(`Unhandled field type: ${(field as ServiceField).type}`);
              acc[(field as ServiceField).name] = (field as ServiceField).required
                ? z.string({
                    required_error: 'messages.errors.field_required',
                  })
                : z.string().optional();
          }
          return acc;
        },
        {} as Record<string, z.ZodType>,
      );

      return z.object(schemaFields);
    };
  }, []);

  // Générer le schéma Zod pour les documents dynamiquement
  const documentsSchema = useMemo(() => {
    const schemaFields: Record<string, z.ZodType> = {};

    // Documents requis
    service.requiredDocuments.forEach((docType) => {
      const fieldName = documentTypeToField[docType];
      if (fieldName) {
        schemaFields[fieldName] = UserDocumentSchema;
      }
    });

    // Documents optionnels
    service.optionalDocuments?.forEach((docType) => {
      const fieldName = documentTypeToField[docType];
      if (fieldName) {
        schemaFields[fieldName] = UserDocumentSchema.nullable().optional();
      }
    });

    return z.object(schemaFields);
  }, [service.requiredDocuments, service.optionalDocuments]);

  // Générer les valeurs par défaut pour le formulaire de documents
  const documentsDefaultValues = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defaults: Record<string, any> = {};

    // Initialiser tous les champs de documents à undefined
    [...service.requiredDocuments, ...(service.optionalDocuments || [])].forEach(
      (docType) => {
        const fieldName = documentTypeToField[docType];
        if (fieldName) {
          defaults[fieldName] = undefined;
          // Vérifier que userProfile existe et a la propriété correspondante
          if (userProfile && userProfile[fieldName as keyof FullProfile]) {
            defaults[fieldName] = userProfile[fieldName as keyof FullProfile];
          }
        }
      },
    );

    return defaults;
  }, [service.requiredDocuments, service.optionalDocuments, userProfile]);

  const forms: Array<ServiceForm> = [];

  if ([...service.requiredDocuments, ...(service.optionalDocuments || [])].length > 0) {
    forms.push({
      id: 'documents',
      title: 'Documents',
      description:
        'Veuillez joindre les documents de votre profil requis pour la démarche',
      schema: documentsSchema,
      defaultValues: {
        ...documentsDefaultValues,
        ...(formData?.documents ?? {}),
      },
      stepData: {
        id: 'documents',
        title: 'Documents',
        fields: service.requiredDocuments.map((docType) => ({
          name: documentTypeToField[docType] ?? docType,
          type: 'document',
          label: tInputs(`userDocument.options.${docType}`),
          required: false,
          documentType: docType,
        })),
        order: 0,
        description:
          'Veuillez joindre les documents de votre profil requis pour la démarche',
        type: 'DOCUMENTS',
        isRequired: true,
        validations: {},
      },
    });
  }

  service.steps.forEach((step) => {
    forms.push({
      id: step.id ?? undefined,
      title: step.title,
      schema: createDynamicSchema(step.fields),
      defaultValues: {
        ...(step.id && formData?.[step.id] ? formData?.[step.id] : {}),
      },
      stepData: step,
    });
  });

  forms.push({
    id: 'delivery',
    title: 'Adresse de livraison',
    description: `Assurez-vous de renseigner les informations en fonction du mode de délivrance (adresse nécessaire pour le mode postal)`,
    stepData: {
      id: 'delivery',
      title: 'Adresse de livraison',
      fields: [
        {
          name: 'deliveryMode',
          type: 'select',
          label: 'Mode de délivrance',
          description: 'Veuillez choisir le mode de délivrance de votre demande',
          required: true,
          options: service.deliveryMode.map((mode) => ({
            value: mode,
            label: tInputs(`deliveryMode.options.${mode}`),
          })),
          selectType: 'single',
        },
        {
          name: 'deliveryAddress',
          type: 'address',
          label: 'Votre adresse de livraison',
          required: false,
          countries: [userProfile.residenceCountyCode as CountryCode],
        },
      ],
      order: 1,
      description:
        'Attention à bien renseignez les infos en fonction du mode de délivrance',
      type: 'DELIVERY',
      isRequired: false,
      validations: {},
    },
    schema: z.object({
      deliveryAddress: BasicAddressSchema,
      deliveryMode: z.string({
        required_error: 'messages.errors.field_required',
      }),
    }),
    defaultValues: {
      ...(formData?.delivery ?? {}),
    },
  });

  const steps = service.steps.map((step) => step.id).filter((step) => step);

  const { currentTab: currentStep, setCurrentTab: setCurrentStep } =
    useStoredTabs<string>('service-step' + service.id, steps[0] ?? '');

  // Créer un formulaire pour chaque étape de service
  const updateFormData = (stepId: string, data: StepFormValues) => {
    const newData = { ...formData, [stepId]: data };
    setFormData(newData);
    saveData(newData);
  };

  return {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    forms,
    error,
    setError,
    isLoading,
    setIsLoading,
    clearData,
  };
}
