import { User } from '@prisma/client'
import { ChatContext } from './types'
import { FullProfile } from '@/types'

// src/lib/ai/context-builder.ts
export class ContextBuilder {
  static async buildContext(user?: User, profile?: FullProfile): Promise<ChatContext> {
    const context: ChatContext = {
      user: JSON.parse(JSON.stringify(user)),
      profile: JSON.parse(JSON.stringify(profile))
    };

    return context;
  }
}