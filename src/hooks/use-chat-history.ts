import { useState, useEffect } from 'react';
import { OpenAI } from 'openai';

// Define type for chat message history
export type ChatMessage = OpenAI.Chat.ChatCompletionMessageParam;

const STORAGE_KEY = 'consular_chat_history';

export function useChatHistory() {
  // Initialize history from sessionStorage or with an empty array
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    const storedHistory = sessionStorage.getItem(STORAGE_KEY);
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  // Function to add a new message to the history and update sessionStorage
  const addMessage = (message: ChatMessage) => {
    setHistory((prevHistory) => {
      const updatedHistory = [...prevHistory, message];
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory)); // Save to sessionStorage
      return updatedHistory;
    });
  };

  // Function to clear history and remove it from sessionStorage
  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem(STORAGE_KEY); // Clear from sessionStorage
  };

  // Update sessionStorage whenever history changes
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  return {
    history,
    addMessage,
    clearHistory,
  };
}
