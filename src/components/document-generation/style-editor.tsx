import * as React from 'react';
import type { Style as PDFStyle } from '@react-pdf/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';

// Liste des propriétés supportées (adaptée react-pdf)
const STYLE_PROPS: Array<{
  key: keyof PDFStyle;
  type: 'number' | 'text' | 'color' | 'select';
  options?: string[];
}> = [
  // Flexbox
  {
    key: 'flexDirection',
    type: 'select',
    options: ['row', 'column', 'row-reverse', 'column-reverse'],
  },
  {
    key: 'justifyContent',
    type: 'select',
    options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around'],
  },
  {
    key: 'alignItems',
    type: 'select',
    options: ['flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  },
  { key: 'flex', type: 'number' },
  { key: 'flexWrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
  {
    key: 'alignSelf',
    type: 'select',
    options: ['auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline'],
  },
  { key: 'gap', type: 'number' },
  // Layout
  { key: 'position', type: 'select', options: ['absolute', 'relative'] },
  { key: 'top', type: 'number' },
  { key: 'right', type: 'number' },
  { key: 'bottom', type: 'number' },
  { key: 'left', type: 'number' },
  { key: 'zIndex', type: 'number' },
  { key: 'overflow', type: 'select', options: ['visible', 'hidden', 'scroll'] },
  { key: 'display', type: 'select', options: ['flex', 'none'] },
  // Dimension
  { key: 'width', type: 'text' },
  { key: 'height', type: 'text' },
  { key: 'minWidth', type: 'text' },
  { key: 'minHeight', type: 'text' },
  { key: 'maxWidth', type: 'text' },
  { key: 'maxHeight', type: 'text' },
  // Color
  { key: 'backgroundColor', type: 'color' },
  { key: 'color', type: 'color' },
  { key: 'opacity', type: 'number' },
  // Text
  { key: 'fontSize', type: 'number' },
  { key: 'fontFamily', type: 'text' },
  { key: 'fontWeight', type: 'text' },
  { key: 'fontStyle', type: 'select', options: ['normal', 'italic'] },
  { key: 'textAlign', type: 'select', options: ['left', 'right', 'center', 'justify'] },
  { key: 'lineHeight', type: 'number' },
  { key: 'letterSpacing', type: 'number' },
  { key: 'textDecoration', type: 'text' },
  {
    key: 'textTransform',
    type: 'select',
    options: ['none', 'uppercase', 'lowercase', 'capitalize'],
  },
  // Margin/Padding
  { key: 'margin', type: 'text' },
  { key: 'marginTop', type: 'text' },
  { key: 'marginRight', type: 'text' },
  { key: 'marginBottom', type: 'text' },
  { key: 'marginLeft', type: 'text' },
  { key: 'marginHorizontal', type: 'text' },
  { key: 'marginVertical', type: 'text' },
  { key: 'padding', type: 'text' },
  { key: 'paddingTop', type: 'text' },
  { key: 'paddingRight', type: 'text' },
  { key: 'paddingBottom', type: 'text' },
  { key: 'paddingLeft', type: 'text' },
  { key: 'paddingHorizontal', type: 'text' },
  { key: 'paddingVertical', type: 'text' },
  // Border
  { key: 'border', type: 'text' },
  { key: 'borderWidth', type: 'number' },
  { key: 'borderColor', type: 'color' },
  { key: 'borderRadius', type: 'number' },
  { key: 'borderTopLeftRadius', type: 'number' },
  { key: 'borderTopRightRadius', type: 'number' },
  { key: 'borderBottomLeftRadius', type: 'number' },
  { key: 'borderBottomRightRadius', type: 'number' },
  // Transform
  { key: 'transform', type: 'text' },
  { key: 'transformOrigin', type: 'text' },
  // Autres
  {
    key: 'objectFit',
    type: 'select',
    options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
  },
  { key: 'objectPosition', type: 'text' },
];

const getStylePropMeta = (key: keyof PDFStyle) => STYLE_PROPS.find((p) => p.key === key);

interface StyleEditorProps {
  value: Partial<PDFStyle>;
  onChange: (style: Partial<PDFStyle>) => void;
}

export function StyleEditor({ value, onChange }: StyleEditorProps) {
  const t = useTranslations('inputs.pdfEditor.style');
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Propriétés sélectionnées (ordre stable)
  const selectedKeys = React.useMemo(
    () =>
      Object.keys(value || {}).filter((k) =>
        STYLE_PROPS.some((p) => p.key === k),
      ) as (keyof PDFStyle)[],
    [value],
  );

  // Propriétés disponibles à ajouter
  const availableProps = React.useMemo(
    () =>
      STYLE_PROPS.filter(
        (p) =>
          !selectedKeys.includes(p.key) &&
          (!search || p.key.toLowerCase().includes(search.toLowerCase())),
      ),
    [selectedKeys, search],
  );

  // Ajout d'une propriété
  const addProp = (key: keyof PDFStyle) => {
    if (!selectedKeys.includes(key)) {
      onChange({ ...value, [key]: '' });
      setOpen(false);
      setSearch('');
    }
  };

  // Suppression d'une propriété
  const removeProp = (key: keyof PDFStyle) => {
    const newStyle = { ...value };
    delete newStyle[key];
    onChange(newStyle);
  };

  // Modification d'une valeur
  const handleValueChange = (key: keyof PDFStyle, val: string | number) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {selectedKeys.length === 0 && (
          <span className="text-muted-foreground text-xs">
            {t('empty', { default: 'Aucune propriété sélectionnée' })}
          </span>
        )}
        {selectedKeys.map((key) => (
          <Badge key={key} variant="secondary" className="flex items-center gap-1 pr-1">
            {t(key, { default: key })}
            <button
              type="button"
              className="ml-1 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => removeProp(key)}
              aria-label={t('remove', { default: 'Retirer' })}
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-7 px-2 ml-1">
              <ChevronsUpDown className="w-4 h-4 mr-1" />
              {t('add', { default: 'Ajouter' })}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-4">
            <SheetHeader>
              <SheetTitle>{t('add', { default: 'Ajouter une propriété' })}</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search', { default: 'Rechercher...' })}
                className="mb-4"
              />
              <div className="max-h-[calc(100vh-200px)] overflow-auto flex flex-col gap-1">
                {availableProps.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    {t('noResult', { default: 'Aucun résultat' })}
                  </span>
                )}
                {availableProps.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className="flex items-center w-full px-2 py-1 rounded hover:bg-muted text-left group"
                    onClick={() => addProp(p.key)}
                  >
                    <Check className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100" />
                    {t(p.key, { default: p.key })}
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {selectedKeys.map((key) => {
          const meta = getStylePropMeta(key);
          if (!meta) return null;
          const val = value[key];
          // Input dynamique selon le type
          switch (meta.type) {
            case 'number':
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium">
                    {t(key, { default: key })}
                  </label>
                  <Input
                    type="number"
                    value={val ?? ''}
                    onChange={(e) =>
                      handleValueChange(
                        key,
                        e.target.value === '' ? '' : Number(e.target.value),
                      )
                    }
                    placeholder={t(key + '_placeholder', { default: '' })}
                  />
                </div>
              );
            case 'color':
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium">
                    {t(key, { default: key })}
                  </label>
                  <Input
                    type="color"
                    value={
                      typeof val === 'string' && val.startsWith('#') ? val : '#000000'
                    }
                    onChange={(e) => handleValueChange(key, e.target.value)}
                  />
                </div>
              );
            case 'select':
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium">
                    {t(key, { default: key })}
                  </label>
                  <select
                    className="input input-bordered rounded-md h-10 px-2"
                    value={val ?? ''}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                  >
                    <option value="">{t(key + '_placeholder', { default: '--' })}</option>
                    {meta.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {t(key + '.' + opt, { default: opt })}
                      </option>
                    ))}
                  </select>
                </div>
              );
            default:
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-medium">
                    {t(key, { default: key })}
                  </label>
                  <Input
                    value={val ?? ''}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    placeholder={t(key + '_placeholder', { default: '' })}
                  />
                </div>
              );
          }
        })}
      </div>
    </div>
  );
}
