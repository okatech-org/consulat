'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Keania_One } from 'next/font/google';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { FullProfile } from '@/types';
import { QRCode } from '@/components/ui/qr-code';

const keaniaOne = Keania_One({
  weight: '400',
  subsets: ['latin'],
});

interface ConsularCardPreviewProps {
  profile: FullProfile;
  modelVersoUrl?: string;
  modelRectoUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_URL;

export function ConsularCardPreview({
  profile,
  modelVersoUrl = 'https://qld7pfnhxe.ufs.sh/f/yMD4lMLsSKvz9KZ9t6D5KCScYI7RP80oHkOuQq4ig2UhaEZN',
  modelRectoUrl = 'https://qld7pfnhxe.ufs.sh/f/yMD4lMLsSKvz4EhQuDOvVPrj3h6w7bt98a0lc2YAfogIxOWR',
}: ConsularCardPreviewProps) {
  const t = useTranslations('profile.card');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {['VALIDATED', 'READY_FOR_PICKUP', 'APPOINTMENT_SCHEDULED', 'COMPLETED'].includes(
        profile.status,
      ) && (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            {t('preview')}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent
        side="bottom"
        className="w-full md:max-w-[600px] md:rounded-t-lg md:mx-auto h-full max-h-[400px]"
      >
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex flex-col items-center gap-6">
          {/* Carte consulaire */}
          <div className="perspective relative w-full max-w-[430px]">
            <div
              className={cn(
                'relative preserve-3d transition-transform duration-500',
                isFlipped && 'rotate-y-180',
              )}
              onClick={handleFlip}
            >
              {/* Face avant */}
              <AnimatePresence mode="wait">
                {!isFlipped && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <div
                      className={`card-recto shadow-lg border aspect-[1.60/1] relative rounded-[15px] overflow-hidden`}
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={modelRectoUrl}
                          alt="Consular card background"
                          fill
                          className="!size-full object-cover object-center"
                        />
                      </div>

                      <div className="photo-numbers p-2 absolute left-0 top-0 h-full w-[53%] flex flex-col justify-end items-center">
                        {profile.identityPicture?.fileUrl && (
                          <div className="relative overflow-hidden mb-[3%] md:mb-[8%] w-[56%] h-auto rounded-full height-auto aspect-square z-[1]">
                            <Image
                              src={profile.identityPicture?.fileUrl}
                              alt="Consular card background"
                              fill
                              className="!size-full object-cover object-center"
                            />
                          </div>
                        )}

                        {profile.cardNumber && (
                          <p
                            className={
                              `text-[0.8em] text-[#AB7E07] ` + keaniaOne.className
                            }
                          >
                            {profile.cardNumber}
                          </p>
                        )}
                        {profile.cardPin && (
                          <p className={`text-[0.8em] font-medium text-[#E94F69]`}>
                            NIP: {profile.cardPin}
                          </p>
                        )}
                      </div>

                      <div className="details absolute right-0 top-0 px-1 h-full w-[57%]  flex flex-col justify-center items-start">
                        <p className="text-lg/5 text-[#383838] font-extrabold -translate-y-[70%]">
                          <span className="uppercase">{profile.lastName}</span>
                          <br />
                          <span className="text-[0.9em]">{profile.firstName}</span>
                        </p>
                      </div>

                      <div className="absolute bottom-4 right-4 size-24">
                        <QRCode value={`${APP_URL}/view/profile/${profile.id}`} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Face arrière */}
              <AnimatePresence mode="wait">
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rotate-y-180 backface-hidden absolute inset-0"
                  >
                    <Card className="aspect-[1.60/1] shadow-lg border rounded-[15px] overflow-hidden">
                      <CardContent className="relative h-full p-4">
                        {/* Fond de la carte (Verso)*/}
                        <Image
                          src={modelVersoUrl}
                          alt="Consular card background"
                          fill
                          className="!size-full object-cover object-center"
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground">{t('click_to_flip')}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
