import cn from 'classnames'

import { Content, useConverterContext } from '../'
import RenderInline, { hasRawInline } from '../RenderInline'
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
  // Only the entry-defining bibref (the first one, at the item's start) is
  // rewritten to anchor-first form; any later `[[[id]]]` in the same item is
  // an inline citation and keeps the normal `[<a id></a>]` form.
  let rewritten = false
  for (const n of nodes) {
    if (!rewritten && n.type === 'anchor' && n.subtype === 'bibref') {
      const id = n.id || n.target
      const text = renderInlineAsString(n.text) || id
      out += `<a id="${id}"></a>[${text}]`
      rewritten = true
    } else {
      out += renderInlineAsString([n])
    }
  }
  return out
}

const UList = ({ node }: { node: ListBlock }) => {
  const { inlineOverrides } = useConverterContext()
  const isChecklist = isOption(node.attributes, 'checklist')
  const isInteractive = isChecklist && isOption(node.attributes, 'interactive')
  const isBibliography = node.style === 'bibliography'

  // Render bibliography entries as a real React tree (so `inlineOverrides` reach
  // the reference links/xrefs inside) unless an entry carries straddling
  // passthrough HTML and no overrides are registered — then the bibliography-
  // aware string serializer preserves it. Mirrors `useInlineRenderMode`, but
  // the decision is per item, not per component. `RenderInline bibliography`
  // reproduces the anchor-first definition form the serializer emits.
  const hasOverrides = !!inlineOverrides && Object.keys(inlineOverrides).length > 0
  const bibReact = (item: ListItemBlock): boolean =>
    hasOverrides || !hasRawInline(item.textInlines)

  return (
    <div
      id={node.id || undefined}
      className={cn('ulist', node.style, node.role, isChecklist && 'checklist')}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <ul
        className={
          isChecklist
            ? 'checklist'
            : isBibliography
              ? 'bibliography'
              : node.style || undefined
        }
      >
        {node.items.map((item: ListItemBlock, index) => {
          const checkbox = isChecklist && 'checkbox' in item.attributes
          const checked = checkbox && 'checked' in item.attributes
          return (
            <li key={index} id={item.id || undefined}>
              {isBibliography ? (
                bibReact(item) ? (
                  <p>
                    <RenderInline nodes={item.textInlines} bibliography />
                  </p>
                ) : (
                  // Straddling passthrough HTML with no overrides: the
                  // bibliography-aware serializer keeps the anchor-first
                  // definition form (`<a id></a>[text]`) intact.
                  <p
                    dangerouslySetInnerHTML={{
                      __html: renderBibliographyInlines(item.textInlines),
                    }}
                  />
                )
              ) : (
                <p>
                  {checkbox && !isInteractive && (
                    <>
                      <i
                        className={`fa ${checked ? 'fa-check-square-o' : 'fa-square-o'}`}
                      />{' '}
                    </>
                  )}
                  {checkbox && isInteractive && (
                    <input
                      type="checkbox"
                      data-item-complete={checked ? '1' : '0'}
                      {...(checked ? { checked: true } : {})}
                    />
                  )}
                  <RenderInline nodes={item.textInlines} />
                </p>
              )}
              <Content blocks={item.blocks} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default UList
