'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Info, UploadIcon } from 'lucide-react';
import { tryCatch } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { AppUserDocument } from '@/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserDocument,
  replaceUserDocumentFile,
  updateUserDocument,
} from '@/actions/user-documents';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataForm } from '@/components/documents/metadata-form';
import { FileInput } from '../ui/file-input';
import { type FileUploadResponse, uploadFileFromClient } from '../ui/uploadthing';
import { ImageCropper } from '../ui/image-cropper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DocumentValidationDialog } from '@/components/profile/document-validation-dialog';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { hasAnyRole } from '@/lib/permissions/utils';
import { toast } from 'sonner';
import type { Doc } from '@/convex/_generated/dataModel';
import { DocumentStatus, DocumentType } from '@/convex/lib/constants';

interface UserDocumentProps {
  document?: Doc<'documents'>;
  expectedType?: DocumentType;
  profileId?: string;
  userId?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  allowEdit?: boolean;
  accept?: string;
  onUpload?: (doc: AppUserDocument) => void;
  onDelete?: () => void;
  noFormLabel?: boolean;
  enableEditor?: boolean;
  enableBackgroundRemoval?: boolean;
  requestId?: string;
}

const updateDocumentSchema = z.object({
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

type UpdateDocumentData = z.infer<typeof updateDocumentSchema>;

const IdentityPhotoGuide: React.FC = () => {
  const t = useTranslations('common.documents.identity_photo');

  return (
    <div className="space-y-3 mb-2">
      <Separator />
      <p className="text-sm font-medium flex items-center gap-1">
        <Info className="size-icon" />
        {t('guide.title')}
      </p>
      <div className="flex flex-row gap-2 items-start">
        <Image
          src="https://rbvj2i3urx.ufs.sh/f/H4jCIhEWEyOiB29qVyt5qRMswJpEe8lhArUQm0gdH6X7ONZL"
          alt={t('guide.example_alt')}
          width={96}
          height={96}
          className="object-cover aspect-square rounded-full"
          unoptimized
        />
        <ul className="text-xs space-y-1 list-disc pl-5">
          <li>{t('guide.face_centered')}</li>
          <li>{t('guide.neutral_expression')}</li>
          <li>{t('guide.no_head_covering')}</li>
          <li>{t('guide.eyes_visible')}</li>
          <li>{t('guide.background_color')}</li>
        </ul>
      </div>
    </div>
  );
};

export function UserDocument({
  document,
  label,
  description,
  profileId,
  userId,
  expectedType = DocumentType.Other,
  required = false,
  disabled = false,
  allowEdit = true,
  accept = 'image/*,application/pdf',
  onUpload,
  enableEditor = false,
  enableBackgroundRemoval = false,
  requestId,
}: UserDocumentProps) {
  const { user } = useCurrentUser();
  const t_errors = useTranslations('messages.errors');
  const t = useTranslations('common.documents');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages.profile');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [tempImageUrl, setTempImageUrl] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isReplacing, setIsReplacing] = React.useState(false);
  const [replaceFile, setReplaceFile] = React.useState<File | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = React.useState<string | null>(null);
  const [processedFile, setProcessedFile] = React.useState<File | null>(null);
  const [showProcessedImageDialog, setShowProcessedImageDialog] = React.useState(false);
  const router = useRouter();

  // Check if user has admin role
  const hasAdminRole = React.useMemo(() => {
    const adminRoles = ['ADMIN', 'AGENT', 'SUPER_ADMIN', 'MANAGER'];
    return user?.roles?.some((role) => adminRoles.includes(role));
  }, [user]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (documentId: string, data: any) => {
    setIsLoading(true);

    const { error, data: updatedDocument } = await tryCatch(
      updateUserDocument(documentId, data),
    );

    if (error) {
      toast.error(t_errors(error.message));
    }

    if (updatedDocument) {
      onUpload?.(updatedDocument);

      toast.success(t_messages('success.update_title'));

      if (onUpload) {
        onUpload(updatedDocument);
      }

      router.refresh();
    }

    setIsLoading(false);
  };

  const form = useForm<UpdateDocumentData>({
    resolver: zodResolver(updateDocumentSchema),
    defaultValues: {
      issuedAt: document?.issuedAt
        ? format(new Date(document.issuedAt), 'yyyy-MM-dd')
        : undefined,
      expiresAt: document?.expiresAt
        ? format(new Date(document.expiresAt), 'yyyy-MM-dd')
        : undefined,
      metadata: document?.metadata,
    },
  });

  const handleFileChange = async (fileData: FileUploadResponse) => {
    setIsLoading(true);

    const data = {
      id: fileData.key,
      type: expectedType,
      fileUrl: fileData.serverData.fileUrl,
      fileType: fileData.type,
      userId: userId ?? '',
      requestId,
      ...(profileId && {
        profileId,
      }),
    };

    const result = await tryCatch(createUserDocument(data));

    if (result.error) {
      toast.error(t_errors(result.error.message));
      setIsLoading(false);
      return;
    }

    if (result.data) {
      if (onUpload) {
        onUpload(result.data);
      } else {
        toast.success(t_messages('success.update_title'));
      }

      setIsLoading(false);
      router.refresh();
    }

    setIsLoading(false);
  };

  const handleFileSelection = async (file: File) => {
    // If image editor is not enabled, proceed with direct upload
    if (!enableEditor || !file.type.startsWith('image/')) {
      await handleFileUpload(file);
      return;
    }

    // For images when editor is enabled, prepare for cropping
    setTempImageUrl(URL.createObjectURL(file));
    setCropperOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);

    const uploadResult = await tryCatch(uploadFileFromClient(file));

    if (uploadResult.error) {
      toast.error(t_errors(uploadResult.error.message));
      console.error(uploadResult.error);
      setIsLoading(false);
      return;
    }

    if (uploadResult.data) {
      await handleFileChange(uploadResult.data[0] as FileUploadResponse);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropperOpen(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    if (replaceFile) {
      await handleReplaceFile(croppedFile);
      setReplaceFile(null);
    } else {
      await handleFileUpload(croppedFile);
    }
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
    setReplaceFile(null);
  };

  const onUpdate = async (data: UpdateDocumentData) => {
    if (!document) return;

    try {
      await handleUpdate(document._id, data);
      setIsUpdating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<DocumentStatus, 'default' | 'destructive' | 'warning'> = {
      pending: 'warning',
      validated: 'default',
      rejected: 'destructive',
      expired: 'destructive',
      expiring: 'warning',
    };
    return (
      <Badge className={'min-w-max ml-2'} variant={variants[status as DocumentStatus]}>
        {t_common(`status.${status}`)}
      </Badge>
    );
  };

  const handleReplaceFile = async (file: File) => {
    setIsLoading(true);
    try {
      // Upload du fichier (réutilise la logique d'upload existante)
      const uploadResult = await tryCatch(uploadFileFromClient(file));
      if (uploadResult.error) {
        toast.error(t_errors(uploadResult.error.message));
        console.error(uploadResult.error);
        setIsLoading(false);
        return;
      }
      if (uploadResult.data && document) {
        const uploaded = uploadResult.data[0] as FileUploadResponse;
        // Appel de l'action serveur pour remplacer le fichier
        const { error, data: updatedDoc } = await tryCatch(
          replaceUserDocumentFile(
            document._id,
            uploaded.serverData.fileUrl,
            uploaded.type,
          ),
        );
        if (error) {
          toast.error(t_errors(error.message));
        } else if (updatedDoc) {
          toast.success(t_messages('success.update_title'));
          onUpload?.(updatedDoc);
          router.refresh();
        }
      }
    } finally {
      setIsLoading(false);
      setIsReplacing(false);
    }
  };

  // Refactored: handle file selection for replace (reupload)
  const handleReplaceFileSelection = async (file: File) => {
    if (!enableEditor || !file.type.startsWith('image/')) {
      await handleReplaceFile(file);
      return;
    }
    setReplaceFile(file);
    setTempImageUrl(URL.createObjectURL(file));
    setCropperOpen(true);
  };

  // Gérer la validation de l'image traitée
  const handleValidateProcessedImage = async () => {
    if (!processedFile) return;

    try {
      setIsLoading(true);
      if (document?._id) {
        // Si le document existe déjà, le remplacer
        await handleReplaceFile(processedFile);
        toast.success("L'arrière-plan a été supprimé et le document mis à jour.");
      } else {
        // Si pas de document existant, créer un nouveau document
        await handleFileUpload(processedFile);
        toast.success("L'image avec arrière-plan supprimé a été sauvegardée.");
      }

      // Fermer la modale et nettoyer
      setShowProcessedImageDialog(false);
      setProcessedImageUrl(null);
      setProcessedFile(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'image traitée:", error);
      toast.error("Impossible de sauvegarder l'image traitée.");
    } finally {
      setIsLoading(false);
    }
  };

  // Annuler la validation de l'image traitée
  const handleCancelProcessedImage = () => {
    setShowProcessedImageDialog(false);
    if (processedImageUrl) {
      URL.revokeObjectURL(processedImageUrl);
    }
    setProcessedImageUrl(null);
    setProcessedFile(null);
  };

  return (
    <div className="relative w-full h-auto space-y-2 mb-12">
      <div>
        <div className="font-medium">
          <span>
            {label}
            {required && <span className="text-sm">{' (Obligatoire)'}</span>}
          </span>
          {document?.status &&
            hasAnyRole(user, ['ADMIN', 'AGENT', 'SUPER_ADMIN']) &&
            getStatusBadge(document.status)}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className={'relative w-full'}>
        <FileInput
          onChangeAction={handleFileSelection}
          accept={accept}
          disabled={isLoading}
          loading={isLoading}
          fileUrl={document?.fileUrl}
          fileType={document?.fileType}
          showPreview={true}
          enableBackgroundRemoval={enableBackgroundRemoval}
          onProcessedImageChange={async (processedUrl) => {
            if (processedUrl) {
              try {
                // Convertir l'URL data en File
                const response = await fetch(processedUrl);
                const blob = await response.blob();
                const file = new File([blob], `${label}-bg-removed.png`, {
                  type: 'image/png',
                });

                // Stocker l'image et le fichier pour la modale de confirmation
                setProcessedImageUrl(processedUrl);
                setProcessedFile(file);
                setShowProcessedImageDialog(true);
              } catch (error) {
                console.error("Erreur lors du traitement de l'image:", error);
                toast.error("Impossible de traiter l'image.");
              }
            }
          }}
        />

        {document && (
          <div className="absolute right-0 bottom-0 translate-y-[120%] flex items-center gap-1">
            {allowEdit && (
              <Button
                variant="link"
                size="sm"
                className="ml-2"
                onClick={() => setIsReplacing(true)}
                disabled={isLoading || disabled}
                leftIcon={<UploadIcon className="size-icon" />}
              >
                {t_common('upload.actions.reupload')}
              </Button>
            )}

            {hasAdminRole && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDialogOpen(true)}
                  disabled={disabled || isLoading}
                  leftIcon={<CheckCircle2 className="size-icon" />}
                >
                  <span>Validation</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Cropper Dialog */}
      {tempImageUrl && (
        <ImageCropper
          fileName={`${document?.type}-${document?._id ?? ''}`}
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={cropperOpen}
          guide={
            expectedType === DocumentType.IdentityPhoto ? (
              <IdentityPhotoGuide />
            ) : undefined
          }
        />
      )}

      {/* Dialog de mise à jour */}
      <Dialog open={isUpdating} onOpenChange={setIsUpdating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('update.title')}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="dates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dates">{t('update.tabs.dates')}</TabsTrigger>
              <TabsTrigger value="metadata">{t('update.tabs.metadata')}</TabsTrigger>
            </TabsList>
            <TabsContent value="dates">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="issuedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dates.issued_on')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('dates.expires_on')}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsUpdating(false)}
                    >
                      {t('actions.cancel')}
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {t('actions.save')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value="metadata">
              {document && (
                <MetadataForm
                  documentType={document.type as DocumentType}
                  metadata={document.metadata}
                  onSubmit={async (metadata) => {
                    await handleUpdate(document._id, { metadata });
                    setIsUpdating(false);
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Document Validation Dialog */}
      {isDialogOpen && document && (
        <DocumentValidationDialog
          documentId={document?._id}
          documentType={label}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onValidated={() => {
            router.refresh();
          }}
        />
      )}

      {/* FileInput pour le remplacement (dialog simple) */}
      {isReplacing && (
        <Dialog open={isReplacing} onOpenChange={setIsReplacing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t_common('upload.actions.reupload')}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <FileInput
                onChangeAction={handleReplaceFileSelection}
                accept={accept}
                disabled={isLoading}
                loading={isLoading}
                fileUrl={undefined}
                fileType={undefined}
                showPreview={false}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReplacing(false)}
              >
                {t('actions.cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modale de confirmation pour l'image traitée */}
      <Dialog open={showProcessedImageDialog} onOpenChange={setShowProcessedImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;image traitée</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Voici le résultat de la suppression d&apos;arrière-plan. Voulez-vous
              remplacer votre document avec cette image ?
            </p>

            {processedImageUrl && (
              <div className="border rounded-lg overflow-hidden">
                <div className="relative aspect-square w-full max-w-sm mx-auto">
                  <Image
                    src={processedImageUrl}
                    alt="Image avec arrière-plan supprimé"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelProcessedImage}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleValidateProcessedImage}
              disabled={isLoading}
            >
              {isLoading ? 'Sauvegarde...' : 'Valider et remplacer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
