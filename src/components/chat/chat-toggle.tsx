'use client';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { ChatWindow } from './chat-window';
import IAstedButton from '../ui/mr-ray-button-fixed';

export function ChatToggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTitle className="sr-only">Chat with an assistant</SheetTitle>
      <SheetTrigger className="aspect-square size-20 rounded-full overflow-hidden">
        <IAstedButton />
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[700px] sm:w-[700px]">
        <div className="py-6 h-full">
          <ChatWindow />
        </div>
      </SheetContent>
    </Sheet>
  );
}
