import type * as AdocTypes from '@asciidoctor/core'

import {
  type ParseState,
  parseInline,
  renderInlineAsString,
  subCallouts,
  subSpecialchars,
} from '../inline'
import type { FootnoteNode, InlineNode } from '../inline'

type NodeType =
  | 'audio'
  | 'admonition'
  | 'colist'
  | 'cell'
  | 'dlist'
  | 'document'
  | 'embedded'
  | 'example'
  | 'floating_title'
  | 'image'
  | 'inline_anchor'
  | 'inline_break'
  | 'inline_button'
  | 'inline_callout'
  | 'inline_footnote'
  | 'inline_image'
  | 'inline_kbd'
  | 'inline_menu'
  | 'inline_quoted'
  | 'listing'
  | 'list_item'
  | 'literal'
  | 'olist'
  | 'open'
  | 'outline'
  | 'page_break'
  | 'paragraph'
  | 'pass'
  | 'preamble'
  | 'quote'
  | 'section'
  | 'sidebar'
  | 'stem'
  | 'table'
  | 'table_cell'
  | 'thematic_break'
  | 'toc'
  | 'ulist'
  | 'verse'
  | 'video'

type ContentModel = 'compound' | 'simple' | 'verbatim' | 'raw' | 'empty'

export type BaseBlock = {
  id?: string
  type: NodeType
  blocks: Block[]
  content?: string | string[] | undefined
  /** Inline AST parsed from this block's source (only set for simple-content
   *  leaves). Templates may render this directly to compose React inline
   *  components, or fall back to `content` (HTML). */
  inlines?: InlineNode[] | undefined
  /** Inline AST for the block's title, if present. */
  titleInlines?: InlineNode[] | undefined
  attributes: Record<string, string | number>
  contentModel: ContentModel | undefined
  lineNumber?: number | undefined
  style?: string | undefined
  role?: string | undefined
  title?: string | undefined
  level: number
}

export type Block =
  | BaseBlock
  | ParagraphBlock
  | AdmonitionBlock
  | CoListBlock
  | ImageBlock
  | LiteralBlock
  | SectionBlock
  | TableBlock
  | AudioBlock
  | VideoBlock

export type DocumentSection = {
  id: string
  title: string
  level: number
  num: string
  numbered: boolean
  hasCaption: boolean
  sections: DocumentSection[]
}

export type DocumentBlock = {
  type: 'document'
  /** Explicit id on the document title (`[[abstract]]` / `[#abstract]`),
   *  emitted on the title `<h1>`. */
  id?: string
  title: string
  hasHeader: boolean
  noHeader: boolean
  attributes: Record<string, string | number>
  blocks: Block[]
  contentModel: ContentModel | undefined
  footnotes: {
    index: number
    textInlines: InlineNode[]
  }[]
  sections: DocumentSection[]
  authors: { name: string | undefined; email: string | undefined }[]
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
}

export interface AdmonitionBlock extends BaseBlock {
  type: 'admonition'
  iconUri: string
}

export interface AudioBlock extends BaseBlock {
  type: 'audio'
  mediaUri: string
  autoplay: boolean
  noControls: boolean
  loop: boolean
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  mediaUri: string
  autoplay: boolean
  noControls: boolean
  loop: boolean
  onHover: boolean
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  imageUri: string
  /** Substituted alt text (asciidoctor `getAlt()` — entities like `&#8217;`
   *  already applied). Must be emitted verbatim, not via a JSX attribute,
   *  which would re-escape the `&`. */
  alt: string
}

export interface ListItemBlock extends BaseBlock {
  textInlines?: InlineNode[] | undefined
}

export interface ListBlock extends BaseBlock {
  items: ListItemBlock[]
}

export interface CoListBlock extends ListBlock {
  type: 'colist'
}

export interface DListBlock extends BaseBlock {
  type: 'dlist'
  items: (ListItemBlock | ListItemBlock[])[][]
}

export interface LiteralBlock extends BaseBlock {
  type: 'listing'
  source: string
  language: string | undefined
}

export interface SectionBlock extends BaseBlock {
  type: 'section'
  level: number
  numbered: boolean
  title: string
  num: string
  name: string
  hasCaption: boolean
}

export interface TableBlock extends BaseBlock {
  type: 'table'
  caption: string
  columns: Column[]
  rows: Row
  headRows: Cell[][]
  bodyRows: Cell[][]
  footRows: Cell[][]
  hasHeader: boolean
  hasFooter: boolean
  hasAutowidth: boolean
}

export type Column = {
  attributes: Record<string, string>
  columnNumber: number
  width: string | undefined
  horizontalAlign: string | undefined
  verticalAlign: string | undefined
  style: string | undefined
}

export type Row = {
  head: Cell[][]
  body: Cell[][]
  foot: Cell[][]
}

export interface Cell extends BaseBlock {
  type: 'table_cell'
  columnSpan: number | undefined
  rowSpan: number | undefined
  text: string | undefined
  textInlines?: InlineNode[] | undefined
  /** Content for cell rendering: a string for asciidoc/literal cells,
   *  or an array of per-paragraph HTML strings for other styles. */
  content: string | string[] | undefined
  /** Per-paragraph inline ASTs mirroring the paragraph boundaries of
   *  `content`. Lets the Table template render cell inline content through
   *  `<RenderInline>` (so `inlineOverrides` apply) instead of injecting the
   *  serialized HTML string. Undefined for asciidoc/literal cells, which
   *  don't go through the inline-string path. */
  contentInlines?: InlineNode[][] | undefined
  source: string
  lines: string[]
  column: Column | undefined
  width: string | undefined
  columnPercentageWidth: string | undefined
}

/**
 * A convenience method to check if the specified option attribute is enabled on the current node.
 * Check if the option is enabled. This method simply checks to see if the <name>-option attribute is defined on the current node.
 */
export const isOption = (attrs: Record<string, string | number>, option: string) => {
  return attrs[`${option}-option`] !== undefined
}

/**
 * Get the value of the specified attribute.
 * If the attribute is not found on this node, fallback_name is set, and this node is not the Document node, get the value of the specified attribute from the Document node.
 *
 * Look for the specified attribute in the attributes on this node and return the value of the attribute, if found.
 * Otherwise, if fallback_name is set (default: same as name) and documentAttrs is included, look for that attribute on the Document node and return its value, if found.
 * Otherwise, return the default value (default: undefined).
 */
export const getAttribute = (
  attrs: Record<string, string | number>,
  name: string,
  defaultValue: any = undefined,
  fallbackName?: string,
  documentAttrs?: Record<string, string | number>,
) => {
  if (attrs[name] !== undefined) {
    return attrs[name]
  }

  const effectiveFallbackName = fallbackName || name
  if (
    effectiveFallbackName &&
    documentAttrs &&
    documentAttrs[effectiveFallbackName] !== undefined
  ) {
    return documentAttrs[effectiveFallbackName]
  }

  return defaultValue
}

export const hasAttribute = (attrs: Record<string, string | number>, name: string) => {
  return attrs[name] !== undefined
}

/** Asciidoctor stores raw (pre-substitution) title text in the `title`
 *  instance var; `getTitle()` returns inline-substituted HTML. We want the
 *  raw text to feed into our own inline parser. */
const getRawTitle = (block: { title?: string }): string | undefined =>
  typeof block.title === 'string' ? block.title : undefined

const sourceFromBlock = (block: AdocTypes.AbstractBlock): string => {
  if (typeof (block as AdocTypes.Block).getSourceLines === 'function') {
    const lines = (block as AdocTypes.Block).getSourceLines()
    // Asciidoctor's getContent() strips leading and trailing empty lines
    let start = 0
    while (start < lines.length && lines[start] === '') start++
    let end = lines.length
    while (end > start && lines[end - 1] === '') end--
    return lines.slice(start, end).join('\n')
  }
  return ''
}

/** Strip leading and trailing blank lines (whitespace-only) from verbatim /
 *  raw block content, AFTER substitutions — mirrors asciidoctor's
 *  `Block#content` for the verbatim/raw content models. Unlike the pre-subs
 *  strip in `sourceFromBlock`, this catches lines that only became blank once
 *  e.g. `{empty}` was resolved. No-op for content of fewer than two lines. */
const stripVerbatimEdges = (content: string): string => {
  const lines = content.split('\n')
  if (lines.length < 2) return content
  while (lines.length && lines[0].replace(/\s+$/, '') === '') lines.shift()
  while (lines.length && lines[lines.length - 1].replace(/\s+$/, '') === '') lines.pop()
  return lines.join('\n')
}

/**
 * Split a flat inline AST into per-paragraph groups at blank-line (`\n\n`)
 * boundaries, mirroring how the serialized HTML is split on `/\n\n+/`. Paragraph
 * breaks only ever occur inside top-level text nodes (other node types render
 * without a `\n\n`), so we split those and keep every other node intact. The
 * group count matches the `/\n\n+/`.split() of the rendered string, so the
 * resulting paragraphs line up 1:1 with `cell.content`.
 */
const splitInlineParagraphs = (nodes: InlineNode[]): InlineNode[][] => {
  const groups: InlineNode[][] = [[]]
  for (const node of nodes) {
    if (node.type === 'text' && !node.raw && /\n\n+/.test(node.text)) {
      const parts = node.text.split(/\n\n+/)
      parts.forEach((part, i) => {
        if (i > 0) groups.push([])
        if (part.length > 0) groups[groups.length - 1].push({ type: 'text', text: part })
      })
    } else {
      groups[groups.length - 1].push(node)
    }
  }
  return groups
}

/** Drop leading whitespace from an inline AST: trims the front of a leading
 *  plain-text node, dropping it entirely if it was whitespace-only. Used to
 *  clean up the gap a stripped `[[[id]]]` bibref label leaves behind. */
const trimLeadingSpace = (nodes: InlineNode[]): InlineNode[] => {
  const first = nodes[0]
  if (!first || first.type !== 'text' || first.raw) return nodes
  const trimmed = first.text.replace(/^\s+/, '')
  if (trimmed === '') return nodes.slice(1)
  if (trimmed === first.text) return nodes
  return [{ ...first, text: trimmed }, ...nodes.slice(1)]
}

/** Collect footnote definitions (with text) from a resolved inline AST. */
const collectFootnoteDefs = (nodes: InlineNode[]): FootnoteNode[] => {
  const defs: FootnoteNode[] = []
  const walk = (ns: InlineNode[]) => {
    for (const n of ns) {
      if (n.type === 'footnote' && n.text && n.text.length > 0) {
        defs.push(n)
      }
      if ('text' in n && Array.isArray(n.text)) {
        walk(n.text)
      }
    }
  }
  walk(nodes)
  return defs
}

export const prepareDocument = (document: AdocTypes.Document) => {
  let preparedDocument: DocumentBlock

  const docAttrs = document.getAttributes() as Record<string, string | number>
  const inlineAttrs: Record<string, string> = {}
  for (const [k, v] of Object.entries(docAttrs)) {
    if (v != null) inlineAttrs[k] = String(v)
  }
  // Pre-scan the raw source for source-order counter resets. Lines like
  // `:!steps:` / `:steps!:` unset a document attribute; asciidoctor restarts
  // the next `{counter:steps}` from 1. These entries aren't AST blocks, so the
  // inline parser never sees them. We can't align them by line number (blocks
  // report no line number without `sourcemap`), so instead we count counter
  // uses per name in source order and record, for each name, the use-indices
  // immediately preceded by a reset. The parser replays those resets.
  const counterResets = new Map<string, Set<number>>()
  // Counter seeds: when `:name: N` appears in the body with a numeric value,
  // and the counter `name` hasn't been used yet, the next `{counter:name}`
  // should start from N+1 instead of 1. We record the use-index at which each
  // seed applies so we can look it up during inline parsing.
  const counterSeeds = new Map<string, Map<number, string>>()
  // Body-defined attributes (`:name: value` after the header) are applied by
  // asciidoctor only during conversion, so they never reach `getAttributes()`
  // and our inline parser can't resolve `{name}` references to them. Collect
  // them from the source and merge the body-only ones into `inlineAttrs`
  // (header/API attributes already present win, so locked attrs are safe).
  const bodyAttrs = new Map<string, string>()
  {
    const useCount = new Map<string, number>()
    const srcLines: string[] =
      typeof (document as unknown as { getSourceLines?: () => string[] }).getSourceLines ===
      'function'
        ? (document as unknown as { getSourceLines: () => string[] }).getSourceLines()
        : []
    const unsetRe = /^:(?:!([\w-]+)|([\w-]+)!):\s*$/
    const setRe = /^:([A-Za-z][\w-]*):(?: (.*))?$/
    const useRe = /(\\)?\{counter2?:([\w-]+)(?::[^}]*)?\}/g
    // Skip lines inside verbatim/comment fences (`----`, `....`, `++++`,
    // `////`), where `:name:` / `{counter:…}` are literal text, not directives.
    const fenceRe = /^(-{4,}|\.{4,}|\+{4,}|\/{4,})$/
    let fence: string | null = null
    for (const ln of srcLines) {
      const fm = fenceRe.exec(ln.trimEnd())
      if (fm) {
        const kind = fm[1][0]
        if (fence === null) fence = kind
        else if (fence === kind) fence = null
        continue
      }
      if (fence !== null) continue
      const unset = unsetRe.exec(ln)
      if (unset) {
        const name = unset[1] || unset[2]
        const at = useCount.get(name) ?? 0
        if (!counterResets.has(name)) counterResets.set(name, new Set())
        counterResets.get(name)!.add(at)
        bodyAttrs.delete(name)
        continue
      }
      const set = setRe.exec(ln)
      if (set) {
        const attrName = set[1]
        const attrValue = set[2] ?? ''
        bodyAttrs.set(attrName, attrValue)
        // If this sets a non-empty value for a (potential) counter name,
        // record the seed at the current use-index so the next
        // `{counter:name}` increments from it (numeric or `succ`-able string).
        if (attrValue !== '') {
          const useIdx = useCount.get(attrName) ?? 0
          if (!counterSeeds.has(attrName)) counterSeeds.set(attrName, new Map())
          counterSeeds.get(attrName)!.set(useIdx, attrValue)
        }
        continue
      }
      let m: RegExpExecArray | null
      useRe.lastIndex = 0
      while ((m = useRe.exec(ln))) {
        if (m[1]) continue // escaped `\{counter:...}`
        useCount.set(m[2], (useCount.get(m[2]) ?? 0) + 1)
      }
    }
  }
  // Add body-only attributes (don't override header/API values already set).
  for (const [k, v] of bodyAttrs) {
    if (!(k in inlineAttrs)) inlineAttrs[k] = v
  }

  const inlineState: ParseState = {
    footnoteIndex: 0,
    footnotesById: new Map(),
    footnoteDefs: [],
    counters: new Map(),
    counterResets,
    counterUses: new Map(),
    counterSeeds,
  }

  // Block-scoped inline attributes: a block can carry options that affect
  // inline substitution (e.g. `[%hardbreaks]` → `hardbreaks-option`). Merge
  // those over the document attributes for that block's inline parse.
  const inlineAttrsFor = (block: { getAttributes?: () => unknown }) => {
    const a = (block.getAttributes && block.getAttributes()) as
      | Record<string, unknown>
      | undefined
    if (a && a['hardbreaks-option'] !== undefined) {
      return { ...inlineAttrs, 'hardbreaks-option': String(a['hardbreaks-option']) }
    }
    return inlineAttrs
  }

  // Build an id → display-text map so we can resolve `<<id>>` xrefs that
  // have no explicit reftext to the right label. The display text mirrors
  // asciidoctor's `Section#xreftext(xrefstyle)`: by default (no xrefstyle)
  // it's the plain section title — NOT the captioned title; the
  // "Appendix A: " / number prefix only appears in the TOC and headings,
  // not in body xrefs. With `:xrefstyle: short|full` set, sections render
  // as "Section N" / `Section N, "Title"`. Our inline parser has no
  // document context, so we walk its output and rewrite the fallback
  // `[id]` text into the real label.
  const refLabels = new Map<string, string>()
  // Every registered id (sections, block anchors, bibrefs). A target that is
  // a registered id is a DIRECT hit — even one with no display label (a bare
  // `[[RIFT]]` anchor) — and must NOT be re-interpreted as a natural xref.
  const idSet = new Set<string>()
  // Reverse map for "natural" cross references (`<<Section Title>>`):
  // asciidoctor's `Document#resolve_id` matches the target against each
  // ref's `xreftext()` (the plain title) EXACTLY — it does not slugify.
  // First-write-wins, in document order.
  const reftextToId = new Map<string, string>()

  const docXrefstyle =
    typeof docAttrs['xrefstyle'] === 'string'
      ? (docAttrs['xrefstyle'] as string)
      : undefined

  // Mirrors Ruby `Section#xreftext`. `numeral` is the trailing-dot form
  // returned by `getSectionNumeral()` (e.g. "2." / "14.3.3." / "A.").
  const sectionXreftext = (
    info: {
      title: string
      numbered: boolean
      sectname: string
      numeral: string
      reftext: string | undefined
    },
    style: string | undefined = docXrefstyle,
  ): string => {
    if (info.reftext) return info.reftext
    const isAppendixOrChapter = info.sectname === 'appendix' || info.sectname === 'chapter'
    const italicOrPlain = isAppendixOrChapter ? `<em>${info.title}</em>` : info.title
    if (style && info.numbered) {
      const base = info.numeral.replace(/\.$/, '')
      const sig = docAttrs[`${info.sectname}-refsig`]
      if (style === 'full') {
        const quotedTitle = isAppendixOrChapter
          ? `<em>${info.title}</em>`
          : `&#8220;${info.title}&#8221;`
        return sig ? `${sig} ${base}, ${quotedTitle}` : `${base}, ${quotedTitle}`
      }
      if (style === 'short') {
        return sig ? `${sig} ${base}` : base
      }
      return italicOrPlain
    }
    if (style) return italicOrPlain
    return info.title
  }

  // Per-id data so a single xref carrying its own `xrefstyle=` can recompute
  // its label with that style (overriding the document default).
  type SectionInfo = {
    title: string
    numbered: boolean
    sectname: string
    numeral: string
    reftext: string | undefined
  }
  const sectionInfos = new Map<string, SectionInfo>()
  const blockRefs = new Map<
    string,
    { $xreftext?: (style: string | null) => string | undefined }
  >()

  const collectTitles = (parent: AdocTypes.AbstractBlock | AdocTypes.Document) => {
    for (const s of parent.getSections()) {
      const id = s.getId()
      const reftext = (s.getReftext && s.getReftext()) || undefined
      const info = {
        title: s.getTitle() || '',
        numbered: s.isNumbered ? s.isNumbered() : false,
        sectname: (s.getSectionName && s.getSectionName()) || 'section',
        numeral: (s.getSectionNumeral && s.getSectionNumeral()) || '',
        reftext,
      }
      if (id) {
        idSet.add(id)
        sectionInfos.set(id, info)
        refLabels.set(id, sectionXreftext(info))
        // Natural-ref key: asciidoctor uses `xreftext()` with no style —
        // the explicit reftext if set, otherwise the plain title.
        const key = reftext || info.title
        if (key && !reftextToId.has(key)) reftextToId.set(key, id)
      }
      collectTitles(s)
    }
  }
  collectTitles(document)
  // …then explicit reftexts override (matches `document.getRefs()` —
  // anchors built with `[[id,reftext]]` or `[[[bibid, Cite Text]]]`).
  const refs = (document as AdocTypes.Document).getRefs
    ? ((document as AdocTypes.Document).getRefs() as Record<string, unknown>)
    : {}
  for (const id of Object.keys(refs)) {
    idSet.add(id)
    const r = refs[id] as {
      title?: string
      getReftext?: () => string | undefined
      $xreftext?: (style: string | null) => string | undefined
    }
    if (typeof r.$xreftext === 'function') blockRefs.set(id, r)
    const reftext = r.getReftext && r.getReftext()
    if (reftext) {
      refLabels.set(id, reftext)
      if (!reftextToId.has(reftext)) reftextToId.set(reftext, id)
    } else if (!refLabels.has(id)) {
      // Captioned blocks (table, image, example, …) aren't covered by the
      // section walk above. Use asciidoctor's own `xreftext`, honoring the
      // document xrefstyle, so `<<tbl>>` resolves to e.g. "Table 7" (short)
      // or the title (default) — matching `AbstractBlock#xreftext`.
      const xt =
        typeof r.$xreftext === 'function' ? r.$xreftext(docXrefstyle ?? null) : undefined
      if (xt) refLabels.set(id, xt)
      else if (r.title) refLabels.set(id, r.title)
    }
  }

  // Map bibliography ids → the external URL carried by their citation, so a
  // `<<id>>` xref into a `[bibliography]` entry can become a direct link, and
  // bibliography ids → the entry's citation body (its inline AST minus the
  // leading `[[[id]]]` bibref label) so an xref can show the reference content
  // on hover. Both built in the same pre-pass (before any body xref is
  // resolved) by re-parsing each bibref list item and reading the parser's
  // resolved bibref id + first link target — which captures every link form
  // (bare URL, `url[label]`, `link:`, `mailto:`).
  const bibUrls = new Map<string, string>()
  const bibInlines = new Map<string, InlineNode[]>()
  if (typeof (document as AdocTypes.Document).findBy === 'function') {
    const items = (document as AdocTypes.Document).findBy({
      context: 'list_item',
    }) as AdocTypes.AbstractBlock[]
    for (const item of items) {
      const raw = (item as unknown as { text?: string }).text
      if (typeof raw !== 'string' || !raw.includes('[[[')) continue
      // Throwaway footnote state so bibliography footnotes don't bump the
      // document-wide counter.
      const nodes = parseInline(raw, {
        attributes: inlineAttrs,
        state: { footnoteIndex: 0, footnotesById: new Map() },
      })
      let id: string | undefined
      let url: string | undefined
      const scan = (ns: InlineNode[]) => {
        for (const n of ns) {
          if (n.type === 'anchor') {
            if (n.subtype === 'bibref' && id === undefined) id = n.target
            else if (n.subtype === 'link' && url === undefined) url = n.target
          }
          if ('text' in n && Array.isArray((n as { text?: InlineNode[] }).text)) {
            scan((n as { text: InlineNode[] }).text)
          }
        }
      }
      scan(nodes)
      if (id) {
        // Citation body: everything after the leading `[[[id]]]` bibref label,
        // with the space the label left behind trimmed off the front.
        const bibIdx = nodes.findIndex((n) => n.type === 'anchor' && n.subtype === 'bibref')
        const body = trimLeadingSpace(bibIdx === -1 ? nodes : nodes.slice(bibIdx + 1))
        if (body.length > 0) bibInlines.set(id, body)
      }
      if (id && url) bibUrls.set(id, url)
    }
  }

  const resolveXrefs = (nodes: InlineNode[] | undefined): InlineNode[] | undefined => {
    if (!nodes) return nodes
    for (const n of nodes) {
      if (n.type === 'anchor' && n.subtype === 'xref') {
        const fallback = `[${n.target}]`
        const text = n.text
        const isBracketed =
          !n.explicitText &&
          text.length === 1 &&
          text[0].type === 'text' &&
          text[0].text === fallback
        const setLabel = (id: string) => {
          // A per-xref `xrefstyle=` recomputes the label with that style;
          // otherwise use the precomputed (document-style) label.
          let v = refLabels.get(id)
          if (n.xrefstyle) {
            const info = sectionInfos.get(id)
            if (info) v = sectionXreftext(info, n.xrefstyle)
            else {
              const r = blockRefs.get(id)
              if (r && typeof r.$xreftext === 'function') v = r.$xreftext(n.xrefstyle) ?? v
            }
          }
          if (isBracketed && typeof v === 'string') {
            // refLabels values are asciidoctor HTML (titles may contain
            // `&#8217;`, `<code>`, `<em>`, `&#8220;…&#8221;`). Mark `raw` so
            // the React renderer parses them to elements rather than escaping.
            n.text = [{ type: 'text', text: v, raw: true }]
          }
        }
        const hashIdx = n.target.indexOf('#')
        // 0a. Self / top reference (`xref:#[]` → target `#`): fall back to the
        //     root document's reftext (or its title), or `[^top]` when it has
        //     neither — mirroring asciidoctor's `get_root_document` branch.
        if (n.target === '#') {
          if (isBracketed) {
            const docTitle = (document as AdocTypes.Document).getDocumentTitle?.()
            const docRt =
              (document.getAttribute && (document.getAttribute('reftext') as string)) ||
              (typeof docTitle === 'string' ? docTitle : undefined)
            n.text = [{ type: 'text', text: docRt || '[^top]', raw: true }]
          }
        }
        // 0. Inter-document xref: `path#fragment` (a non-empty path before the
        //    `#`). Resolve the path with `relfileprefix`/`outfilesuffix` like
        //    asciidoctor's `convert_inline_anchor`; an asciidoc source path
        //    (`.adoc`, or extensionless) maps to the output suffix.
        if (hashIdx > 0 && !n.target.slice(0, hashIdx).includes('://')) {
          let path = n.target.slice(0, hashIdx)
          const frag = n.target.slice(hashIdx + 1)
          const outfilesuffix = (docAttrs['outfilesuffix'] as string) ?? '.html'
          let src2src = false
          if (path.endsWith('.adoc')) {
            path = path.slice(0, -5)
            src2src = true
          } else if (!/\.[^./]+$/.test(path)) {
            src2src = true
          }
          const relfileprefix = (docAttrs['relfileprefix'] as string) ?? ''
          const relfilesuffix = src2src
            ? docAttrs['relfilesuffix'] !== undefined
              ? String(docAttrs['relfilesuffix'])
              : outfilesuffix
            : ''
          const resolvedPath = relfileprefix + path + relfilesuffix
          n.target = frag ? `${resolvedPath}#${frag}` : resolvedPath
          if (isBracketed) n.text = [{ type: 'text', text: resolvedPath, raw: true }]
        }
        // 0b. Inter-document xref macro with a file extension but no fragment
        //     (`xref:other.adoc[]`). Only the macro form treats this as a path;
        //     `.adoc` maps to the output suffix, other extensions are kept.
        else if (
          n.macro &&
          hashIdx === -1 &&
          /\.[^./]+$/.test(n.target) &&
          !n.target.includes('://')
        ) {
          let path = n.target
          let src2src = false
          if (path.endsWith('.adoc')) {
            path = path.slice(0, -5)
            src2src = true
          }
          const outfilesuffix = (docAttrs['outfilesuffix'] as string) ?? '.html'
          const relfileprefix = (docAttrs['relfileprefix'] as string) ?? ''
          const relfilesuffix = src2src
            ? docAttrs['relfilesuffix'] !== undefined
              ? String(docAttrs['relfilesuffix'])
              : outfilesuffix
            : ''
          const resolvedPath = relfileprefix + path + relfilesuffix
          n.target = resolvedPath
          if (isBracketed) n.text = [{ type: 'text', text: resolvedPath, raw: true }]
          // The resolved target is a real path, not a `#fragment`; render it as
          // a plain link so the href is used verbatim (no `#` prefix).
          n.subtype = 'link'
        }
        // 1. The target is literally a registered id (even an unlabeled
        //    bare anchor — leave its `[id]` text as-is).
        else if (idSet.has(n.target)) {
          setLabel(n.target)
        } else if (n.target.includes(' ') || n.target.toLowerCase() !== n.target) {
          // 2. Natural cross reference: asciidoctor only attempts this when
          // the target contains a space or has uppercase, then matches it
          // EXACTLY against a section's title text (no slugification). A
          // target that doesn't match (e.g. one that spans a line break, so
          // it carries an embedded newline) is left as the broken `#target`
          // / `[target]` form, exactly as stock does.
          const id = reftextToId.get(n.target)
          if (id) {
            n.target = id
            setLabel(id)
          }
        }
        // else: leave the parser's broken `#target` / `[target]` fallback.

        // If this xref resolved to a bibliography entry, surface its URL and
        // citation body for an `inlineOverrides.anchor` to use. Non-destructive
        // — subtype, target and label stay exactly as stock asciidoctor renders
        // them.
        const bibUrl = bibUrls.get(n.target)
        if (bibUrl) n.externalHref = bibUrl
        const bibBody = bibInlines.get(n.target)
        if (bibBody) n.referenceInlines = bibBody
      }
      if ('text' in n && Array.isArray((n as { text?: InlineNode[] }).text)) {
        resolveXrefs((n as { text: InlineNode[] }).text)
      }
    }
    return nodes
  }

  const parseTitleInlines = (raw: string | undefined): InlineNode[] | undefined => {
    if (!raw) return undefined
    // Titles use a throwaway footnote state so footnotes in them don't bump
    // the document-wide counter (asciidoctor also doesn't number title
    // footnotes), but they SHARE the document-wide `counters` map so
    // `{counter:...}` in section titles increments in source order.
    return parseInline(raw, {
      attributes: inlineAttrs,
      state: {
        footnoteIndex: 0,
        footnotesById: new Map(),
        counters: inlineState.counters,
        counterResets: inlineState.counterResets,
        counterUses: inlineState.counterUses,
      },
    })
  }

  function processBlock(
    block: AdocTypes.Block | AdocTypes.ListItem | AdocTypes.Section,
  ): Block {
    const type = block.getNodeName && (block.getNodeName() as NodeType)
    const contentModel = block.getContentModel && block.getContentModel()
    // For list-like blocks, `getBlocks()` returns the same list items that
    // `getItems()` returns later. Walking both would parse each item's
    // inlines twice — bumping the document-wide footnote counter once per
    // duplicate visit. Skip `blocks` here; the item path below populates
    // `items` from `getItems()` instead.
    const isListContainer =
      type === 'olist' || type === 'ulist' || type === 'colist' || type === 'dlist'
    const blocks =
      type && !isListContainer && block.hasBlocks()
        ? block.getBlocks().map((block) => processBlock(block))
        : []

    const rawTitle = getRawTitle(block as unknown as { title?: string })

    let processedBlock: Block = {
      id: block.getId && block.getId(),
      type,
      blocks,
      content: undefined,
      inlines:
        blocks.length === 0 && contentModel === 'simple'
          ? resolveXrefs(
              parseInline(sourceFromBlock(block as AdocTypes.AbstractBlock), {
                attributes: inlineAttrsFor(block),
                state: inlineState,
              }),
            )
          : undefined,
      titleInlines:
        block.hasTitle && block.hasTitle() ? parseTitleInlines(rawTitle) : undefined,
      attributes: block.getAttributes && block.getAttributes(),
      contentModel,
      lineNumber: block.getLineNumber && block.getLineNumber(),
      style: block.getStyle && block.getStyle(),
      role: block.getRole && block.getRole(),
      title:
        block.hasTitle && block.hasTitle()
          ? (block as AdocTypes.AbstractBlock).getCaption &&
            (block as AdocTypes.AbstractBlock).getCaption()
            ? (block as AdocTypes.AbstractBlock).getCaptionedTitle()
            : block.getTitle()
          : undefined,
      level: block.getLevel && block.getLevel(),
    }

    if (type === 'admonition') {
      let admonitionBlock = processedBlock as AdmonitionBlock
      admonitionBlock.iconUri = block.getIconUri(processedBlock.attributes.name as string)
    }

    if (type === 'audio') {
      let audioBlock = processedBlock as AudioBlock
      audioBlock.mediaUri = block.getMediaUri(block.getAttribute('target'))
      audioBlock.autoplay = block.isOption('autoplay')
      audioBlock.noControls = block.isOption('nocontrols')
      audioBlock.loop = block.isOption('loop')
      processedBlock = audioBlock
    }

    if (type === 'video') {
      let videoBlock = processedBlock as VideoBlock
      videoBlock.mediaUri = block.getMediaUri(block.getAttribute('target'))
      videoBlock.autoplay = block.isOption('autoplay')
      videoBlock.noControls = block.isOption('nocontrols')
      videoBlock.loop = block.isOption('loop')
      videoBlock.onHover = block.isOption('onhover')
      processedBlock = videoBlock
    }

    if (type === 'image') {
      let imageBlock = processedBlock as ImageBlock
      imageBlock.imageUri = block.getImageUri(block.getAttribute('target'))
      imageBlock.alt =
        typeof (block as { getAlt?: () => string }).getAlt === 'function'
          ? (block as { getAlt: () => string }).getAlt()
          : ((block.getAttribute('alt') as string) ?? '')
    }

    if (type === 'listing' || type === 'literal') {
      if ('getSource' in block) {
        const listingBlock = processedBlock as LiteralBlock
        listingBlock.source = block.getSource()
        listingBlock.language = block.getAttribute('language')
        const iconsFont = docAttrs['icons'] === 'font'
        const lineComment = block.getAttribute('line-comment') as string | undefined
        const verbatimSource = sourceFromBlock(block as AdocTypes.AbstractBlock)
        const subs: string[] =
          block.getSubstitutions && typeof block.getSubstitutions === 'function'
            ? (block.getSubstitutions() as string[])
            : ['specialcharacters', 'callouts']
        const hasInlineSubs = subs.some((s) =>
          ['quotes', 'attributes', 'replacements', 'macros', 'post_replacements'].includes(
            s,
          ),
        )
        if (hasInlineSubs) {
          // When inline subs (quotes, macros, etc.) are present alongside
          // the normal verbatim ones, render the inline AST to HTML and
          // then apply callouts on top (callout markers survive the inline
          // parser as escaped &lt;N&gt; text which subCallouts recognises).
          const inlines = resolveXrefs(
            parseInline(verbatimSource, {
              attributes: inlineAttrsFor(block),
              state: inlineState,
              // Honour the block's exact subs list (e.g. `subs=+macros` runs
              // macros but not quotes, so `*bold*` stays literal while a
              // `pass:quotes[…]` macro still formats its own content).
              _subs: subs,
            }),
          )
          let content = renderInlineAsString(inlines ?? [])
          if (subs.includes('callouts')) {
            content = subCallouts(content, iconsFont, lineComment)
          }
          processedBlock.content = stripVerbatimEdges(content)
        } else {
          let content = subSpecialchars(verbatimSource)
          if (subs.includes('callouts')) {
            content = subCallouts(content, iconsFont, lineComment)
          }
          processedBlock.content = stripVerbatimEdges(content)
        }
      }
    }

    if (type === 'section') {
      const sectionBlock = processedBlock as SectionBlock
      const hasCaption = !!block.getCaption()
      sectionBlock.title = hasCaption ? block.getCaptionedTitle() : block.getTitle() || ''
      sectionBlock.hasCaption = hasCaption
      // titleInlines is already parsed by the base block above — don't
      // re-parse here, or document-wide `{counter:...}` would double-count.
      if ('getSectionNumeral' in block) {
        sectionBlock.name = block.getSectionName()
        sectionBlock.numbered = block.isNumbered()
        sectionBlock.num = block.getSectionNumeral()
      }
    }

    if (type === 'verse') {
      // Verse has contentModel 'verbatim' but applies normal subs (quotes,
      // attributes, replacements, macros, etc.), so we parse inline content
      // here — the general block logic skips inline parsing for verbatim.
      processedBlock.inlines = resolveXrefs(
        parseInline(sourceFromBlock(block as AdocTypes.AbstractBlock), {
          attributes: inlineAttrsFor(block),
          state: inlineState,
        }),
      )
    }

    if (type === 'stem') {
      const stemSource = sourceFromBlock(block as AdocTypes.AbstractBlock)
      processedBlock.content = subSpecialchars(stemSource)
    }

    if (type === 'pass') {
      const passSubs: string[] =
        block.getSubstitutions && typeof block.getSubstitutions === 'function'
          ? (block.getSubstitutions() as string[])
          : []
      if (passSubs.length > 0) {
        // Passthrough with explicit subs — process inline content.
        // Render to HTML string for the template's parse() call.
        const inlines = resolveXrefs(
          parseInline(sourceFromBlock(block as AdocTypes.AbstractBlock), {
            attributes: inlineAttrsFor(block),
            state: inlineState,
          }),
        )
        processedBlock.content = stripVerbatimEdges(renderInlineAsString(inlines ?? []))
      } else {
        processedBlock.content = stripVerbatimEdges(
          sourceFromBlock(block as AdocTypes.AbstractBlock),
        )
      }
    }

    // In a description list (dlist), each item is a tuple that consists of a 2-item Array of
    // ListItem terms and a ListItem description (i.e., [[term, term, ...], desc].
    // todo: fix this type disaster
    if (type === 'dlist') {
      let listBlock = processedBlock as DListBlock
      listBlock.items = (
        (block as unknown as AdocTypes.List).getItems() as [
          AdocTypes.ListItem[],
          AdocTypes.ListItem,
        ]
      ).map((listBlock) => {
        return [
          (listBlock as any)[0].map(
            (dd: AdocTypes.ListItem) => processBlock(dd) as ListItemBlock,
          ),
          processBlock((listBlock as any)[1]) as ListItemBlock,
        ]
      })
    }

    if (type === 'colist' || type === 'olist' || type === 'ulist') {
      let listBlock = processedBlock as ListBlock
      listBlock.items = (block as unknown as AdocTypes.List)
        .getItems()
        .map((listBlock) => processBlock(listBlock) as ListItemBlock)
    }

    if (type === 'list_item') {
      let listItemBlock = processedBlock as ListItemBlock
      const adocListItem = block as unknown as AdocTypes.ListItem
      const rawListItemText =
        typeof (adocListItem as unknown as { text?: string }).text === 'string'
          ? (adocListItem as unknown as { text: string }).text
          : undefined
      listItemBlock.textInlines =
        adocListItem.hasText() && rawListItemText !== undefined
          ? resolveXrefs(
              parseInline(rawListItemText, {
                attributes: inlineAttrs,
                state: inlineState,
              }),
            )
          : undefined
    }

    if (type === 'table') {
      let tableBlock = processedBlock as TableBlock
      const adocTable = block as unknown as AdocTypes.Table

      tableBlock.columns = adocTable.getColumns().map((col) => ({
        // @ts-ignore
        attributes: col.getAttributes(),
        columnNumber: col.getColumnNumber(),
        width: col.getWidth(),
        horizontalAlign: col.getHorizontalAlign(),
        verticalAlign: col.getVerticalAlign(),
        style: col.getStyle(),
      }))

      const processCellArray = (rows: AdocTypes.Table.Cell[][]) => {
        return rows.map((cellArray) =>
          cellArray.map((cell) => processBlock(cell as any)),
        ) as unknown as Cell[][]
      }

      // Parse each cell exactly once. `getRows()` returns the same cells as
      // getHeadRows/getBodyRows/getFootRows, so reuse the parsed results for
      // both views — parsing twice would double-count document-wide
      // `{counter:...}` (and footnote indices) inside cells.
      const headRows = processCellArray(adocTable.getHeadRows())
      const bodyRows = processCellArray(adocTable.getBodyRows())
      const footRows = processCellArray(adocTable.getFootRows())
      tableBlock.rows = { head: headRows, body: bodyRows, foot: footRows }

      tableBlock = {
        ...tableBlock,
        caption: adocTable.getCaption(),
        hasHeader: adocTable.hasHeaderOption(),
        hasFooter: adocTable.hasFooterOption(),
        hasAutowidth: adocTable.hasAutowidthOption(),
        headRows,
        bodyRows,
        footRows,
      }

      // needs reassigning because of the use of spread
      processedBlock = tableBlock
    }

    if (type === 'table_cell') {
      const adocCell = block as unknown as AdocTypes.Table.Cell

      const col = adocCell.getColumn()

      const rawCellText =
        typeof (adocCell as unknown as { text?: string }).text === 'string'
          ? (adocCell as unknown as { text: string }).text
          : adocCell.getSource()

      const cellStyle = adocCell.getStyle()

      // Asciidoc cells have an inner document whose blocks we render through
      // our own React templates (no dangerouslySetInnerHTML), so populate them
      // via getInnerDocument(). All other cell styles compute content from
      // textInlines + column-style wrapping instead of calling getContent().
      let asciidocCellBlocks: Block[] | undefined
      if (cellStyle === 'asciidoc') {
        const innerDoc = (adocCell as any).getInnerDocument?.()
        asciidocCellBlocks = innerDoc
          ? innerDoc.getBlocks().map((b: any) => processBlock(b))
          : []
      }

      // Build textInlines from raw cell text (shared across all styles)
      const cellInlines = rawCellText
        ? resolveXrefs(
            parseInline(rawCellText, {
              attributes: inlineAttrs,
              state: inlineState,
            }),
          )
        : undefined

      // Build cell.content: an array of per-paragraph styled HTML strings.
      // This mirrors asciidoctor's getContent() format for table cells:
      //   - asciidoc: string of block HTML (handled via <Content>)
      //   - literal:  specialchars-escaped source in a single string
      //   - emphasis/strong/monospaced: each paragraph wrapped in
      //     <em>/<strong>/<code>
      //   - header: plain text paragraphs (no <p> wrapper)
      //   - default: plain text paragraphs wrapped in <p class="tableblock">
      let cellContent: string | string[] | undefined
      // Per-paragraph inline ASTs, populated for the styles whose content is
      // built from cellInlines (everything except asciidoc/literal). Lets the
      // Table template render through <RenderInline> so inlineOverrides apply.
      let cellContentInlines: InlineNode[][] | undefined
      if (cellStyle === 'asciidoc') {
        cellContent = '' // rendered via <Content>, not dangerouslySetInnerHTML
      } else if (cellStyle === 'literal') {
        cellContent = subSpecialchars(adocCell.getSource())
      } else if (rawCellText) {
        // Derive cellContent from the already-parsed cellInlines instead
        // of re-parsing, to avoid double-counting footnotes.
        const fullHtml = cellInlines ? renderInlineAsString(cellInlines) : ''
        const paragraphs = fullHtml ? fullHtml.split(/\n\n+/) : []
        // Column-style wrapping tags
        const open =
          cellStyle === 'emphasis'
            ? '<em>'
            : cellStyle === 'strong'
              ? '<strong>'
              : cellStyle === 'monospaced'
                ? '<code>'
                : ''
        const close =
          cellStyle === 'emphasis'
            ? '</em>'
            : cellStyle === 'strong'
              ? '</strong>'
              : cellStyle === 'monospaced'
                ? '</code>'
                : ''
        cellContent = paragraphs.length > 0 ? paragraphs.map((p) => open + p + close) : []
        cellContentInlines = cellInlines ? splitInlineParagraphs(cellInlines) : []
      } else {
        cellContent = []
        cellContentInlines = []
      }

      let tableCellBlock: Cell = {
        ...processedBlock,
        blocks: asciidocCellBlocks ?? processedBlock.blocks,
        type: 'table_cell',
        content: cellContent,
        contentInlines: cellContentInlines,
        text: cellStyle === 'asciidoc' ? '' : renderInlineAsString(cellInlines || []),
        textInlines: cellInlines,
        columnSpan: adocCell.getColumnSpan(),
        rowSpan: adocCell.getRowSpan(),
        source: adocCell.getSource(),
        lines: adocCell.getLines(),
        width: adocCell.getWidth(),
        columnPercentageWidth: adocCell.getColumnPercentageWidth(),
        column: col
          ? {
              // @ts-ignore
              attributes: col.getAttributes(),
              columnNumber: col.getColumnNumber(),
              width: col.getWidth(),
              horizontalAlign: col.getHorizontalAlign(),
              verticalAlign: col.getVerticalAlign(),
              style: col.getStyle(),
            }
          : undefined,
      }

      processedBlock = tableCellBlock
    }

    return processedBlock
  }

  function processSections(
    parent: AdocTypes.AbstractBlock | AdocTypes.Document,
  ): DocumentSection[] {
    return parent.getSections().map((section) => ({
      id: section.getId(),
      title:
        (section.getCaption() ? section.getCaptionedTitle() : section.getTitle()) || '',
      level: section.getLevel(),
      num: section.getSectionNumber(),
      numbered: section.isNumbered(),
      hasCaption: !!section.getCaption(),
      sections: processSections(section),
    }))
  }

  preparedDocument = {
    type: 'document',
    id: (document.getId && document.getId()) || undefined,
    title: document.getDocumentTitle()?.toString() || '',
    hasHeader: document.hasHeader(),
    noHeader: document.getNoheader(),
    contentModel: document.getContentModel(),
    footnotes: [],
    attributes: document.getAttributes(),
    blocks: document.getBlocks().map((block) => processBlock(block)),
    sections: processSections(document),
    authors: [],
  }

  // Collect footnote definitions from the fully-resolved inline AST
  // (not from `inlineState.footnoteDefs`, which contains sentinel-laden
  // text that hasn't been through rebuildAllPlaceholders).
  const resolvedFootnotes: FootnoteNode[] = []
  const walkBlocksForFootnotes = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.inlines) {
        const defs = collectFootnoteDefs(b.inlines)
        resolvedFootnotes.push(...defs)
      }
      if (b.blocks) walkBlocksForFootnotes(b.blocks)
      // Handle list items
      if ('items' in b && Array.isArray(b.items)) {
        for (const item of b.items) {
          if ('textInlines' in item && item.textInlines) {
            const d = collectFootnoteDefs(item.textInlines)
            resolvedFootnotes.push(...d)
          }
          if ('blocks' in item && item.blocks) walkBlocksForFootnotes(item.blocks)
        }
      }
      // Handle dlist items (tuples of terms and description)
      if ('items' in b && Array.isArray(b.items)) {
        for (const item of b.items) {
          if (Array.isArray(item)) {
            for (const term of item) {
              if (
                term &&
                typeof term === 'object' &&
                'textInlines' in term &&
                term.textInlines
              ) {
                const d = collectFootnoteDefs(term.textInlines)
                resolvedFootnotes.push(...d)
              }
            }
          }
        }
      }
      // Handle table cells
      if ('rows' in b && b.rows) {
        const row = b.rows as Row
        for (const cellGroup of [row.head, row.body, row.foot]) {
          for (const rowCells of cellGroup) {
            for (const cell of rowCells) {
              if (cell.textInlines) {
                const d = collectFootnoteDefs(cell.textInlines)
                resolvedFootnotes.push(...d)
              }
            }
          }
        }
      }
    }
  }
  walkBlocksForFootnotes(preparedDocument.blocks)
  // Document title doesn't carry footnotes in the current model
  // (title inlines are parsed separately with a throwaway state).

  if (resolvedFootnotes.length > 0) {
    // Deduplicate by index (references to the same definition appear
    // multiple times; keep only the one with text content).
    const seen = new Map<number, FootnoteNode>()
    for (const fn of resolvedFootnotes) {
      if (fn.index !== undefined) {
        const existing = seen.get(fn.index)
        if (!existing || (fn.text && fn.text.length > 0)) {
          seen.set(fn.index, fn)
        }
      }
    }
    preparedDocument.footnotes = [...seen.values()]
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
      .map((fn) => ({
        index: fn.index!,
        textInlines: fn.text ?? [],
      }))
  }

  const authors = document.getAuthors()
  if (authors) {
    preparedDocument.authors = document.getAuthors().map((author) => {
      const authorName = author.getName()
      const authorEmail = author.getEmail()

      return {
        name: authorName
          ? renderInlineAsString(
              resolveXrefs(
                parseInline(authorName, {
                  attributes: inlineAttrs,
                  state: { footnoteIndex: 0, footnotesById: new Map() },
                }),
              ) || [],
            )
          : undefined,
        email: authorEmail
          ? renderInlineAsString(
              resolveXrefs(
                parseInline(authorEmail, {
                  attributes: inlineAttrs,
                  state: { footnoteIndex: 0, footnotesById: new Map() },
                }),
              ) || [],
            )
          : undefined,
      }
    })
  }

  return preparedDocument
}

// used to modify a document after the fact
// e.g. for a syntax highlighter
export const processDocument = async (
  documentBlock: DocumentBlock,
  processFunction: (block: Block) => Promise<Block>,
): Promise<DocumentBlock> => {
  const processBlocks = async (blocks: Block[]): Promise<Block[]> => {
    return Promise.all(
      blocks.map(async (block) => {
        let processedBlock = await processFunction(block)

        if (processedBlock.blocks && processedBlock.blocks.length > 0) {
          processedBlock.blocks = await processBlocks(processedBlock.blocks)
        }

        if ((processedBlock as ListBlock).items) {
          const processedListblock = processedBlock as ListBlock
          processedListblock.items = (await processBlocks(
            processedListblock.items,
          )) as ListItemBlock[]
        }

        return processedBlock
      }),
    )
  }

  const processedBlocks = await processBlocks(documentBlock.blocks)

  return {
    ...documentBlock,
    blocks: processedBlocks,
  }
}
