import type { Block } from './prepareDocument'

/** Collect every child block reachable from a block, regardless of how the
 *  block stores its children: nested `blocks`, list `items` (olist / ulist /
 *  colist, and dlist's `[terms[], desc]` tuples), and table cells. */
const childBlocks = (block: Block): Block[] => {
  const children: Block[] = [...(block.blocks ?? [])]

  if ('items' in block && Array.isArray(block.items)) {
    for (const item of block.items) {
      if (Array.isArray(item)) {
        // dlist row: an array of terms / descriptions, each of which may itself
        // be an array (the term list).
        for (const sub of item) {
          if (Array.isArray(sub)) children.push(...sub)
          else children.push(sub)
        }
      } else {
        children.push(item)
      }
    }
  }

  if ('rows' in block && block.rows) {
    for (const group of [block.rows.head, block.rows.body, block.rows.foot]) {
      for (const row of group) children.push(...row)
    }
  }

  return children
}

/**
 * Walk a block tree depth-first and return the first block whose `id` matches.
 * Descends through child blocks, list items, and table cells, so any anchored
 * block — not just sections — is reachable by id.
 */
export const findSection = (blocks: Block[], id: string): Block | undefined => {
  for (const block of blocks) {
    if (block.id === id) return block
    const found = findSection(childBlocks(block), id)
    if (found) return found
  }
  return undefined
}
