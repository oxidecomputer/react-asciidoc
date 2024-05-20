import type * as AdocTypes from '@asciidoctor/core'
import { decode } from 'html-entities'

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
  id: string
  type: NodeType
  blocks: Block[]
  content: string | undefined
  attributes: Record<string, string>
  contentModel: ContentModel | undefined
  lineNumber: number | undefined
  style: string | undefined
  role: string | undefined
  title: string | undefined
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

export type DocumentSection = {
  id: string
  title: string
  level: number
  num: string
  sections: DocumentSection[]
}

export type DocumentBlock = {
  type: 'document'
  title: string
  hasHeader: boolean
  noHeader: boolean
  attributes: Record<string, string>
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

export interface ImageBlock extends BaseBlock {
  type: 'image'
  imageUri: string
}

export interface ListItemBlock extends BaseBlock {
  text: string | undefined
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
}

export interface TableBlock extends BaseBlock {
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
  type: NodeType
  attributes: Record<string, string>
  columnSpan: number | undefined
  rowSpan: number | undefined
  content: string | undefined
  text: string
  source: string
  lines: string[]
  lineNumber: number | undefined
  style: string | undefined
  column: Column | undefined
  width: string | undefined
  columnPercentageWidth: string | undefined
}

/**
 * A convenience method to check if the specified option attribute is enabled on the current node.
 * Check if the option is enabled. This method simply checks to see if the <name>-option attribute is defined on the current node.
 */
export const isOption = (attrs: Record<string, string>, option: string) => {
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
  attrs: Record<string, string>,
  name: string,
  defaultValue: any = undefined,
  fallbackName?: string,
  documentAttrs?: Record<string, string>,
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

export const hasAttribute = (attrs: Record<string, string>, name: string) => {
  return attrs[name] !== undefined
}

export const prepareDocument = (document: AdocTypes.Document) => {
  let preparedDocument: DocumentBlock

  function processBlock(
    block: AdocTypes.Block | AdocTypes.ListItem | AdocTypes.Section,
  ): Block {
    const type = block.getNodeName && (block.getNodeName() as NodeType)
    const contentModel = block.getContentModel && block.getContentModel()
    const blocks =
      type && block.hasBlocks() ? block.getBlocks().map((block) => processBlock(block)) : []

    let processedBlock: Block = {
      id: block.getId && block.getId(),
      type,
      blocks,
      content: blocks.length > 0 ? undefined : block.getContent && block.getContent(),
      attributes: block.getAttributes && block.getAttributes(),
      contentModel,
      lineNumber: block.getLineNumber && block.getLineNumber(),
      style: block.getStyle && block.getStyle(),
      role: block.getRole && block.getRole(),
      title: block.hasTitle && block.hasTitle() ? block.getTitle() : undefined,
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
      audioBlock.noControls = !block.isOption('nocontrols')
      audioBlock.loop = block.isOption('loop')
      processedBlock = audioBlock
    }

    if (type === 'image') {
      let imageBlock = processedBlock as ImageBlock
      imageBlock.imageUri = block.getImageUri(block.getAttribute('target'))
    }

    if (type === 'listing' || type === 'literal') {
      if ('getSource' in block) {
        const listingBlock = processedBlock as LiteralBlock
        listingBlock.source = block.getSource()
        listingBlock.language = block.getAttribute('language')
      }
    }

    if (type === 'section') {
      const sectionBlock = processedBlock as SectionBlock
      sectionBlock.title = block.getCaption()
        ? block.getCaptionedTitle()
        : block.getTitle() || ''
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
      listItemBlock.text = adocListItem.hasText() ? adocListItem.getText() : undefined
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

      const rows = adocTable.getRows()
      tableBlock.rows = {
        head: processCellArray(rows.head),
        body: processCellArray(rows.body),
        foot: processCellArray(rows.foot),
      }

      tableBlock = {
        ...tableBlock,
        caption: adocTable.getCaption(),
        hasHeader: adocTable.hasHeaderOption(),
        hasFooter: adocTable.hasFooterOption(),
        hasAutowidth: adocTable.hasAutowidthOption(),
        headRows: processCellArray(adocTable.getHeadRows()),
        bodyRows: processCellArray(adocTable.getBodyRows()),
        footRows: processCellArray(adocTable.getFootRows()),
      }

      // needs reassigning because of the use of spread
      processedBlock = tableBlock
    }

    if (type === 'table_cell') {
      const adocListItem = block as unknown as AdocTypes.Table.Cell

      const col = adocListItem.getColumn()

      let tableCellBlock: Cell = {
        text: adocListItem.getText(),
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
        ...processedBlock,
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
      sections: processSections(section),
    }))
  }

  const authors = document.getAuthors().map((author) => {
    const authorName = author.getName()
    const authorEmail = author.getEmail()

    return {
      name: authorName ? document.applySubstitutions(authorName).toString() : undefined,
      email: authorEmail ? document.applySubstitutions(authorEmail).toString() : undefined,
    }
  })

  preparedDocument = {
    type: 'document',
    title: document.getDocumentTitle()?.toString() || '',
    hasHeader: document.hasHeader(),
    noHeader: document.getNoheader(),
    contentModel: document.getContentModel(),
    attributes: document.getAttributes(),
    footnotes: document.getFootnotes().map((footnote) => ({
      text: footnote.getText(),
      index: footnote.getIndex(),
    })),
    blocks: document.getBlocks().map((block) => processBlock(block)),
    sections: processSections(document),
    authors,
  }

  // Needs to happen after the blocks are processed
  // Since the footnotes are added when they are called with `getContent()`
  preparedDocument.footnotes = document.getFootnotes().map((footnote) => ({
    text: footnote.getText(),
    index: footnote.getIndex(),
  }))

  return preparedDocument
}

// used to modify a document after the fact
// e.g. for a syntax highlighter
export const processDocument = async (
  documentBlock: DocumentBlock,
  processFunction: (block: Block) => Promise<Block>,
): Promise<DocumentBlock> => {
  async function processBlocks(blocks: Block[]): Promise<Block[]> {
    return Promise.all(
      blocks.map(async (block) => {
        let processedBlock = await processFunction(block)

        if (processedBlock.blocks && processedBlock.blocks.length > 0) {
          processedBlock = {
            ...processedBlock,
            blocks: await processBlocks(processedBlock.blocks),
          }
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

// same as `processDocument` but works syncronously
export const processDocumentSync = (
  documentBlock: DocumentBlock,
  processFunction: (block: Block) => Block,
): DocumentBlock => {
  function processBlocks(blocks: Block[]): Block[] {
    return blocks.map((block) => {
      let processedBlock = processFunction(block)

      if (processedBlock.blocks && processedBlock.blocks.length > 0) {
        processedBlock = {
          ...processedBlock,
          blocks: processBlocks(processedBlock.blocks),
        }
      }

      return processedBlock
    })
  }

  const processedBlocks = processBlocks(documentBlock.blocks)

  return {
    ...documentBlock,
    blocks: processedBlocks,
  }
}
