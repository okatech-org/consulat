'use client';

import { useState, useMemo } from 'react';
import { z, type ZodSchema } from 'zod';
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
import { createFormStorage } from '@/lib/form-storage';
import { useStoredTabs } from './use-tabs';
import { useTranslations } from 'next-intl';
import type { CountryCode } from '@/lib/autocomplete-datas';
import type { Doc } from '@/convex/_generated/dataModel';
import type { CompleteProfile, ServiceField, ServiceStep } from '@/convex/lib/types';
import { getProfileValueByPath } from '@/lib/profile-utils';
import { SelectType, ServiceStepType } from '@/convex/lib/constants';

type StepFormValues = Record<string, unknown>;

export type ServiceForm = {
  id?: string;
  title: string;
  description?: string;
  schema: ZodSchema;
  defaultValues: Record<string, unknown>;
  stepData?: ServiceStep;
};

/**
 * Hook to manage multi-step service request forms with Convex backend
 * @param service - Convex service document
 * @param profile - Complete user profile from Convex
 * @returns Form state and handlers
 */
export function useServiceForm(service: Doc<'services'>, profile: CompleteProfile) {
  const { clearData, saveData } = createFormStorage('consular_form_data' + service._id);
  const tInputs = useTranslations('inputs');
  const [formData, setFormData] = useState<Record<string, StepFormValues>>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic schema generator for form fields
  const createDynamicSchema = useMemo(() => {
    return (fields: ServiceField[]) => {
      if (!Array.isArray(fields)) {
        console.error('fields is not an array:', fields);
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
                      message: 'messages.errors.invalid_field',
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
                      message: 'messages.errors.field_required',
                    },
                  )
                : z
                    .object(
                      {
                        ...BasicAddressSchema.shape,
                      },
                      {
                        message: 'messages.errors.invalid_field',
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
                  message: 'messages.errors.field_required',
                });
                acc[field.name] = field.required ? selectSchema : selectSchema.optional();
              } else {
                acc[field.name] = field.required ? SelectSchema : SelectSchema.optional();
              }
              break;
            case 'checkbox':
              if (field.options && field.options.length > 0) {
                acc[field.name] = field.required
                  ? z.array(z.string()).min(1, 'messages.errors.field_required')
                  : z.array(z.string()).optional();
              } else {
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
                  message: 'messages.errors.field_required',
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
                      message: 'messages.errors.field_required',
                    },
                  )
                : z
                    .object(
                      {
                        ...UserDocumentSchema.shape,
                      },
                      {
                        message: 'messages.errors.invalid_field',
                      },
                    )
                    .optional();
              break;
            case 'photo':
              acc[field.name] = field.required
                ? PictureFileSchema
                : PictureFileSchema.optional();
              break;
            default:
              console.warn(`Unhandled field type: ${(field as ServiceField).type}`);
              acc[(field as ServiceField).name] = (field as ServiceField).required
                ? z.string({
                    message: 'messages.errors.invalid_field',
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

  // Generate document schema from service steps
  const documentsSchema = useMemo(() => {
    const schemaFields: Record<string, z.ZodType> = {};

    // Find the documents step in service steps
    const documentsStep = service.steps.find((step) =>
      step.title.toLowerCase().includes('document'),
    );

    if (documentsStep && documentsStep.fields) {
      const stepFields = Array.isArray(documentsStep.fields)
        ? documentsStep.fields
        : Object.values(documentsStep.fields);

      stepFields.forEach((field) => {
        const typedField = field as ServiceField;
        if (typedField.type === 'document' && typedField.documentType) {
          const fieldName = typedField.name;
          // Required documents use UserDocumentSchema, optional use nullable/optional
          schemaFields[fieldName] = typedField.required
            ? UserDocumentSchema
            : UserDocumentSchema.nullable().optional();
        }
      });
    }

    return z.object(schemaFields);
  }, [service.steps]);

  // Generate default values for document form
  const documentsDefaultValues = useMemo(() => {
    const defaults: Record<string, unknown> = {};

    // Find the documents step in service steps
    const documentsStep = service.steps.find((step) =>
      step.title.toLowerCase().includes('document'),
    );

    if (documentsStep && documentsStep.fields) {
      const stepFields = Array.isArray(documentsStep.fields)
        ? documentsStep.fields
        : Object.values(documentsStep.fields);

      stepFields.forEach((field) => {
        const typedField = field as ServiceField;
        if (typedField.type === 'document' && typedField.documentType) {
          const fieldName = typedField.name;
          defaults[fieldName] = undefined;
          // Check if profile has this document
          if (profile && profile[fieldName as keyof CompleteProfile]) {
            defaults[fieldName] = profile[fieldName as keyof CompleteProfile];
          }
        }
      });
    }

    return defaults;
  }, [service.steps, profile]);

  // Build forms array
  const forms: Array<ServiceForm> = [];

  // Add documents form if there are document steps
  const documentsStep = service.steps.find(
    (step) => step.type === ServiceStepType.Documents,
  );
  if (documentsStep && documentsStep.fields) {
    const stepFields = Array.isArray(documentsStep.fields)
      ? documentsStep.fields
      : Object.values(documentsStep.fields);

    forms.push({
      id: 'documents',
      title: documentsStep.title || 'Documents',
      description:
        documentsStep.description ||
        'Veuillez joindre les documents de votre profil requis pour la démarche',
      schema: documentsSchema,
      defaultValues: {
        ...documentsDefaultValues,
        ...(formData?.documents ?? {}),
      },
      stepData: {
        title: documentsStep.title || 'Documents',
        fields: stepFields.map((field) => {
          const typedField = field as ServiceField;
          if (typedField.type === 'document') {
            return {
              name: typedField.name,
              type: typedField.type,
              label:
                typedField.label ||
                tInputs(`userDocument.options.${typedField.documentType}`),
              required: typedField.required,
              documentType: typedField.documentType,
            };
          }
          return typedField;
        }),
        order: documentsStep.order || 0,
        description: documentsStep.description || 'inputDocument.description',
        type: 'documents' as any,
        isRequired: documentsStep.isRequired || true,
        validations: documentsStep.validations || {},
      },
    });
  }

  // Add service-defined steps (excluding documents step as it's handled separately)
  service.steps
    .filter((step) => !step.title.toLowerCase().includes('document'))
    .forEach((step, index) => {
      const stepId = step.title.toLowerCase().replace(/\s+/g, '_') || `step_${index}`;

      // Convert fields from Record to Array if needed (Convex stores as record)
      const stepFields = Array.isArray(step.fields)
        ? step.fields
        : step.fields
          ? Object.values(step.fields)
          : [];

      // Build default values from profile using profilePath
      const defaultValues: Record<string, unknown> = {};
      stepFields.forEach((field) => {
        const typedField = field as ServiceField;
        if (typedField.profilePath) {
          const profileValue = getProfileValueByPath(profile, typedField.profilePath);
          if (profileValue !== undefined) {
            defaultValues[typedField.name] = profileValue;
          }
        }
      });

      forms.push({
        id: stepId,
        title: step.title,
        schema: createDynamicSchema(stepFields as ServiceField[]),
        defaultValues: {
          ...defaultValues, // Profile-based defaults first
          ...(formData?.[stepId] ? formData[stepId] : {}), // Saved form data overrides
        },
        stepData: {
          title: step.title,
          description: step.description || undefined,
          type: step.type,
          isRequired: step.isRequired,
          fields: stepFields as ServiceField[],
          validations: step.validations || undefined,
          order: step.order,
        },
      });
    });

  // Add delivery form
  forms.push({
    id: 'delivery',
    title: 'Adresse de livraison',
    description: `Assurez-vous de renseigner les informations en fonction du mode de délivrance (adresse nécessaire pour le mode postal)`,
    stepData: {
      title: 'Adresse de livraison',
      fields: [
        {
          name: 'deliveryMode',
          type: 'select',
          label: 'Mode de délivrance',
          description: 'Veuillez choisir le mode de délivrance de votre demande',
          required: true,
          options: service.delivery.modes.map((mode) => ({
            value: mode,
            label: tInputs(`deliveryMode.options.${mode}`),
          })),
          selectType: SelectType.Single,
        },
        {
          name: 'deliveryAddress',
          type: 'address',
          label: 'Votre adresse de livraison',
          required: false,
          countries: [profile.residenceCountry as CountryCode],
        },
      ],
      order: 1,
      description:
        'Attention à bien renseignez les infos en fonction du mode de délivrance',
      type: ServiceStepType.Delivery,
      isRequired: false,
      validations: {},
    },
    schema: z.object({
      deliveryAddress: BasicAddressSchema,
      deliveryMode: z.string({
        message: 'messages.errors.invalid_field',
      }),
    }),
    defaultValues: {
      ...(formData?.delivery ?? {}),
    },
  });

  // Generate step IDs for navigation
  const steps = forms.map((form) => form.id || 'step').filter(Boolean);

  const { currentTab: currentStep, setCurrentTab: setCurrentStep } =
    useStoredTabs<string>('service-step' + service._id, steps[0] ?? '');

  // Update form data handler
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
