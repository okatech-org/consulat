'use client';

import { Document, Page, Text, Image, Font, View, Link, Note } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import type { Style as PDFStyle } from '@react-pdf/types';
import type { PDFVersion, PageSize, Bookmark, SourceObject } from '@react-pdf/types';
import CardContainer from '../layouts/card-container';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { MinusIcon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
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

export type Config = {
  document: DocumentProps;
  font?: {
    family: string;
    src: string;
  };
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
        <Document {...(child.props as DocumentProps)}>
          {child.children && renderChildren(child.children)}
        </Document>
      );
    case 'Page':
      return (
        <Page {...(child.props as PageProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </Page>
      );
    case 'Text':
      return (
        <Text {...(child.props as TextProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </Text>
      );
    case 'Image':
      return <Image {...(child.props as Required<ImageProps>)} />;
    case 'View':
      return (
        <View {...(child.props as ViewProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </View>
      );
    case 'Link':
      return (
        <Link {...(child.props as LinkProps)}>
          {child.children && renderChildren(child.children)}
          {child.content}
        </Link>
      );
    case 'Note':
      return <Note {...(child.props as Required<NoteProps>)} />;
    default:
      return null;
  }
}

type PDFBuilderProps = {
  config?: Config;
};

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

function ConfigEditor({ config }: { config: Config }) {
  const [localConfig, setLocalConfig] = useState(config);
  const [editing, setEditing] = useState<Children | null>(null);

  function handleAddElement(parentId: string, type: ElementType) {
    const newElement = getDefaultElement(type, parentId);
    let newConfig: Config;
    if (parentId === 'root') {
      // Only allow adding Page to root
      if (type !== ElementType.Page) return;
      newConfig = {
        ...localConfig,
        children: [...localConfig.children, newElement],
      };
    } else {
      newConfig = {
        ...localConfig,
        children: addElementToParent(localConfig.children, parentId, newElement),
      };
    }
    setLocalConfig(newConfig);
  }

  function handleRemoveElement(id: string, parentId?: string) {
    if (!parentId) return;
    let newConfig: Config;
    if (parentId === 'root') {
      newConfig = {
        ...localConfig,
        children: localConfig.children.filter((child) => child.id !== id),
      };
    } else {
      newConfig = {
        ...localConfig,
        children: removeElementFromTree(localConfig.children, id),
      };
    }
    setLocalConfig(newConfig);
  }

  function handlePropChange(id: string, path: string[], value: unknown) {
    function updateProps(children: Children[]): Children[] {
      return children.map((child) => {
        if (child.id === id) {
          const updated = { ...child };
          let target: unknown = updated;
          for (let i = 0; i < path.length - 1; i++) {
            if (typeof target === 'object' && target !== null && path[i] in target) {
              // @ts-expect-error: dynamic path
              target = target[path[i]];
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
    const newConfig = { ...localConfig, children: updateProps(localConfig.children) };
    setLocalConfig(newConfig);
  }

  function renderEditDialog() {
    if (!editing) return null;
    const { element, props, content, id } = editing;
    return (
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier les propriétés de {element}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {element === 'Text' && (
              <div>
                <Label className="block text-xs font-medium mb-1">Contenu</Label>
                <Input
                  className="input input-bordered w-full"
                  value={typeof content === 'string' ? content : ''}
                  onChange={(e) => handlePropChange(id, ['content'], e.target.value)}
                  placeholder="Contenu du texte"
                />
              </div>
            )}
            {element === 'Image' && (
              <div>
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
              </div>
            )}
            {/* Add more fields for other element types and props as needed */}
            {/* Example: Page size/orientation, View style, etc. */}
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
          <div className="ml-2">{child.children.map((c) => renderChildEditor(c))}</div>
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
      <div className="space-y-2">
        {localConfig.children.map((child) => renderChildEditor(child))}
      </div>
      {renderEditDialog()}
    </div>
  );
}

export function PDFBuilder({
  config = {
    document: {
      title: 'Document',
    },
    children: [],
  },
}: PDFBuilderProps) {
  if (config.font) {
    Font.register(config.font);
  }

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
        <ConfigEditor config={config} />
      </CardContainer>
    </div>
  );
}
