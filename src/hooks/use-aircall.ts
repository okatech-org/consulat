'use client';

import { useEffect, useRef, useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { AircallConfig } from '@/schemas/aircall';

declare global {
  interface Window {
    AircallWorkspace: any;
  }
}

interface AircallWorkspaceInstance {
  dial: (phoneNumber: string) => void;
  hangup: () => void;
  answer: () => void;
  hold: () => void;
  unhold: () => void;
  mute: () => void;
  unmute: () => void;
  openKeypad: () => void;
  closeKeypad: () => void;
  openDialer: () => void;
  closeDialer: () => void;
  openContacts: () => void;
  closeContacts: () => void;
  openHistory: () => void;
  closeHistory: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  destroy: () => void;
}

interface UseAircallOptions {
  config: AircallConfig;
  domElementId: string;
  onLogin?: (settings: any) => void;
  onLogout?: () => void;
  onCallStart?: (data: any) => void;
  onCallEnd?: (data: any) => void;
  onCallAnswer?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useAircall({
  config,
  domElementId,
  onLogin,
  onLogout,
  onCallStart,
  onCallEnd,
  onCallAnswer,
  onError,
}: UseAircallOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const workspaceRef = useRef<AircallWorkspaceInstance | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Charger le script Aircall
  useEffect(() => {
    if (!config.enabled || isScriptLoaded) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.aircall.io/workspace/v2/aircall-workspace.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      setError('Impossible de charger le script Aircall');
      onError?.('Impossible de charger le script Aircall');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config.enabled, isScriptLoaded, onError]);

  // Initialiser Aircall Workspace
  useEffect(() => {
    if (
      !config.enabled ||
      !isScriptLoaded ||
      !window.AircallWorkspace ||
      workspaceRef.current
    ) {
      return;
    }

    try {
      const workspace = new window.AircallWorkspace({
        domToLoadWorkspace: `#${domElementId}`,
        integrationToLoad: config.integrationName || 'consulat-ga',
        size: config.workspaceSize || 'medium',
        onLogin: (settings: any) => {
          setIsConnected(true);
          setIsLoaded(true);
          onLogin?.(settings);
        },
        onLogout: () => {
          setIsConnected(false);
          onLogout?.();
        },
        onCallStart: (data: any) => {
          onCallStart?.(data);
        },
        onCallEnd: (data: any) => {
          onCallEnd?.(data);
        },
        onCallAnswer: (data: any) => {
          onCallAnswer?.(data);
        },
        onError: (error: any) => {
          console.error('Aircall: Erreur', error);
          setError(error.message || 'Erreur Aircall');
          onError?.(error);
        },
      });

      workspaceRef.current = workspace;
    } catch (err) {
      console.error("Erreur lors de l'initialisation d'Aircall:", err);
      setError("Erreur lors de l'initialisation d'Aircall");
      onError?.(err);
    }
  }, [
    config.enabled,
    isScriptLoaded,
    domElementId,
    config.integrationName,
    config.workspaceSize,
    onLogin,
    onLogout,
    onCallStart,
    onCallEnd,
    onCallAnswer,
    onError,
  ]);

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      if (workspaceRef.current) {
        try {
          workspaceRef.current.destroy();
        } catch (err) {
          console.error("Erreur lors de la destruction d'Aircall:", err);
        }
      }
    };
  }, []);

  // Fonctions utilitaires
  const makeCall = (phoneNumber: string) => {
    if (!workspaceRef.current || !isConnected) {
      console.warn("Aircall n'est pas connecté");
      return false;
    }

    try {
      workspaceRef.current.dial(phoneNumber);
      return true;
    } catch (err) {
      console.error("Erreur lors de l'appel:", err);
      setError("Erreur lors de l'appel");
      return false;
    }
  };

  const hangupCall = () => {
    if (!workspaceRef.current || !isConnected) {
      console.warn("Aircall n'est pas connecté");
      return false;
    }

    try {
      workspaceRef.current.hangup();
      return true;
    } catch (err) {
      console.error("Erreur lors de la fermeture d'appel:", err);
      return false;
    }
  };

  const openDialer = () => {
    if (!workspaceRef.current || !isConnected) {
      console.warn("Aircall n'est pas connecté");
      return false;
    }

    try {
      workspaceRef.current.openDialer();
      return true;
    } catch (err) {
      console.error("Erreur lors de l'ouverture du dialer:", err);
      return false;
    }
  };

  return {
    isLoaded,
    isConnected,
    error,
    makeCall,
    hangupCall,
    openDialer,
    workspace: workspaceRef.current,
  };
}
