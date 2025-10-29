'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Loader2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  Shield,
  Check,
  X,
  Eye,
} from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge as UiBadge } from '@/components/ui/badge';

interface IntelProfileDetailsSheetProps {
  profileId: string;
  triggerLabel?: string;
  triggerVariant?: 'default' | 'outline' | 'ghost';
  triggerIcon?: React.ReactNode;
}

export function IntelProfileDetailsSheet({
  profileId,
  triggerLabel = 'Voir le Profil Complet',
  triggerVariant = 'outline',
  triggerIcon,
}: IntelProfileDetailsSheetProps) {
  const t = useTranslations('intelligence.profileDetails');
  const [open, setOpen] = useState(false);

  const profile = useQuery(
    api.functions.profile.getCurrentProfile,
    profileId ? { profileId } : 'skip',
  );
  const isLoading = profile === undefined;
  const error = null;

  const userDocsData = useQuery(
    api.functions.document.getUserDocumentsDashboard,
    open ? { limit: 50 } : 'skip',
  );
  const profileLinkedDocs = [
    profile?.identityPicture && {
      ...profile.identityPicture,
      type: 'IDENTITY_PHOTO',
      status: 'VALIDATED',
    },
    profile?.passport && { ...profile.passport, type: 'PASSPORT', status: 'VALIDATED' },
    profile?.birthCertificate && {
      ...profile.birthCertificate,
      type: 'BIRTH_CERTIFICATE',
      status: 'VALIDATED',
    },
    profile?.residencePermit && {
      ...profile.residencePermit,
      type: 'RESIDENCE_PERMIT',
      status: 'VALIDATED',
    },
    profile?.addressProof && {
      ...profile.addressProof,
      type: 'PROOF_OF_ADDRESS',
      status: 'VALIDATED',
    },
  ].filter(Boolean) as Array<{
    id: string;
    fileUrl: string;
    fileType: string;
    metadata?: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    status: string;
  }>;
  const documents =
    (profileLinkedDocs.length > 0 ? profileLinkedDocs : userDocsData?.documents) ?? [];

  const renderContent = () => {
    // État de chargement
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              {t('loading')}
            </span>
          </div>
        </div>
      );
    }

    // Gestion des erreurs
    if (error) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{t('error')}</AlertDescription>
          </Alert>
        </div>
      );
    }

    if (!profile) return null;

    return (
      <div className="space-y-6">
        {/* En-tête du profil */}
        <Card
          className="relative group transition-all duration-300 hover:shadow-2xl border-l-4 overflow-hidden"
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
            boxShadow: 'var(--shadow-glass)',
            borderLeftColor: '#10b981',
          }}
        >
          {/* Barre de scan animée */}
          <div
            className="absolute top-0 left-0 h-1 opacity-0 group-hover:opacity-100"
            style={{
              width: '100px',
              background: 'linear-gradient(90deg, transparent, #10b981 50%, transparent)',
              animation: 'scan 2s infinite linear',
            }}
          />

          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 px-3 py-1.5 text-xs font-bold rounded-full">
                <Shield className="h-3 w-3 mr-1.5" />
                {t('badges.verified')}
              </Badge>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {t('labels.id')}: {profile.id.slice(-8).toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.identityPicture?.fileUrl} />
                <AvatarFallback className="text-lg font-bold">
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t('labels.consular_profile')} ID: {profileId.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations personnelles */}
        <Card
          className="relative transition-all duration-300 hover:shadow-lg"
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div
            className="px-6 pt-5 pb-4 border-b"
            style={{ borderColor: 'var(--border-glass-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <User className="h-5 w-5" style={{ color: '#3b82f6' }} />
              </div>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('sections.personal_info')}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t('sections.personal_info_desc')}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne 1 */}
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <Calendar className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.birth_date')}
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.birthDate
                        ? format(new Date(profile.birthDate), 'dd MMMM yyyy', {
                            locale: fr,
                          })
                        : t('labels.not_set')}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <MapPin className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.birth_place')}
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.birthPlace || t('labels.not_set')}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <Mail className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.email')}
                    </span>
                    <p
                      className="text-sm font-mono font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.email || t('labels.not_set')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Colonne 2 */}
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <Phone className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.phone')}
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.phoneNumber
                        ? profile.phoneNumber
                            .replace(/[\s-]/g, '') // Supprimer espaces et tirets
                            .replace(
                              /(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/,
                              '$1 $2 $3 $4 $5 $6',
                            )
                        : t('labels.not_set')}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <MapPin className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.nationality')}
                    </span>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.nationality
                        ? profile.nationality === 'GA'
                          ? 'Gabonaise'
                          : profile.nationality === 'FR'
                            ? 'Française'
                            : profile.nationality === 'US'
                              ? 'Américaine'
                              : profile.nationality === 'CA'
                                ? 'Canadienne'
                                : profile.nationality === 'BE'
                                  ? 'Belge'
                                  : profile.nationality === 'CH'
                                    ? 'Suisse'
                                    : profile.nationality === 'DE'
                                      ? 'Allemande'
                                      : profile.nationality === 'ES'
                                        ? 'Espagnole'
                                        : profile.nationality === 'IT'
                                          ? 'Italienne'
                                          : profile.nationality === 'UK'
                                            ? 'Britannique'
                                            : profile.nationality
                        : t('labels.not_set')}
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <MapPin className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.address')}
                    </span>
                    {profile.address ? (
                      <div
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <div>{profile.address.firstLine}</div>
                        {profile.address.secondLine && (
                          <div>{profile.address.secondLine}</div>
                        )}
                        <div>
                          {profile.address.zipCode} {profile.address.city} -{' '}
                          {profile.address.country === 'FR'
                            ? 'France'
                            : profile.address.country === 'GA'
                              ? 'Gabon'
                              : profile.address.country === 'US'
                                ? 'États-Unis'
                                : profile.address.country === 'CA'
                                  ? 'Canada'
                                  : profile.address.country === 'BE'
                                    ? 'Belgique'
                                    : profile.address.country === 'CH'
                                      ? 'Suisse'
                                      : profile.address.country === 'DE'
                                        ? 'Allemagne'
                                        : profile.address.country === 'ES'
                                          ? 'Espagne'
                                          : profile.address.country === 'IT'
                                            ? 'Italie'
                                            : profile.address.country === 'UK'
                                              ? 'Royaume-Uni'
                                              : profile.address.country}
                        </div>
                      </div>
                    ) : (
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {t('labels.not_set')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents et statut */}
        <Card
          className="relative transition-all duration-300 hover:shadow-lg"
          style={{
            background: 'var(--bg-glass-primary)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-glass-primary)',
            boxShadow: 'var(--shadow-glass)',
          }}
        >
          <div
            className="px-6 pt-5 pb-4 border-b"
            style={{ borderColor: 'var(--border-glass-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <FileText className="h-5 w-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('sections.documents_status')}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {t('sections.documents_status_desc')}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne 1 */}
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <IdCard className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.document_type')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs font-medium">
                        {profile.idType || t('labels.not_defined')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <FileText className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.number')}
                    </span>
                    <p
                      className="text-sm font-mono font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.idNumber || t('labels.not_set')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Colonne 2 */}
              <div className="space-y-4">
                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  {profile.identityPicture ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.identity_photo')}
                    </span>
                    <div className="flex items-center gap-2">
                      {profile.identityPicture ? (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                          {t('labels.available')}
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-xs">
                          {t('labels.missing')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 py-3 px-4 rounded-lg"
                  style={{ background: 'var(--bg-glass-light)' }}
                >
                  <Calendar className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
                  <div className="flex-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('fields.last_update')}
                    </span>
                    <p
                      className="text-sm font-mono font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {profile.updatedAt
                        ? format(new Date(profile.updatedAt), 'dd/MM/yyyy HH:mm', {
                            locale: fr,
                          })
                        : t('labels.never')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des documents (lecture seule) */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <FileText className="h-5 w-5" style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <h4
                    className="text-base font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {t('documents.title')}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t('documents.subtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {documents.length === 0 && (
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('documents.none')}
                  </div>
                )}

                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{
                      background: 'var(--bg-glass-light)',
                      border: '1px solid var(--border-glass-secondary)',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UiBadge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs font-medium flex-shrink-0">
                        {t(`documents.types.${doc.type}`) || String(doc.type)}
                      </UiBadge>
                      <div className="truncate">
                        <div
                          className="text-sm font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {doc.metadata?.name || t('documents.document')}
                        </div>
                        <div
                          className="text-xs font-medium"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {doc.fileType} •{' '}
                          {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <UiBadge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30 text-xs font-medium">
                        {t(`documents.status.${doc.status}`) || String(doc.status)}
                      </UiBadge>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-medium px-2 py-1 rounded border hover:bg-opacity-20 transition-colors"
                        style={{
                          color: 'var(--text-primary)',
                          borderColor: 'var(--border-glass-primary)',
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {t('actions.view')}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes scan {
          0% { 
            left: -100px;
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% { 
            left: 100%;
            opacity: 0;
          }
        }
      `}</style>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant={triggerVariant} size="sm" className="w-full">
            {triggerIcon || <User className="h-4 w-4 mr-2" />}
            {triggerLabel}
          </Button>
        </SheetTrigger>
        <SheetContent
          className="w-full max-w-4xl overflow-y-auto sm:max-w-4xl"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-glass-primary)',
          }}
          aria-describedby="intel-profile-details"
        >
          <SheetHeader>
            <SheetTitle style={{ color: 'var(--text-primary)' }}>
              Détails du Profil - Design 2.1
            </SheetTitle>
          </SheetHeader>
          <div id="intel-profile-details" className="mt-6">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
