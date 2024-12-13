'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { X } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChatWindow } from './chat-window'
import LottieAnimation from '@/components/ui/lottie-animation'

export function ChatToggle() {
  const t = useTranslations('chatbot')
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed flex flex-col aspect-square h-max items-center translate-y-[-50%] top-[50%] bottom-4 right-4 rounded-full p-0 md:bottom-4 md:right-6"
          aria-label={t('chat_with_ray')}
        >
          {isOpen ? (
            <X className="size-6" />
          ) : (
            <div className="h-auto aspect-square w-20">
              <LottieAnimation
                src="https://lottie.host/0b163bae-89e4-409f-9f3f-f0f995440a69/INxhyzaLC8.json"
                loop={true}
                className="w-full h-full"
              />
            </div>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-[500px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle>{t('chat_with_ray')}</SheetTitle>
        </SheetHeader>
        <div className="py-6 h-full">
          <ChatWindow />
        </div>
      </SheetContent>
    </Sheet>
  )
}