'use client';

import { Document, Page, Text, Image, Font, View, Link, Note } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import type { Style as PDFStyle } from '@react-pdf/types';
import type { PDFVersion, PageSize, Bookmark, SourceObject } from '@react-pdf/types';
import CardContainer from '../layouts/card-container';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { MinusIcon } from 'lucide-react';
import { useState } from 'react';

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
  onConfigChange: (config: Config) => void;
};

function ConfigEditor({
  config,
  onChange,
}: {
  config: Config;
  onChange: (config: Config) => void;
}) {
  const [localConfig, setLocalConfig] = useState(config);

  function handleAddElement(parentId: string, type: ElementType) {
    const newConfig = { ...config };

    if (parentId === 'root') {
      newConfig.children.push({
        id: crypto.randomUUID(),
        parentId: 'root',
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
      });

      onChange(newConfig);
      return;
    }

    const flatChildren = flattenConfig(newConfig);
    const parent = flatChildren.find((child) => child.id === parentId);
    if (!parent) {
      throw new Error(`Parent element not found: ${parentId}`);
    }
    let newElement: Children;
    const newId = crypto.randomUUID();

    switch (type) {
      case ElementType.View:
        newElement = {
          id: newId,
          parentId: parentId,
          element: 'View',
          props: {
            wrap: true,
            style: {
              marginBottom: 10,
            },
          },
          children: [],
        };
        break;
      case ElementType.Text:
        newElement = {
          id: newId,
          parentId: parentId,
          element: 'Text',
          props: {
            wrap: true,
            style: {
              fontSize: 12,
              fontFamily: 'Times-Roman',
            },
          },
          content: 'New Text',
        };
        break;
      case ElementType.Image:
        newElement = {
          id: newId,
          parentId: parentId,
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
        break;
      case ElementType.Link:
        newElement = {
          id: newId,
          parentId: parentId,
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
        break;
      case ElementType.Note:
        newElement = {
          id: newId,
          parentId: parentId,
          element: 'Note',
          props: {
            children: 'New note',
          },
        };
        break;
      default:
        throw new Error(`Unsupported element type: ${type}`);
    }

    if (parentId === 'root') {
      newConfig.children.push(newElement);
    } else {
      const parentPath = flatChildren.find((child) => child.id === parentId)?.path;
      if (!parentPath) {
        throw new Error(`Parent element not found: ${parentId}`);
      }

      const parentRefInConfig = config.children.find((child) => child.id === parentId);
      if (!parentRefInConfig) {
        throw new Error(`Parent element not found: ${parentId}`);
      }

      parentRefInConfig.children?.splice(parentPath.length, 0, newElement);
    }

    onChange(newConfig);
  }

  function handleRemoveElement(id: string, parentId?: string) {
    const newConfig = { ...localConfig };

    if (!parentId) {
      throw new Error('Parent ID is required');
    }

    if (parentId === 'root') {
      newConfig.children = newConfig.children.filter((child) => child.id !== id);
    }

    console.log({ newConfig });

    setLocalConfig(() => newConfig);
  }

  function renderChildEditor(child: Children) {
    return (
      <div
        key={child.id}
        className="pl-4 border-l-2 border-gray-200 my-2 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="truncate max-w-full">{child.element}</span>
          <Button
            disabled={child.element === 'Document'}
            type="button"
            variant="link"
            size="link"
            onClick={() => handleRemoveElement(child.id, child.parentId)}
          >
            <MinusIcon className="size-icon" />
          </Button>
        </div>
      </div>
    );
  }

  function flattenConfig(config: Config): Array<Children & { path: number[] }> {
    const flatChildren: Array<Children & { path: number[] }> = [];

    function flatten(children: Children[], path: number[]) {
      children.forEach((child, index) => {
        flatChildren.push({ ...child, path: [...path, index] });
        if (child.children && child.children.length > 0) {
          flatten(child.children, [...path, index]);
        }
      });
    }

    flatten(config.children, []);
    return flatChildren;
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
  onConfigChange,
}: PDFBuilderProps) {
  if (config.font) {
    Font.register(config.font);
  }

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-6 gap-4">
      <div className="aspect-[1/1.4142] lg:col-span-4">
        <ReactPDF.PDFViewer width="100%" height="100%">
          <Document {...config.document}>{config.children.map(renderChild)}</Document>
        </ReactPDF.PDFViewer>
      </div>
      <CardContainer className="lg:col-span-2" title="Editor">
        <ConfigEditor config={config} onChange={onConfigChange} />
      </CardContainer>
    </div>
  );
}
