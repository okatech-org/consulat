'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { Save, X, Check, Loader2 } from 'lucide-react';

export function UserProfileEditor() {
  const utils = api.useUtils();
  const { data: user } = api.user.getCurrentUser.useQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const updateProfile = api.user.updateProfile.useMutation({
    // Mutation optimiste
    onMutate: async (newData) => {
      // Annuler les refetch en cours pour éviter les conflits
      await utils.user.getCurrentUser.cancel();

      // Snapshot des données actuelles
      const previousUser = utils.user.getCurrentUser.getData();

      // Mise à jour optimiste
      utils.user.getCurrentUser.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          ...newData,
        };
      });

      // Retourner le contexte pour rollback si nécessaire
      return { previousUser };
    },
    // Si erreur, restaurer les données précédentes
    onError: (err, newData, context) => {
      if (context?.previousUser) {
        utils.user.getCurrentUser.setData(undefined, context.previousUser);
      }
    },
    // Toujours refetch après pour s'assurer de la synchronisation
    onSettled: () => {
      void utils.user.getCurrentUser.invalidate();
    },
    onSuccess: () => {
      setIsEditing(false);
    },
  });

  const handleEdit = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const updates: { name?: string; email?: string } = {};
    if (name && name !== user?.name) updates.name = name;
    if (email && email !== user?.email) updates.email = email;

    if (Object.keys(updates).length > 0) {
      updateProfile.mutate(updates);
    } else {
      setIsEditing(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-md rounded-xl bg-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-bold">Modifier le profil</h3>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition hover:bg-white/20"
          >
            Modifier
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm text-white/70">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none focus:bg-white/20"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-white/70">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none focus:bg-white/20"
              placeholder="votre@email.com"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {updateProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Enregistrer
                </>
              )}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 transition hover:bg-white/20 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              Annuler
            </button>
          </div>

          {updateProfile.isError && (
            <div className="rounded-lg bg-red-500/20 p-3 text-sm text-red-300">
              Erreur lors de la mise à jour du profil
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/70">Nom</p>
            <p className="font-medium">{user.name || 'Non défini'}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Email</p>
            <p className="font-medium">{user.email || 'Non défini'}</p>
          </div>
        </div>
      )}

      {updateProfile.isSuccess && !isEditing && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/20 p-3 text-sm text-green-300">
          <Check className="h-4 w-4" />
          Profil mis à jour avec succès
        </div>
      )}
    </div>
  );
}
