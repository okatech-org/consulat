'use client';

import { useState, useMemo } from 'react';
import { DocumentType } from '@prisma/client';
import { useDocumentsDashboard } from '@/hooks/use-documents';
import { type DashboardDocument } from '@/server/api/routers/documents';
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

interface DocumentsListClientProps {
  initialData: {
    documents: DashboardDocument[];
    nextCursor: string | undefined;
    totalCount: number;
    hasMore: boolean;
  };
}

const DocumentTypeLabels: Record<DocumentType, string> = {
  PASSPORT: 'Passeport',
  IDENTITY_CARD: "Carte d'identité",
  BIRTH_CERTIFICATE: 'Acte de naissance',
  RESIDENCE_PERMIT: 'Titre de séjour',
  PROOF_OF_ADDRESS: 'Justificatif de domicile',
  MARRIAGE_CERTIFICATE: 'Acte de mariage',
  DEATH_CERTIFICATE: 'Acte de décès',
  DIVORCE_DECREE: 'Acte de divorce',
  NATIONALITY_CERTIFICATE: 'Certificat de nationalité',
  VISA_PAGES: 'Pages de visa',
  EMPLOYMENT_PROOF: "Justificatif d'emploi",
  NATURALIZATION_DECREE: 'Décret de naturalisation',
  IDENTITY_PHOTO: "Photo d'identité",
  CONSULAR_CARD: 'Carte consulaire',
  OTHER: 'Autre',
};

const getDocumentIcon = (type: DocumentType, fileType: string) => {
  if (fileType.startsWith('image/')) {
    return <Image className="h-4 w-4" />;
  }
  if (fileType === 'application/pdf') {
    return <FileText className="h-4 w-4" />;
  }
  return <File className="h-4 w-4" />;
};

const getStatusColor = (status: 'PENDING' | 'VALIDATED' | 'REJECTED') => {
  switch (status) {
    case 'VALIDATED':
      return 'default';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export function DocumentsListClient({ initialData }: DocumentsListClientProps) {
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useDocumentsDashboard({
      limit: 20,
      type: selectedType !== 'all' ? selectedType : undefined,
    });

  // Utiliser les données initiales ou les données de la query
  const documents = useMemo(() => {
    if (data?.pages) {
      return data.pages.flatMap((page) => page.documents);
    }
    return initialData.documents;
  }, [data?.pages, initialData.documents]);

  const totalCount = data?.pages?.[0]?.totalCount ?? initialData.totalCount;

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
              {Object.entries(DocumentTypeLabels).map(([type, label]) => (
                <SelectItem key={type} value={type}>
                  {label}
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
          {documents.map((doc) => {
            const fileName =
              doc.metadata &&
              typeof doc.metadata === 'object' &&
              'name' in doc.metadata &&
              typeof doc.metadata.name === 'string'
                ? doc.metadata.name
                : `Document ${doc.type}`;
            const fileSize =
              doc.metadata &&
              typeof doc.metadata === 'object' &&
              'size' in doc.metadata &&
              typeof doc.metadata.size === 'number'
                ? `${Math.round(doc.metadata.size / 1024)} KB`
                : null;

            return (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.type, doc.fileType)}
                      <span className="font-medium text-sm">
                        {DocumentTypeLabels[doc.type]}
                      </span>
                    </div>
                    <Badge variant={getStatusColor(doc.status)}>
                      {doc.status === 'VALIDATED'
                        ? 'Validé'
                        : doc.status === 'REJECTED'
                          ? 'Rejeté'
                          : 'En attente'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="py-2">
                  <p className="text-sm font-medium truncate" title={fileName}>
                    {fileName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
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
                      onClick={() => handlePreview(doc.fileUrl)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownload(doc.fileUrl, fileName)}
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
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              'Charger plus'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
