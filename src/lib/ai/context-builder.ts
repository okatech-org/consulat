import { User } from '@prisma/client'
import { ChatContext } from './types'
import { FullProfile } from '@/types'
import { db } from '@/lib/prisma'

// src/lib/ai/context-builder.ts
export class ContextBuilder {
  static async buildContext(user: User | null, profile: FullProfile | null): Promise<ChatContext> {
    const context: ChatContext = {
      user: {
        isAuthenticated: !!user,
        role: user?.role,
        profile: profile || undefined
      }
    };

    if (user?.consulateId) {
      const consulate = await db.consulate.findUnique({
        where: { id: user.consulateId },
        include: { availableServices: true }
      });
      context.consulate = consulate || undefined;
    }

    return context;
  }
}