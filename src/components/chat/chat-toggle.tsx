'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import IAstedButton from '../ui/mr-ray-button-fixed';
import { ModernChatWindow } from './modern-chat-window';
import { getGeminiChatCompletion, getUserContextData } from '@/lib/ai/actions';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocale } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/lib/ai/types';

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
}

export function ChatToggle() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages] = useState<Message[]>([]);
  const user = useCurrentUser();
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
      <SheetTrigger asChild>
        <div className="fixed bottom-4 right-4 z-50">
          <IAstedButton className="cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </SheetTrigger>
      <SheetContent
        side="right"
        className={cn(
          'flex h-full w-full flex-col gap-0 p-0 sm:max-w-[600px] border-l shadow-lg',
          isMobile && 'h-[100dvh]',
        )}
      >
        <SheetTitle className="flex items-center justify-between border-b px-6 py-4 bg-background">
          <span className="text-lg font-semibold">Assistant Consulaire</span>
        </SheetTitle>
        <ModernChatWindow
          className="border-0 shadow-none rounded-none"
          onSendMessage={handleSendMessage}
          botName="Ray"
          botAvatarUrl="/avatar-placeholder.png"
          initialMessages={messages}
        />
      </SheetContent>
    </Sheet>
  );
}
