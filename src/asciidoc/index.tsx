import hljs from 'highlight.js'
import parse from 'html-react-parser'

import Asciidoctor from '~/lib/asciidoctor'
import type { Asciidoctor as AdType } from '~/lib/asciidoctor'

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

export const ad = Asciidoctor()

// needs its own name so it doesn't get mixed up with built-in highlight.js (I think)
ad.SyntaxHighlighter.register('highlight.js-server', {
  handlesHighlighting: () => true,
  highlight: (_node, source, lang) => {
    if (!lang) return source
    return hljs.getLanguage(lang)
      ? hljs.highlight(source, { language: lang }).value
      : source
  },
})

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

const Asciidoc = ({ content }: { content: string }) => {
  const doc = ad.load(content, {
    standalone: true,
    attributes: {
      'source-highlighter': 'highlight.js-server',
      sectlinks: 'true',
      icons: 'font',
    },
    sourcemap: true,
  })

  return <Document document={doc} />
}

export const Content = ({ blocks }: { blocks: AdType.AbstractBlock[] }) => {
  return (
    <>
      {blocks.map((block: AdType.AbstractBlock, index: number) => (
        <Converter key={`${index}-${block.getNodeName()}`} node={block} />
      ))}
    </>
  )
}

const Converter = ({ node }: { node: AdType.AbstractBlock }) => {
  const transform = node.getNodeName()

  const document = node.getDocument()
  const blockAttributes = node.getAttributes()
  document.playbackAttributes(blockAttributes)

  switch (transform) {
    case 'audio':
      return <Audio node={node as AdType.Block} />
    case 'preamble':
      return <Preamble node={node} />
    case 'section':
      return <Section node={node as AdType.Section} />
    case 'paragraph':
      return <Paragraph node={node as AdType.Block} />
    case 'dlist':
      return <DList node={node as AdType.List} />
    case 'ulist':
      return <UList node={node as AdType.List} />
    case 'floating_title':
      return <FloatingTitle node={node as AdType.Block} />
    case 'admonition':
      return <Admonition node={node as AdType.Block} />
    case 'listing':
      return <Listing node={node as AdType.Block} />
    case 'literal':
      return <Literal node={node as AdType.Block} />
    case 'image':
      return <Image node={node as AdType.Block} />
    case 'colist':
      return <CoList node={node as AdType.List} />
    case 'olist':
      return <OList node={node as AdType.List} />
    case 'table':
      return <Table node={node as AdType.Table} />
    case 'thematic_break':
      return <ThematicBreak />
    case 'open':
      return <Open node={node as AdType.Block} />
    case 'pass':
      return <Pass node={node as AdType.Block} />
    case 'page_break':
      return <PageBreak />
    case 'example':
      return <Example node={node as AdType.Block} />
    case 'sidebar':
      return <Sidebar node={node as AdType.Block} />
    case 'quote':
      return <Quote node={node as AdType.Block} />
    case 'verse':
      return <Verse node={node as AdType.Block} />
    case 'toc':
      return <TableOfContents node={node as AdType.Block} />
    default:
      return <>{parse(node.convert())}</>
  }
}

export default Asciidoc
