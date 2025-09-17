import { cookies } from 'next/headers';

export async function getServerTheme(): Promise<'light' | 'dark' | 'system'> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');

  // Si pas de cookie, retourner 'system' pour éviter l'hydratation mismatch
  return (themeCookie?.value as 'light' | 'dark' | 'system') || 'system';
}
