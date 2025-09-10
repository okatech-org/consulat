'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Eye,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  Euro,
  Calendar,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Phone,
  Mail,
  Building2
} from 'lucide-react';
import type { Projet } from '@/data/dgss-projets';

interface ProjetCardProps {
  projet: Projet;
}

export default function ProjetCardEnhanced({ projet }: ProjetCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'planifie': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'complete': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'critique': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'suspendu': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'text-red-400';
      case 'haute': return 'text-orange-400';
      case 'moyenne': return 'text-yellow-400';
      case 'basse': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatBudget = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M€`;
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K€`;
    }
    return `${montant.toLocaleString()}€`;
  };

  const handleContactResponsable = () => {
    window.location.href = `mailto:${projet.responsable.email}?subject=Projet ${projet.code} - Contact`;
    toast.info(`Contact ${projet.responsable.nom}...`);
  };

  const handleCallResponsable = () => {
    navigator.clipboard.writeText(projet.responsable.telephone);
    toast.success(`Téléphone ${projet.responsable.nom} copié : ${projet.responsable.telephone}`);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{projet.nom}</CardTitle>
            <p className="text-sm text-muted-foreground font-mono">{projet.code}</p>
            <Badge variant="outline" className={getStatutColor(projet.statut)}>
              {projet.statut.toUpperCase()}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Réduire' : 'Étendre'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {projet.description}
        </p>

        {/* Informations principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Priorité</p>
            <p className={`text-sm font-medium ${getPrioriteColor(projet.priorite)}`}>
              {projet.priorite.toUpperCase()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-sm font-medium">{formatBudget(projet.budget)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Échéance</p>
            <p className="text-sm font-medium">
              {projet.dateEcheance.toLocaleDateString('fr-FR', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Zone</p>
            <p className="text-sm font-medium">{projet.zone}</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-muted-foreground">{projet.progression}%</span>
          </div>
          <Progress value={projet.progression} className="h-2" />
        </div>

        {/* Responsable principal */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs bg-primary/10">
                  {projet.responsable.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{projet.responsable.nom}</p>
                <p className="text-xs text-muted-foreground">{projet.responsable.organisation}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleContactResponsable}
              >
                <Mail className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCallResponsable}
              >
                <Phone className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Informations étendues */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            {/* KPIs rapides */}
            <div className="grid grid-cols-3 gap-4 p-3 bg-muted/20 rounded-lg">
              {projet.kpis.slice(0, 3).map((kpi, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs text-muted-foreground">{kpi.nom}</p>
                  <p className="text-sm font-bold">{kpi.valeur}</p>
                  <div className="flex justify-center mt-1">
                    {kpi.evolution === 'positive' && (
                      <TrendingUp className="h-3 w-3 text-green-400" />
                    )}
                    {kpi.evolution === 'negative' && (
                      <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />
                    )}
                    {kpi.evolution === 'stable' && (
                      <div className="w-3 h-0.5 bg-yellow-400 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Équipe */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Équipe projet</p>
              <div className="flex -space-x-2">
                {projet.equipe.slice(0, 5).map((membre, index) => (
                  <Avatar 
                    key={index} 
                    className="w-8 h-8 border-2 border-background cursor-pointer hover:z-10 transition-all"
                    onClick={() => toast.info(`${membre.nom} - ${membre.role}`)}
                  >
                    <AvatarFallback className="text-xs bg-primary/10">
                      {membre.initiales}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {projet.equipe.length > 5 && (
                  <Avatar className="w-8 h-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-muted">
                      +{projet.equipe.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            {/* Prochaines étapes */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Prochaines étapes</p>
              <div className="space-y-1">
                {projet.prochaines_etapes.slice(0, 2).map((etape) => (
                  <div key={etape.id} className="text-xs text-muted-foreground">
                    • {etape.titre} ({new Date(etape.echeance).toLocaleDateString('fr-FR')})
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risques */}
        {projet.risques.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">
                {projet.risques.length} risque(s) identifié(s)
              </span>
            </div>
            <Badge variant="destructive" className="text-xs">
              Surveillance requise
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => router.push(`/dashboard/projets/${projet.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Détails
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => toast.info(`Génération rapport ${projet.code}...`)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Rapport
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => toast.info(`Discussion projet ${projet.nom}...`)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussion
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => toast.info(`Paramètres ${projet.code}...`)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
