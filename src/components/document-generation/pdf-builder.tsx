'use client';

import {
  Document,
  Page,
  Text,
  Image,
  Font,
  View,
  Link,
  Note,
  Canvas,
} from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import type { Style as PDFStyle } from '@react-pdf/types';
import type { PDFVersion, PageSize, Bookmark, SourceObject } from '@react-pdf/types';
import CardContainer from '../layouts/card-container';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MultiSelect } from '../ui/multi-select';
import { MinusIcon, PlusIcon } from 'lucide-react';
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

type CanvasProps = {
  paint: (painter: unknown, width: number, height: number) => null;
  debug?: boolean;
  fixed?: boolean;
  bookmark?: string | Bookmark;
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
  Canvas = 'Canvas',
}

type ChildrenBase = {
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

type CanvasElement = ChildrenBase & {
  element: 'Canvas';
  props: CanvasProps;
};

type Children =
  | (DocumentElement & { children?: Children[] })
  | (PageElement & { children?: Children[] })
  | (ViewElement & { children?: Children[] })
  | (TextElement & { children?: Children[] })
  | (ImageElement & { children?: Children[] })
  | (LinkElement & { children?: Children[] })
  | (NoteElement & { children?: Children[] })
  | (CanvasElement & { children?: Children[] });

export type Config = {
  document: DocumentProps;
  font?: {
    family: string;
    src: string;
  };
  children: Children[];
};

const quixoteConfig: Config = {
  document: {
    title: 'Don Quijote de la Mancha',
    author: 'Miguel de Cervantes',
    subject: 'Spanish Literature',
    keywords: 'novel, spanish, classic',
    creator: 'Consulat.ga PDF Generator',
    language: 'es',
    pageMode: 'useNone',
    pageLayout: 'singlePage',
  },
  font: {
    family: 'Oswald',
    src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
  },
  children: [
    {
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
      children: [
        {
          element: 'View',
          props: {
            style: {
              marginBottom: 30,
              borderBottom: '1pt solid #999',
              paddingBottom: 20,
            },
          },
          children: [
            {
              element: 'Text',
              props: {
                id: 'title',
                style: {
                  fontSize: 24,
                  textAlign: 'center',
                  fontFamily: 'Oswald',
                },
              },
              content: 'Don Quijote de la Mancha',
            },
            {
              element: 'Text',
              props: {
                style: {
                  fontSize: 12,
                  textAlign: 'center',
                  marginTop: 10,
                },
              },
              content: 'Miguel de Cervantes',
            },
          ],
        },
        {
          element: 'View',
          props: {
            style: {
              flexDirection: 'row',
              marginBottom: 20,
            },
          },
          children: [
            {
              element: 'View',
              props: {
                style: {
                  flex: 1,
                  marginRight: 10,
                },
              },
              children: [
                {
                  element: 'Image',
                  props: {
                    source:
                      'https://rbvj2i3urx.ufs.sh/f/H4jCIhEWEyOi0G1T4rEioAQZb145Ml832EyDvzWdnmFpiX0P',
                    cache: true,
                    style: {
                      width: '100%',
                      height: 'auto',
                    },
                  },
                },
              ],
            },
            {
              element: 'View',
              props: {
                style: {
                  flex: 2,
                },
              },
              children: [
                {
                  element: 'Link',
                  props: {
                    src: '#chapter1',
                    style: {
                      textDecoration: 'none',
                      color: '#000',
                    },
                  },
                  children: [
                    {
                      element: 'Text',
                      props: {
                        id: 'chapter1',
                        style: {
                          fontSize: 18,
                          marginBottom: 10,
                          fontFamily: 'Oswald',
                        },
                      },
                      content:
                        'Capítulo I: Que trata de la condición y ejercicio del famoso hidalgo D. Quijote de la Mancha',
                    },
                  ],
                },
                {
                  element: 'Text',
                  props: {
                    style: {
                      fontSize: 14,
                      textAlign: 'justify',
                      fontFamily: 'Times-Roman',
                    },
                  },
                  content:
                    'En un lugar de la Mancha, de cuyo nombre no quiero acordarme...',
                },
                {
                  element: 'Note',
                  props: {
                    children: 'This is a note annotation in the PDF',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
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
    case 'Canvas':
      return <Canvas {...child.props} />;
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
  function handleAddElement(path: string[], type: ElementType) {
    const newConfig = { ...config };

    let newElement: Children;

    switch (type) {
      case ElementType.Document:
        newElement = {
          element: 'Document',
          props: {
            title: 'New Document',
            creator: 'Consulat.ga PDF Generator',
            language: 'fr',
          },
          children: [],
        };
        break;
      case ElementType.Page:
        newElement = {
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
        break;
      case ElementType.View:
        newElement = {
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
          element: 'Note',
          props: {
            children: 'New note',
          },
        };
        break;
      case ElementType.Canvas:
        newElement = {
          element: 'Canvas',
          props: {
            paint: (painter, width, height) => null,
            style: {
              width: '100%',
              height: 100,
            },
          },
        };
        break;
      default:
        throw new Error(`Unsupported element type: ${type}`);
    }

    // Navigate to the target location using the path
    let current: any = newConfig;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current.children) {
        current.children = [];
      }
      current = current.children[parseInt(path[i], 10)];
    }

    // Add the new element at the specified position
    if (!current.children) {
      current.children = [];
    }
    const lastIndex = path[path.length - 1];
    if (lastIndex !== undefined) {
      current.children.splice(parseInt(lastIndex, 10), 0, newElement);
    } else {
      current.children.push(newElement);
    }

    onChange(newConfig);
  }

  function handleRemoveElement(path: string[]) {
    const newConfig = { ...config };
    console.log('Removing element at path:', path);

    const flatConfig = flattenConfig(newConfig);
    console.log(
      'All elements:',
      flatConfig.map((c) => ({ element: c.element, props: c.props })),
    );

    const index = flatConfig.findIndex(
      (child) => child.element === path[path.length - 1],
    );
    console.log('Found element at index:', index);

    if (index !== -1) {
      flatConfig.splice(index, 1);
      const resultConfig = unflattenConfig(flatConfig);
      onChange(resultConfig);
    } else {
      console.warn('Element not found at path:', path);
    }
  }

  function flattenConfig(config: Config): Children[] {
    const flatChildren: Children[] = [];

    function flatten(children: Children[]) {
      children.forEach((child) => {
        flatChildren.push(child);
        if (child.children && child.children.length > 0) {
          flatten(child.children);
        }
      });
    }

    flatten(config.children);
    return flatChildren;
  }

  function unflattenConfig(flatConfig: Children[]): Config {
    // Create a new config with the first element as root
    const newConfig: Config = {
      document: config.document,
      children: [],
    };

    // Add all elements at root level for now
    // Later we can implement proper tree reconstruction if needed
    newConfig.children = flatConfig;

    return newConfig;
  }

  function renderChildEditor(child: Children, path: string[]) {
    const elementKey = `element-${path.join('-')}-${child.element}-${Date.now()}`;

    return (
      <div
        key={elementKey}
        className="pl-4 border-l-2 border-gray-200 my-2 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2">
          <span>{elementKey}</span>
          <Button variant="link" size="link" onClick={() => handleRemoveElement(path)}>
            <MinusIcon className="size-icon" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label>Arborescence du document</Label>
        <Button
          onClick={() => handleAddElement([], ElementType.Page)}
          variant="outline"
          size="sm"
        >
          Ajouter une page
        </Button>
      </div>
      <div className="space-y-2">
        {config.children.map((child, index) => renderChildEditor(child, [index]))}
      </div>
    </div>
  );
}

export function PDFBuilder({ config = quixoteConfig, onConfigChange }: PDFBuilderProps) {
  if (config.font) {
    Font.register(config.font);
  }

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-6 gap-4">
      <div className="aspect-[1/1.4142] lg:col-span-4">
        <ReactPDF.PDFViewer width="100%" height="100%">
          <Document {...config.document}>{renderChildren(config.children)}</Document>
        </ReactPDF.PDFViewer>
      </div>
      <CardContainer className="lg:col-span-2" title="Editor">
        <ConfigEditor config={config} onChange={onConfigChange} />
      </CardContainer>
    </div>
  );
}
