'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppointmentType } from '@prisma/client';

interface NewAppointmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewAppointmentDialog({ isOpen, onClose }: NewAppointmentDialogProps) {
  const t = useTranslations('user.dashboard.appointments');
  const [step, setStep] = useState<'service' | 'date' | 'confirm'>('service');
  const [selectedService, setSelectedService] = useState<AppointmentType | null>(null);

  const services = [
    {
      type: AppointmentType.DOCUMENT_SUBMISSION,
      title: t('services.document_submission'),
      description: t('services.document_submission_description'),
      duration: 30,
    },
    {
      type: AppointmentType.DOCUMENT_COLLECTION,
      title: t('services.document_collection'),
      description: t('services.document_collection_description'),
      duration: 15,
    },
    {
      type: AppointmentType.FIRST_REGISTRATION,
      title: t('services.first_registration'),
      description: t('services.first_registration_description'),
      duration: 45,
    },
    // ... autres services
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('new_appointment_dialog.title')}</DialogTitle>
        </DialogHeader>

        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="service" disabled={step !== 'service'}>
              {t('new_appointment_dialog.steps.service')}
            </TabsTrigger>
            <TabsTrigger value="date" disabled={step !== 'date'}>
              {t('new_appointment_dialog.steps.date')}
            </TabsTrigger>
            <TabsTrigger value="confirm" disabled={step !== 'confirm'}>
              {t('new_appointment_dialog.steps.confirm')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="service">
            <div className="grid gap-4">
              {services.map((service) => (
                <Card
                  key={service.type}
                  className={`cursor-pointer transition-colors hover:bg-accent ${
                    selectedService === service.type ? 'border-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedService(service.type);
                    setStep('date');
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="mt-2 text-sm">
                      {t('new_appointment_dialog.duration', {
                        duration: service.duration,
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="date">
            {/* TODO: Ajouter le sélecteur de date/heure */}
          </TabsContent>

          <TabsContent value="confirm">{/* TODO: Ajouter la confirmation */}</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
