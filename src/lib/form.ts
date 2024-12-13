import { z } from "zod"
import { getTranslations } from 'next-intl/server'
import { ActionResult } from '@/lib/auth/action'

export async function validateForm<T>(
  schema: z.Schema<T>,
  formData: FormData
): Promise<ActionResult<T>> {
  const t = await getTranslations('errors.validation')

  try {
    // Convertir FormData en objet
    const data = Object.fromEntries(formData.entries())

    const validated = await schema.parseAsync(data)
    return { data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.errors[0].message // ou formater les erreurs comme souhaité
      }
    }
    return { error: t('invalid_data') }
  }
}