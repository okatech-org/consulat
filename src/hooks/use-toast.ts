'use client';

import { useState, useCallback } from 'react';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((message: string, type: ToastData['type'], duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: ToastData = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove après la durée spécifiée
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 300); // +300ms pour l'animation
    
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => 
    addToast(message, 'success', duration), [addToast]);
    
  const error = useCallback((message: string, duration?: number) => 
    addToast(message, 'error', duration), [addToast]);
    
  const warning = useCallback((message: string, duration?: number) => 
    addToast(message, 'warning', duration), [addToast]);
    
  const info = useCallback((message: string, duration?: number) => 
    addToast(message, 'info', duration), [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}