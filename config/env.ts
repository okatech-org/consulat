export const env = {
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  POSTGRES_URL: process.env.POSTGRES_URL,
} as const;

// Validation des variables d'environnement
Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
});
