export type QuoteSubType =
  | 'emphasis'
  | 'strong'
  | 'monospaced'
  | 'double'
  | 'single'
  | 'superscript'
  | 'subscript'
  | 'mark'
  | 'asciimath'
  | 'latexmath'
  | 'unquoted'

export interface QSubEntry {
  type: QuoteSubType
  scope: 'constrained' | 'unconstrained'
  rx: RegExp
}

export type InlineNode =
  | TextNode
  | QuotedNode
  | AnchorNode
  | ImageNode
  | FootnoteNode
  | IndexTermNode
  | CalloutNode
  | BreakNode
  | ButtonNode
  | KeyboardNode
  | MenuNode

export interface TextNode {
  type: 'text'
  text: string
  /** Raw HTML from a no-subs passthrough (`+++…+++`, `pass:[…]`). Must be
   *  emitted verbatim — the React renderer parses it into elements rather
   *  than escaping it as text. */
  raw?: boolean
}

export interface QuotedNode {
  type: 'quoted'
  subtype:
    | 'emphasis'
    | 'strong'
    | 'monospaced'
    | 'double'
    | 'single'
    | 'superscript'
    | 'subscript'
    | 'mark'
    | 'asciimath'
    | 'latexmath'
    | 'unquoted'
  text: InlineNode[]
  id?: string
  role?: string
}

export interface AnchorNode {
  type: 'anchor'
  subtype: 'link' | 'ref' | 'xref' | 'bibref'
  text: InlineNode[]
  target: string
  id?: string
  role?: string
  window?: string
  /** Per-xref display style from `xref:id[xrefstyle=short|full]`. Overrides
   *  the document `:xrefstyle:` when computing the fallback label. */
  xrefstyle?: string
}

export interface ImageNode {
  type: 'image'
  subtype: 'image' | 'icon'
  target: string
  alt?: string
  width?: string
  height?: string
  id?: string
  role?: string
  title?: string
  /** `float` attribute — rendered as an extra class on the wrapper span. */
  float?: string
  /** `link` attribute — wraps the image/icon in `<a class="image" href>`. */
  link?: string
  /** `window` (`^` or `window=`) for the link wrapper. */
  window?: string
  iconType?: 'text' | 'image' | 'font'
}

export interface FootnoteNode {
  type: 'footnote'
  text: InlineNode[]
  id?: string
  refid?: string
  /** Sequential index assigned during parsing (1-based). */
  index?: number
}

export interface IndexTermNode {
  type: 'indexterm'
  terms: string[]
  visible?: boolean
}

export interface CalloutNode {
  type: 'callout'
  number: string
}

export interface BreakNode {
  type: 'break'
  subtype: 'line'
}

export interface ButtonNode {
  type: 'button'
  text: InlineNode[]
}

export interface KeyboardNode {
  type: 'kbd'
  keys: string[]
}

export interface MenuNode {
  type: 'menu'
  items: string[]
}
