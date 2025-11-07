'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import IAstedButton from '../ui/mr-ray-button-fixed';
import { ModernChatWindow } from './modern-chat-window';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLocale } from 'next-intl';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/convex/lib/ai/types';

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

  const getChatCompletion = useAction(api.functions.ai.getChatCompletion);

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!message.trim() || !user?._id) return '';

    try {
      const aiResponse = await getChatCompletion({
        userId: user?._id,
        locale: locale,
        messages: [
          ...messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: message },
        ],
      });

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

      {customIcon ? (
        <SheetTrigger className="cursor-pointer flex items-center justify-center p-1 rounded-full overflow-hidden">
          {customIcon}
        </SheetTrigger>
      ) : (
        <SheetTrigger className="aspect-square cursor-pointer flex items-center justify-center size-[45px] p-1 rounded-full overflow-hidden">
          <IAstedButton />
        </SheetTrigger>
      )}

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
