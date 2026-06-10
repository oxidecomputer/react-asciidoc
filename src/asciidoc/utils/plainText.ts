import { decodeHTML } from 'entities'

import type { InlineNode } from '../inline'

/** Strip HTML tags from a raw-passthrough text node's content (`+++…+++`,
 *  `pass:[…]`), leaving only its textual payload. */
const stripTags = (s: string): string => s.replace(/<[^>]*>/g, '')

const joinNodes = (nodes: InlineNode[]): string => nodes.map(nodePlainText).join('')

/**
 * Project a single inline node down to its visible text. Kept exhaustive over
 * the `InlineNode` union (the `never` default makes adding a node type a
 * compile error here) so that a plain-text projection can't silently drop a new
 * inline kind — the whole reason this lives in the library rather than being
 * copied app-side.
 */
const nodePlainText = (node: InlineNode): string => {
  switch (node.type) {
    case 'text':
      // Raw nodes carry HTML; everything else is literal text. Entity decoding
      // happens once over the whole string in `plainText`.
      return node.raw ? stripTags(node.text) : node.text
    case 'quoted':
      // Smart quotes contribute the visible curly delimiters; every other
      // quoted subtype (emphasis, strong, mark, sub/sup, math, …) is purely
      // presentational, so only its inner text survives.
      if (node.subtype === 'double') return `“${joinNodes(node.text)}”`
      if (node.subtype === 'single') return `‘${joinNodes(node.text)}’`
      return joinNodes(node.text)
    case 'anchor':
      // Link / xref label text; ref and bibref definitions have no flowing text.
      return joinNodes(node.text)
    case 'image':
      return node.alt ?? ''
    case 'footnote':
      // The footnote marker (`[N]`) is not part of the flowing text.
      return ''
    case 'indexterm':
      return node.visible ? node.terms.join(', ') : ''
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
 * Project an inline AST down to its visible plain text, with HTML entities
 * decoded. The inline parser deliberately leaves numeric entities (`&#8217;`)
 * in text nodes for the React renderer to round-trip, so the projection to
 * plain text is where they must be resolved — hence the library owns both the
 * walk (coupled to the `InlineNode` union) and the decode.
 *
 * Useful for anchor-override tooltips, `alt`/`title` projections, search
 * indexing, and anywhere a flat string is needed instead of a React tree.
 */
export const plainText = (nodes: InlineNode[] | undefined): string =>
  nodes ? decodeHTML(joinNodes(nodes)) : ''
