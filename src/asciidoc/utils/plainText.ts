import { decodeHTML } from 'entities'

import type { InlineNode } from '../inline'

const stripTags = (s: string): string => s.replace(/<[^>]*>/g, '')

const joinNodes = (nodes: InlineNode[]): string => nodes.map(nodePlainText).join('')

// Exhaustive over `InlineNode` — the `never` default turns adding a node type
// into a compile error here, so the projection can't silently drop a new kind.
const nodePlainText = (node: InlineNode): string => {
  switch (node.type) {
    case 'text':
      return node.raw ? stripTags(node.text) : node.text // raw nodes carry HTML
    case 'quoted':
      // Smart quotes keep their visible delimiters; other subtypes (emphasis,
      // strong, sub/sup, math, …) are presentational, so only inner text shows.
      if (node.subtype === 'double') return `“${joinNodes(node.text)}”`
      if (node.subtype === 'single') return `‘${joinNodes(node.text)}’`
      return joinNodes(node.text)
    case 'anchor':
      return joinNodes(node.text) // link/xref label; ref/bibref have none
    case 'image':
      return node.alt ?? ''
    case 'indexterm':
      return node.visible ? node.terms.join(', ') : ''
    case 'footnote': // markers, not flowing text
    case 'callout':
      return ''
    case 'break':
      return ' '
    case 'button':
      return joinNodes(node.text)
    case 'kbd':
      return node.keys.join('+')
    case 'menu':
      return node.items.join(' > ')
    default: {
      const _exhaustive: never = node
      return _exhaustive
    }
  }
}

/**
 * Flatten an inline AST to its visible plain text, entity-decoded. The parser
 * leaves numeric entities (`&#8217;`) in text nodes for React to round-trip, so
 * plain text is where they must be resolved — the library owns both the walk
 * (coupled to `InlineNode`) and the decode. For tooltips, `alt`/`title`, search
 * indexing — anywhere a string is needed instead of a React tree.
 */
export const plainText = (nodes: InlineNode[] | undefined): string =>
  nodes ? decodeHTML(joinNodes(nodes)) : ''
