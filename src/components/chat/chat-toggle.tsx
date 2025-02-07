'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {MessageCircleMore} from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChatWindow } from './chat-window';

export function ChatToggle() {
  const t = useTranslations('common.chatbot');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed flex flex-col bg-sidebar p-2 items-center bottom-10 right-4 rounded-full p-0 md:bottom-4 md:right-6"
          aria-label={t('chat_with_ray')}
        >
          <MessageCircleMore className="size-10" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[500px] sm:w-[500px]">
        <div className="py-6 h-full">
          <ChatWindow />
        </div>
      </SheetContent>
    </Sheet>
  );
}
