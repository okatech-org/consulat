'use client';

import { Card } from '@/components/ui/card';

interface UserOverviewProps {
  stats: {
    inProgress: number;
    completed: number;
    pending: number;
    appointments: number;
  };
}

export function UserOverview({ stats }: UserOverviewProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Informations utilisateur */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold text-lg">
            JD
          </div>
          <div>
            <h3 className="font-semibold text-lg">Jean Dupont</h3>
            <p className="text-sm text-muted-foreground">Carte consulaire : #GAB123456</p>
            <p className="text-sm text-muted-foreground">Passeport expire le 15/03/2026</p>
            <p className="text-sm text-muted-foreground">Inscrit depuis mars 2024</p>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-xs text-muted-foreground font-medium">EN COURS</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-muted-foreground font-medium">TERMINÉES</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-muted-foreground font-medium">EN ATTENTE</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-cyan-600">{stats.appointments}</div>
            <div className="text-xs text-muted-foreground font-medium">RDV PRÉVUS</div>
          </div>
        </div>
      </div>
    </Card>
  );
}