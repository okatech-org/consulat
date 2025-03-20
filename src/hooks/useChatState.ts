import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/chat/ChatMessage';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  conversationId: string;
  addMessage: (content: string, sender: 'user' | 'bot') => void;
  setIsLoading: (loading: boolean) => void;
  clearMessages: () => void;
  loadConversation: (conversationId: string) => void;
  saveCurrentConversation: () => void;
  getStoredConversations: () => Array<{ id: string, title: string, date: Date }>;
}

export const useChatState = (initialMessages: Message[] = []): ChatState => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>(uuidv4());

  // Chargement initial des messages du localStorage si disponible
  useEffect(() => {
    const storedConversation = localStorage.getItem(`chat_conversation_${conversationId}`);
    if (storedConversation && initialMessages.length === 0) {
      try {
        const parsedConversation = JSON.parse(storedConversation);
        // Convertir les timestamps string en objets Date
        const messagesWithDates = parsedConversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Erreur lors du chargement de la conversation:', error);
      }
    }
  }, [conversationId, initialMessages.length]);

  // Enregistrement automatique des messages dans localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_conversation_${conversationId}`, JSON.stringify({
        id: conversationId,
        title: messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : ''),
        date: new Date(),
        messages
      }));
    }
  }, [messages, conversationId]);

  // Fonction pour ajouter un message
  const addMessage = useCallback((content: string, sender: 'user' | 'bot') => {
    const newMessage = {
      id: uuidv4(),
      content,
      sender,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Faire défiler automatiquement vers le bas
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  }, []);

  // Fonction pour effacer les messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(uuidv4());
  }, []);

  // Fonction pour charger une conversation existante
  const loadConversation = useCallback((id: string) => {
    const storedConversation = localStorage.getItem(`chat_conversation_${id}`);
    if (storedConversation) {
      try {
        const parsedConversation = JSON.parse(storedConversation);
        const messagesWithDates = parsedConversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
        setConversationId(id);
      } catch (error) {
        console.error('Erreur lors du chargement de la conversation:', error);
      }
    }
  }, []);

  // Fonction pour sauvegarder explicitement la conversation actuelle
  const saveCurrentConversation = useCallback(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_conversation_${conversationId}`, JSON.stringify({
        id: conversationId,
        title: messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : ''),
        date: new Date(),
        messages
      }));
      return conversationId;
    }
    return null;
  }, [messages, conversationId]);

  // Fonction pour récupérer toutes les conversations enregistrées
  const getStoredConversations = useCallback(() => {
    const conversations = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_conversation_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          conversations.push({
            id: data.id,
            title: data.title,
            date: new Date(data.date)
          });
        } catch (error) {
          console.error('Erreur lors de la récupération des conversations:', error);
        }
      }
    }
    
    // Trier par date, la plus récente en premier
    return conversations.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, []);

  return {
    messages,
    isLoading,
    conversationId,
    addMessage,
    setIsLoading,
    clearMessages,
    loadConversation,
    saveCurrentConversation,
    getStoredConversations
  };
};

export default useChatState; 