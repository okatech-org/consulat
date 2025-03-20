'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ChatContextType {
  isOpen: boolean;
  toggleChat: () => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  // Fermer le chat lors d'un changement de route
  useEffect(() => {
    const handleRouteChange = () => {
      closeChat();
    };

    // Pour Next.js 13 App Router, nous pourrions écouter un événement personnalisé
    // Ceci est un exemple, mais vous pourriez avoir besoin d'adapter selon votre navigation
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <ChatContext.Provider value={{ isOpen, toggleChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
