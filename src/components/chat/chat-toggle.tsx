'use client';

import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAnimation } from 'framer-motion';
import IAstedButton from '../ui/mr-ray-button-fixed';
import { useChat } from '@/contexts/chat-context';
import { ModernChatWindow } from './modern-chat-window';
import { getChatCompletion, getUserContextData } from '@/lib/ai/actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocale } from 'next-intl';
import { ContextBuilder } from '@/lib/ai/context-builder';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function ChatToggle() {
  const isMobile = useIsMobile();
  const { isOpen, toggleChat } = useChat();
  const controls = useAnimation();
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
    if (!isOpen) {
      controls.start({
        scale: 1,
        transition: { duration: 0.3 },
      });
    }
  }, [controls, isOpen]);

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
      <SheetTitle className="sr-only" asChild>
        <span className="text-sm font-medium">Chat</span>
      </SheetTitle>

      <SheetTrigger className="aspect-square size-[45px] p-1 rounded-full overflow-hidden">
        <IAstedButton />
      </SheetTrigger>

      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn(
          'w-full max-w-[700px] sm:w-[700px] p-0',
          isMobile && 'h-full max-h-[600px]',
        )}
      >
        <div className="h-full overflow-hidden">
          <ModernChatWindow
            className="h-full border-0 shadow-none rounded-none"
            botName="Ray"
            botAvatarUrl="/avatar-placeholder.png"
            onSendMessage={handleSendMessage}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
