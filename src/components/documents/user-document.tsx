'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { BadgeCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Form } from '@/components/ui/form';
import { Controller, useForm } from 'react-hook-form';
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataForm } from '@/components/documents/metadata-form';
import { FileInput } from '../ui/file-input';
import { FileDisplay } from '../ui/file-display';
import { ImageCropper } from '../ui/image-cropper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DocumentValidationDialog } from '@/components/profile/document-validation-dialog';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { hasAnyRole } from '@/lib/permissions/utils';
import { toast } from 'sonner';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import {
  DocumentStatus,
  DocumentType,
  OwnerType,
  UserRole,
} from '@/convex/lib/constants';
import { useFile } from '@/hooks/use-file';

interface UserDocumentProps {
  document?: Doc<'documents'>;
  expectedType?: DocumentType;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  allowEdit?: boolean;
  accept?: string;
  onUpload?: (doc: Doc<'documents'>) => void;
  onDelete?: () => void;
  noFormLabel?: boolean;
  enableEditor?: boolean;
  enableBackgroundRemoval?: boolean;
  requestId?: string;
  profileId?: Id<'profiles'> | Id<'childProfiles'>;
  ownerType?: OwnerType;
}

const updateDocumentSchema = z.object({
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
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
          src="https://greedy-horse-339.convex.cloud/api/storage/0fb75612-4c0a-4d53-866d-d9038e43161d"
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
  expectedType = DocumentType.Other,
  required = false,
  disabled = false,
  allowEdit = true,
  accept = 'image/*,application/pdf',
  enableEditor = false,
  enableBackgroundRemoval = false,
  requestId,
  profileId,
  ownerType,
  onUpload,
  onDelete,
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
  const [processedImageUrl, setProcessedImageUrl] = React.useState<string | null>(null);
  const [processedFile, setProcessedFile] = React.useState<File | null>(null);
  const [showProcessedImageDialog, setShowProcessedImageDialog] = React.useState(false);

  const router = useRouter();
  const { handleFileUpload } = useFile();

  const updateDocumentMutation = useMutation(api.functions.document.updateUserDocument);
  const createUserDocumentMutation = useMutation(
    api.functions.document.createUserDocument,
  );
  const replaceUserDocumentFileMutation = useMutation(
    api.functions.document.replaceUserDocumentFile,
  );
  const deleteUserDocumentMutation = useMutation(
    api.functions.document.deleteUserDocument,
  );

  // Check if user has admin role
  const hasAdminRole = React.useMemo(() => {
    const adminRoles = [
      UserRole.Admin,
      UserRole.Agent,
      UserRole.SuperAdmin,
      UserRole.Manager,
    ];
    return user?.roles?.some((role) => adminRoles.includes(role));
  }, [user]);

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

  if (!user) {
    return null;
  }

  const handleUpdate = async (documentId: Id<'documents'>, data: UpdateDocumentData) => {
    setIsLoading(true);

    try {
      const result = await updateDocumentMutation({
        documentId,
        issuedAt: data.issuedAt ? new Date(data.issuedAt).getTime() : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).getTime() : undefined,
        metadata: data.metadata,
      });

      // If onUpload is provided, we should ideally refresh the doc or pass the result
      // But for now we just notify success and refresh
      if (onUpload && typeof result === 'object') {
        onUpload(result as Doc<'documents'>);
      }

      toast.success(t_messages('success.update_title'));
      router.refresh();
    } catch (error) {
      toast.error(
        t_errors(
          error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelection = async (file: File) => {
    if (!enableEditor || !file.type.startsWith('image/')) {
      await handleUploadAndCreateDocument(file);
      return;
    }

    setTempImageUrl(URL.createObjectURL(file));
    setCropperOpen(true);
  };

  const handleUploadAndCreateDocument = async (file: File) => {
    setIsLoading(true);

    try {
      const uploadResult = await handleFileUpload(file);

      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      const targetOwnerId = document?.ownerId ?? profileId ?? user.profileId;
      const targetOwnerType = ownerType ?? OwnerType.Profile;

      if (!targetOwnerId) {
        throw new Error('Owner ID not found');
      }

      const result = await createUserDocumentMutation({
        type: expectedType,
        storageId: uploadResult.storageId,
        fileType: uploadResult.type,
        fileName: uploadResult.name,
        ownerId: targetOwnerId,
        ownerType: targetOwnerType,
        issuedAt: undefined,
        expiresAt: undefined,
        metadata: {
          requestId,
        },
      });

      if (onUpload && typeof result === 'object') {
        onUpload(result as Doc<'documents'>);
      }

      toast.success(t_messages('success.update_title'));
      router.refresh();
    } catch (error) {
      toast.error(
        t_errors(error instanceof Error ? error.message : "Erreur lors de l'upload"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceFile = async (file: File) => {
    setIsLoading(true);
    try {
      if (!document) {
        throw new Error('Document not found');
      }

      const uploadResult = await handleFileUpload(file);

      if (!uploadResult) {
        throw new Error('Upload failed');
      }

      const result = await replaceUserDocumentFileMutation({
        documentId: document._id,
        storageId: uploadResult.storageId,
        fileType: uploadResult.type,
        fileName: uploadResult.name,
      });

      if (onUpload && typeof result === 'object') {
        onUpload(result as Doc<'documents'>);
      }

      toast.success(t_messages('success.update_title'));
      router.refresh();
    } catch (error) {
      toast.error(
        t_errors(error instanceof Error ? error.message : 'Erreur lors du remplacement'),
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setCropperOpen(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }

    await handleUploadAndCreateDocument(croppedFile);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl(null);
    }
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

  // Gérer la validation de l'image traitée
  const handleValidateProcessedImage = async () => {
    if (!processedFile) return;

    try {
      setIsLoading(true);
      if (document?._id) {
        await handleReplaceFile(processedFile);
        toast.success("L'arrière-plan a été supprimé et le document mis à jour.");
      } else {
        await handleUploadAndCreateDocument(processedFile);
        toast.success("L'image avec arrière-plan supprimé a été sauvegardée.");
      }

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

  // Gestionnaire de suppression de fichier
  const handleDeleteFile = async () => {
    if (!document?._id) return;

    try {
      setIsLoading(true);

      // Supprimer le document utilisateur (supprime aussi le fichier associé)
      await deleteUserDocumentMutation({
        documentId: document._id,
      });

      if (onDelete) onDelete();
      toast.success(t_messages('success.deleted'));
      router.refresh();
    } catch (error) {
      toast.error(
        t_errors(
          error instanceof Error ? error.message : 'Erreur lors de la suppression',
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-auto space-y-2">
      <div>
        <div className="font-medium">
          <span className="text-sm">
            {label}
            {required && <span className="text-xs">{' (Obligatoire)'}</span>}
          </span>
          {document?.status &&
            hasAnyRole(user, [UserRole.Admin, UserRole.Agent, UserRole.SuperAdmin]) &&
            getStatusBadge(document.status)}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>

      <div className={`relative max-w-full ${hasAdminRole ? 'mb-[3.5rem]' : ''}`}>
        {document?.fileUrl && (
          <div className="mb-4">
            <FileDisplay
              fileUrl={document.fileUrl}
              fileName={document.fileName}
              fileType={document.fileType}
              status={document.status}
              variant="card"
              className={
                document.type === DocumentType.IdentityPhoto
                  ? 'aspect-square w-full max-w-[250px]'
                  : 'aspect-document w-full max-w-[250px]'
              }
              showActions={allowEdit}
              onDelete={
                allowEdit
                  ? () => {
                      // Gestionnaire de suppression
                      handleDeleteFile();
                    }
                  : undefined
              }
            />
          </div>
        )}

        {!document?.fileUrl && (
          <FileInput
            onChangeAction={handleFileSelection}
            accept={accept}
            disabled={isLoading}
            loading={isLoading}
            fileUrl={document?.fileUrl}
            fileType={document?.fileType}
            showPreview={!document?.storageId} // Ne pas montrer l'aperçu si on a déjà un fichier
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
        )}

        {document && hasAdminRole && (
          <div className="absolute left-0 bottom-0 translate-y-[120%] flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsUpdating(true)}
              disabled={disabled || isLoading}
            >
              <BadgeCheck className="size-icon" />
            </Button>
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
                  <FieldGroup>
                    <Controller
                      name="issuedAt"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="document-issued-at">
                            {t('dates.issued_on')}
                          </FieldLabel>
                          <Input
                            id="document-issued-at"
                            type="date"
                            {...field}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                    <Controller
                      name="expiresAt"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor="document-expires-at">
                            {t('dates.expires_on')}
                          </FieldLabel>
                          <Input
                            id="document-expires-at"
                            type="date"
                            {...field}
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                      )}
                    />
                  </FieldGroup>
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
                  metadata={document.metadata ?? null}
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
