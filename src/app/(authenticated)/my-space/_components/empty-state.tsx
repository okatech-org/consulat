'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/schemas/routes';

export function EmptyState() {
  return (
    <Card className="border-2 border-dashed border-border">
      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Aucune demande en cours</h3>
        <p className="text-muted-foreground mb-6">
          Vous n'avez actuellement aucune demande de service en cours de traitement.
          Démarrez votre première demande pour commencer vos démarches consulaires.
        </p>
        
        <Button asChild>
          <Link href={ROUTES.user.service_available}>
            <Plus className="mr-2 h-4 w-4" />
            Créer ma première demande
          </Link>
        </Button>
      </div>
    </Card>
  );
}