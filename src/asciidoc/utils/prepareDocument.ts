import type * as AdocTypes from '@asciidoctor/core'

import { type ParseState, parseInline } from '../inline'
import type { InlineNode } from '../inline'

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
  content?: string | undefined
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
    text: string | undefined
    index: number | undefined
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
  text: string | undefined
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
  text: string
  textInlines?: InlineNode[] | undefined
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

const contentCache: { [key: string]: string } = {}
type Node = AdocTypes.Block | AdocTypes.AbstractBlock | AdocTypes.Table.Cell

const getContent = (node: Node) => {
  const cacheKey = (node as Node & { $$id: string }).$$id

  if (contentCache[cacheKey]) {
    return contentCache[cacheKey]
  }

  const newContent = (node.getContent && node.getContent()) || ''
  contentCache[cacheKey] = newContent
  return newContent
}

const getText = (
  node: AdocTypes.ListItem | AdocTypes.Document.Footnote | AdocTypes.Table.Cell,
) => {
  const cacheKey = (node as Node & { $$id: string }).$$id

  if (contentCache[cacheKey]) {
    return contentCache[cacheKey]
  }

  const newContent = (node.getText && node.getText()) || ''
  contentCache[cacheKey] = newContent
  return newContent
}

/** Asciidoctor stores raw (pre-substitution) title text in the `title`
 *  instance var; `getTitle()` returns inline-substituted HTML. We want the
 *  raw text to feed into our own inline parser. */
const getRawTitle = (block: { title?: string }): string | undefined =>
  typeof block.title === 'string' ? block.title : undefined

const sourceFromBlock = (block: AdocTypes.AbstractBlock): string => {
  if (typeof (block as AdocTypes.Block).getSourceLines === 'function') {
    return (block as AdocTypes.Block).getSourceLines().join('\n')
  }
  return ''
}

export const prepareDocument = (document: AdocTypes.Document) => {
  let preparedDocument: DocumentBlock

  const docAttrs = document.getAttributes() as Record<string, string | number>
  const inlineAttrs: Record<string, string> = {}
  for (const [k, v] of Object.entries(docAttrs)) {
    if (v != null) inlineAttrs[k] = String(v)
  }
  const inlineState: ParseState = {
    footnoteIndex: 0,
    footnotesById: new Map(),
    counters: new Map(),
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
  const sectionXreftext = (info: {
    title: string
    numbered: boolean
    sectname: string
    numeral: string
    reftext: string | undefined
  }): string => {
    if (info.reftext) return info.reftext
    const isAppendixOrChapter = info.sectname === 'appendix' || info.sectname === 'chapter'
    const italicOrPlain = isAppendixOrChapter ? `<em>${info.title}</em>` : info.title
    if (docXrefstyle && info.numbered) {
      const base = info.numeral.replace(/\.$/, '')
      const sig = docAttrs[`${info.sectname}-refsig`]
      if (docXrefstyle === 'full') {
        const quotedTitle = isAppendixOrChapter
          ? `<em>${info.title}</em>`
          : `&#8220;${info.title}&#8221;`
        return sig ? `${sig} ${base}, ${quotedTitle}` : `${base}, ${quotedTitle}`
      }
      if (docXrefstyle === 'short') {
        return sig ? `${sig} ${base}` : base
      }
      return italicOrPlain
    }
    if (docXrefstyle) return italicOrPlain
    return info.title
  }

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

  const resolveXrefs = (nodes: InlineNode[] | undefined): InlineNode[] | undefined => {
    if (!nodes) return nodes
    for (const n of nodes) {
      if (n.type === 'anchor' && n.subtype === 'xref') {
        const fallback = `[${n.target}]`
        const text = n.text
        const isBracketed =
          text.length === 1 && text[0].type === 'text' && text[0].text === fallback
        const setLabel = (id: string) => {
          const v = refLabels.get(id)
          if (isBracketed && typeof v === 'string') {
            n.text = [{ type: 'text', text: v }]
          }
        }
        // 1. The target is literally a registered id (even an unlabeled
        //    bare anchor — leave its `[id]` text as-is).
        if (idSet.has(n.target)) {
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
      content: blocks.length > 0 ? undefined : getContent(block),
      inlines:
        blocks.length === 0 && contentModel === 'simple'
          ? resolveXrefs(
              parseInline(sourceFromBlock(block as AdocTypes.AbstractBlock), {
                attributes: inlineAttrs,
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
        // content from getContent() is already specialchars-escaped — keep
        // it that way so the <pre> renders verbatim source rather than
        // interpreting `<tag>` literals as HTML.
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
      listItemBlock.text = adocListItem.hasText() ? getText(adocListItem) : undefined
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
      const adocListItem = block as unknown as AdocTypes.Table.Cell

      const col = adocListItem.getColumn()

      const rawCellText =
        typeof (adocListItem as unknown as { text?: string }).text === 'string'
          ? (adocListItem as unknown as { text: string }).text
          : adocListItem.getSource()

      let tableCellBlock: Cell = {
        ...processedBlock,
        type: 'table_cell',
        text: getText(adocListItem),
        textInlines: rawCellText
          ? resolveXrefs(
              parseInline(rawCellText, {
                attributes: inlineAttrs,
                state: inlineState,
              }),
            )
          : undefined,
        columnSpan: adocListItem.getColumnSpan(),
        rowSpan: adocListItem.getRowSpan(),
        source: adocListItem.getSource(),
        lines: adocListItem.getLines(),
        width: adocListItem.getWidth(),
        columnPercentageWidth: adocListItem.getColumnPercentageWidth(),
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

  // Needs to happen after the blocks are processed
  // Since the footnotes are added when they are called with `getContent()`
  const footnotes = document.getFootnotes()
  if (footnotes) {
    preparedDocument.footnotes = footnotes.map((footnote) => ({
      text: footnote.getText(),
      index: footnote.getIndex(),
    }))
  }

  const authors = document.getAuthors()
  if (authors) {
    preparedDocument.authors = document.getAuthors().map((author) => {
      const authorName = author.getName()
      const authorEmail = author.getEmail()

      return {
        name: authorName ? document.applySubstitutions(authorName).toString() : undefined,
        email: authorEmail
          ? document.applySubstitutions(authorEmail).toString()
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
