'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceErrorCardProps {
  backText: string;
}

export function ServiceErrorCard({ backText }: ServiceErrorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-red-500">
          Erreur lors du chargement des détails du service
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          Nous n&apos;avons pas pu charger les détails du service. Veuillez réessayer plus
          tard.
        </p>
        <p className="text-sm text-muted-foreground mt-2">{backText}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()}>Réessayer</Button>
      </CardFooter>
    </Card>
  );
}
