import { BaseAssistant } from '@/lib/ai/assistants/base-assistant';
import { AssistantResponse, Message } from '@/lib/ai/types';

export class ConsularAssistant extends BaseAssistant {
  async handleMessage(message: string): Promise<AssistantResponse> {
    try {
      const messages: Message[] = [
        {
          role: 'user',
          content: message,
        },
      ];

      const response = await this.createChatCompletion(messages);
      await this.saveInteraction(messages[0], response);

      return response;
    } catch (error) {
      console.error('Error handling message:', error);
      return {
        message:
          'Je suis désolé, mais je ne peux pas traiter votre demande pour le moment. Veuillez réessayer plus tard.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
