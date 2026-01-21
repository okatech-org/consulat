'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AircallConfigSchema, type AircallConfig } from '@/schemas/aircall';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';
import CardContainer from '@/components/layouts/card-container';

interface AircallSettingsProps {
  config?: AircallConfig;
  onSave: (config: AircallConfig) => Promise<void>;
  isLoading?: boolean;
}

export function AircallSettings({
  config,
  onSave,
  isLoading = false,
}: AircallSettingsProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AircallConfig>({
    resolver: zodResolver(AircallConfigSchema),
    defaultValues: config || {
      enabled: false,
      workspaceSize: 'medium',
      events: {
        onLogin: true,
        onLogout: true,
        onCallStart: true,
        onCallEnd: true,
        onCallAnswer: true,
      },
      permissions: {
        canMakeOutboundCalls: true,
        canReceiveInboundCalls: true,
        canTransferCalls: true,
        canRecordCalls: false,
      },
    },
  });

  const isEnabled = form.watch('enabled');

  const handleSubmit = async (data: AircallConfig) => {
    setIsSaving(true);
    try {
      await onSave(data);
      toast.success('La configuration Aircall a été mise à jour avec succès.');
    } catch {
      toast.error('Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <CardContainer
          title="Configuration Aircall"
          subtitle="Configurez l'intégration Aircall pour permettre les appels depuis l'interface de review"
        >
          <div className="space-y-6">
            {/* Activation */}
            <Field name="enabled" className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FieldLabel className="text-base">Activer Aircall</FieldLabel>
                <FieldDescription>
                  Permettre aux agents de passer des appels depuis l&apos;interface de
                  review des demandes
                </FieldDescription>
              </div>
              <Switch checked={form.watch('enabled')} onCheckedChange={(checked) => form.setValue('enabled', checked)} />
              <FieldError />
            </Field>

            {isEnabled && (
              <>
                <Separator />

                {/* Configuration API */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className="size-4" />
                    <h3 className="text-lg font-medium">Configuration API</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field name="apiKey">
                      <FieldLabel>Clé API</FieldLabel>
                      <Input
                        type="password"
                        placeholder="Votre clé API Aircall"
                        {...form.register('apiKey')}
                        value={form.watch('apiKey') || ''}
                      />
                      <FieldDescription>
                        Clé API obtenue depuis votre dashboard Aircall
                      </FieldDescription>
                      <FieldError />
                    </Field>

                    <Field name="apiId">
                      <FieldLabel>ID API</FieldLabel>
                      <Input
                        placeholder="Votre ID API Aircall"
                        {...form.register('apiId')}
                        value={form.watch('apiId') || ''}
                      />
                      <FieldDescription>
                        ID API obtenu depuis votre dashboard Aircall
                      </FieldDescription>
                      <FieldError />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field name="integrationName">
                      <FieldLabel>Nom de l&apos;intégration</FieldLabel>
                      <Input
                        placeholder="Consulat.ga"
                        {...form.register('integrationName')}
                        value={form.watch('integrationName') || ''}
                      />
                      <FieldDescription>
                        Nom affiché dans l&apos;interface Aircall
                      </FieldDescription>
                      <FieldError />
                    </Field>

                    <Field name="workspaceSize">
                      <FieldLabel>Taille du workspace</FieldLabel>
                      <Select
                        onValueChange={(value) => form.setValue('workspaceSize', value as 'small' | 'medium' | 'big')}
                        defaultValue={form.watch('workspaceSize')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une taille" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Petit</SelectItem>
                          <SelectItem value="medium">Moyen</SelectItem>
                          <SelectItem value="big">Grand</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldDescription>
                        Taille de l&apos;interface Aircall intégrée
                      </FieldDescription>
                      <FieldError />
                    </Field>
                  </div>
                </div>

                <Separator />

                {/* Permissions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4" />
                    <h3 className="text-lg font-medium">Permissions</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field name="permissions.canMakeOutboundCalls" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Appels sortants</FieldLabel>
                        <FieldDescription className="text-xs">
                          Permettre aux agents de passer des appels
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('permissions.canMakeOutboundCalls')}
                        onCheckedChange={(checked) => form.setValue('permissions.canMakeOutboundCalls', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="permissions.canReceiveInboundCalls" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Appels entrants</FieldLabel>
                        <FieldDescription className="text-xs">
                          Permettre aux agents de recevoir des appels
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('permissions.canReceiveInboundCalls')}
                        onCheckedChange={(checked) => form.setValue('permissions.canReceiveInboundCalls', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="permissions.canTransferCalls" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">
                          Transfert d&apos;appels
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          Permettre le transfert d&apos;appels entre agents
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('permissions.canTransferCalls')}
                        onCheckedChange={(checked) => form.setValue('permissions.canTransferCalls', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="permissions.canRecordCalls" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Enregistrement</FieldLabel>
                        <FieldDescription className="text-xs">
                          Permettre l&apos;enregistrement des appels
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('permissions.canRecordCalls')}
                        onCheckedChange={(checked) => form.setValue('permissions.canRecordCalls', checked)}
                      />
                      <FieldError />
                    </Field>
                  </div>
                </div>

                <Separator />

                {/* Événements */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4" />
                    <h3 className="text-lg font-medium">Événements</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field name="events.onLogin" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Connexion</FieldLabel>
                        <FieldDescription className="text-xs">
                          Écouter les événements de connexion
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('events.onLogin')}
                        onCheckedChange={(checked) => form.setValue('events.onLogin', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="events.onLogout" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Déconnexion</FieldLabel>
                        <FieldDescription className="text-xs">
                          Écouter les événements de déconnexion
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('events.onLogout')}
                        onCheckedChange={(checked) => form.setValue('events.onLogout', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="events.onCallStart" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Début d&apos;appel</FieldLabel>
                        <FieldDescription className="text-xs">
                          Écouter les événements de début d&apos;appel
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('events.onCallStart')}
                        onCheckedChange={(checked) => form.setValue('events.onCallStart', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="events.onCallEnd" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">Fin d&apos;appel</FieldLabel>
                        <FieldDescription className="text-xs">
                          Écouter les événements de fin d&apos;appel
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('events.onCallEnd')}
                        onCheckedChange={(checked) => form.setValue('events.onCallEnd', checked)}
                      />
                      <FieldError />
                    </Field>

                    <Field name="events.onCallAnswer" className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FieldLabel className="text-sm">
                          Réponse d&apos;appel
                        </FieldLabel>
                        <FieldDescription className="text-xs">
                          Écouter les événements de réponse d&apos;appel
                        </FieldDescription>
                      </div>
                      <Switch
                        checked={form.watch('events.onCallAnswer')}
                        onCheckedChange={(checked) => form.setValue('events.onCallAnswer', checked)}
                      />
                      <FieldError />
                    </Field>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContainer>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="min-w-[120px]"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
