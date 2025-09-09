'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Building2,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  Euro,
  Mail,
  Phone,
  MapPin,
  Clock,
  FileText,
  BarChart3,
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  MessageSquare,
  Settings
} from 'lucide-react';
import { projets as dgssProjects, statsGlobales, responsablesPrincipaux } from '@/data/dgss-projets';
import ProjetCardEnhanced from '@/components/projets/projet-card-enhanced';

// Types pour les projets
interface Projet {
  id: string;
  nom: string;
  code: string;
  description: string;
  statut: 'actif' | 'planifie' | 'complete' | 'critique' | 'suspendu';
  priorite: 'haute' | 'moyenne' | 'basse' | 'critique';
  progression: number;
  budget: number;
  budgetUtilise: number;
  dateDebut: Date;
  dateEcheance: Date;
  responsable: string;
  equipe: string[];
  zone: string;
  beneficiaires?: number;
  phase: string;
  risques: number;
  kpis: {
    nom: string;
    valeur: string;
    evolution: 'positive' | 'negative' | 'stable';
  }[];
}

// Utilisation des données réelles DGSS
const projets = dgssProjects;
const stats = statsGlobales;

export default function ProjetsPage() {
  const router = useRouter();
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtrePriorite, setFiltrePriorite] = useState<string>('tous');
  const [recherche, setRecherche] = useState('');

  // Filtrage des projets
  const projetsFiltres = useMemo(() => {
    return projets.filter(projet => {
      const matchRecherche = recherche === '' || 
        projet.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        projet.code.toLowerCase().includes(recherche.toLowerCase()) ||
        projet.responsable.toLowerCase().includes(recherche.toLowerCase());
      
      const matchStatut = filtreStatut === 'tous' || projet.statut === filtreStatut;
      const matchPriorite = filtrePriorite === 'tous' || projet.priorite === filtrePriorite;
      
      return matchRecherche && matchStatut && matchPriorite;
    });
  }, [recherche, filtreStatut, filtrePriorite]);

  // Fonction pour obtenir la couleur du statut
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

  // Fonction pour obtenir la couleur de la priorité
  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'text-red-400';
      case 'haute': return 'text-orange-400';
      case 'moyenne': return 'text-yellow-400';
      case 'basse': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Fonction pour formater le budget
  const formatBudget = (montant: number) => {
    if (montant >= 1000000) {
      return `${(montant / 1000000).toFixed(1)}M€`;
    } else if (montant >= 1000) {
      return `${(montant / 1000).toFixed(0)}K€`;
    }
    return `${montant}€`;
  };

  return (
    <IntelAgentLayout
      title="Gestion des Projets Stratégiques"
      description="Surveillance et coordination des initiatives Digital Gouv"
      currentPage="projets"
    >
      <div className="space-y-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projets Actifs</p>
                  <p className="text-2xl font-bold">{stats.projetsActifs}</p>
                  <p className="text-xs text-green-400 mt-1">+{stats.totalProjets - stats.projetsActifs} planifiés</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progression Moyenne</p>
                  <p className="text-2xl font-bold">{stats.progressionMoyenne}%</p>
                  <p className="text-xs text-green-400 mt-1">En cours</p>
                </div>
                <Target className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Projets Critiques</p>
                  <p className="text-2xl font-bold text-red-400">{stats.projetsCritiques}</p>
                  <p className="text-xs text-red-400 mt-1">Attention requise</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Total</p>
                  <p className="text-2xl font-bold">{formatBudget(stats.budgetTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((stats.budgetUtilise / stats.budgetTotal) * 100)}% utilisé
                  </p>
                </div>
                <Euro className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre d'actions et filtres */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtres et Actions</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Projet
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recherche</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, code, responsable..."
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="actif">En cours</SelectItem>
                    <SelectItem value="planifie">Planifiés</SelectItem>
                    <SelectItem value="critique">Critiques</SelectItem>
                    <SelectItem value="complete">Complétés</SelectItem>
                    <SelectItem value="suspendu">Suspendus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priorité</label>
                <Select value={filtrePriorite} onValueChange={setFiltrePriorite}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les priorités" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Toutes les priorités</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="basse">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Affichage</label>
                <div className="text-sm text-muted-foreground">
                  {projetsFiltres.length} projet(s) affiché(s)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grille des projets avec cartes améliorées */}
        <div className="grid gap-6">
          {projetsFiltres.map((projet) => (
            <ProjetCardEnhanced key={projet.id} projet={projet} />
          ))}
        </div>

        {/* Informations responsables principaux */}
        <Card>
          <CardHeader>
            <CardTitle>Responsables Principaux Digital Gouv</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Consul Général */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      JM
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{responsablesPrincipaux.consulGeneral.nom}</p>
                    <p className="text-sm text-muted-foreground">{responsablesPrincipaux.consulGeneral.poste}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${responsablesPrincipaux.consulGeneral.email}`;
                        toast.info('Ouverture du client email...');
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {responsablesPrincipaux.consulGeneral.email}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(responsablesPrincipaux.consulGeneral.telephone);
                        toast.success('Téléphone copié dans le presse-papiers');
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {responsablesPrincipaux.consulGeneral.telephone}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{responsablesPrincipaux.consulGeneral.adresse}</span>
                  </div>
                </div>
                <Badge variant="outline">
                  {responsablesPrincipaux.consulGeneral.projets.length} projets
                </Badge>
              </div>

              {/* OKA Tech */}
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      GA
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{responsablesPrincipaux.okaTech.nom}</p>
                    <p className="text-sm text-muted-foreground">{responsablesPrincipaux.okaTech.poste}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${responsablesPrincipaux.okaTech.email}`;
                        toast.info('Ouverture du client email...');
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {responsablesPrincipaux.okaTech.email}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(responsablesPrincipaux.okaTech.telephone);
                        toast.success('Téléphone copié dans le presse-papiers');
                      }}
                      className="hover:text-primary transition-colors"
                    >
                      {responsablesPrincipaux.okaTech.telephone}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{responsablesPrincipaux.okaTech.organisation}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {responsablesPrincipaux.okaTech.specialite}
                </p>
                <Badge variant="outline">
                  {responsablesPrincipaux.okaTech.projets.length} projets
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline des activités récentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Chronologie des Activités</CardTitle>
              <Button variant="outline" size="sm">
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Activités récentes de tous les projets */}
              {dgssProjects
                .flatMap(p => p.activites.map(a => ({ ...a, projet: p.nom, code: p.code })))
                .sort((a, b) => {
                  // Tri par importance puis par date (simulation)
                  if (a.importance === 'haute' && b.importance !== 'haute') return -1;
                  if (a.importance !== 'haute' && b.importance === 'haute') return 1;
                  return 0;
                })
                .slice(0, 6)
                .map((activite, index) => (
                  <div key={index} className="flex gap-4 hover:bg-muted/30 p-2 rounded-lg transition-colors cursor-pointer">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        activite.importance === 'haute' ? 'bg-red-500' :
                        activite.importance === 'moyenne' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      {index < 5 && (
                        <div className="w-0.5 h-8 bg-border" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{activite.projet}</p>
                        <p className="text-xs text-muted-foreground">{activite.date}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activite.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Par : {activite.auteur}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </IntelAgentLayout>
  );
}
