import asciidoctor from '@asciidoctor/core'
import type {
  AbstractBlock,
  Block,
  List,
  Section as SectionType,
  Table as TableType,
} from '@asciidoctor/core'
import type * as AdocTypes from '@asciidoctor/core'
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
import { CaptionedTitle, Title, getLineNumber, getRole } from './templates/util'
import { getContent, getText } from './utils/getContent'

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
}

const OptionsContext = createContext<Options>({})

const Asciidoc = ({
  content,
  options,
}: {
  content: AdocTypes.Document
  options?: Options
}) => {
  const CustomDocument = options && options.customDocument

  return (
    <OptionsContext.Provider value={options || {}}>
      {CustomDocument ? (
        <CustomDocument document={content} />
      ) : (
        <Document document={content} />
      )}
    </OptionsContext.Provider>
  )
}

const Content = ({ blocks }: { blocks: AbstractBlock[] }) => {
  return (
    <>
      {blocks.map((block: AbstractBlock, index: number) => (
        <Converter key={`${index}-${block.getNodeName()}`} node={block} />
      ))}
    </>
  )
}

const Converter = ({ node }: { node: AbstractBlock }) => {
  const opts = useContext(OptionsContext)

  const transform = node.getNodeName() as keyof Overrides

  const document = node.getDocument()
  const blockAttributes = node.getAttributes()
  document.playbackAttributes(blockAttributes)

  const OverrideComponent = opts && opts.overrides && opts.overrides[transform]

  if (OverrideComponent) {
    return <OverrideComponent node={node as any} />
  }

  switch (transform) {
    case 'audio':
      return <Audio node={node as Block} />
    case 'preamble':
      return <Preamble node={node} />
    case 'section':
      return <Section node={node as SectionType} />
    case 'paragraph':
      return <Paragraph node={node as Block} />
    case 'dlist':
      return <DList node={node as List} />
    case 'ulist':
      return <UList node={node as List} />
    case 'floating_title':
      return <FloatingTitle node={node as Block} />
    case 'admonition':
      return <Admonition node={node as Block} />
    case 'listing':
      return <Listing node={node as Block} />
    case 'literal':
      return <Literal node={node as Block} />
    case 'image':
      return <Image node={node as Block} />
    case 'colist':
      return <CoList node={node as List} />
    case 'olist':
      return <OList node={node as List} />
    case 'table':
      return <Table node={node as TableType} />
    case 'thematic_break':
      return <ThematicBreak />
    case 'open':
      return <Open node={node as Block} />
    case 'pass':
      return <Pass node={node as Block} />
    case 'page_break':
      return <PageBreak />
    case 'example':
      return <Example node={node as Block} />
    case 'sidebar':
      return <Sidebar node={node as Block} />
    case 'quote':
      return <Quote node={node as Block} />
    case 'verse':
      return <Verse node={node as Block} />
    case 'toc':
      return <TableOfContents node={node as Block} />
    default:
      return <>{parse(node.convert())}</>
  }
}

export default Asciidoc
export {
  asciidoctor,
  Content,
  getContent,
  getText,
  Title,
  getRole,
  getLineNumber,
  CaptionedTitle,
  AdocTypes,
  parse,
}
export * from './templates'
