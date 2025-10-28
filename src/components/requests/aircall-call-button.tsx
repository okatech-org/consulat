'use client';

import { useState } from 'react';
import { Phone, PhoneCall, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAircall } from '@/hooks/use-aircall';
import type { AircallConfig } from '@/schemas/aircall';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface AircallCallButtonProps {
  phoneNumber: string;
  userDisplayName?: string;
  requestId: string;
  config: AircallConfig;
  disabled?: boolean;
}

export function AircallCallButton({
  phoneNumber,
  userDisplayName,
  requestId,
  config,
  disabled = false,
}: AircallCallButtonProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<
    'idle' | 'calling' | 'connected' | 'ended'
  >('idle');

  const aircall = useAircall({
    config,
    domElementId: `aircall-workspace-${requestId}`,
    onLogin: () => {
      toast({
        title: 'Aircall connecté',
        description: 'Vous pouvez maintenant passer des appels.',
      });
    },
    onLogout: () => {
      setCallStatus('idle');
    },
    onCallStart: () => {
      setCallStatus('calling');
      toast({
        title: 'Appel en cours',
        description: `Appel vers ${phoneNumber}`,
      });
    },
    onCallEnd: () => {
      setCallStatus('ended');
      toast({
        title: 'Appel terminé',
        description: "L'appel a été terminé.",
      });
      // Fermer le dialog après un délai
      setTimeout(() => {
        setIsDialogOpen(false);
        setCallStatus('idle');
      }, 2000);
    },
    onCallAnswer: () => {
      setCallStatus('connected');
      toast({
        title: 'Appel connecté',
        description: "L'appel a été accepté.",
      });
    },
    onError: (error) => {
      console.error('Erreur Aircall:', error);
      toast({
        title: 'Erreur Aircall',
        description: "Une erreur est survenue lors de l'appel.",
        variant: 'destructive',
      });
    },
  });

  const handleCall = () => {
    if (!aircall.isConnected) {
      toast({
        title: 'Aircall non connecté',
        description: 'Veuillez vous connecter à Aircall pour passer des appels.',
        variant: 'destructive',
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: 'Numéro manquant',
        description: 'Aucun numéro de téléphone disponible pour cette demande.',
        variant: 'destructive',
      });
      return;
    }

    const success = aircall.makeCall(phoneNumber);
    if (success) {
      setIsDialogOpen(true);
    }
  };

  const handleHangup = () => {
    aircall.hangupCall();
  };

  const isCallActive = callStatus === 'calling' || callStatus === 'connected';

  // Si Aircall n'est pas activé, ne pas afficher le bouton
  if (!config.enabled) {
    return null;
  }

  // Si pas de numéro de téléphone, afficher le bouton désactivé
  if (!phoneNumber) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Phone className="size-4 mr-2" />
        Appeler
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCall}
        disabled={disabled || !aircall.isConnected || isCallActive}
      >
        <Phone className="size-4 mr-2" />
        Appeler avec Aircall
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="size-5" />
              Appel en cours
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="text-lg font-semibold">
                {userDisplayName || 'Utilisateur'}
              </div>
              <div className="text-sm text-muted-foreground">{phoneNumber}</div>
              <Badge
                variant={
                  callStatus === 'calling'
                    ? 'default'
                    : callStatus === 'connected'
                      ? 'default'
                      : callStatus === 'ended'
                        ? 'secondary'
                        : 'outline'
                }
              >
                {callStatus === 'calling' && 'Appel en cours...'}
                {callStatus === 'connected' && 'Connecté'}
                {callStatus === 'ended' && 'Appel terminé'}
                {callStatus === 'idle' && 'En attente'}
              </Badge>
            </div>

            {/* Container pour l'interface Aircall */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div
                id={`aircall-workspace-${requestId}`}
                className="min-h-[400px] w-full"
              />
            </div>

            {/* Contrôles d'appel */}
            <div className="flex justify-center gap-2">
              {isCallActive && (
                <Button variant="destructive" size="sm" onClick={handleHangup}>
                  <PhoneOff className="size-4 mr-2" />
                  Raccrocher
                </Button>
              )}
            </div>

            {/* Statut de connexion Aircall */}
            <div className="text-xs text-center text-muted-foreground">
              {aircall.isConnected ? (
                <span className="text-green-600">✓ Aircall connecté</span>
              ) : (
                <span className="text-red-600">✗ Aircall déconnecté</span>
              )}
              {aircall.error && (
                <div className="text-red-600 mt-1">Erreur: {aircall.error}</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
