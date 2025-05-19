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
};

export function PDFBuilder({ config = quixoteConfig }: PDFBuilderProps) {
  if (config.font) {
    Font.register(config.font);
  }

  console.log({ config });

  return (
    <div className="w-full h-full">
      <div className="aspect-[1/1.4142]">
        <ReactPDF.PDFViewer width="100%" height="100%">
          <Document {...config.document}>{renderChildren(config.children)}</Document>
        </ReactPDF.PDFViewer>
      </div>
    </div>
  );
}
