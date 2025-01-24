export class FormError extends Error {
  constructor(
    message: string,
    public step?: number,
    public field?: string,
  ) {
    super(message);
    this.name = 'FormError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleFormError(error: unknown, t: any) {
  if (error instanceof FormError) {
    return {
      title: t('errors.validation.title'),
      description: error.message,
      step: error.step,
      field: error.field,
    };
  }

  return {
    title: t('errors.unknown.title'),
    description: t('errors.unknown.description'),
  };
}
