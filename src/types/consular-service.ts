import {
  ConsularService,
  ServiceCategory,
  ServiceStepType,
  Organization,
} from '@prisma/client';
import { ProfileKey } from '@/types/profile';

export const fieldTypes = [
  'text',
  'email',
  'phone',
  'date',
  'select',
  'address',
  'file',
  'checkbox',
  'radio',
  'textarea',
  'number',
] as const;

export type ServiceFieldType = (typeof fieldTypes)[number];

// Types pour les champs de formulaire dynamiques
export interface ServiceField {
  name: string;
  type: ServiceFieldType;
  label: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: unknown;
  profileField?: ProfileKey;
  options?: Array<{
    value: string;
    label: string;
  }>;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customValidation?: string;
  };
}

export interface ServiceStep {
  id: string | null;
  order: number;
  title: string;
  description: string | null;
  type: ServiceStepType;
  isRequired: boolean;
  fields: ServiceField[];
  validations: Record<string, unknown> | null;
}

export interface ConsularServiceItem extends Omit<ConsularService, 'fields'> {
  steps: ServiceStep[];
  organization: Organization | null;
}

export type UpdateServiceInput = Partial<ConsularServiceItem>;

export interface ProfileFieldMapping {
  [formField: string]: string;
}

export interface ServiceStore {
  services: ConsularServiceItem[];
  selectedService: ConsularServiceItem | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setServices: (services: ConsularServiceItem[]) => void;
  setSelectedService: (service: ConsularServiceItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface ConsularServiceListingItem {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  organization: {
    id: string;
    name: string;
  } | null;
}
