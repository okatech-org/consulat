'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import IAstedButton from '../ui/mr-ray-button-fixed';
import { ModernChatWindow } from './modern-chat-window';
import { getGeminiChatCompletion, getUserContextData } from '@/lib/ai/actions';
import { useCurrentUser } from '@/contexts/user-context';
import { useLocale } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/ai/types';

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
}

export function ChatToggle({ customIcon }: { customIcon?: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages] = useState<Message[]>([]);
  const { user } = useCurrentUser();
  const locale = useLocale();

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!message.trim()) return '';

    try {
      // Get user context
      const contextData = await getUserContextData(user?.id, locale);

      // Get AI response
      const aiResponse = await getGeminiChatCompletion(
        [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ],
        contextData,
      );

      if (aiResponse) {
        return aiResponse.content;
      }

      return "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.";
    } catch (error) {
      console.error('Error sending message:', error);
      return "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTitle className="sr-only" asChild>
        <span className="text-sm font-medium">Chat</span>
      </SheetTitle>

      <SheetTrigger className="aspect-square flex items-center justify-center size-[45px] p-1 rounded-full overflow-hidden">
        {customIcon ?? <IAstedButton />}
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
