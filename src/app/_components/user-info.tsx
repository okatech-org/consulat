'use client';

import { api } from '@/trpc/react';
import {
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { UserRole } from '@prisma/client';

export function UserInfo() {
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = api.user.getCurrentUser.useQuery(undefined, {
    // Actualiser toutes les 5 minutes
    refetchInterval: 5 * 60 * 1000,
    // Garder les données fraîches pendant 2 minutes
    staleTime: 2 * 60 * 1000,
    // Réessayer 2 fois en cas d'erreur
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white/10 p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-32 rounded bg-white/20"></div>
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-white/20"></div>
            <div className="h-3 w-full rounded bg-white/20"></div>
            <div className="h-3 w-3/4 rounded bg-white/20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full max-w-md rounded-xl bg-red-500/10 p-6">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>Erreur lors du chargement</span>
        </div>
        <p className="mt-2 text-sm text-red-300">{error?.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 flex items-center gap-2 rounded-md bg-red-500/20 px-3 py-1 text-sm text-red-300 hover:bg-red-500/30"
        >
          <RefreshCw className="h-3 w-3" />
          Réessayer
        </button>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Non définie';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleBadge = (roles: UserRole[]) => {
    const roleLabels = {
      [UserRole.SUPER_ADMIN]: 'Super Admin',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.MANAGER]: 'Manager',
      [UserRole.AGENT]: 'Agent',
      [UserRole.USER]: 'Utilisateur',
    };

    const highestRole = roles[0] || UserRole.USER;
    const label = roleLabels[highestRole];
    const colors = {
      [UserRole.SUPER_ADMIN]: 'bg-purple-500/20 text-purple-300',
      [UserRole.ADMIN]: 'bg-red-500/20 text-red-300',
      [UserRole.MANAGER]: 'bg-orange-500/20 text-orange-300',
      [UserRole.AGENT]: 'bg-blue-500/20 text-blue-300',
      [UserRole.USER]: 'bg-green-500/20 text-green-300',
    };

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colors[highestRole]}`}
      >
        <Shield className="h-3 w-3" />
        {label}
      </span>
    );
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Informations utilisateur</h3>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="rounded-md p-1 hover:bg-white/10"
          aria-label="Actualiser"
        >
          <RefreshCw
            className={`h-4 w-4 text-white/60 ${isRefetching ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="space-y-3">
        {/* Nom et rôle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/60" />
            <span className="text-white">{user.name || 'Sans nom'}</span>
          </div>
          {user.roles && getRoleBadge(user.roles)}
        </div>

        {/* Email */}
        {user.email && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-white/60" />
              <span className="text-white">{user.email}</span>
            </div>
            {'emailVerified' in user && (
              <span
                aria-label={user.emailVerified ? 'Email vérifié' : 'Email non vérifié'}
              >
                {user.emailVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </span>
            )}
          </div>
        )}

        {/* Téléphone */}
        {user.phoneNumber && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-white/60" />
              <span className="text-white">{user.phoneNumber}</span>
            </div>
            {'phoneNumberVerified' in user && (
              <span
                aria-label={
                  user.phoneNumberVerified ? 'Téléphone vérifié' : 'Téléphone non vérifié'
                }
              >
                {user.phoneNumberVerified ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </span>
            )}
          </div>
        )}

        {/* Date de création */}
        {'createdAt' in user && user.createdAt && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/60" />
            <span className="text-white">Membre depuis {formatDate(user.createdAt)}</span>
          </div>
        )}

        {/* Informations spécifiques au rôle */}
        {'specializations' in user &&
          user.specializations &&
          user.specializations.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-sm text-white/60">Spécialisations :</p>
              <div className="flex flex-wrap gap-2">
                {user.specializations.map((spec) => (
                  <span key={spec} className="rounded bg-white/10 px-2 py-1 text-xs">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

        {'linkedCountries' in user &&
          user.linkedCountries &&
          user.linkedCountries.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="mb-2 text-sm text-white/60">Pays gérés :</p>
              <div className="flex flex-wrap gap-2">
                {user.linkedCountries.map((country) => (
                  <span
                    key={country.code}
                    className="rounded bg-white/10 px-2 py-1 text-xs"
                  >
                    {country.name}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Statut de vérification global */}
      <div className="mt-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-2">
          {('emailVerified' in user && user.emailVerified) ||
          ('phoneNumberVerified' in user && user.phoneNumberVerified) ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400">Compte vérifié</span>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-yellow-400" />
              <span className="text-sm text-yellow-400">Vérification requise</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
