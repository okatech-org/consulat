'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { motion, useAnimation, AnimatePresence, PanInfo } from 'framer-motion';
import useWindowDimensions from '@/hooks/use-window-dimensions';
import IAstedButton from '../ui/mr-ray-button-fixed';
import { useChat } from '@/contexts/chat-context';
import { ModernChatWindow } from './modern-chat-window';
import { getChatCompletion, getUserContextData } from '@/lib/ai/actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocale } from 'next-intl';
import { ContextBuilder } from '@/lib/ai/context-builder';

// Constantes pour la gestion de la position
const STORAGE_KEY = 'ray-chatbot-position';
const DEFAULT_POSITION = { x: 0, y: 0 };
const BUTTON_SIZE = 80; // taille du bouton en pixels (ajustée pour Mr Ray)
const PADDING = 20; // espace de padding pour les limites

export function ChatToggle() {
  const { isOpen, toggleChat } = useChat();
  const controls = useAnimation();
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [isDragging, setIsDragging] = useState(false);
  const { width, height } = useWindowDimensions();
  const currentUser = useCurrentUser();
  const locale = useLocale();
  const [userContext, setUserContext] = useState<string | null>(null);

  // Reset context when chat is closed
  useEffect(() => {
    if (!isOpen) {
      setUserContext(null);
    }
  }, [isOpen]);

  // Animation de pulsation (simplifiée car Mr Ray a déjà ses propres animations)
  useEffect(() => {
    if (!isOpen && !isDragging) {
      controls.start({
        scale: 1,
        transition: { duration: 0.3 },
      });
    }
  }, [controls, isOpen, isDragging]);

  // Charger la position sauvegardée
  useEffect(() => {
    const savedPosition = localStorage.getItem(STORAGE_KEY);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        // Vérifier que la position est dans les limites de l'écran actuel
        const validPosition = validatePosition(parsed, width, height);
        setPosition(validPosition);
      } catch (e) {
        console.error('Failed to parse saved position', e);
        setPosition(DEFAULT_POSITION);
      }
    }
  }, [width, height]);

  // Valider que la position est dans les limites de l'écran
  const validatePosition = (
    pos: typeof DEFAULT_POSITION,
    screenWidth: number,
    screenHeight: number,
  ) => {
    if (!screenWidth || !screenHeight) return DEFAULT_POSITION;

    return {
      x: Math.min(
        Math.max(pos.x, -screenWidth / 2 + BUTTON_SIZE / 2 + PADDING),
        screenWidth / 2 - BUTTON_SIZE / 2 - PADDING,
      ),
      y: Math.min(
        Math.max(pos.y, -screenHeight / 2 + BUTTON_SIZE / 2 + PADDING),
        screenHeight / 2 - BUTTON_SIZE / 2 - PADDING,
      ),
    };
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    event.preventDefault(); // Prevent default behavior
    event.stopPropagation(); // Stop propagation to prevent click event
    setIsDragging(false);

    // Mettre à jour et sauvegarder la nouvelle position
    const newPosition = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    };

    // Valider la position
    const validPosition = validatePosition(newPosition, width, height);
    setPosition(validPosition);

    // Sauvegarder dans localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validPosition));
  };

  // Cette fonction gère l'envoi de messages au chatbot
  const handleSendMessage = async (message: string): Promise<string> => {
    try {
      // Get or initialize context
      if (!userContext) {
        // Only fetch context data the first time
        const contextData = await getUserContextData(
          locale,
          currentUser?.id,
          currentUser?.roles ? currentUser.roles[0] : undefined,
        );
        const context = ContextBuilder.buildContext(contextData);
        setUserContext(context);

        // Envoyer le message au chatbot
        const aiResponse = await getChatCompletion(message, context, [
          { role: 'user', content: message },
        ]);

        return aiResponse || 'Désolé, une erreur est survenue. Veuillez réessayer.';
      } else {
        // Reuse existing context for subsequent messages
        const aiResponse = await getChatCompletion(message, userContext, [
          { role: 'user', content: message },
        ]);

        return aiResponse || 'Désolé, une erreur est survenue. Veuillez réessayer.';
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      return 'Désolé, une erreur est survenue. Veuillez réessayer.';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={toggleChat}>
      <SheetTitle className="sr-only">Chat with an assistant</SheetTitle>

      <motion.div
        className="fixed flex items-center justify-center z-50"
        style={{
          bottom: '20px',
          right: '20px',
          touchAction: 'none',
        }}
        animate={{
          x: position.x,
          y: position.y,
        }}
        drag
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
      >
        <AnimatePresence>
          <motion.div
            onClick={() => {
              // Only toggle if not dragging
              if (!isDragging) {
                toggleChat();
              }
            }}
            className="aspect-square size-[4rem] relative md:size-20 rounded-full overflow-hidden cursor-pointer"
            whileTap={{ scale: 0.95 }}
            animate={controls}
          >
            <IAstedButton />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <SheetContent side="right" className="w-full max-w-[700px] sm:w-[700px] p-0">
        <div className="h-full overflow-hidden">
          <ModernChatWindow
            className="h-full border-0 shadow-none rounded-none"
            botName="Ray"
            botAvatarUrl="/images/avatar-placeholder.png"
            onSendMessage={handleSendMessage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
