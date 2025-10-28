'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type ChatMessage = any;

export type ChatContextType = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
};

const ChatContext = createContext<ChatContextType>({
  messages: [],
  addMessage: () => {},
  setMessages: () => {},
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  // Fermer le chat lors d'un changement de route
  useEffect(() => {
    const handleRouteChange = () => {
      setMessages([]);
    };

    // Pour Next.js 13 App Router, nous pourrions écouter un événement personnalisé
    // Ceci est un exemple, mais vous pourriez avoir besoin d'adapter selon votre navigation
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, setMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
