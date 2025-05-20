'use client';

import { Document, Page, Text, Image, Font, View, Link, Note } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import type { Style as PDFStyle } from '@react-pdf/types';
import type { PDFVersion, PageSize, Bookmark, SourceObject } from '@react-pdf/types';
import CardContainer from '../layouts/card-container';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { MinusIcon, PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';

type PageMode =
  | 'useNone'
  | 'useOutlines'
  | 'useThumbs'
  | 'fullScreen'
  | 'useOC'
  | 'useAttachments';
type PageLayout =
  | 'singlePage'
  | 'oneColumn'
  | 'twoColumnLeft'
  | 'twoColumnRight'
  | 'twoPageLeft'
  | 'twoPageRight';
type PageOrientation = 'portrait' | 'landscape';

type DocumentProps = {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  pdfVersion?: PDFVersion;
  language?: string;
  pageMode?: PageMode;
  pageLayout?: PageLayout;
};

type PageProps = {
  size?: PageSize;
  orientation?: PageOrientation;
  wrap?: boolean;
  debug?: boolean;
  dpi?: number;
  id?: string;
  bookmark?: string | Bookmark;
  style?: PDFStyle;
};

type ViewProps = {
  wrap?: boolean;
  debug?: boolean;
  fixed?: boolean;
  id?: string;
  bookmark?: string | Record<string, unknown>;
  style?: PDFStyle;
};

type TextProps = {
  wrap?: boolean;
  debug?: boolean;
  fixed?: boolean;
  render?: (props: { pageNumber: number; subPageNumber: number }) => React.ReactNode;
  hyphenationCallback?: (word: string) => string[];
  id?: string;
  bookmark?: string | Record<string, unknown>;
  style?: PDFStyle;
};

type ImageProps = {
  source: string | SourceObject;
  debug?: boolean;
  fixed?: boolean;
  cache?: boolean;
  bookmark?: string | Bookmark;
  style?: PDFStyle;
};

type LinkProps = {
  src?: string;
  wrap?: boolean;
  debug?: boolean;
  fixed?: boolean;
  bookmark?: string | Record<string, unknown>;
  style?: PDFStyle;
};

type NoteProps = {
  children?: string;
  fixed?: boolean;
  style?: PDFStyle;
};

enum ElementType {
  Document = 'Document',
  Page = 'Page',
  View = 'View',
  Text = 'Text',
  Image = 'Image',
  Link = 'Link',
  Note = 'Note',
}

type ChildrenBase = {
  id: string;
  parentId?: string;
  content?: string;
};

type DocumentElement = ChildrenBase & {
  element: 'Document';
  props: DocumentProps;
};

type PageElement = ChildrenBase & {
  element: 'Page';
  props: PageProps;
};

type ViewElement = ChildrenBase & {
  element: 'View';
  props: ViewProps;
};

type TextElement = ChildrenBase & {
  element: 'Text';
  props: TextProps;
};

type ImageElement = ChildrenBase & {
  element: 'Image';
  props: ImageProps;
};

type LinkElement = ChildrenBase & {
  element: 'Link';
  props: LinkProps;
};

type NoteElement = ChildrenBase & {
  element: 'Note';
  props: NoteProps;
};

type Children =
  | (DocumentElement & { children?: Children[] })
  | (PageElement & { children?: Children[] })
  | (ViewElement & { children?: Children[] })
  | (TextElement & { children?: Children[] })
  | (ImageElement & { children?: Children[] })
  | (LinkElement & { children?: Children[] })
  | (NoteElement & { children?: Children[] });

type Font = {
  family: string;
  src: string;
};

export type Config = {
  document: DocumentProps;
  fonts: Font[];
  children: Children[];
};

export function renderChildren(children: Children[]) {
  return children.map((child) => {
    return renderChild(child);
  });
}

function renderChild(child: Children) {
  switch (child.element) {
    case 'Document':
      return (
        <Document key={child.id} {...(child.props as DocumentProps)}>
          {child.children && renderChildren(child.children)}
        </Document>
      );
    case 'Page':
      return (
        <Page key={child.id} {...(child.props as PageProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </Page>
      );
    case 'Text':
      return (
        <Text key={child.id} {...(child.props as TextProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </Text>
      );
    case 'Image':
      return <Image key={child.id} {...(child.props as Required<ImageProps>)} />;
    case 'View':
      return (
        <View key={child.id} {...(child.props as ViewProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </View>
      );
    case 'Link':
      return (
        <Link key={child.id} {...(child.props as LinkProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </Link>
      );
    case 'Note':
      return (
        <Note {...(child.props as Required<NoteProps>)} key={child.id}>
          {typeof child.props.children === 'string' ? child.props.children : ''}
        </Note>
      );
    default:
      return null;
  }
}

function removeElementFromTree(children: Children[], id: string): Children[] {
  // Recursively remove element by id from the tree
  return children
    .filter((child) => child.id !== id)
    .map((child) =>
      child.children
        ? { ...child, children: removeElementFromTree(child.children, id) }
        : child,
    );
}

function addElementToParent(
  children: Children[],
  parentId: string,
  newElement: Children,
): Children[] {
  return children.map((child) => {
    if (child.id === parentId) {
      return {
        ...child,
        children: child.children ? [...child.children, newElement] : [newElement],
      };
    }
    if (child.children) {
      return {
        ...child,
        children: addElementToParent(child.children, parentId, newElement),
      };
    }
    return child;
  });
}

function getPermissibleChildTypes(element: Children): ElementType[] {
  switch (element.element) {
    case 'Document':
      return [ElementType.Page];
    case 'Page':
    case 'View':
      return [
        ElementType.View,
        ElementType.Text,
        ElementType.Image,
        ElementType.Link,
        ElementType.Note,
      ];
    case 'Link':
      return [ElementType.Text, ElementType.View, ElementType.Image, ElementType.Note];
    default:
      return [];
  }
}

function getDefaultElement(type: ElementType, parentId: string): Children {
  const newId = crypto.randomUUID();
  switch (type) {
    case ElementType.Page:
      return {
        id: newId,
        parentId,
        element: 'Page',
        props: {
          size: 'A4',
          orientation: 'portrait',
          wrap: true,
          style: {
            paddingTop: 35,
            paddingBottom: 65,
            paddingHorizontal: 35,
          },
        },
        children: [],
      };
    case ElementType.View:
      return {
        id: newId,
        parentId,
        element: 'View',
        props: {
          wrap: true,
          style: {
            marginBottom: 10,
          },
        },
        children: [],
      };
    case ElementType.Text:
      return {
        id: newId,
        parentId,
        element: 'Text',
        props: {
          wrap: true,
          style: {
            fontSize: 12,
            fontFamily: 'Times-Roman',
          },
        },
        content: 'Nouveau texte',
      };
    case ElementType.Image:
      return {
        id: newId,
        parentId,
        element: 'Image',
        props: {
          source: '',
          cache: true,
          style: {
            width: '100%',
            height: 'auto',
          },
        },
      };
    case ElementType.Link:
      return {
        id: newId,
        parentId,
        element: 'Link',
        props: {
          src: '#',
          style: {
            textDecoration: 'none',
            color: '#000',
          },
        },
        children: [],
      };
    case ElementType.Note:
      return {
        id: newId,
        parentId,
        element: 'Note',
        props: {
          children: 'New note',
        },
      };
    default:
      throw new Error(`Unsupported element type: ${type}`);
  }
}

function ConfigEditor({
  config,
  setConfig,
}: {
  config: Config;
  setConfig: (config: Config) => void;
}) {
  const [editing, setEditing] = useState<Children | null>(null);

  function handleAddElement(parentId: string, type: ElementType) {
    const newElement = getDefaultElement(type, parentId);
    let newConfig: Config;
    if (parentId === 'root') {
      // Only allow adding Page to root
      if (type !== ElementType.Page) return;
      newConfig = {
        ...config,
        children: [...config.children, newElement],
      };
    } else {
      newConfig = {
        ...config,
        children: addElementToParent(config.children, parentId, newElement),
      };
    }
    setConfig(newConfig);
  }

  function handleRemoveElement(id: string, parentId?: string) {
    if (!parentId) return;
    let newConfig: Config;
    if (parentId === 'root') {
      newConfig = {
        ...config,
        children: config.children.filter((child) => child.id !== id),
      };
    } else {
      newConfig = {
        ...config,
        children: removeElementFromTree(config.children, id),
      };
    }
    setConfig(newConfig);
  }

  function handlePropChange(id: string, path: string[], value: unknown) {
    function updateProps(children: Children[]): Children[] {
      return children.map((child) => {
        if (child.id === id) {
          const updated = { ...child };
          let target: unknown = updated;
          for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (
              typeof target === 'object' &&
              target !== null &&
              typeof key === 'string' &&
              Object.prototype.hasOwnProperty.call(target, key)
            ) {
              // @ts-expect-error: dynamic path
              target = target[key];
            } else {
              return child;
            }
          }
          if (
            typeof target === 'object' &&
            target !== null &&
            path[path.length - 1] !== undefined
          ) {
            // @ts-expect-error: dynamic path
            target[path[path.length - 1]] = value;
          }
          return updated;
        }
        if (child.children) {
          return { ...child, children: updateProps(child.children) };
        }
        return child;
      });
    }
    const newConfig = { ...config, children: updateProps(config.children) };
    setConfig(newConfig);
  }

  function renderEditDialog() {
    if (!editing) return null;
    const { element, props, content, id } = editing;
    // Helper for safely getting nested style values
    const getStyle = (key: string) => {
      if (props && 'style' in props && props.style && typeof props.style === 'object') {
        // @ts-expect-error: dynamic style access
        return props.style[key] ?? '';
      }
      return '';
    };
    // Helper for safely updating nested style values
    const handleStyleChange = (styleKey: string, value: string | number) => {
      handlePropChange(id, ['props', 'style', styleKey], value);
    };
    return (
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les propriétés de {element}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {element === 'Text' && (
              <>
                <Label className="block text-xs font-medium mb-1">Contenu</Label>
                <Input
                  className="input input-bordered w-full"
                  value={typeof content === 'string' ? content : ''}
                  onChange={(e) => handlePropChange(id, ['content'], e.target.value)}
                  placeholder="Contenu du texte"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">
                  Taille de police
                </Label>
                <Input
                  type="number"
                  className="input input-bordered w-full"
                  value={props?.style?.fontSize ?? ''}
                  onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                  placeholder="Taille de police"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Police</Label>
                <Input
                  className="input input-bordered w-full"
                  value={props?.style?.fontFamily ?? ''}
                  onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                  placeholder="Police (ex: Times-Roman)"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Couleur</Label>
                <Input
                  className="input input-bordered w-full"
                  value={props?.style?.color ?? ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="Couleur (ex: #000000)"
                />
              </>
            )}
            {element === 'Image' && (
              <>
                <Label className="block text-xs font-medium mb-1">
                  Url de l&apos;image
                </Label>
                <Input
                  className="input input-bordered w-full"
                  value={typeof props.source === 'string' ? props.source : ''}
                  onChange={(e) =>
                    handlePropChange(id, ['props', 'source'], e.target.value)
                  }
                  placeholder="Url de l'image"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Largeur</Label>
                <Input
                  className="input input-bordered w-full"
                  value={getStyle('width')}
                  onChange={(e) => handleStyleChange('width', e.target.value)}
                  placeholder="Largeur (ex: 100%)"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Hauteur</Label>
                <Input
                  className="input input-bordered w-full"
                  value={getStyle('height')}
                  onChange={(e) => handleStyleChange('height', e.target.value)}
                  placeholder="Hauteur (ex: auto)"
                />
              </>
            )}
            {element === 'Page' && (
              <>
                <Label className="block text-xs font-medium mb-1">Taille</Label>
                <Input
                  className="input input-bordered w-full"
                  value={typeof props.size === 'string' ? props.size : ''}
                  onChange={(e) =>
                    handlePropChange(id, ['props', 'size'], e.target.value)
                  }
                  placeholder="Taille (ex: A4)"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Orientation</Label>
                <Input
                  className="input input-bordered w-full"
                  value={props.orientation ?? ''}
                  onChange={(e) =>
                    handlePropChange(id, ['props', 'orientation'], e.target.value)
                  }
                  placeholder="Orientation (portrait/landscape)"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">
                  Padding haut
                </Label>
                <Input
                  type="number"
                  className="input input-bordered w-full"
                  value={getStyle('paddingTop')}
                  onChange={(e) =>
                    handleStyleChange('paddingTop', Number(e.target.value))
                  }
                  placeholder="Padding haut"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Padding bas</Label>
                <Input
                  type="number"
                  className="input input-bordered w-full"
                  value={getStyle('paddingBottom')}
                  onChange={(e) =>
                    handleStyleChange('paddingBottom', Number(e.target.value))
                  }
                  placeholder="Padding bas"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">
                  Padding horizontal
                </Label>
                <Input
                  type="number"
                  className="input input-bordered w-full"
                  value={getStyle('paddingHorizontal')}
                  onChange={(e) =>
                    handleStyleChange('paddingHorizontal', Number(e.target.value))
                  }
                  placeholder="Padding horizontal"
                />
              </>
            )}
            {element === 'View' && (
              <>
                <Label className="block text-xs font-medium mb-1">Marge basse</Label>
                <Input
                  type="number"
                  className="input input-bordered w-full"
                  value={getStyle('marginBottom')}
                  onChange={(e) =>
                    handleStyleChange('marginBottom', Number(e.target.value))
                  }
                  placeholder="Marge basse"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">
                  Direction du flex
                </Label>
                <Input
                  className="input input-bordered w-full"
                  value={getStyle('flexDirection')}
                  onChange={(e) => handleStyleChange('flexDirection', e.target.value)}
                  placeholder="Direction du flex (row/column)"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">
                  Couleur de fond
                </Label>
                <Input
                  className="input input-bordered w-full"
                  value={getStyle('backgroundColor')}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  placeholder="Couleur de fond (ex: #ffffff)"
                />
              </>
            )}
            {element === 'Link' && (
              <>
                <Label className="block text-xs font-medium mb-1">URL</Label>
                <Input
                  className="input input-bordered w-full"
                  value={props.src ?? ''}
                  onChange={(e) => handlePropChange(id, ['props', 'src'], e.target.value)}
                  placeholder="URL du lien"
                />
                <Label className="block text-xs font-medium mb-1 mt-2">Couleur</Label>
                <Input
                  className="input input-bordered w-full"
                  value={props.style?.color ?? ''}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  placeholder="Couleur du lien (ex: #0000ff)"
                />
              </>
            )}
            {element === 'Note' && (
              <>
                <Label className="block text-xs font-medium mb-1">
                  Contenu de la note
                </Label>
                <Input
                  className="input input-bordered w-full"
                  value={props.children ?? ''}
                  onChange={(e) =>
                    handlePropChange(id, ['props', 'children'], e.target.value)
                  }
                  placeholder="Contenu de la note"
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  function renderChildEditor(child: Children) {
    const permissible = getPermissibleChildTypes(child);
    return (
      <div key={child.id} className="pl-2 border-l-2 border-gray-200 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-sm border-b border-dashed border-gray-200 pb-1">
          <span className="truncate max-w-full font-semibold">{child.element}</span>
          <div className="commands flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={child.element === 'Document'}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveElement(child.id, child.parentId)}
                >
                  <MinusIcon className="size-icon" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Retirer l&apos;élément</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(child)}
                >
                  <PencilIcon className="size-icon" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Modifier l&apos;élément</TooltipContent>
            </Tooltip>
            {permissible.length > 0 && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon">
                        +
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Ajouter un élément</TooltipContent>
                </Tooltip>

                <DropdownMenuContent align="start">
                  {permissible.map((type) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => handleAddElement(child.id, type)}
                    >
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {/* Inline editing for Text.content and Image.props.source */}
        {child.element === 'Text' && (
          <input
            className="input input-bordered w-full my-1"
            value={typeof child.content === 'string' ? child.content : ''}
            onChange={(e) => handlePropChange(child.id, ['content'], e.target.value)}
          />
        )}
        {child.element === 'Image' &&
          !!child.props &&
          typeof child.props.source === 'string' && (
            <input
              className="input input-bordered w-full my-1"
              value={child.props.source}
              onChange={(e) =>
                handlePropChange(child.id, ['props', 'source'], e.target.value)
              }
            />
          )}
        {child.children && child.children.length > 0 && (
          <div className="ml-2 flex flex-col gap-2">
            {child.children.map((c) => renderChildEditor(c))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Arborescence du document</Label>
        <Button
          onClick={() => handleAddElement('root', ElementType.Page)}
          variant="outline"
          size="sm"
        >
          Ajouter une page
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {config.children.map((child) => renderChildEditor(child))}
      </div>
      {renderEditDialog()}
    </div>
  );
}

type PDFBuilderProps = {
  config?: Config;
  onChange: (config: Config) => void;
};

export function PDFBuilder({
  config = {
    fonts: [],
    document: {
      title: 'Document',
    },
    children: [],
  },
  onChange,
}: PDFBuilderProps) {
  config.fonts.forEach((font) => {
    Font.register(font);
  });

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-6 gap-4">
      <CardContainer
        className="lg:col-span-4 overflow-hidden"
        contentClass="overflow-hidden p-0 aspect-[1/1.4142]"
      >
        <ReactPDF.PDFViewer width="100%" height="100%">
          <Document {...config.document}>{config.children.map(renderChild)}</Document>
        </ReactPDF.PDFViewer>
      </CardContainer>
      <CardContainer className="lg:col-span-2" title="Editor">
        <ConfigEditor config={config} setConfig={onChange} />
      </CardContainer>
    </div>
  );
}
