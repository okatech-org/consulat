'use client';

import { Suspense, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { FileText } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { DocumentType } from '../../../convex/lib/constants';
import { useTranslations } from 'next-intl';
import { useCurrentUser } from '@/hooks/use-current-user';
import { UserDocument } from './user-document';
import type { Doc } from '@/convex/_generated/dataModel';

function DocumentsListContent() {
  const { user } = useCurrentUser();
  const t = useTranslations('services.documents');
  const t_input = useTranslations('inputs.userDocument');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');

  const documents = useQuery(
    api.functions.document.getUserDocuments,
    user?.profileId ? { profileId: user.profileId } : 'skip',
  );

  const totalCount = documents?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value as DocumentType | 'all')}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les documents</SelectItem>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(type as any)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalCount} document{totalCount > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des documents */}
      {!documents || documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Aucun document trouvé</p>
            <p className="text-sm text-muted-foreground">
              {selectedType !== 'all'
                ? "Aucun document de ce type n'a été trouvé."
                : "Vous n'avez pas encore ajouté de documents."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {documents.map((document) => (
            <UserDocument
              key={document._id}
              document={document as Doc<'documents'>}
              label={t_input(`options.${document.type}`)}
              expectedType={document.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DocumentsListClient() {
  return (
    <Suspense fallback={<LoadingSkeleton variant="grid" />}>
      <DocumentsListContent />
    </Suspense>
  );
}
