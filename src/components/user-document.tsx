'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { X, Eye, PenIcon } from 'lucide-react';
import { cn, tryCatch, useDateLocale } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Image from 'next/image';
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
} from '@/actions/user-documents';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetadataForm } from '@/components/metadata-form';
import { toast } from '@/hooks/use-toast';
import { FileInput, FileUploadResponse } from '@/components/ui/file-input';

interface UserDocumentProps {
  document?: AppUserDocument | null;
  expectedType?: DocumentType;
  profileId?: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  allowEdit?: boolean;
  accept?: string;
  onUpload?: (doc: AppUserDocument) => void;
  onDelete?: () => void;
  noFormLabel?: boolean;
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
  expectedType = DocumentType.IDENTITY_PHOTO,
  required = false,
  disabled = false,
  allowEdit = true,
  accept = 'image/*,application/pdf',
  onDelete,
  onUpload,
}: UserDocumentProps) {
  const t_errors = useTranslations('messages.errors');
  const t = useTranslations('common.documents');
  const t_common = useTranslations('common');
  const t_messages = useTranslations('messages.profile');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const router = useRouter();
  const { formatDate } = useDateLocale();

  const handleDelete = async (documentId: string) => {
    setIsLoading(true);
    const result = await tryCatch(deleteUserDocument(documentId));

    if (result.data) {
      if (onDelete) {
        onDelete();
      } else {
        toast({
          title: t_messages('success.update_title'),
          description: t_messages('success.update_description'),
          variant: 'success',
        });
        router.refresh();
      }
    }

    if (result.error) {
      toast({
        title: t_messages('errors.update_failed'),
        description: result.error.message,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
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

  // Gérer la prévisualisation
  React.useEffect(() => {
    if (!document?.fileUrl) {
      setPreview(null);
      return;
    }

    if (document.fileUrl.endsWith('.pdf')) {
      setPreview(null);
      return;
    }

    setPreview(document.fileUrl);
  }, [document]);

  const handleFileChange = async (fileData: FileUploadResponse) => {
    setIsLoading(true);
    const data = {
      id: fileData.key,
      type: expectedType,
      fileUrl: fileData.serverData.fileUrl,
      userId: fileData.serverData.userId,
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
        router.refresh();
      }
    }

    setIsLoading(false);
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
      <Badge className={'min-w-max'} variant={variants[status]}>
        {t_common(`status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="mb-2 space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-normal mb-1">
          <span>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </span>
          {document?.status && getStatusBadge(document.status)}
        </h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div>
        {!document ? (
          // État vide
          <div className="flex flex-col items-center justify-center text-center">
            <FileInput onChange={handleFileChange} />
          </div>
        ) : (
          // Document existant
          <div className="flex h-full gap-4">
            {/* Prévisualisation */}
            {preview ? (
              <Button
                type="button"
                variant="ghost"
                className="flex aspect-document h-full max-h-[150px] w-auto overflow-hidden !p-0"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Image
                  src={preview}
                  alt="Preview"
                  width={400}
                  height={600}
                  className="size-full object-cover"
                />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="flex aspect-document h-full max-h-[150px] w-auto items-center justify-center rounded-md bg-muted !p-0"
                onClick={() => setIsPreviewOpen(true)}
              >
                <FileInput onChange={handleFileChange} />
              </Button>
            )}

            {/* Actions */}
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                disabled={disabled || isLoading}
              >
                <Eye className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(document.id)}
                disabled={disabled || isLoading}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Informations */}
            <div className="flex flex-1 grow flex-col justify-end space-y-1 pt-6">
              <p className="text-sm text-muted-foreground">
                {(document.issuedAt || document.expiresAt) && (
                  <>
                    {t('validity', {
                      start: document.issuedAt ? formatDate(document.issuedAt) : 'N/A',
                      end: document.expiresAt ? formatDate(document.expiresAt) : 'N/A',
                    })}
                  </>
                )}
              </p>
              {document.metadata && (
                <div className="text-sm text-muted-foreground">
                  {Object.entries(document.metadata).map(([key, value]) => (
                    <p key={key}>
                      {/** @ts-expect-error - key is a string */}
                      {t(`metadata.${key}`)}: {`${value}`}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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

      {/* Preview Dialog */}
      {document && (
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-screen-lg max-h-[90vh]">
            {document.fileUrl.endsWith('.pdf') ? (
              <iframe
                src={document.fileUrl}
                className="w-full h-[80vh] rounded-lg"
                title="PDF Preview"
              />
            ) : (
              <div className="relative aspect-[3/4] w-full h-full overflow-hidden rounded-lg">
                <Image
                  src={document.fileUrl}
                  alt="Preview"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
