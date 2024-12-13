import { User, Consulate, Country } from '@prisma/client'
import { UserContext } from './types';
import { FullProfile } from '@/types'

// TypeScript
export class ContextBuilder {
  static async buildContext(
    user?: User | null,
    profile?: FullProfile | undefined,
    consulate?: Consulate & {
      countries: Omit<Country, "consulateId">[]
    } | null
  ): Promise<UserContext> {

    return {
      user: user || null,
      profile: profile,
      consulate: consulate || null
    };
  }
}