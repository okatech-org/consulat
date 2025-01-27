import { cookies } from 'next/headers';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const CHAT_HISTORY_SESSION_KEY = 'consulat_chat_history';
const MAX_HISTORY_LENGTH = 10; // Limiter l'historique aux 10 derniers messages (à ajuster)

export class ChatSessionManager {
  static getSessionId(): string | undefined {
    return cookies().get('session')?.value; // Assurez-vous que le nom du cookie correspond à votre gestion de session
  }

  static async initializeSessionHistory(): Promise<ChatCompletionMessageParam[]> {
    return [];
  }

  static async getSessionHistory(): Promise<ChatCompletionMessageParam[]> {
    const sessionId = ChatSessionManager.getSessionId();
    if (!sessionId) {
      return ChatSessionManager.initializeSessionHistory();
    }

    const history = cookies().get(CHAT_HISTORY_SESSION_KEY)?.value;
    return history ? JSON.parse(history) : [];
  }

  static async addMessageToHistory(message: ChatCompletionMessageParam): Promise<void> {
    const currentHistory = await ChatSessionManager.getSessionHistory();
    const updatedHistory = [...currentHistory, message].slice(-MAX_HISTORY_LENGTH); // Ajoute et limite l'historique

    cookies().set(CHAT_HISTORY_SESSION_KEY, JSON.stringify(updatedHistory));
  }

  static async clearSessionHistory(): Promise<void> {
    cookies().delete(CHAT_HISTORY_SESSION_KEY);
  }
}
