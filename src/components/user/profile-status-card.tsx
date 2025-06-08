'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileText,
  Shield,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import CardContainer from '@/components/layouts/card-container';
import { ROUTES } from '@/schemas/routes';
import { cn } from '@/lib/utils';

interface ProfileStatusCardProps {
  profileCompletion: number;
  profileStatus?: string;
  missingDocuments: string[];
  userName?: string;
  urgentActions?: {
    title: string;
    description: string;
    href: string;
    variant?: 'urgent' | 'important' | 'info';
  }[];
  className?: string;
}

interface StatusIndicatorProps {
  completion: number;
  status?: string;
}

function StatusIndicator({ completion, status }: StatusIndicatorProps) {
  const getStatusConfig = (completion: number, status?: string) => {
    if (status === 'VALIDATED' || completion === 100) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'Profil validé',
        description: 'Votre profil est complet et validé',
      };
    }

    if (completion >= 75) {
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        label: 'En cours de validation',
        description: 'Profil presque complet, validation en cours',
      };
    }

    if (completion >= 50) {
      return {
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        label: 'Action requise',
        description: 'Complétez votre profil pour continuer',
      };
    }

    return {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Profil incomplet',
      description: 'Plusieurs informations manquantes',
    };
  };

  const config = getStatusConfig(completion, status);
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={cn('p-3 rounded-full', config.bgColor)}>
        <Icon className={cn('h-6 w-6', config.color)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-foreground">{config.label}</h3>
          <Badge
            variant={
              completion >= 75
                ? 'default'
                : completion >= 50
                  ? 'secondary'
                  : 'destructive'
            }
            className="text-xs"
          >
            {completion}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
    </div>
  );
}

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'stroke-green-500';
    if (progress >= 50) return 'stroke-blue-500';
    if (progress >= 25) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            'transition-all duration-500 ease-in-out',
            getProgressColor(progress),
          )}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{progress}%</span>
        <span className="text-xs text-muted-foreground">Complété</span>
      </div>
    </div>
  );
}

interface MissingDocumentsListProps {
  documents: string[];
  maxVisible?: number;
}

function MissingDocumentsList({ documents, maxVisible = 3 }: MissingDocumentsListProps) {
  const documentLabels: Record<string, string> = {
    identity_photo: "Photo d'identité",
    passport: 'Passeport',
    birth_certificate: 'Acte de naissance',
    residence_permit: 'Titre de séjour',
    proof_of_address: 'Justificatif de domicile',
  };

  const visibleDocs = documents.slice(0, maxVisible);
  const remainingCount = documents.length - maxVisible;

  if (documents.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Tous les documents sont fournis</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">Documents manquants :</p>
      <div className="space-y-2">
        {visibleDocs.map((doc) => (
          <div key={doc} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <span className="text-muted-foreground">{documentLabels[doc] || doc}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-muted-foreground">
            et {remainingCount} autre{remainingCount > 1 ? 's' : ''} document
            {remainingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProfileStatusCard({
  profileCompletion,
  profileStatus,
  missingDocuments,
  userName,
  urgentActions = [],
  className,
}: ProfileStatusCardProps) {
  const hasUrgentActions = urgentActions.length > 0;
  const isProfileComplete = profileCompletion >= 75;

  return (
    <CardContainer
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        !isProfileComplete &&
          'border-orange-200 light:bg-gradient-to-br from-orange-50/50 light:to-background dark:bg-orange-950/50',
        isProfileComplete &&
          'border-green-200 light:bg-gradient-to-br from-green-50/50 light:to-background dark:bg-green-950/50',
        className,
      )}
    >
      <div className="space-y-6">
        {/* En-tête avec nom d'utilisateur */}
        {userName && (
          <div className="flex items-center gap-2 pb-4 border-b">
            <User className="h-5 w-5 text-primary" />
            <span className="font-medium">Bonjour, {userName}</span>
          </div>
        )}

        {/* Zone principale avec indicateur et anneau de progression */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Indicateur de statut */}
          <div className="flex-1 w-full">
            <StatusIndicator completion={profileCompletion} status={profileStatus} />

            {/* Barre de progression linéaire pour mobile */}
            <div className="lg:hidden">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-3" />
            </div>
          </div>

          {/* Anneau de progression pour desktop */}
          <div className="hidden lg:flex justify-center">
            <ProgressRing progress={profileCompletion} />
          </div>
        </div>

        {/* Actions urgentes */}
        {hasUrgentActions && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Actions prioritaires
            </h4>
            <div className="space-y-2">
              {urgentActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant === 'urgent' ? 'destructive' : 'outline'}
                  size="sm"
                  asChild
                  className="w-full justify-between"
                >
                  <Link href={action.href}>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      {action.description && (
                        <div className="text-xs opacity-80">{action.description}</div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Documents manquants */}
        <MissingDocumentsList documents={missingDocuments} />

        {/* Action principale */}
        <div className="pt-4 border-t">
          <Button
            asChild
            className="w-full"
            variant={isProfileComplete ? 'outline' : 'default'}
          >
            <Link
              href={ROUTES.user.profile}
              className="flex items-center justify-center gap-2"
            >
              {isProfileComplete ? (
                <>
                  <Shield className="h-4 w-4" />
                  Voir mon profil
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Compléter mon profil
                </>
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </CardContainer>
  );
}
