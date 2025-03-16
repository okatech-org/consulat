'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { X, PenIcon } from 'lucide-react';
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
} from '@/actions/user-documents';
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
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [localDocument, setLocalDocument] = React.useState(document);
  const [resetKey, setResetKey] = React.useState(Date.now());
  const router = useRouter();
  const { formatDate } = useDateLocale();

  // Mettre à jour le document local lorsque le document externe change
  React.useEffect(() => {
    setLocalDocument(document);
  }, [document]);

  const handleDelete = async (documentId: string) => {
    setIsLoading(true);
    const result = await tryCatch(deleteUserDocument(documentId));

    if (result.data) {
      // Réinitialiser le document local
      setLocalDocument(null);
      // Forcer le remontage du composant FileInput
      setResetKey(Date.now());

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
      // Mettre à jour le document local
      setLocalDocument(updatedDocument);

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
      issuedAt: localDocument?.issuedAt
        ? format(new Date(localDocument.issuedAt), 'yyyy-MM-dd')
        : undefined,
      expiresAt: localDocument?.expiresAt
        ? format(new Date(localDocument.expiresAt), 'yyyy-MM-dd')
        : undefined,
      metadata: localDocument?.metadata,
    },
  });

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
      // Mettre à jour le document local avec le résultat
      setLocalDocument(result.data);

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
    if (!localDocument) return;

    try {
      await handleUpdate(localDocument.id, data);
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
    <div className="mb-2 space-y-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-normal mb-1">
          <span>
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </span>
          {localDocument?.status && getStatusBadge(localDocument.status)}
        </h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <div className={cn('relative', 'h-full')}>
        <FileInput
          key={resetKey}
          onChange={handleFileChange}
          accept={accept}
          loading={isLoading}
          fileUrl={localDocument?.fileUrl}
          showPreview={true}
          autoUpload={true}
        />

        {localDocument && (
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
              onClick={() => handleDelete(localDocument.id)}
              disabled={disabled || isLoading}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}

        {localDocument && localDocument.metadata && (
          <div className="flex flex-1 flex-col justify-end space-y-1 pt-4 text-sm text-muted-foreground">
            {(localDocument.issuedAt || localDocument.expiresAt) && (
              <p>
                {t('validity', {
                  start: localDocument.issuedAt
                    ? formatDate(localDocument.issuedAt)
                    : 'N/A',
                  end: localDocument.expiresAt
                    ? formatDate(localDocument.expiresAt)
                    : 'N/A',
                })}
              </p>
            )}
            <div>
              {Object.entries(localDocument.metadata).map(([key, value]) => (
                <p key={key}>
                  {/** @ts-expect-error - key is a string */}
                  {t(`metadata.${key}`)}: {`${value}`}
                </p>
              ))}
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
              {localDocument && (
                <MetadataForm
                  documentType={localDocument.type}
                  metadata={localDocument.metadata}
                  onSubmit={async (metadata) => {
                    await handleUpdate(localDocument.id, { metadata });
                    setIsUpdating(false);
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
