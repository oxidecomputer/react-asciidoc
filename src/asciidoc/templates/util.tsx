import type { AbstractBlock, Block, List } from '@asciidoctor/core'
import parse from 'html-react-parser'

export const Title = ({ node }: { node: AbstractBlock | Block | List }) =>
  node.hasTitle() ? <div className="title">{parse(node.getTitle() || '')}</div> : null

export const CaptionedTitle = ({ node }: { node: Block | Block | List }) =>
  node.hasTitle() ? (
    <div className="title">{parse(node.getCaptionedTitle() || '')}</div>
  ) : null

export const getRole = (node: AbstractBlock | Block | List) =>
  typeof node.getRole() === 'string' ? node.getRole() : undefined
