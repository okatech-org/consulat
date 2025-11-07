'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AircallConfigSchema, type AircallConfig } from '@/schemas/aircall';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Activer Aircall</FormLabel>
                    <FormDescription>
                      Permettre aux agents de passer des appels depuis l&apos;interface de
                      review des demandes
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

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
                    <FormField
                      control={form.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clé API</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Votre clé API Aircall"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Clé API obtenue depuis votre dashboard Aircall
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID API</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre ID API Aircall" {...field} />
                          </FormControl>
                          <FormDescription>
                            ID API obtenu depuis votre dashboard Aircall
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="integrationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom de l&apos;intégration</FormLabel>
                          <FormControl>
                            <Input placeholder="Consulat.ga" {...field} />
                          </FormControl>
                          <FormDescription>
                            Nom affiché dans l&apos;interface Aircall
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workspaceSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taille du workspace</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une taille" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="small">Petit</SelectItem>
                              <SelectItem value="medium">Moyen</SelectItem>
                              <SelectItem value="big">Grand</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Taille de l&apos;interface Aircall intégrée
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                    <FormField
                      control={form.control}
                      name="permissions.canMakeOutboundCalls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Appels sortants</FormLabel>
                            <FormDescription className="text-xs">
                              Permettre aux agents de passer des appels
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.canReceiveInboundCalls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Appels entrants</FormLabel>
                            <FormDescription className="text-xs">
                              Permettre aux agents de recevoir des appels
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.canTransferCalls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">
                              Transfert d&apos;appels
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Permettre le transfert d&apos;appels entre agents
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="permissions.canRecordCalls"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Enregistrement</FormLabel>
                            <FormDescription className="text-xs">
                              Permettre l&apos;enregistrement des appels
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
                    <FormField
                      control={form.control}
                      name="events.onLogin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Connexion</FormLabel>
                            <FormDescription className="text-xs">
                              Écouter les événements de connexion
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="events.onLogout"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Déconnexion</FormLabel>
                            <FormDescription className="text-xs">
                              Écouter les événements de déconnexion
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="events.onCallStart"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Début d&apos;appel</FormLabel>
                            <FormDescription className="text-xs">
                              Écouter les événements de début d&apos;appel
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="events.onCallEnd"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Fin d&apos;appel</FormLabel>
                            <FormDescription className="text-xs">
                              Écouter les événements de fin d&apos;appel
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="events.onCallAnswer"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">
                              Réponse d&apos;appel
                            </FormLabel>
                            <FormDescription className="text-xs">
                              Écouter les événements de réponse d&apos;appel
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
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
