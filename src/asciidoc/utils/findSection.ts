import type { Block } from './prepareDocument'

// A block stores children three different ways; collect all of them so the
// walk reaches every anchored block.
const childBlocks = (block: Block): Block[] => {
  const children: Block[] = [...(block.blocks ?? [])]

  if ('items' in block && Array.isArray(block.items)) {
    for (const item of block.items) {
      // dlist rows are `[terms[], desc]` tuples; lists are flat items.
      if (Array.isArray(item))
        for (const sub of item) children.push(...(Array.isArray(sub) ? sub : [sub]))
      else children.push(item)
    }
  }

  if ('rows' in block && block.rows) {
    for (const group of [block.rows.head, block.rows.body, block.rows.foot])
      for (const row of group) children.push(...row)
  }

  return children
}

/**
 * First block whose `id` matches, depth-first. Descends through child blocks,
 * list items, and table cells, so any anchored block — not just sections — is
 * reachable by id.
 */
export const findSection = (blocks: Block[], id: string): Block | undefined => {
  for (const block of blocks) {
    if (block.id === id) return block
    const found = findSection(childBlocks(block), id)
    if (found) return found
  }
  return undefined
}
