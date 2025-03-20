'use client';

import { useCallback } from 'react';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: any;
}

export interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
}

/**
 * Hook pour fournir des fonctionnalités de journalisation
 * 
 * @returns Un objet logger avec les méthodes debug, info, warn et error
 */
export function useLogger(): Logger {
  const log = useCallback((level: LogLevel, message: string, context?: LogContext) => {
    // En développement, on affiche les logs dans la console
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      const formattedContext = context ? JSON.stringify(context, null, 2) : '';
      
      switch (level) {
        case 'debug':
          console.debug(`[${timestamp}] [DEBUG] ${message}`, formattedContext);
          break;
        case 'info':
          console.info(`[${timestamp}] [INFO] ${message}`, formattedContext);
          break;
        case 'warn':
          console.warn(`[${timestamp}] [WARN] ${message}`, formattedContext);
          break;
        case 'error':
          console.error(`[${timestamp}] [ERROR] ${message}`, formattedContext);
          break;
      }
    }
    
    // En production, on pourrait envoyer les logs à un service externe
    // comme Sentry, LogRocket, etc.
  }, []);

  return {
    debug: (message: string, context?: LogContext) => log('debug', message, context),
    info: (message: string, context?: LogContext) => log('info', message, context),
    warn: (message: string, context?: LogContext) => log('warn', message, context),
    error: (message: string, context?: LogContext) => log('error', message, context),
  };
}

// Export un logger global pour les composants non-React
export const logger: Logger = {
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  },
  info: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[INFO] ${message}`, context || '');
    }
  },
  warn: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, context || '');
    }
  },
  error: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ERROR] ${message}`, context || '');
    }
  },
}; 