import { Prisma } from '@prisma/client';

export type PrismaInclude<T extends string | number | symbol> = {
  include: {
    [K in T]?: boolean | Record<string, any>;
  };
};

export type WithInclude<T, I> = T & {
  [K in keyof I['include']]: I['include'][K] extends true
    ? K extends keyof T
      ? NonNullable<T[K]>
      : never
    : I['include'][K] extends Record<string, any>
      ? K extends keyof T
        ? NonNullable<T[K]> & WithInclude<NonNullable<T[K]>, I['include'][K]>
        : never
      : never;
};
