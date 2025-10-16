import type { Id } from '../_generated/dataModel';

// Interface pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export class ValidationException extends Error {
  constructor(public errors: Array<ValidationError>) {
    super(`Validation failed: ${errors.map((e) => e.message).join(', ')}`);
    this.name = 'Validatio nException';
  }
}

// Validateur pour les demandes
export function validateRequest(data: any): Array<ValidationError> {
  const errors: Array<ValidationError> = [];

  if (!data.serviceId) {
    errors.push({
      field: 'serviceId',
      message: 'Service ID is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!data.requesterId) {
    errors.push({
      field: 'requesterId',
      message: 'Requester ID is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (data.priority !== undefined && (data.priority < 0 || data.priority > 2)) {
    errors.push({
      field: 'priority',
      message: 'Priority must be between 0 and 2',
      code: 'INVALID_RANGE',
    });
  }

  return errors;
}

// Validateur pour les utilisateurs
export function validateUser(data: any): Array<ValidationError> {
  const errors: Array<ValidationError> = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_FORMAT',
    });
  }

  if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.push({
      field: 'phoneNumber',
      message: 'Invalid phone number format',
      code: 'INVALID_FORMAT',
    });
  }

  return errors;
}

// Validateur pour les services
export function validateService(data: any): Array<ValidationError> {
  const errors: Array<ValidationError> = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Service name is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (!data.code || data.code.trim().length === 0) {
    errors.push({
      field: 'code',
      message: 'Service code is required',
      code: 'REQUIRED_FIELD',
    });
  }

  if (data.price !== undefined && data.price < 0) {
    errors.push({
      field: 'price',
      message: 'Price cannot be negative',
      code: 'INVALID_RANGE',
    });
  }

  return errors;
}

// Helper pour valider et lancer une exception si nécessaire
export function validateOrThrow<T>(
  data: T,
  validator: (data: T) => Array<ValidationError>,
): void {
  const errors = validator(data);
  if (errors.length > 0) {
    throw new ValidationException(errors);
  }
}

// Helper pour les mutations avec validation
export async function withValidation<T>(
  data: any,
  validator: (data: any) => Array<ValidationError>,
  mutation: (data: any) => Promise<T>,
): Promise<T> {
  // Validation
  validateOrThrow(data, validator);

  // Exécution de la mutation
  const result = await mutation(data);

  return result;
}

// Utilitaires de validati on
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Helper pour générer des clés de cache à invalider (désactivé)
export function getCacheKeysToInvalidate(
  type: 'user' | 'service' | 'request' | 'organizatio n',
  id: Id<any>,
): Array<string> {
  // Cache désactivé pour l'instant
  return [];
}
