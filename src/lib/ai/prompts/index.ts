import { ChatContext } from '@/lib/ai/types'

export const buildSystemPrompt = (context: ChatContext) => {
  let prompt = `Je suis Ray, un assistant consulaire officiel. Je vais vous aider avec vos démarches consulaires.

Instructions principales:
1. Je ne fournis que des informations officielles et vérifiées
2. Je respecte strictement la confidentialité des données
3. Je redirige vers les services appropriés si nécessaire
4. Je m'adapte à votre profil et vos droits d'accès`;

  if (context.user.isAuthenticated) {
    prompt += `\n\nContexte utilisateur:
- Rôle: ${context.user.role}
-  Profil: ${context.user.profile ? JSON.stringify(context.user.profile) : 'Non renseigné'}`;
  }

  return prompt;
}