'use client';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MessageCircleIcon } from 'lucide-react';
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
          aria-label={t('chat_with_ray')}
          className="p-1 width-16 aspect-square rounded-full bg-primary/40 "
        >
          <MessageCircleIcon className="size-10 text-primary-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[700px] sm:w-[700px]">
        <div className="py-6 h-full">
          <ChatWindow />
        </div>
      </SheetContent>
    </Sheet>
  );
}
