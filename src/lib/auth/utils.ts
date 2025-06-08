import { authClient } from './auth-client';

export async function signOut() {
  await authClient.signOut();
}
