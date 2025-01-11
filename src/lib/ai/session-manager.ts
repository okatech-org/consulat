// src/lib/ai/session-actions.ts
import { Message } from './types';

const CHAT_SESSION_KEY = 'ray_chat_session';

export interface ChatSession {
  messages: Message[];
  lastUpdated: string;
}

export class SessionManager {
  static saveInteraction(userMessage: Message, assistantMessage: Message) {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      // Récupérer la session existante
      const existingSession = this.getCurrentSession();
      const messages = existingSession ? existingSession.messages : [];

      // Ajouter les nouveaux messages
      const updatedSession: ChatSession = {
        messages: [...messages, userMessage, assistantMessage],
        lastUpdated: new Date().toISOString()
      };

      // Sauvegarder dans sessionStorage
      sessionStorage.setItem(CHAT_SESSION_KEY, JSON.stringify(updatedSession));
    } catch (error) {
      console.error('Error saving chat interaction:', error);
    }
  }

  static getCurrentSession(): ChatSession | null {

    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const sessionData = sessionStorage.getItem(CHAT_SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Error retrieving chat session:', error);
      return null;
    }
  }

  static clearSession() {
    try {
      sessionStorage.removeItem(CHAT_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing chat session:', error);
    }
  }
}