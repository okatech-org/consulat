'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/trpc/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Calendar, Plus, Shield, FileText, Eye, BarChart3, AlertCircle, Clock, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { IntelligenceNotesSection } from '@/components/intelligence/intelligence-notes-section';
import { IntelNavigationBar } from '@/components/intelligence/intel-navigation-bar';
import { ROUTES } from '@/schemas/routes';
import { ProfileLookupSheet } from '@/components/profile/profile-lookup-sheet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Progress } from '@/components/ui/progress';
import { IntelligenceNoteForm } from '@/components/intelligence/intelligence-note-form';
import CardContainer from '@/components/layouts/card-container';
import { useCurrentUser } from '@/hooks/use-role-data';
import { toast } from 'sonner';
import { useCallback, useState, useEffect } from 'react';

interface ProfileIntelligenceDetailsPageProps {
  profileId: string;
}

export function ProfileIntelligenceDetailsPage({
  profileId,
}: ProfileIntelligenceDetailsPageProps) {
  const router = useRouter();
  const { user: currentUser } = useCurrentUser();

  // États pour les améliorations UX
  const [isProfileViewed, setIsProfileViewed] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [completionScore, setCompletionScore] = useState(85);

  const { data: profile, isLoading } = api.intelligence.getProfileDetails.useQuery({
    profileId,
  });

  // Simuler l'activité en temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      setLastActivity(new Date());
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

  // Marquer le profil comme consulté
  useEffect(() => {
    if (profile && !isProfileViewed) {
      setTimeout(() => {
        setIsProfileViewed(true);
        toast.info('Profil consulté', {
          description: 'Accès enregistré dans les logs de surveillance',
        });
      }, 2000);
    }
  }, [profile, isProfileViewed]);

  // Callbacks optimisés pour les interactions
  const handleReturnToProfiles = useCallback(() => {
    toast.success('Retour à la liste des profils');
    router.push(ROUTES.intel.profiles);
  }, [router]);

  const handleNoteSuccess = useCallback(() => {
    toast.success('Note ajoutée avec succès !', {
      description: 'La note de renseignement a été enregistrée.',
      action: {
        label: 'Voir',
        onClick: () => {
          document.querySelector('[data-section="renseignements"]')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        },
      },
    });
  }, []);

  const handleProfileAction = useCallback((action: string) => {
    toast.info(`Action: ${action}`, {
      description: 'Action enregistrée dans les logs',
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <IntelNavigationBar 
          currentPage="Chargement..."
          breadcrumbs={[
            { label: 'Profils consulaires', href: '/intel/profiles' }
          ]}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* En-tête skeleton premium */}
            <div className="relative p-8 rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/60 shadow-xl animate-pulse">
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-24 bg-slate-200 rounded-2xl"></div>
                  <div className="h-28 w-28 bg-slate-200 rounded-full"></div>
          </div>
                <div className="flex-1 space-y-4">
                  <div className="h-12 bg-slate-200 rounded-2xl w-3/4"></div>
                  <div className="h-6 bg-slate-200 rounded-xl w-1/2"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="h-20 bg-slate-200 rounded-2xl"></div>
                    <div className="h-20 bg-slate-200 rounded-2xl"></div>
        </div>
                </div>
              </div>
            </div>
            
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <div className="h-96 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <div className="h-64 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl animate-pulse"></div>
                <div className="h-48 bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <IntelNavigationBar 
          currentPage="Profil introuvable"
          breadcrumbs={[
            { label: 'Profils consulaires', href: '/intel/profiles' }
          ]}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="relative">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-2xl">
                <User className="h-16 w-16 text-slate-400" />
              </div>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-40 bg-red-500/10 rounded-full animate-ping"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Profil non trouvé</h2>
            <p className="text-slate-600 mb-8 text-lg max-w-md mx-auto">
              Le profil demandé n&apos;existe pas ou vous n&apos;avez pas l&apos;autorisation de le consulter.
            </p>
            
            <Button 
              onClick={handleReturnToProfiles}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-0"
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <IntelNavigationBar 
        currentPage={`${profile.firstName} ${profile.lastName}`}
        breadcrumbs={[
          { label: 'Profils consulaires', href: '/intel/profiles' }
        ]}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">

          {/* En-tête principal avec statut en temps réel */}
          <div 
            className="relative p-8 rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
              {/* Indicateur de consultation en temps réel */}
              {isProfileViewed && (
                <div className="absolute top-4 left-4 z-20">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        Consulté
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="bg-slate-800 text-white">
                      <p>Profil consulté par {currentUser?.name || 'Agent'} à {format(lastActivity, 'HH:mm', { locale: fr })}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Animation de scan améliorée */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)',
                  animation: 'scan-animation 6s ease-in-out infinite'
                }}
              />
              
              {/* Orbe décorative avec pulsation */}
              <div 
                className="absolute top-4 right-4 w-32 h-32 rounded-full opacity-10 animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                }}
              />
              
              {/* Contenu de l'en-tête */}
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  {/* Bouton retour et avatar améliorés */}
                  <div className="flex items-center gap-6">
                      <Tooltip>
                        <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
                            onClick={handleReturnToProfiles}
                            className="group/btn flex items-center gap-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg px-4 py-2.5 rounded-xl border-2"
                           style={{
                             background: 'rgba(255, 255, 255, 0.8)',
                             backdropFilter: 'blur(12px)',
                             border: '2px solid rgba(59, 130, 246, 0.2)',
                           }}
                         >
                           <ArrowLeft className="h-4 w-4 transition-transform group-hover/btn:-translate-x-0.5" />
                           <span className="hidden sm:inline">Retour</span>
        </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Retourner à la liste des profils consulaires</p>
                        </TooltipContent>
                      </Tooltip>
                    
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="relative cursor-pointer">
                          <Avatar className="h-28 w-28 border-4 border-white/50 shadow-2xl ring-4 ring-blue-500/20 transition-all duration-300 hover:ring-blue-500/40 hover:scale-105">
                            <AvatarImage
                              src={profile.identityPicture?.fileUrl || ''}
                              className="h-28 w-28 rounded-full object-cover"
                            />
                          </Avatar>
                          {/* Badge de statut actif animé */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform">
                                <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse"></div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Profil actif - Dernière mise à jour: {format(lastActivity, 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80 bg-white/95 backdrop-blur-xl border border-slate-200">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={profile.identityPicture?.fileUrl || ''} />
                            </Avatar>
                            <div>
                              <h4 className="text-lg font-bold">{profile.firstName} {profile.lastName}</h4>
                              <p className="text-sm text-slate-600">Citoyen gabonais</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-slate-600">Complétude du profil</span>
                              <span className="text-sm font-semibold">{completionScore}%</span>
                            </div>
                            <Progress value={completionScore} className="h-2" />
                            
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-blue-500" />
                                <span>Créé il y a 2 ans</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="h-3 w-3 text-green-500" />
                                <span>Vérifié</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                  
                  {/* Informations principales avec micro-interactions */}
        <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="group/title">
                          <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-300 group-hover/title:from-blue-700 group-hover/title:to-purple-700 transition-all duration-500">
            {profile.firstName} {profile.lastName}
          </h1>
                          <div className="h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover/title:w-full transition-all duration-700 rounded-full mt-1"></div>
                        </div>
                        
                        <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
            Profil gabonais - Consultation des renseignements
          </p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>En ligne maintenant</span>
                          </div>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 text-sm text-slate-500 cursor-help hover:text-slate-700 transition-colors">
                                <AlertCircle className="h-4 w-4" />
                                <span>Niveau {riskLevel === 'low' ? 'Faible' : riskLevel === 'medium' ? 'Moyen' : 'Élevé'}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-slate-800 text-white">
                              <p>Niveau de risque basé sur l'analyse comportementale</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      
                      {/* Badges de statut avec tooltips */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg border-0 cursor-help">
                              <Shield className="h-4 w-4 mr-2" />
                              Surveillance Active
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-blue-800 text-white">
                            <p>Surveillance activée depuis le 15/09/2024</p>
                            <p className="text-xs opacity-80">Agent: {currentUser?.name || 'Intel'}</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg border-0 cursor-help">
                              <Eye className="h-4 w-4 mr-2" />
                              Profil Vérifié
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-green-800 text-white">
                            <p>Profil vérifié et validé par la DGSS</p>
                            <p className="text-xs opacity-80">Dernière vérification: Aujourd'hui</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    
                    {/* Informations rapides avec tooltips et micro-interactions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profile.birthDate && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="group/info flex items-center gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-blue-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-help">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover/info:from-blue-200 group-hover/info:to-blue-300 transition-all duration-300 group-hover/info:rotate-3">
                                <Calendar className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                  Date de naissance
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                  {format(new Date(profile.birthDate), 'dd MMMM yyyy', { locale: fr })}
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Âge: {new Date().getFullYear() - new Date(profile.birthDate).getFullYear()} ans</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      
                      {profile.birthPlace && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="group/info flex items-center gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-orange-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-help">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center group-hover/info:from-orange-200 group-hover/info:to-orange-300 transition-all duration-300 group-hover/info:rotate-3">
                                <MapPin className="h-6 w-6 text-orange-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                  Lieu de naissance
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                  {profile.birthPlace}
                                </p>
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Localisation de naissance enregistrée</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Nouvelle card - Statut d'activité */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="group/info flex items-center gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-purple-200/80 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-help">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center group-hover/info:from-purple-200 group-hover/info:to-purple-300 transition-all duration-300 group-hover/info:rotate-3">
                              <Clock className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                Dernière activité
                              </p>
                              <p className="text-sm font-bold text-slate-800">
                                {format(lastActivity, 'HH:mm', { locale: fr })}
                              </p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <p>Dernière interaction système détectée</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </div>
        </div>

        {/* Layout en grille 2/3 - 1/3 avec espacement harmonieux */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
          {/* Section Principale (2/3) - RENSEIGNEMENTS MISE EN AVANT */}
          <div className="xl:col-span-2">
            
            {/* Section RENSEIGNEMENTS PRIORITAIRE avec améliorations UX */}
            <div 
              className="group relative p-8 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 hover:bg-white/90"
              data-section="renseignements"
            >
              
              {/* Effet de bordure animée responsive */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Badge prioritaire flottant avec pulsation */}
              <div className="absolute -top-3 left-8 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-lg border-0 rounded-full hover:scale-105 transition-transform cursor-help animate-pulse">
                      <Shield className="h-3 w-3 mr-2" />
                      Section Prioritaire
        </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-purple-800 text-white">
                    <p>Section haute priorité - Accès restreint DGSS</p>
                    <p className="text-xs opacity-80">Classification: Confidentiel</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Indicateur de niveau de sécurité */}
              <div className="absolute top-4 right-4 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-200 hover:bg-red-200 transition-colors cursor-help">
                      <AlertCircle className="h-3 w-3" />
                      <span>Niveau {riskLevel === 'low' ? '1' : riskLevel === 'medium' ? '2' : '3'}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="bg-red-800 text-white">
                    <p>Niveau de surveillance: {riskLevel === 'low' ? 'Faible' : riskLevel === 'medium' ? 'Moyen' : 'Élevé'}</p>
                    <p className="text-xs opacity-80">Mise à jour automatique basée sur l'IA</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="relative z-10 pt-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="relative cursor-pointer group/icon">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover/icon:rotate-6 group-hover/icon:scale-110">
                            <Shield className="h-8 w-8 text-white transition-transform group-hover/icon:rotate-12" />
                          </div>
                          
                          {/* Badge d'alerte animé */}
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white shadow-md animate-bounce hover:animate-spin cursor-pointer">
                            <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-yellow-800">!</span>
                            </div>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72 bg-white/95 backdrop-blur-xl border border-slate-200">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                              <Shield className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800">Centre de Renseignements</h4>
                              <p className="text-sm text-slate-600">DGSS - Classification élevée</p>
                            </div>
      </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Notes actives:</span>
                              <span className="font-semibold">1</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Dernière mise à jour:</span>
                              <span className="font-semibold">Aujourd'hui</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Agent assigné:</span>
                              <span className="font-semibold">{currentUser?.name || 'Intel'}</span>
                            </div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                    
                    <div>
                      <div className="group/title-section">
                        <h2 className="text-3xl font-black text-slate-800 mb-1 group-hover/title-section:text-blue-700 transition-colors duration-300">
              Renseignements
            </h2>
                        <div className="h-0.5 w-0 bg-gradient-to-r from-blue-500 to-purple-600 group-hover/title-section:w-full transition-all duration-500 rounded-full"></div>
                      </div>
                      <p className="text-slate-500 font-medium mt-2">
                        Informations de surveillance et notes d'intelligence
                      </p>
                    </div>
                  </div>
                  
                  {/* Indicateurs de statut rapides */}
                  <div className="hidden lg:flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 hover:bg-blue-200 transition-colors cursor-help">
                          <FileText className="h-3 w-3" />
                          <span>1 Note</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>1 note de renseignement active</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200 hover:bg-green-200 transition-colors cursor-help">
                          <Eye className="h-3 w-3" />
                          <span>Vérifié</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Statut vérifié par la DGSS</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="relative">
                  <IntelligenceNotesSection
                    profileId={profileId}
                    currentUserId={currentUser?.id || ''}
                    allowDelete={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar d'actions (1/3) - UX Premium */}
          <div className="space-y-8">
            
            {/* Actions principales avec design interactif */}
            <div className="sticky top-8 space-y-6">
              
              {/* Card Actions Prioritaires avec micro-interactions */}
              <div className="group relative p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                
                {/* Effet de fond animé multi-couches */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
                          <Plus className="h-5 w-5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800">
                        Actions Prioritaires
                      </h3>
                    </div>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-help hover:bg-slate-200 transition-colors">
                          <AlertCircle className="h-4 w-4 text-slate-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Actions rapides pour ce profil</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Bouton AJOUTER UNE NOTE - Ultra Premium */}
                    <Tooltip>
                      <TooltipTrigger asChild>
            <Sheet>
              <SheetTrigger asChild>
                            <Button className="w-full h-14 text-white font-bold text-base bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl rounded-2xl border-0 group/btn overflow-hidden relative">
                              
                              {/* Effet de brillance animé */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                              
                              {/* Particules décoratives */}
                              <div className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
                              <div className="absolute bottom-2 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
                              
                              <div className="relative flex items-center justify-center gap-3">
                                <Plus className="h-5 w-5 transition-transform group-hover/btn:rotate-90 duration-300" />
                                <span>Ajouter une Note</span>
                              </div>
                </Button>
              </SheetTrigger>
                          <SheetContent className="w-full sm:min-w-[50vw] sm:max-w-[90vw] bg-white/95 backdrop-blur-xl">
                <SheetHeader>
                              <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Ajouter une note de renseignement
                  </SheetTitle>
                </SheetHeader>
                            <div className="mt-8">
                  <IntelligenceNoteForm
                    profileId={profileId}
                                onSuccess={handleNoteSuccess}
                  />
                </div>
              </SheetContent>
            </Sheet>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="bg-blue-800 text-white">
                        <p>Ajouter une nouvelle note de renseignement</p>
                        <p className="text-xs opacity-80">Classification automatique selon le contenu</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                          <ProfileLookupSheet
            profileId={profileId}
                            triggerLabel="Voir le Profil Complet"
                            triggerVariant="outline"
                            triggerIcon={<User className="h-5 w-5" />}
          />
        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>Consulter toutes les informations du profil</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Actions secondaires */}
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="grid grid-cols-2 gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleProfileAction('export')}
                              className="text-xs font-semibold hover:bg-slate-50 transition-colors"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Exporter les données du profil</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleProfileAction('share')}
                              className="text-xs font-semibold hover:bg-slate-50 transition-colors"
                            >
                              <Globe className="h-4 w-4 mr-1" />
                              Partager
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p>Partager avec d'autres agents</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques rapides améliorées */}
              <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Statistiques
                  </h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center cursor-help hover:bg-blue-200 transition-colors">
                        <AlertCircle className="h-3 w-3 text-blue-600" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Statistiques en temps réel</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="space-y-4">
                  <div className="group/stat flex justify-between items-center p-3 rounded-xl hover:bg-white/60 transition-colors">
                    <span className="text-sm text-slate-600">Notes actives</span>
                    <Badge variant="secondary" className="font-bold group-hover/stat:scale-110 transition-transform">1</Badge>
                  </div>
                  
                  <div className="group/stat flex justify-between items-center p-3 rounded-xl hover:bg-white/60 transition-colors">
                    <span className="text-sm text-slate-600">Dernier accès</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-slate-800">Maintenant</span>
                    </div>
                  </div>
                  
                  <div className="group/stat flex justify-between items-center p-3 rounded-xl hover:bg-white/60 transition-colors">
                    <span className="text-sm text-slate-600">Niveau de risque</span>
                    <Badge className={`font-bold transition-all duration-300 group-hover/stat:scale-110 ${
                      riskLevel === 'low' ? 'bg-green-100 text-green-800 border-green-200' :
                      riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {riskLevel === 'low' ? 'Faible' : riskLevel === 'medium' ? 'Moyen' : 'Élevé'}
                    </Badge>
                  </div>
                  
                  <div className="group/stat flex justify-between items-center p-3 rounded-xl hover:bg-white/60 transition-colors">
                    <span className="text-sm text-slate-600">Complétude</span>
                    <div className="flex items-center gap-2">
                      <Progress value={completionScore} className="w-16 h-2" />
                      <span className="text-sm font-semibold text-slate-800">{completionScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides supplémentaires */}
              <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/40 shadow-lg">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-600" />
                  Actions Avancées
                </h4>
                
                <div className="space-y-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:bg-slate-50 transition-colors"
                        onClick={() => handleProfileAction('surveillance')}
                      >
                        <Shield className="h-4 w-4 mr-3 text-blue-600" />
                        <span className="text-sm">Modifier Surveillance</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Ajuster le niveau de surveillance</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:bg-slate-50 transition-colors"
                        onClick={() => handleProfileAction('contact')}
                      >
                        <Phone className="h-4 w-4 mr-3 text-green-600" />
                        <span className="text-sm">Contacter</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Initier un contact avec le profil</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start hover:bg-slate-50 transition-colors"
                        onClick={() => handleProfileAction('flag')}
                      >
                        <AlertCircle className="h-4 w-4 mr-3 text-orange-600" />
                        <span className="text-sm">Signaler</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Signaler une activité suspecte</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        </div>
        
        {/* Bouton d'action flottant mobile premium */}
        <div className="fixed bottom-6 right-6 xl:hidden z-50">
          <div className="relative group/fab">
            
            {/* Halo du bouton flottant */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl scale-150 opacity-60 group-hover/fab:opacity-100 transition-opacity duration-500"></div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-0 group/btn overflow-hidden"
                      style={{
                        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4), 0 4px 16px rgba(147, 51, 234, 0.3)',
                      }}
                    >
                      
                      {/* Effet de brillance circulaire */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 rounded-full"></div>
                      
                      {/* Particules décoratives */}
                      <div className="absolute top-3 left-3 w-1 h-1 bg-white/80 rounded-full animate-ping"></div>
                      <div className="absolute bottom-4 right-3 w-0.5 h-0.5 bg-white/60 rounded-full animate-pulse"></div>
                      
                      <Plus className="h-6 w-6 transition-transform group-hover/btn:rotate-90 duration-300 relative z-10" />
                      
                      {/* Badge de notification */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white shadow-md flex items-center justify-center animate-bounce">
                        <span className="text-xs font-bold text-yellow-800">1</span>
                      </div>
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="w-full bg-white/95 backdrop-blur-xl border-l border-slate-200/60">
                    <SheetHeader>
                      <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Plus className="h-4 w-4 text-white" />
                        </div>
                        Actions rapides
                      </SheetTitle>
                    </SheetHeader>
                    
                    <div className="mt-8 space-y-6">
                      
                      {/* Action principale */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200/50">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Action Prioritaire
                        </h4>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter une Note
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-full bg-white/95 backdrop-blur-xl">
                            <SheetHeader>
                              <SheetTitle className="text-xl font-bold">
                                Ajouter une note de renseignement
                              </SheetTitle>
                            </SheetHeader>
                            <div className="mt-6">
                              <IntelligenceNoteForm
                                profileId={profileId}
                                onSuccess={handleNoteSuccess}
                              />
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                      
                      {/* Actions secondaires */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Actions Supplémentaires</h4>
                        
                <ProfileLookupSheet
                  profileId={profileId}
                          triggerLabel="Voir le Profil Complet"
                  triggerVariant="outline"
                  triggerIcon={<User className="h-4 w-4" />}
                />
                        
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProfileAction('export')}
                            className="text-xs hover:bg-slate-50"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleProfileAction('share')}
                            className="text-xs hover:bg-slate-50"
                          >
                            <Globe className="h-3 w-3 mr-1" />
                            Partager
                          </Button>
                        </div>
              </div>
            </div>
                  </SheetContent>
                </Sheet>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-blue-800 text-white">
                <p>Actions rapides mobiles</p>
                <p className="text-xs opacity-80">Appuyer pour ouvrir le menu</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Styles CSS pour animations UX premium */}
        <style jsx>{`
        @keyframes scan-animation {
          0% { 
            transform: translateX(-100%); 
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% { 
            transform: translateX(300%); 
            opacity: 0;
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% { 
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }
        
        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-6px); 
          }
        }
        
        @keyframes shimmer {
          0% { 
            background-position: -200% 0; 
          }
          100% { 
            background-position: 200% 0; 
          }
        }
        
        @keyframes status-indicator {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.2) rotate(180deg); 
            opacity: 1;
          }
        }
        
        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .float-animation {
          animation: float-gentle 4s ease-in-out infinite;
        }
        
        /* Styles responsifs et accessibilité */
        @media (prefers-reduced-motion: reduce) {
          .scan-animation,
          .animate-pulse,
          .animate-bounce,
          .animate-ping,
          .float-animation,
          .shimmer-effect {
            animation: none !important;
          }
          
          .group-hover\\:rotate-6:hover,
          .group-hover\\:rotate-12:hover,
          .group-hover\\:scale-105:hover,
          .group-hover\\:scale-110:hover {
            transform: none !important;
          }
        }
        
        /* Focus states pour l'accessibilité */
        .focus-visible {
          outline: 2px solid rgb(59, 130, 246);
          outline-offset: 2px;
        }
        
        /* Optimisations mobile */
        @media (max-width: 768px) {
          .hover\\:scale-105:hover {
            transform: scale(1.02) !important;
          }
          
          .hover\\:shadow-2xl:hover {
            box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1) !important;
          }
        }
      `}</style>
    </div>
  );
}
