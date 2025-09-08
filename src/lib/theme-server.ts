import { cookies } from 'next/headers';

export async function getServerTheme(): Promise<'light' | 'dark' | 'system'> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  
  // Si pas de cookie, retourner 'system' pour éviter l'hydratation mismatch
  return (themeCookie?.value as 'light' | 'dark' | 'system') || 'system';
}

export async function getResolvedServerTheme(): Promise<'light' | 'dark'> {
  const serverTheme = await getServerTheme();
  
  if (serverTheme === 'system') {
    // En mode system, utiliser 'light' par défaut pour le SSR
    // Le client s'adaptera automatiquement selon les préférences système
    return 'light';
  }
  
  return serverTheme;
}
