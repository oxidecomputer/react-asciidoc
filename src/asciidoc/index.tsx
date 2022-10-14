import Processor from 'asciidoctor'
import type { Asciidoctor } from 'asciidoctor'
import hljs from 'highlight.js'

import InlineConverter from './inlineConverter'
import {
  Admonition,
  CoList,
  DList,
  Example,
  Image,
  Listing,
  Literal,
  OList,
  Paragraph,
  Preamble,
  Quote,
  Section,
  Sidebar,
  Table,
  UList,
} from './templates'

export const processor = Processor()

// needs its own name so it doesn't get mixed up with built-in highlight.js (I think)
processor.SyntaxHighlighter.register('highlight.js-server', {
  handlesHighlighting: () => true,
  highlight: (_node, source, lang) => {
    if (!lang) return source
    return hljs.getLanguage(lang)
      ? hljs.highlight(source, { language: lang }).value
      : source
  },
})

processor.ConverterFactory.register(new InlineConverter(), ['html5'])

const Asciidoc = ({ content }: { content: string }) => {
  const doc = processor.load(content, {
    standalone: true,
    attributes: {
      'source-highlighter': 'highlight.js-server',
      sectlinks: 'true',
      icons: 'font',
    },
  })
  const blocks = doc.getBlocks()

  return (
    <div>
      <Content blocks={blocks} />
    </div>
  )
}

export const Content = ({ blocks }: { blocks: Asciidoctor.AbstractBlock[] }) => {
  return (
    <>
      {blocks.map((block: Asciidoctor.AbstractBlock, index: number) => (
        <Converter key={`${index}-${block.getNodeName()}`} node={block} />
      ))}
    </>
  )
}

const Converter = ({ node }: { node: Asciidoctor.AbstractBlock }) => {
  const transform = node.getNodeName()

  switch (transform) {
    case 'preamble':
      return <Preamble node={node} />
    case 'section':
      return <Section node={node as Asciidoctor.Block} />
    case 'paragraph':
      return <Paragraph node={node as Asciidoctor.Block} />
    case 'dlist':
      return <DList node={node as Asciidoctor.List} />
    case 'ulist':
      return <UList node={node as Asciidoctor.List} />
    case 'admonition':
      return <Admonition node={node as Asciidoctor.Block} />
    case 'listing':
      return <Listing node={node as Asciidoctor.Block} />
    case 'literal':
      return <Literal node={node as Asciidoctor.Block} />
    case 'image':
      return <Image node={node as Asciidoctor.Block} />
    case 'colist':
      return <CoList node={node as Asciidoctor.List} />
    case 'olist':
      return <OList node={node as Asciidoctor.List} />
    case 'table':
      return <Table node={node as Asciidoctor.Table} />
    case 'example':
      return <Example node={node as Asciidoctor.Block} />
    case 'sidebar':
      return <Sidebar node={node as Asciidoctor.Block} />
    case 'quote':
      return <Quote node={node as Asciidoctor.Block} />
    default:
      return (
        <div className="bg-error-secondary text-error rounded-lg my-1">
          {node.getNodeName()}
        </div>
      )
  }
}

export default Asciidoc
