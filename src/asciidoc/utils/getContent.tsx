import type {
  AbstractBlock,
  Block,
  Document,
  Inline,
  ListItem,
  Table,
} from '@asciidoctor/core'

const contentCache: { [key: string]: string } = {}
type Node = Block | AbstractBlock | Table.Cell

const getContent = (node: Node) => {
  const cacheKey = (node as Node & { $$id: string }).$$id

  if (contentCache[cacheKey]) {
    return contentCache[cacheKey]
  }

  const newContent = node.getContent() || ''
  contentCache[cacheKey] = newContent
  return newContent
}

const getText = (node: ListItem | Document.Footnote | Table.Cell | Inline) => {
  const cacheKey = (node as Node & { $$id: string }).$$id

  if (contentCache[cacheKey]) {
    return contentCache[cacheKey]
  }

  const newContent = node.getText() || ''
  contentCache[cacheKey] = newContent
  return newContent
}

export { getContent, getText }
