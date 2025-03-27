'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { PenIcon, Trash, Shield, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn, tryCatch, useDateLocale } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AppUserDocument } from '@/types';
import { DocumentStatus, DocumentType } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserDocument,
  deleteUserDocument,
  updateUserDocument,
  checkDocumentExists,
} from '@/actions/user-documents';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataForm } from '@/components/metadata-form';
import { toast } from '@/hooks/use-toast';
import { FileInput } from './ui/file-input';
import { FileUploadResponse, uploadFileFromClient } from './ui/uploadthing';
import { ImageCropper } from './ui/image-cropper';
import { useCurrentUser } from '@/hooks/use-current-user';
import { DocumentValidationDialog } from '@/app/(authenticated)/dashboard/(admin)/_utils/components/profile/document-validation-dialog';
import { validateDocument } from '@/lib/document-validation';

interface UserDocumentProps {
  document?: AppUserDocument | null;
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
  aspectRatio?: string;
  requestId?: string;
}

const updateDocumentSchema = z.object({
  issuedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  metadata: z.record(z.string(), z.any()).nullable().optional(),
});

type UpdateDocumentData = z.infer<typeof updateDocumentSchema>;

export function UserDocument({
  document,
  label,
  description,
  profileId,
  userId,
  expectedType = DocumentType.OTHER,
  required = false,
  disabled = false,
  allowEdit = true,
  accept = 'image/*,application/pdf',
  onDelete,
  onUpload,
  enableEditor = false,
  aspectRatio = '1',
  requestId,
}: UserDocumentProps) {
  const user = useCurrentUser();
  const t_errors = useTranslations('messages.errors');
  const t = useTranslations('common.documents');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages.profile');
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [cropperOpen, setCropperOpen] = React.useState(false);
  const [tempImageUrl, setTempImageUrl] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const router = useRouter();
  const { formatDate } = useDateLocale();

  // Check if user has admin role
  const hasAdminRole = React.useMemo(() => {
    const adminRoles = ['ADMIN', 'AGENT', 'SUPER_ADMIN'];
    return user?.roles?.some((role) => adminRoles.includes(role));
  }, [user]);

  // Validate document
  const validation = React.useMemo(() => {
    if (!document) {
      return {
        isValid: !required,
        errors: required ? ['required_document'] : [],
      };
    }
    return validateDocument(document, required);
  }, [document, required]);

  // Parse the aspectRatio prop to a number
  const aspectRatioNumber = React.useMemo(() => {
    if (!aspectRatio) return 1;
    const [width, height] = aspectRatio.split(':');
    return width && height ? parseFloat(width) / parseFloat(height) : 1;
  }, [aspectRatio]);

  const handleDelete = async (documentId: string) => {
    setIsLoading(true);

    try {
      // Vérifier d'abord si le document existe
      const documentExists = await checkDocumentExists(documentId);
      if (!documentExists) {
        // Mettre à jour l'interface sans appeler l'API
        onDelete?.();
        toast({
          title: t_common('status.DELETED'),
          description: t_errors('document_already_deleted'),
          variant: 'default',
        });
        setIsLoading(false);
        return;
      }

      // Si le document existe, procéder à la suppression
      const result = await tryCatch(deleteUserDocument(documentId, requestId));

      if (result.data) {
        onDelete?.();
      }

      if (result.error) {
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: t_messages('errors.update_failed'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdate = async (documentId: string, data: any) => {
    setIsLoading(true);

    const { error, data: updatedDocument } = await tryCatch(
      updateUserDocument(documentId, data),
    );

    if (error) {
      toast({
        title: t_messages('success.update_title'),
        description: t_errors(error.message),
        variant: 'destructive',
      });
    }

    if (updatedDocument) {
      onUpload?.(updatedDocument);

      toast({
        title: t_messages('success.update_title'),
        description: t_messages('success.update_description'),
        variant: 'success',
      });

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
      toast({
        title: t_messages('errors.update_failed'),
        description: t_errors(result.error.message),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (result.data) {
      if (onUpload) {
        onUpload(result.data);
      } else {
        toast({
          title: t_messages('success.update_title'),
          description: t_messages('success.update_description'),
          variant: 'success',
        });
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
      toast({
        title: t_messages('errors.update_failed'),
        description: t_errors(uploadResult.error.message),
        variant: 'destructive',
      });
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

    await handleFileUpload(croppedFile);
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
      await handleUpdate(document.id, data);
      setIsUpdating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<
      DocumentStatus,
      'default' | 'success' | 'destructive' | 'warning'
    > = {
      PENDING: 'warning',
      VALIDATED: 'success',
      REJECTED: 'destructive',
      EXPIRED: 'destructive',
      EXPIRING: 'warning',
    };
    return (
      <Badge className={'min-w-max ml-2'} variant={variants[status]}>
        {t_common(`status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="mb-2 space-y-4 relative w-full h-auto overflow-hidden">
      <div className="flex flex-col gap-1">
        <div className="font-medium text-normal mb-1">
          <span>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </span>
          {document?.status && getStatusBadge(document.status)}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className={cn('relative', 'w-full')}>
        <FileInput
          onChangeAction={handleFileSelection}
          accept={accept}
          disabled={isLoading}
          loading={isLoading}
          fileUrl={document?.fileUrl}
          fileType={document?.fileType}
          showPreview={true}
        />

        {document && (
          <div className="absolute right-1 top-1 flex items-center gap-2">
            {allowEdit && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsUpdating(true)}
                disabled={disabled || isLoading}
              >
                <PenIcon className="size-4" />
              </Button>
            )}
            {hasAdminRole && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                disabled={disabled || isLoading}
              >
                <CheckCircle2 className="size-4" />
                <span className="sr-only">Valider</span>
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(document.id)}
              disabled={disabled || isLoading}
            >
              <Trash className="size-icon" />
            </Button>
          </div>
        )}

        {document && (
          <div className="flex flex-1 flex-col justify-end space-y-1 pt-4 text-sm text-muted-foreground">
            {(document.issuedAt || document.expiresAt) && (
              <p>
                {t('validity', {
                  start: document.issuedAt ? formatDate(document.issuedAt) : 'N/A',
                  end: document.expiresAt ? formatDate(document.expiresAt) : 'N/A',
                })}
              </p>
            )}
            {document.metadata && (
              <div>
                {Object.entries(document.metadata).map(([key, value]) => (
                  <p key={key}>
                    {/** @ts-expect-error - key is a string */}
                    {t(`metadata.${key}`)}: {`${value}`}
                  </p>
                ))}
              </div>
            )}
            {/* Display validation status for all users */}
            <div className="flex items-center gap-2 mt-2">
              {validation.isValid ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="size-4" />
                  {t_common('status.VALIDATED')}
                </span>
              ) : (
                <span className="text-warning flex items-center gap-1">
                  <AlertTriangle className="size-4" />
                  {validation.errors.join(', ')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Image Cropper Dialog */}
      {tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          aspectRatio={aspectRatioNumber}
          circularCrop={true}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={cropperOpen}
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
                  documentType={document.type}
                  metadata={document.metadata}
                  onSubmit={async (metadata) => {
                    await handleUpdate(document.id, { metadata });
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
          documentId={document?.id}
          documentType={label}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onValidated={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
