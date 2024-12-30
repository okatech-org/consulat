'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { FullProfile } from '@/types'
import { QRCode } from '@/components/ui/qr-code'

interface ConsularCardPreviewProps {
  profile: FullProfile
}

const APP_URL = process.env.NEXT_PUBLIC_URL

export function ConsularCardPreview({ profile }: ConsularCardPreviewProps) {
  const t = useTranslations('profile.card')
  const [isFlipped, setIsFlipped] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleFlip = () => setIsFlipped(!isFlipped)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {t('preview')}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>

        <div className="mt-8 flex flex-col items-center gap-6">
          {/* Carte consulaire */}
          <div className="relative w-full max-w-md perspective">
            <div
              className={cn(
                "relative preserve-3d transition-transform duration-500",
                isFlipped && "rotate-y-180"
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
                    <Card className="aspect-[1.58/1] overflow-hidden">
                      <CardContent className="relative h-full p-4">
                        {/* Fond de la carte */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />

                        {/* Photo d'identité */}
                        {profile.identityPicture && (
                          <div className="absolute left-4 top-4 h-auto w-24 aspect-square overflow-hidden rounded-lg border">
                            <Image
                              src={profile.identityPicture}
                              alt={t('photo_alt')}
                              fill
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}

                        {/* Informations principales */}
                        <div className="absolute left-32 top-4 space-y-2">
                          <h3 className="text-lg font-semibold">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          <div className="text-sm">
                            <p>{t('birth')}: {format(new Date(profile.birthDate), 'PPP', { locale: fr })}</p>
                            <p>{t('nationality')}: {profile.nationality}</p>
                            <p>{t('passport')}: {profile.passportNumber}</p>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="absolute bottom-4 right-4 h-24 w-24">
                          <QRCode value={`${APP_URL}/view/profile/${profile.id}`}/>
                        </div>
                      </CardContent>
                    </Card>
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
                    className="absolute inset-0 rotate-y-180 backface-hidden"
                  >
                    <Card className="aspect-[1.58/1] overflow-hidden">
                      <CardContent className="relative h-full p-4">
                        {/* Fond de la carte */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />

                        {/* Informations complémentaires */}
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <h4 className="font-medium">{t('address')}</h4>
                            <p className="text-sm">
                              {profile.address?.firstLine}
                              {profile.address?.secondLine && <>, {profile.address.secondLine}</>}
                              <br />
                              {profile.address?.zipCode} {profile.address?.city}
                              <br />
                              {profile.address?.country}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-medium">{t('contact')}</h4>
                            <p className="text-sm">
                              {profile.phone && <>{t('phone')}: {`${profile.phone.countryCode}${profile.phone.number}`}<br /></>}
                              {profile.email && <>{t('email')}: {profile.email}</>}
                            </p>
                          </div>
                        </div>

                        {/* Informations légales */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-xs text-muted-foreground">
                            {t('legal_notice')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground">
            {t('click_to_flip')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}