'use client';

import * as React from 'react';
import { Organization } from '@/types/organization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from 'next-intl';
import { useTabs } from '@/hooks/use-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TradFormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

// Schéma de validation pour la génération des créneaux
const timeSlotGenerationSchema = z.object({
  monthsInAdvance: z.coerce.number().min(1).max(12),
});

type TimeSlotGenerationForm = z.infer<typeof timeSlotGenerationSchema>;

interface TimeSlotsSettingsProps {
  organization: Organization;
}

export function TimeSlotsSettings({ organization }: TimeSlotsSettingsProps) {
  const t = useTranslations('organization.settings');
  const t_slots = useTranslations('organization.settings.general.slots.generation');
  const { handleTabChange, searchParams } = useTabs();
  const [isLoading, setIsLoading] = React.useState(false);

  const tab = searchParams.get('country') || organization.countries[0]?.code;

  const form = useForm<TimeSlotGenerationForm>({
    resolver: zodResolver(timeSlotGenerationSchema),
    defaultValues: {
      monthsInAdvance: 3, // Par défaut, générer pour 3 mois
    },
  });

  const onSubmit = async (data: TimeSlotGenerationForm) => {
    setIsLoading(true);
    try {
      // TODO: Appeler l'action server pour générer les créneaux
      console.log('Generating slots for', tab, 'with data:', data);
    } catch (error) {
      console.error('Error generating slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={tab} onValueChange={(value) => handleTabChange(value, 'country')}>
        <TabsList>
          {organization.countries.map((country) => (
            <TabsTrigger key={country.code} value={country.code}>
              {country.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {organization.countries.map((country) => (
          <TabsContent key={country.code} value={country.code}>
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t_slots('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="monthsInAdvance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t_slots('months_in_advance')}</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={12} {...field} />
                            </FormControl>
                            <TradFormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? t_slots('generating') : t_slots('generate')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* TODO: Ajouter un tableau pour afficher les créneaux existants */}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
