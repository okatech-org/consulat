import { OpenAI } from 'openai';
import { AssistantResponse, Message, UserContext } from '@/lib/ai/types'
import { SessionManager } from '@/lib/ai/session-manager'

export class BaseAssistant {
  protected readonly openai: OpenAI;
  protected readonly userContext: UserContext;

  constructor(openai: OpenAI, userContext: UserContext) {
    this.openai = openai;
    this.userContext = userContext;
  }

  protected async getSystemPrompt(): Promise<string> {
    const isAuthenticated = !!this.userContext.user;
    const hasProfile = !!this.userContext.profile;
    const hasConsulate = !!this.userContext.consulate;

    let prompt = `You are Ray, a consulate agent. Your role is to help users with their consular procedures. Here are your guidelines:

0. Act like a human, not a robot. Remember that you are communicating with a real person and should be empathetic to their needs.
1. Always be polite, professional, and helpful.
2. Provide accurate and concise information about passports, visas, birth certificates, and other consular services.
3. Adapt your responses based on the user's context (country of residence, status, etc.).
4. Use the specific user information to personalize your responses.
5. If you don't know the answer, direct the user to the appropriate consular service.
6. Respond in the user's language.
7. Use Markdown format to structure your responses (lists, bold, links, etc.).
9. Respect the confidentiality of user information.
10. Provide links to relevant forms or pages on the consulate's website if necessary.
11. Call the user by his lastName (if known) or by his firstName and add the appropriate title (Mr., Mrs., etc.).
12. Clearly state the steps the user needs to take to complete a certain process.

Information on consular services:
- Passports: Require a valid ID and a recent photo.
- Visas: Requirements vary depending on the country of origin and length of stay.
- Birth certificates: Can be obtained by providing proof of identity and birth details.`;

    if (isAuthenticated && this.userContext.user) {
      prompt += `\n\nContexte utilisateur:
- Nom: ${this.userContext.user.name || 'Non renseigné'}
- Rôle: ${this.userContext.user.role}`;
    }

    if (hasProfile && this.userContext.profile) {
      prompt += `\n\nInformations de profil:
- Nom complet: ${this.userContext.profile.firstName} ${this.userContext.profile.lastName}
- Statut: ${this.userContext.profile.status}
- Pays de résidence: ${this.userContext.profile.address?.country}`;
    }

    if (hasConsulate && this.userContext.consulate) {
      prompt += `\n\nConsulat de rattachement:
- Nom: ${this.userContext.consulate.name}
- Type: ${this.userContext.consulate.isGeneral ? 'Général' : 'Consulat'}
- Pays couverts: ${this.userContext.consulate.countries.join(', ')}`;
    }

    return prompt;
  }

  protected async createChatCompletion(
    messages: Message[],
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<AssistantResponse> {
    try {
      const systemPrompt = await this.getSystemPrompt();
      const allMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any[];

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: allMessages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1000,
      });

      return {
        message: completion.choices[0].message.content || ''
      };
    } catch (error) {
      console.error('Error in chat completion:', error);
      throw new Error('Failed to generate response');
    }
  }

  protected async saveInteraction(message: Message, response: AssistantResponse) {
    const userMessage: Message = {
      role: 'user',
      content: message.content
    };

    const assistantMessage: Message = {
      role: 'assistant',
      content: response.message
    };

    SessionManager.saveInteraction(userMessage, assistantMessage);
  }
}