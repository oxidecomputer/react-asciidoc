import type { AbstractBlock, Block, List } from '@asciidoctor/core'
import parse from 'html-react-parser'

export const Title = ({ text }: { text: string | undefined }) =>
  text ? <div className="title">{parse(text)}</div> : null

export const getRole = (node: AbstractBlock | Block | List) =>
  typeof node.getRole() === 'string' ? node.getRole() : undefined

export const getLineNumber = (node: AbstractBlock | Block | List) =>
  node.getLineNumber() ? { 'data-lineno': node.getLineNumber() } : {}
