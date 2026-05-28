import cn from 'classnames'

import { Content, inlineHtml } from '../'
import type { InlineNode } from '../inline'
import { renderInlineAsString } from '../inline'
import { type ListBlock, type ListItemBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

// `[bibliography]` lists rewrite the standard bibref output `[<a id></a>]`
// into anchor-first form `<a id></a>[text]`, where `text` is the alt label
// when supplied (`[[[id, text]]]`) and the id otherwise. Only the parent
// list knows whether to apply this transform, so we walk the AST here
// rather than baking the choice into the renderer.
const renderBibliographyInlines = (nodes: InlineNode[] | undefined): string => {
  if (!nodes) return ''
  let out = ''
  for (const n of nodes) {
    if (n.type === 'anchor' && n.subtype === 'bibref') {
      const id = n.id || n.target
      const text = renderInlineAsString(n.text) || id
      out += `<a id="${id}"></a>[${text}]`
    } else {
      out += renderInlineAsString([n])
    }
  }
  return out
}

const UList = ({ node }: { node: ListBlock }) => {
  const isChecklist = isOption(node.attributes, 'checklist')
  const isBibliography = node.style === 'bibliography'

  return (
    <div
      id={node.id || undefined}
      className={cn('ulist', node.style, node.role, isChecklist && 'checklist')}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <ul
        className={
          isChecklist ? 'checklist' : isBibliography ? 'bibliography' : undefined
        }
      >
        {node.items.map((item: ListItemBlock, index) => {
          const checkbox = isChecklist && 'checkbox' in item.attributes
          const checked = checkbox && 'checked' in item.attributes
          const itemInner = isBibliography
            ? renderBibliographyInlines(item.textInlines)
            : inlineHtml(item.textInlines).__html
          // Checklists fold the icon into the inline HTML so we don't
          // introduce a React wrapper that breaks whitespace between the
          // icon and the text.
          const html = checkbox
            ? `<i class="fa ${checked ? 'fa-check-square-o' : 'fa-square-o'}"></i> ${itemInner}`
            : itemInner
          return (
            <li key={index} id={item.id || undefined}>
              <p dangerouslySetInnerHTML={{ __html: html }} />
              <Content blocks={item.blocks} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default UList
