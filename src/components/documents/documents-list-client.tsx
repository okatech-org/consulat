'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Eye, Download, FileText, Image, File, Loader2 } from 'lucide-react';
import { usePaginatedQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { DocumentType, DocumentStatus } from '../../../convex/lib/constants';
import type { Doc } from '../../../convex/_generated/dataModel';
import { useTranslations } from 'next-intl';

type DocumentWithUrl = Omit<Doc<'documents'>, 'fileUrl'> & {
  fileUrl?: string | null;
};

const getDocumentIcon = (type: string, fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  if (fileType === 'application/pdf') {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case DocumentStatus.Validated:
      return 'default';
    case DocumentStatus.Rejected:
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function DocumentsListClient() {
  const t = useTranslations('services.documents');
  const tStatus = useTranslations('documents.status');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');

  // Requête paginée avec Convex
  const { results, status, loadMore } = usePaginatedQuery(
    api.functions.document.getUserDocumentsPaginated,
    {
      type: selectedType !== 'all' ? (selectedType as any) : undefined,
      status: undefined,
    },
    { initialNumItems: 20 },
  );

  // Utiliser directement les résultats de Convex
  const documents = results;
  const totalCount = documents.length;
  const isLoading = status === 'LoadingFirstPage';

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handlePreview = (url: string) => {
    window.open(url, '_blank');
  };

  if (isLoading) {
    return <LoadingSkeleton variant="grid" />;
  }

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
      {documents.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc: DocumentWithUrl) => {
            const fileName =
              doc.metadata &&
              typeof doc.metadata === 'object' &&
              'name' in doc.metadata &&
              typeof doc.metadata.name === 'string'
                ? doc.metadata.name
                : doc.fileName || `Document ${doc.type}`;
            const fileSize = doc.fileSize
              ? `${Math.round(doc.fileSize / 1024)} KB`
              : doc.metadata &&
                  typeof doc.metadata === 'object' &&
                  'size' in doc.metadata &&
                  typeof doc.metadata.size === 'number'
                ? `${Math.round(doc.metadata.size / 1024)} KB`
                : null;

            return (
              <Card key={doc._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type, doc.fileType)}
                      <span className="font-medium text-sm">{t(doc.type as any)}</span>
                    </div>
                    <Badge variant={getStatusColor(doc.status)}>
                      {doc.status === DocumentStatus.Validated
                        ? tStatus('validated')
                        : doc.status === DocumentStatus.Rejected
                          ? tStatus('rejected')
                          : tStatus('pending')}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="py-2">
                  <p className="text-sm font-medium truncate" title={fileName}>
                    {fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(doc._creationTime).toLocaleDateString('fr-FR')}</span>
                    {fileSize && (
                      <>
                        <span>•</span>
                        <span>{fileSize}</span>
                      </>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <div className="flex gap-2 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => doc.fileUrl && handlePreview(doc.fileUrl)}
                      disabled={!doc.fileUrl}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => doc.fileUrl && handleDownload(doc.fileUrl, fileName)}
                      disabled={!doc.fileUrl}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bouton charger plus */}
      {status === 'CanLoadMore' && (
        <div className="flex justify-center">
          <Button onClick={() => loadMore(20)} variant="outline">
            Charger plus
          </Button>
        </div>
      )}
      {status === 'LoadingMore' && (
        <div className="flex justify-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Chargement...</span>
        </div>
      )}
    </div>
  );
}
