'use client';

import { UserDocument } from '@/components/user-document';
import { DocumentType } from '@prisma/client';
import { useState } from 'react';
import { AppUserDocument } from '@/types';
import { Button } from '@/components/ui/button';

export default function TestImageEditorPage() {
  const [document1, setDocument1] = useState<AppUserDocument | null>(null);
  const [document2, setDocument2] = useState<AppUserDocument | null>(null);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">
        Test de l&apos;éditeur de photo d&apos;identité
      </h1>

      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-800">
          Notre nouvel éditeur permet maintenant de recadrer les photos en cercle, idéal
          pour les photos d&apos;identité. Essayez de télécharger une photo ci-dessous
          pour tester les différentes options !
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 border p-4 rounded-md">
          <h2 className="text-xl font-semibold">
            Photo d&apos;identité avec recadrage circulaire
          </h2>
          <UserDocument
            label="Photo d'identité"
            description="Téléchargez votre photo d'identité. Le recadrage circulaire sera automatiquement activé."
            expectedType={DocumentType.IDENTITY_PHOTO}
            document={document1}
            onUpload={(doc) => setDocument1(doc)}
            onDelete={() => setDocument1(null)}
            enableEditor={true}
            aspectRatio="1/1"
          />
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h2 className="text-xl font-semibold">Document avec recadrage rectangulaire</h2>
          <UserDocument
            label="Photo au format 16/9"
            description="Pour les photos de paysage, nous utilisons un format 16/9."
            expectedType={DocumentType.OTHER}
            document={document2}
            onUpload={(doc) => setDocument2(doc)}
            onDelete={() => setDocument2(null)}
            enableEditor={true}
            aspectRatio="16/9"
          />
        </div>

        <div className="space-y-4 border p-4 rounded-md">
          <h2 className="text-xl font-semibold">Document sans éditeur (comparaison)</h2>
          <UserDocument
            label="Document standard"
            description="Téléchargement standard sans éditeur d'image."
            expectedType={DocumentType.OTHER}
            document={null}
            enableEditor={false}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button onClick={() => window.location.reload()} variant="outline">
          Réinitialiser les tests
        </Button>
      </div>
    </div>
  );
}
