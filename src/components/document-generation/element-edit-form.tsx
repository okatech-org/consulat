// 'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import type { Children } from './pdf-builder';
import { FileInput } from '@/components/ui/file-input';
import { uploadFileFromClient } from '@/components/ui/uploadthing';
import { StyleEditor } from './style-editor';

interface ElementEditFormProps {
  element: Children;
  onSave: (updated: Children) => void;
  onCancel?: () => void;
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Type guard for fileUrl property
function hasFileUrl(obj: unknown): obj is { fileUrl: string } {
  return (
    !!obj &&
    typeof obj === 'object' &&
    'fileUrl' in obj &&
    typeof (obj as { fileUrl: unknown }).fileUrl === 'string'
  );
}

export function ElementEditForm({ element, onSave, onCancel }: ElementEditFormProps) {
  const t = useTranslations('inputs');
  const [localElement, setLocalElement] = useState<Children>(deepClone(element));

  // Helpers pour éditer les propriétés
  function updateProp(path: (string | number)[], value: unknown) {
    setLocalElement((prev) => {
      const clone = deepClone(prev);
      let obj: Record<string, unknown> = clone as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]] as Record<string, unknown>;
      }
      obj[path[path.length - 1]] = value;
      return clone;
    });
  }

  // Rendu dynamique selon le type d'élément
  function renderFields() {
    switch (localElement.element) {
      case 'Text':
        return (
          <>
            <label className="block text-xs font-medium mb-1">
              {t('pdfEditor.text.content')}
            </label>
            <Input
              value={localElement.content ?? ''}
              onChange={(e) => updateProp(['content'], e.target.value)}
              placeholder={t('pdfEditor.text.content_placeholder')}
            />
            <div className="mt-2">
              <StyleEditor
                value={localElement.props?.style ?? {}}
                onChange={(newStyle) => updateProp(['props', 'style'], newStyle)}
              />
            </div>
          </>
        );
      case 'Image':
        return (
          <>
            <label className="block text-xs font-medium mb-1">
              {t('pdfEditor.image.source')}
            </label>
            <Input
              value={
                typeof localElement.props?.source === 'string'
                  ? localElement.props?.source
                  : ''
              }
              onChange={(e) => updateProp(['props', 'source'], e.target.value)}
              placeholder={t('pdfEditor.image.source_placeholder')}
              type="url"
            />
            <div className="my-2">
              <FileInput
                accept="image/*"
                fileUrl={
                  typeof localElement.props?.source === 'string'
                    ? localElement.props?.source
                    : undefined
                }
                fileType={localElement.props?.source ? 'image' : undefined}
                onChangeAction={async (file) => {
                  const res = await uploadFileFromClient(file);
                  let url: string | undefined;
                  if (res[0]) {
                    if (hasFileUrl(res[0])) {
                      url = res[0].fileUrl;
                    } else if (
                      res[0]?.serverData &&
                      typeof res[0].serverData.fileUrl === 'string'
                    ) {
                      url = res[0].serverData.fileUrl;
                    }
                  }
                  if (url) {
                    updateProp(['props', 'source'], url);
                  }
                }}
                showPreview={true}
                aspectRatio="16/9"
              />
            </div>
            <div className="mt-2">
              <StyleEditor
                value={localElement.props?.style ?? {}}
                onChange={(newStyle) => updateProp(['props', 'style'], newStyle)}
              />
            </div>
          </>
        );
      case 'Page':
        return (
          <>
            <label className="block text-xs font-medium mb-1">
              {t('pdfEditor.page.size')}
            </label>
            <Input
              value={
                typeof localElement.props?.size === 'string'
                  ? localElement.props?.size
                  : ''
              }
              onChange={(e) => updateProp(['props', 'size'], e.target.value)}
              placeholder={t('pdfEditor.page.size_placeholder')}
            />
            <label className="block text-xs font-medium mb-1 mt-2">
              {t('pdfEditor.page.orientation')}
            </label>
            <Input
              value={
                typeof localElement.props?.orientation === 'string'
                  ? localElement.props?.orientation
                  : ''
              }
              onChange={(e) => updateProp(['props', 'orientation'], e.target.value)}
              placeholder={t('pdfEditor.page.orientation_placeholder')}
            />
            <div className="mt-2">
              <StyleEditor
                value={localElement.props?.style ?? {}}
                onChange={(newStyle) => updateProp(['props', 'style'], newStyle)}
              />
            </div>
          </>
        );
      case 'Note':
        return (
          <>
            <label className="block text-xs font-medium mb-1">
              {t('pdfEditor.note.content')}
            </label>
            <Textarea
              value={localElement.props?.children ?? ''}
              onChange={(e) => updateProp(['props', 'children'], e.target.value)}
              placeholder={t('pdfEditor.note.content_placeholder')}
            />
          </>
        );
      case 'Link':
        return (
          <>
            <label className="block text-xs font-medium mb-1">
              {t('pdfEditor.link.src')}
            </label>
            <Input
              value={localElement.props?.src ?? ''}
              onChange={(e) => updateProp(['props', 'src'], e.target.value)}
              placeholder={t('pdfEditor.link.src_placeholder')}
            />
            <div className="mt-2">
              <StyleEditor
                value={localElement.props?.style ?? {}}
                onChange={(newStyle) => updateProp(['props', 'style'], newStyle)}
              />
            </div>
          </>
        );
      case 'View':
        return (
          <>
            <div className="mt-2">
              <StyleEditor
                value={localElement.props?.style ?? {}}
                onChange={(newStyle) => updateProp(['props', 'style'], newStyle)}
              />
            </div>
          </>
        );
      case 'Document':
        return (
          <>
            <label className="block text-xs font-medium mb-1">
              {t('pdfEditor.document.title')}
            </label>
            <Input
              value={localElement.props?.title ?? ''}
              onChange={(e) => updateProp(['props', 'title'], e.target.value)}
              placeholder={t('pdfEditor.document.title_placeholder')}
            />
            <label className="block text-xs font-medium mb-1 mt-2">
              {t('pdfEditor.document.author')}
            </label>
            <Input
              value={localElement.props?.author ?? ''}
              onChange={(e) => updateProp(['props', 'author'], e.target.value)}
              placeholder={t('pdfEditor.document.author_placeholder')}
            />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(localElement);
      }}
      className="space-y-4"
    >
      {renderFields()}
      <div className="flex gap-2 justify-end mt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('actions.cancel')}
          </Button>
        )}
        <Button type="submit" variant="default">
          {t('actions.save')}
        </Button>
      </div>
    </form>
  );
}
