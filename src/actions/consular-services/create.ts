'use server'

import { db } from '@/lib/prisma'
import { ConsularServiceType, DocumentType } from '@prisma/client'
import { ActionResult } from '@/lib/auth/action'
import { checkAuth } from '@/lib/auth/action'

interface CreateServiceInput {
  type: ConsularServiceType
  title: string
  description?: string
  requiredDocuments: DocumentType[]
  optionalDocuments?: DocumentType[]
  estimatedTime?: string
  price?: number
  steps: {
    order: number
    title: string
    description?: string
    isRequired: boolean
    fields?: Record<string, unknown>
  }[]
}

export async function createConsularService(
  input: CreateServiceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const authResult = await checkAuth(['ADMIN', 'SUPER_ADMIN'])
    if (authResult.error) return { error: authResult.error }

    const service = await db.consularService.create({
      data: {
        type: input.type,
        title: input.title,
        description: input.description,
        requiredDocuments: input.requiredDocuments,
        estimatedTime: input.estimatedTime,
        price: input.price,
        steps: {
          create: input.steps.map(step => ({
            order: step.order,
            title: step.title,
            description: step.description,
            isRequired: step.isRequired,
            fields: step.fields ? JSON.stringify(step.fields) : undefined
          }))
        }
      }
    })

    return { data: { id: service.id } }
  } catch (error) {
    console.error('Error creating consular service:', error)
    return { error: 'Failed to create consular service' }
  }
}