'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Keania_One } from 'next/font/google';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn, useDateLocale } from '@/lib/utils';
import type { CompleteProfile } from '@/convex/lib/types';
import { QRCode } from '@/components/ui/qr-code';

const keaniaOne = Keania_One({
  weight: '400',
  subsets: ['latin'],
});

interface ConsularCardPreviewProps {
  profile: CompleteProfile;
  modelVersoUrl?: string;
  modelRectoUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_URL;

export function ConsularCardPreview({
  profile,
  modelVersoUrl = 'https://greedy-horse-339.convex.cloud/api/storage/1423b4ef-2701-46ef-ac6f-10d759e61c09',
  modelRectoUrl = 'https://greedy-horse-339.convex.cloud/api/storage/91438165-c30d-4aab-91e0-0a8e5806c1ec',
}: ConsularCardPreviewProps) {
  const t = useTranslations('profile.card');
  const [isFlipped, setIsFlipped] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const handleFlip = () => setIsFlipped(!isFlipped);
  const { formatDate } = useDateLocale();
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
        className="w-full min-w-[380px] sm:max-w-[600px] bg-[#B7B7B8] sm:rounded-t-lg sm:mx-auto h-full max-h-[400px]"
      >
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
                      className={`card-recto shadow-lg aspect-[1.60/1] relative rounded-[15px] overflow-hidden`}
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={modelRectoUrl}
                          alt="Consular card background"
                          fill
                          className="!size-full object-cover object-center"
                        />
                      </div>

                      <div className="photo-numbers pb-[3%] gap-y-[4%] sm:gap-y-[5.6%] absolute left-0 top-0 h-full w-[53%] flex flex-col justify-end items-center">
                        {profile.identityPicture?.fileUrl && (
                          <div className="relative overflow-hidden w-[53%] sm:w-[52%] h-auto rounded-full height-auto aspect-square z-[1]">
                            <Image
                              src={profile.identityPicture?.fileUrl}
                              alt="Consular card background"
                              fill
                              className="!size-full object-cover object-center"
                            />
                          </div>
                        )}

                        <div className="flex flex-col text-center">
                          <p
                            className={
                              `text-[0.7em] sm:text-[0.8em] text-[#AB7E07] ` +
                              keaniaOne.className
                            }
                          >
                            {profile.consularCard?.cardNumber || '-'}
                          </p>
                          <p
                            className={`text-[0.7em] sm:text-[0.8em] font-medium text-[#E94F69]`}
                          >
                            NIP: {profile.consularCard?.cardPin || '-'}
                          </p>
                        </div>
                      </div>

                      <div className="details absolute right-0 top-0 px-1 h-full w-[56.5%]  flex flex-col justify-center items-start">
                        <p className="text-[0.8em]/4 sm:text-[1em]/5 text-[#383838] font-extrabold -translate-y-[70%]">
                          <span className="uppercase">{profile.personal?.lastName}</span>
                          <br />
                          <span className="text-[0.9em]">
                            {profile.personal?.firstName}
                          </span>
                        </p>
                      </div>

                      <div className="details absolute right-0 top-0 px-1 h-full w-[37%] pt-[3%] flex flex-col justify-center items-start">
                        <p className="text-[0.5em]/3 sm:text-[0.8em]/4 text-[#383838] font-bold -translate-x-[10%]">
                          {profile.consularCard?.cardIssuedAt
                            ? formatDate(
                                new Date(profile.consularCard.cardIssuedAt),
                                'dd/MM/yyyy',
                              )
                            : '-'}
                        </p>
                        <p className="text-[0.5em]/3 sm:text-[0.8em]/4 text-[#383838] font-bold">
                          {profile.consularCard?.cardExpiresAt
                            ? formatDate(
                                new Date(profile.consularCard.cardExpiresAt),
                                'dd/MM/yyyy',
                              )
                            : '-'}
                        </p>
                      </div>

                      <div className="absolute right-0 bottom-0 w-[21%] aspect-square h-auto -translate-x-[20%] -translate-y-[10%]">
                        <QRCode value={`${APP_URL}/view/profile/${profile._id}`} />
                      </div>

                      <div className="absolute right-[4%] w-max translate-x-[50%] text-center top-1/2 rotate-[270deg]">
                        <p className="text-[7px] sm:text-[0.5em] min-w-max text-[#383838]">
                          {profile.consularCard?.cardNumber || '-'}
                        </p>
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
                    <Card className="aspect-[1.60/1] shadow-lg rounded-[15px] overflow-hidden">
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
