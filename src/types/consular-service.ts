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
  'document',
  'photo',
] as const;

export type ServiceFieldType = (typeof fieldTypes)[number];

export type ServiceField = {
  name: string;
  type: ServiceFieldType;
  label: string;
  required?: boolean;
  description?: string | null;
  placeholder?: string;
  defaultValue?: any;
  profileField?: string;
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
};
