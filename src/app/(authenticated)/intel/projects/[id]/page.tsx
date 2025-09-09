'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import IntelAgentLayout from '@/components/layouts/intel-agent-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { projets as dgssProjects } from '@/data/dgss-projets';
import { 
  Calendar,
  Euro,
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  Settings,
  Clock,
  MapPin,
  Activity,
  CheckCircle2,
  Circle,
  XCircle,
  Download,
  Upload,
  BarChart3,
  PieChart,
  Briefcase,
  Shield,
  Globe,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Eye
} from 'lucide-react';

// Types pour les états
interface LoadingState {
  export: boolean;
  document: boolean;
  update: boolean;
  delete: boolean;
}

interface ErrorState {
  message: string | null;
  type: 'error' | 'warning' | 'info' | null;
}

// Récupération des données réelles depuis le fichier de données
const getProjetDetails = (id: string) => {
  return dgssProjects.find(projet => projet.id === id) || null;
};

// Données de fallback pour les projets non trouvés
const getProjetDetailsFallback = (id: string) => {
  const projets = {
    'dgss-001': {
      id: 'dgss-001',
      nom: 'Digital Gouv - Modernisation Consulaire',
      code: 'DGSS-2025-001',
      description: 'Programme de digitalisation complète des services consulaires pour la diaspora gabonaise en France. Déploiement de l\'application mobile, consulats mobiles et cartes NFC pour 35,000 citoyens.',
      statut: 'actif',
      priorite: 'haute',
      progression: 35,
      budget: 336900,
      budgetUtilise: 118415,
      budgetReste: 218485,
      dateDebut: new Date('2025-09-01'),
      dateEcheance: new Date('2025-12-31'),
      responsable: {
        nom: 'Jean-Marie NKOGHE',
        poste: 'Directeur de Projet',
        email: 'jm.nkoghe@consulat.ga',
        telephone: '+33 1 42 99 56 60'
      },
      equipe: [
        { initiales: 'JM', nom: 'Jean-Marie NKOGHE', role: 'Chef de Projet', email: 'jm.nkoghe@consulat.ga' },
        { initiales: 'AN', nom: 'Alice NDONG', role: 'Tech Lead', email: 'a.ndong@consulat.ga' },
        { initiales: 'PO', nom: 'Paul OBIANG', role: 'Business Analyst', email: 'p.obiang@consulat.ga' },
        { initiales: 'ML', nom: 'Marie LEBLANC', role: 'UX Designer', email: 'm.leblanc@consulat.ga' },
        { initiales: 'SK', nom: 'Samuel KOUMBA', role: 'DevOps Engineer', email: 's.koumba@consulat.ga' }
      ],
      zone: 'France',
      beneficiaires: 35000,
      phase: 'Déploiement',
      risques: [
        {
          id: 1,
          titre: 'Résistance au changement',
          description: 'Certains citoyens pourraient être réticents à adopter les nouveaux outils digitaux',
          niveau: 'moyen',
          probabilite: 40,
          impact: 'élevé',
          mitigation: 'Campagne de communication et formation utilisateurs',
          responsable: 'Marie LEBLANC',
          statut: 'actif'
        },
        {
          id: 2,
          titre: 'Retard fournisseur cartes NFC',
          description: 'Délai de livraison des cartes NFC pourrait impacter le planning',
          niveau: 'faible',
          probabilite: 25,
          impact: 'moyen',
          mitigation: 'Fournisseur alternatif identifié et contractualisé',
          responsable: 'Alice NDONG',
          statut: 'surveille'
        }
      ],
      objectifs: [
        { id: 1, titre: 'Digitaliser 100% des services consulaires', statut: 'en_cours', progression: 45 },
        { id: 2, titre: 'Atteindre 40% d\'inscription de la diaspora', statut: 'en_cours', progression: 15 },
        { id: 3, titre: 'Déployer 3 consulats mobiles', statut: 'planifie', progression: 10 },
        { id: 4, titre: 'Produire 10,000 cartes NFC', statut: 'en_cours', progression: 30 }
      ],
      livrables: [
        { 
          id: 1,
          nom: 'Application Mobile v1.0', 
          statut: 'complete', 
          echeance: '2025-10-01',
          description: 'Interface utilisateur complète avec authentification et services de base',
          responsable: 'Alice NDONG'
        },
        { 
          id: 2,
          nom: 'Infrastructure Cloud Sécurisée', 
          statut: 'complete', 
          echeance: '2025-09-30',
          description: 'Déploiement AWS avec chiffrement et redondance',
          responsable: 'Samuel KOUMBA'
        },
        { 
          id: 3,
          nom: 'Consulats Mobiles - Phase 1', 
          statut: 'en_cours', 
          echeance: '2025-11-15',
          description: '3 véhicules équipés pour missions terrain',
          responsable: 'Paul OBIANG'
        },
        { 
          id: 4,
          nom: 'Cartes NFC Première Vague', 
          statut: 'en_cours', 
          echeance: '2025-12-01',
          description: '10,000 cartes avec puces sécurisées',
          responsable: 'Alice NDONG'
        },
        { 
          id: 5,
          nom: 'Formation Agents Consulaires', 
          statut: 'planifie', 
          echeance: '2025-12-15',
          description: 'Certification de 25 agents aux nouveaux outils',
          responsable: 'Marie LEBLANC'
        },
        { 
          id: 6,
          nom: 'Campagne Communication', 
          statut: 'planifie', 
          echeance: '2025-11-30',
          description: 'Sensibilisation diaspora aux nouveaux services',
          responsable: 'Marie LEBLANC'
        }
      ],
      kpis: [
        { nom: 'Inscriptions réalisées', valeur: '5,250', objectif: '14,000', unite: 'citoyens', evolution: 'positive' },
        { nom: 'Satisfaction utilisateurs', valeur: '78%', objectif: '85%', unite: '%', evolution: 'positive' },
        { nom: 'Temps traitement moyen', valeur: '45min', objectif: '30min', unite: 'minutes', evolution: 'stable' },
        { nom: 'Disponibilité système', valeur: '99.2%', objectif: '99.9%', unite: '%', evolution: 'positive' },
        { nom: 'Incidents sécurité', valeur: '0', objectif: '0', unite: 'incidents', evolution: 'stable' },
        { nom: 'ROI estimé', valeur: '280%', objectif: '300%', unite: '%', evolution: 'positive' }
      ],
      budget_details: {
        categories: [
          { nom: 'Consulats Mobiles', alloue: 75000, utilise: 35000, pourcentage: 22.3 },
          { nom: 'Application Digitale', alloue: 72000, utilise: 28000, pourcentage: 21.4 },
          { nom: 'Cartes NFC', alloue: 149900, utilise: 45000, pourcentage: 44.5 },
          { nom: 'Événements', alloue: 40000, utilise: 10415, pourcentage: 11.8 }
        ]
      },
      activites: [
        { 
          date: 'Il y a 2 heures', 
          action: 'Validation budget Q4 2025 - 336,900€ approuvés', 
          auteur: 'Ministère des Finances',
          type: 'budget',
          importance: 'haute'
        },
        { 
          date: 'Il y a 6 heures', 
          action: 'Livraison première commande cartes NFC (1,000 unités)', 
          auteur: 'Gemalto France',
          type: 'livraison',
          importance: 'moyenne'
        },
        { 
          date: 'Il y a 1 jour', 
          action: 'Tests de charge application mobile - 500 utilisateurs simultanés', 
          auteur: 'Équipe Technique',
          type: 'test',
          importance: 'moyenne'
        },
        { 
          date: 'Il y a 2 jours', 
          action: 'Formation équipe consulat mobile Paris - 5 agents certifiés', 
          auteur: 'Service Formation',
          type: 'formation',
          importance: 'moyenne'
        },
        { 
          date: 'Il y a 3 jours', 
          action: 'Réunion partenaires stratégiques - Orange, BGFIBank, Total', 
          auteur: 'Chef de Projet',
          type: 'reunion',
          importance: 'haute'
        },
        { 
          date: 'Il y a 1 semaine', 
          action: 'Audit sécurité infrastructure - 0 vulnérabilité critique', 
          auteur: 'DGSS Cyber',
          type: 'securite',
          importance: 'haute'
        }
      ],
      documents: [
        { id: 1, nom: 'Cahier des charges technique', taille: '2.4 MB', type: 'PDF', date: '2025-08-15', url: '/docs/cahier-charges.pdf' },
        { id: 2, nom: 'Architecture système', taille: '1.8 MB', type: 'PDF', date: '2025-09-01', url: '/docs/architecture.pdf' },
        { id: 3, nom: 'Plan de communication', taille: '890 KB', type: 'DOCX', date: '2025-09-10', url: '/docs/plan-comm.docx' },
        { id: 4, nom: 'Rapport sécurité', taille: '1.2 MB', type: 'PDF', date: '2025-10-01', url: '/docs/securite.pdf' },
        { id: 5, nom: 'Budget détaillé Q4', taille: '456 KB', type: 'XLSX', date: '2025-10-15', url: '/docs/budget-q4.xlsx' }
      ],
      prochaines_etapes: [
        { 
          id: 1,
          titre: 'Déploiement consulat mobile Lyon', 
          echeance: '2025-11-05', 
          responsable: 'Paul OBIANG',
          priorite: 'haute',
          statut: 'planifie'
        },
        { 
          id: 2,
          titre: 'Production cartes NFC batch 2 (3,000 unités)', 
          echeance: '2025-11-15', 
          responsable: 'Alice NDONG',
          priorite: 'haute',
          statut: 'planifie'
        },
        { 
          id: 3,
          titre: 'Campagne communication diaspora', 
          echeance: '2025-11-20', 
          responsable: 'Marie LEBLANC',
          priorite: 'moyenne',
          statut: 'planifie'
        },
        { 
          id: 4,
          titre: 'Formation agents Marseille', 
          echeance: '2025-11-25', 
          responsable: 'Samuel KOUMBA',
          priorite: 'moyenne',
          statut: 'planifie'
        }
      ]
    }
  };

  return projets[id as keyof typeof projets] || null;
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjetDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [projet, setProjet] = useState<any>(null);
  const [loading, setLoading] = useState<LoadingState>({
    export: false,
    document: false,
    update: false,
    delete: false
  });
  const [error, setError] = useState<ErrorState>({ message: null, type: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    progression: 0
  });
  const [newDocument, setNewDocument] = useState({
    nom: '',
    type: 'PDF',
    description: ''
  });
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showRiskDialog, setShowRiskDialog] = useState(false);
  const [newRisk, setNewRisk] = useState({
    titre: '',
    description: '',
    niveau: 'moyen',
    probabilite: 50,
    impact: 'moyen',
    mitigation: ''
  });

  // Résolution des params au montage
  useEffect(() => {
    params.then(p => {
      setResolvedParams(p);
      const projetData = getProjetDetails(p.id);
      if (projetData) {
        setProjet(projetData);
        setEditForm({
          nom: projetData.nom,
          description: projetData.description,
          progression: projetData.progression
        });
      }
    });
  }, [params]);

  if (!resolvedParams || !projet) {
    return (
      <IntelAgentLayout
        title="Chargement..."
        description="Chargement des détails du projet"
        currentPage="projets"
        backButton={true}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </IntelAgentLayout>
    );
  }

  // Fonctions utilitaires
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'planifie': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'complete': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'critique': return 'bg-red-500/20 text-red-400 border-red-500/30';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <Euro className="h-4 w-4 text-green-500" />;
      case 'livraison': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'test': return <Activity className="h-4 w-4 text-purple-500" />;
      case 'formation': return <Users className="h-4 w-4 text-orange-500" />;
      case 'reunion': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case 'securite': return <Shield className="h-4 w-4 text-red-500" />;
      default: return <Circle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Gestionnaires d'événements fonctionnels
  const handleExportProject = async () => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      toast.info('Génération du rapport en cours...');
      
      // Simulation de génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Génération CSV
      const csvData = [
        ['Projet', 'Code', 'Statut', 'Progression', 'Budget', 'Échéance'],
        [projet.nom, projet.code, projet.statut, `${projet.progression}%`, formatBudget(projet.budget), projet.dateEcheance.toLocaleDateString()]
      ];
      
      const csv = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `projet_${projet.code}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Rapport exporté avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'export');
      setError({ message: 'Erreur lors de l\'export du rapport', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  };

  const handleDownloadDocument = async (doc: any) => {
    setLoading(prev => ({ ...prev, document: true }));
    try {
      toast.info(`Téléchargement de ${doc.nom}...`);
      
      // Simulation de téléchargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ouvrir dans un nouvel onglet (simulation)
      window.open(doc.url, '_blank');
      
      toast.success('Document téléchargé');
    } catch (err) {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setLoading(prev => ({ ...prev, document: false }));
    }
  };

  const handleUpdateProject = async () => {
    setLoading(prev => ({ ...prev, update: true }));
    try {
      toast.info('Mise à jour du projet...');
      
      // Simulation de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mettre à jour les données localement
      setProjet(prev => ({
        ...prev,
        nom: editForm.nom,
        description: editForm.description,
        progression: editForm.progression
      }));
      
      setIsEditing(false);
      toast.success('Projet mis à jour avec succès');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
      setError({ message: 'Erreur lors de la mise à jour', type: 'error' });
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  const handleAddDocument = async () => {
    if (!newDocument.nom) {
      toast.error('Le nom du document est requis');
      return;
    }

    setLoading(prev => ({ ...prev, document: true }));
    try {
      toast.info('Ajout du document...');
      
      // Simulation d'ajout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nouveauDoc = {
        id: Date.now(),
        nom: newDocument.nom,
        type: newDocument.type,
        taille: '1.2 MB',
        date: new Date().toISOString().split('T')[0],
        url: `/docs/${newDocument.nom.toLowerCase().replace(/\s/g, '-')}.${newDocument.type.toLowerCase()}`
      };
      
      setProjet(prev => ({
        ...prev,
        documents: [...prev.documents, nouveauDoc]
      }));
      
      setNewDocument({ nom: '', type: 'PDF', description: '' });
      setShowDocumentDialog(false);
      toast.success('Document ajouté avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setLoading(prev => ({ ...prev, document: false }));
    }
  };

  const handleAddRisk = async () => {
    if (!newRisk.titre || !newRisk.description) {
      toast.error('Le titre et la description sont requis');
      return;
    }

    try {
      toast.info('Ajout du risque...');
      
      const nouveauRisque = {
        id: Date.now(),
        titre: newRisk.titre,
        description: newRisk.description,
        niveau: newRisk.niveau,
        probabilite: newRisk.probabilite,
        impact: newRisk.impact,
        mitigation: newRisk.mitigation,
        responsable: projet.responsable.nom,
        statut: 'nouveau'
      };
      
      setProjet(prev => ({
        ...prev,
        risques: [...prev.risques, nouveauRisque]
      }));
      
      setNewRisk({
        titre: '',
        description: '',
        niveau: 'moyen',
        probabilite: 50,
        impact: 'moyen',
        mitigation: ''
      });
      setShowRiskDialog(false);
      toast.success('Risque ajouté avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout');
    }
  };

  const handleRefreshData = async () => {
    try {
      toast.info('Actualisation des données...');
      
      // Simulation de refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mise à jour de quelques métriques
      setProjet(prev => ({
        ...prev,
        progression: Math.min(100, prev.progression + Math.floor(Math.random() * 5)),
        budgetUtilise: prev.budgetUtilise + Math.floor(Math.random() * 5000)
      }));
      
      toast.success('Données actualisées');
    } catch (err) {
      toast.error('Erreur lors de l\'actualisation');
    }
  };

  const handleContactMember = (email: string) => {
    window.location.href = `mailto:${email}?subject=Projet ${projet.code} - Contact`;
    toast.info('Ouverture du client email...');
  };

  return (
    <IntelAgentLayout
      title={projet.nom}
      description={`Projet ${projet.code} - ${projet.phase}`}
      currentPage="projets"
      backButton={true}
    >
      <div className="space-y-6">
        {/* Affichage des erreurs */}
        {error.message && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-400">{error.message}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError({ message: null, type: null })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* En-tête du projet */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  {isEditing ? (
                    <Input
                      value={editForm.nom}
                      onChange={(e) => setEditForm(prev => ({ ...prev, nom: e.target.value }))}
                      className="text-2xl font-bold"
                    />
                  ) : (
                    <h1 className="text-2xl font-bold">{projet.nom}</h1>
                  )}
                  <Badge variant="outline" className={getStatutColor(projet.statut)}>
                    {projet.statut.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className={getPrioriteColor(projet.priorite)}>
                    PRIORITÉ {projet.priorite.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-muted-foreground font-mono">{projet.code}</p>
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="max-w-4xl"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground max-w-4xl leading-relaxed">
                    {projet.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpdateProject}
                      disabled={loading.update}
                    >
                      {loading.update ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportProject}
                      disabled={loading.export}
                    >
                      {loading.export ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Exporter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshData}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Actualiser
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Métriques clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progression</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={editForm.progression}
                      onChange={(e) => setEditForm(prev => ({ ...prev, progression: Number(e.target.value) }))}
                      className="text-2xl font-bold w-20"
                    />
                  ) : (
                    <p className="text-2xl font-bold">{projet.progression}%</p>
                  )}
                  <Progress value={isEditing ? editForm.progression : projet.progression} className="mt-2 h-2" />
                </div>
                <Target className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Total</p>
                  <p className="text-2xl font-bold">{formatBudget(projet.budget)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round((projet.budgetUtilise / projet.budget) * 100)}% utilisé
                  </p>
                </div>
                <Euro className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bénéficiaires</p>
                  <p className="text-2xl font-bold">{projet.beneficiaires.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Citoyens diaspora</p>
                </div>
                <Users className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Échéance</p>
                  <p className="text-2xl font-bold">
                    {Math.ceil((projet.dateEcheance.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}j
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Restants</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Équipe</p>
                  <p className="text-2xl font-bold">{projet.equipe.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Membres actifs</p>
                </div>
                <Briefcase className="h-8 w-8 text-indigo-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets détaillés */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="team">Équipe</TabsTrigger>
            <TabsTrigger value="deliverables">Livrables</TabsTrigger>
            <TabsTrigger value="risks">Risques</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KPIs détaillés */}
              <Card>
                <CardHeader>
                  <CardTitle>Indicateurs de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projet.kpis.map((kpi, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{kpi.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            Objectif : {kpi.objectif} {kpi.unite}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{kpi.valeur}</p>
                          <div className="flex justify-end">
                            {kpi.evolution === 'positive' && (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            )}
                            {kpi.evolution === 'negative' && (
                              <TrendingUp className="h-4 w-4 text-red-400 rotate-180" />
                            )}
                            {kpi.evolution === 'stable' && (
                              <div className="w-4 h-0.5 bg-yellow-400 mt-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs */}
              <Card>
                <CardHeader>
                  <CardTitle>Objectifs du Projet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projet.objectifs.map((objectif) => (
                      <div key={objectif.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{objectif.titre}</p>
                          <Badge variant={objectif.statut === 'complete' ? 'default' : 'secondary'}>
                            {objectif.statut === 'complete' ? 'Terminé' :
                             objectif.statut === 'en_cours' ? 'En cours' : 'Planifié'}
                          </Badge>
                        </div>
                        <Progress value={objectif.progression} className="h-1" />
                        <p className="text-xs text-muted-foreground">{objectif.progression}% complété</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Prochaines étapes */}
            <Card>
              <CardHeader>
                <CardTitle>Prochaines Étapes Critiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projet.prochaines_etapes.map((etape) => (
                    <div key={etape.id} className="p-4 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{etape.titre}</p>
                        <Badge variant={etape.priorite === 'haute' ? 'destructive' : 'secondary'}>
                          {etape.priorite}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Échéance : {new Date(etape.echeance).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Responsable : {etape.responsable}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.info(`Action planifiée pour ${etape.titre}`)}
                        >
                          <Activity className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition Budgétaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projet.budget_details.categories.map((categorie, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{categorie.nom}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatBudget(categorie.alloue)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <Progress value={(categorie.utilise / categorie.alloue) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Utilisé : {formatBudget(categorie.utilise)}</span>
                            <span>{Math.round((categorie.utilise / categorie.alloue) * 100)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Synthèse Financière</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Budget Total</p>
                      <p className="text-xl font-bold">{formatBudget(projet.budget)}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Utilisé</p>
                      <p className="text-xl font-bold text-orange-400">{formatBudget(projet.budgetUtilise)}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Disponible</p>
                      <p className="text-xl font-bold text-green-400">{formatBudget(projet.budgetReste)}</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Utilisation</p>
                      <p className="text-xl font-bold">
                        {Math.round((projet.budgetUtilise / projet.budget) * 100)}%
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => toast.info('Génération du rapport budgétaire en cours...')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Générer Rapport Budgétaire
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Équipe Projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Responsable principal */}
                  <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {projet.responsable.nom.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{projet.responsable.nom}</p>
                        <p className="text-sm text-muted-foreground">{projet.responsable.poste}</p>
                        <div className="flex gap-4 mt-2">
                          <button
                            onClick={() => handleContactMember(projet.responsable.email)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            <span>{projet.responsable.email}</span>
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(projet.responsable.telephone);
                              toast.success('Numéro copié dans le presse-papiers');
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{projet.responsable.telephone}</span>
                          </button>
                        </div>
                      </div>
                      <Badge>Responsable</Badge>
                    </div>
                  </div>

                  {/* Membres de l'équipe */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projet.equipe.slice(1).map((membre, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-secondary">
                            {membre.initiales}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{membre.nom}</p>
                          <p className="text-xs text-muted-foreground">{membre.role}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleContactMember(membre.email)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliverables" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Livrables et Jalons</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => toast.info('Fonction d\'ajout de livrable à implémenter')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projet.livrables.map((livrable) => (
                    <div key={livrable.id} className="p-4 border rounded-lg space-y-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {livrable.statut === 'complete' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                          {livrable.statut === 'en_cours' && <Activity className="h-5 w-5 text-blue-500" />}
                          {livrable.statut === 'planifie' && <Circle className="h-5 w-5 text-gray-400" />}
                          <div>
                            <p className="font-medium">{livrable.nom}</p>
                            <p className="text-sm text-muted-foreground">{livrable.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              livrable.statut === 'complete' ? 'default' :
                              livrable.statut === 'en_cours' ? 'secondary' : 'outline'
                            }
                          >
                            {livrable.statut === 'complete' ? 'Terminé' :
                             livrable.statut === 'en_cours' ? 'En cours' : 'Planifié'}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Détails du livrable : ${livrable.nom}`)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Échéance : {new Date(livrable.echeance).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>Responsable : {livrable.responsable}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gestion des Risques</CardTitle>
                  <Dialog open={showRiskDialog} onOpenChange={setShowRiskDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Risque
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un Nouveau Risque</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Titre du risque</label>
                          <Input
                            value={newRisk.titre}
                            onChange={(e) => setNewRisk(prev => ({ ...prev, titre: e.target.value }))}
                            placeholder="Ex: Retard de livraison"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newRisk.description}
                            onChange={(e) => setNewRisk(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description détaillée du risque"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Niveau</label>
                            <Select value={newRisk.niveau} onValueChange={(value) => setNewRisk(prev => ({ ...prev, niveau: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="élevé">Élevé</SelectItem>
                                <SelectItem value="critique">Critique</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Impact</label>
                            <Select value={newRisk.impact} onValueChange={(value) => setNewRisk(prev => ({ ...prev, impact: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="élevé">Élevé</SelectItem>
                                <SelectItem value="critique">Critique</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Stratégie de mitigation</label>
                          <Textarea
                            value={newRisk.mitigation}
                            onChange={(e) => setNewRisk(prev => ({ ...prev, mitigation: e.target.value }))}
                            placeholder="Actions prévues pour réduire le risque"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowRiskDialog(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddRisk}>
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projet.risques.map((risque) => (
                    <div key={risque.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <p className="font-medium">{risque.titre}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {risque.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              risque.niveau === 'critique' ? 'destructive' :
                              risque.niveau === 'élevé' ? 'default' :
                              risque.niveau === 'moyen' ? 'secondary' : 'outline'
                            }
                          >
                            {risque.niveau}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(`Risque géré par : ${risque.responsable}`)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Probabilité</p>
                          <div className="flex items-center gap-2">
                            <Progress value={risque.probabilite} className="h-1 flex-1" />
                            <span className="text-xs">{risque.probabilite}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Impact</p>
                          <p className="font-medium">{risque.impact}</p>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Stratégie de mitigation :</p>
                        <p className="text-sm">{risque.mitigation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Documents du Projet</CardTitle>
                  <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un Document</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nom du document</label>
                          <Input
                            value={newDocument.nom}
                            onChange={(e) => setNewDocument(prev => ({ ...prev, nom: e.target.value }))}
                            placeholder="Ex: Rapport d'avancement Q4"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select value={newDocument.type} onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PDF">PDF</SelectItem>
                              <SelectItem value="DOCX">DOCX</SelectItem>
                              <SelectItem value="XLSX">XLSX</SelectItem>
                              <SelectItem value="PPTX">PPTX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={newDocument.description}
                            onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Description du contenu du document"
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowDocumentDialog(false)}>
                            Annuler
                          </Button>
                          <Button onClick={handleAddDocument} disabled={loading.document}>
                            {loading.document ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projet.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.nom}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.type} • {doc.taille} • {new Date(doc.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadDocument(doc)}
                          disabled={loading.document}
                        >
                          {loading.document ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            window.open(doc.url, '_blank');
                            toast.info('Ouverture du document...');
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
                              setProjet(prev => ({
                                ...prev,
                                documents: prev.documents.filter(d => d.id !== doc.id)
                              }));
                              toast.success('Document supprimé');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Timeline des activités */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Chronologie Détaillée</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projet.activites.map((activite, index) => (
                <div key={index} className="flex gap-4 hover:bg-muted/30 p-2 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(activite.type)}
                    </div>
                    {index < projet.activites.length - 1 && (
                      <div className="w-0.5 h-12 bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activite.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Par : {activite.auteur}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{activite.date}</p>
                        <Badge 
                          variant={activite.importance === 'haute' ? 'destructive' : 'secondary'}
                          className="mt-1"
                        >
                          {activite.importance}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={handleExportProject}
                disabled={loading.export}
              >
                {loading.export ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Rapport
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => toast.info('Ouverture de la discussion du projet...')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => toast.info('Ouverture du planning détaillé...')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Planning
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => toast.info('Ouverture des analytics du projet...')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => toast.info('Ouverture du tableau de sécurité...')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Sécurité
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => toast.info('Ouverture des paramètres du projet...')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </IntelAgentLayout>
  );
}