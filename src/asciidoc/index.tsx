import parse from 'html-react-parser'
import { createContext, useContext } from 'react'

import {
  Admonition,
  Audio,
  CoList,
  DList,
  Document,
  Example,
  FloatingTitle,
  Image,
  Listing,
  Literal,
  OList,
  Open,
  PageBreak,
  Paragraph,
  Pass,
  Preamble,
  Quote,
  Section,
  Sidebar,
  Table,
  TableOfContents,
  ThematicBreak,
  UList,
  Verse,
} from './templates'
import { Title } from './templates/util'
import { prepareDocument } from './utils/prepareDocument'
import type {
  AdmonitionBlock,
  AudioBlock,
  Block,
  CoListBlock,
  DListBlock,
  DocumentBlock,
  DocumentSection,
  ImageBlock,
  ListBlock,
  LiteralBlock,
  ParagraphBlock,
  SectionBlock,
  TableBlock,
} from './utils/prepareDocument'

// Add support for inline blocks
// Cannot use react but could probably convert
// jsx syntax to html with some helper functions
// for the content
/* class InlineConverter {
  baseConverter: AdType.Html5Converter

  constructor() {
    this.baseConverter = new ad.Html5Converter()
  }

  convert(node: AdType.Block, transform: string) {
    switch (node.getNodeName()) {
      default:
        break
    }

    return this.baseConverter.convert(node, transform)
  }
} */

type Overrides = {
  admonition?: typeof Admonition
  audio?: typeof Audio
  colist?: typeof CoList
  dlist?: typeof DList
  example?: typeof Example
  floating_title?: typeof FloatingTitle
  image?: typeof Image
  listing?: typeof Listing
  literal?: typeof Literal
  olist?: typeof OList
  open?: typeof Open
  page_break?: typeof PageBreak
  paragraph?: typeof Paragraph
  pass?: typeof Pass
  preamble?: typeof Preamble
  quote?: typeof Quote
  section?: typeof Section
  sidebar?: typeof Sidebar
  table?: typeof Table
  toc?: typeof TableOfContents
  thematic_break?: typeof ThematicBreak
  ulist?: typeof UList
  verse?: typeof Verse
}

export type Options = {
  overrides?: Overrides
  customDocument?: typeof Document
  document: {
    attributes?: DocumentBlock['attributes']
    sections?: DocumentSection[]
  }
}

export const Context = createContext<Options>({ document: {} })

const Asciidoc = ({
  document,
  options,
}: {
  document: DocumentBlock
  options?: Options
}) => {
  const CustomDocument = options && options.customDocument

  return (
    <Context.Provider
      value={
        {
          ...options,
          document: { attributes: document.attributes, sections: document.sections },
        } || {}
      }
    >
      {CustomDocument ? (
        <CustomDocument document={document} />
      ) : (
        <Document document={document} />
      )}
    </Context.Provider>
  )
}

const Content = ({ blocks }: { blocks: Block[] }) => {
  return (
    <>
      {blocks.map((block: Block, index: number) => (
        <Converter key={`${index}-${block.type}`} node={block} />
      ))}
    </>
  )
}

const Converter = ({ node }: { node: Block }) => {
  const { overrides } = useContext(Context)

  const transform = node.type as keyof Overrides
  const OverrideComponent =
    overrides && (overrides[transform] as ({ node }: { node: Block }) => JSX.Element)

  if (OverrideComponent) {
    return <OverrideComponent node={node} />
  }

  switch (transform) {
    case 'audio':
      return <Audio node={node as AudioBlock} />
    case 'preamble':
      return <Preamble node={node as Block} />
    case 'section':
      return <Section node={node as SectionBlock} />
    case 'paragraph':
      return <Paragraph node={node as ParagraphBlock} />
    case 'dlist':
      return <DList node={node as DListBlock} />
    case 'ulist':
      return <UList node={node as ListBlock} />
    case 'floating_title':
      return <FloatingTitle node={node as Block} />
    case 'admonition':
      return <Admonition node={node as AdmonitionBlock} />
    case 'listing':
      return <Listing node={node as LiteralBlock} />
    case 'literal':
      return <Literal node={node as LiteralBlock} />
    case 'image':
      return <Image node={node as ImageBlock} />
    case 'colist':
      return <CoList node={node as CoListBlock} />
    case 'olist':
      return <OList node={node as ListBlock} />
    case 'table':
      return <Table node={node as TableBlock} />
    case 'thematic_break':
      return <ThematicBreak />
    case 'open':
      return <Open node={node as Block} />
    case 'pass':
      return <Pass node={node as Block} />
    case 'page_break':
      return <PageBreak />
    case 'example':
      return <Example node={node as LiteralBlock} />
    case 'sidebar':
      return <Sidebar node={node as Block} />
    case 'quote':
      return <Quote node={node as Block} />
    case 'verse':
      return <Verse node={node as Block} />
    case 'toc':
      return <TableOfContents node={node as Block} />
    default:
      return <></>
  }
}

export { Asciidoc, Content, prepareDocument, Title, parse }
export type {
  AdmonitionBlock,
  AudioBlock,
  Block,
  CoListBlock,
  DListBlock,
  DocumentBlock,
  DocumentSection,
  ImageBlock,
  ListBlock,
  LiteralBlock,
  ParagraphBlock,
  SectionBlock,
  TableBlock,
}
export * from './templates'
