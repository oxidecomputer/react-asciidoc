import cn from 'classnames'
import { type ReactNode } from 'react'

import { Content, useConverterContext } from '..'
import RenderInline, { hasRawInline } from '../RenderInline'
import {
  type Cell,
  type TableBlock,
  getAttribute,
  hasAttribute,
  isOption,
} from '../utils/prepareDocument'

const Table = ({ node }: { node: TableBlock }) => {
  const { document, inlineOverrides } = useConverterContext()
  const docAttrs = document.attributes || {}

  const hasOverrides = !!inlineOverrides && Object.keys(inlineOverrides).length > 0

  // Render a cell's inline content as a real React tree (so inlineOverrides
  // apply) unless it carries straddling passthrough HTML and no overrides are
  // registered — then the string path preserves it. Decided per cell since a
  // table mixes plain and passthrough cells. Mirrors `useInlineRenderMode`,
  // inlined here because the decision is per-cell, not per-component.
  const cellReact = (cell: Cell): boolean => hasOverrides || !hasRawInline(cell.textInlines)

  let classes = [
    'frame-' + getAttribute(node.attributes, 'frame', 'all', 'table-frame', docAttrs),
    'grid-' + getAttribute(node.attributes, 'grid', 'all', 'table-grid', docAttrs),
  ]

  let stripes = getAttribute(node.attributes, 'stripes', null, 'table-stripes', docAttrs)

  if (stripes) {
    classes.push('stripes-' + stripes)
  }

  let autowidth = isOption(node.attributes, 'autowidth')
  let tablewidth = parseInt(`${node.attributes['tablepcwidth']}`)
  let width: string | null = null

  if (autowidth && !hasAttribute(node.attributes, 'width')) {
    classes.push('fit-content')
  } else if (tablewidth === 100) {
    classes.push('stretch')
  } else {
    width = `${tablewidth}%`
  }

  if (hasAttribute(node.attributes, 'float')) classes.push(`${node.attributes['float']}`)
  if (node.role) classes.push(node.role || '')

  const getCellClass = (cell: Cell): string => {
    const classAttr = cn(
      'tableblock',
      `halign-${cell.attributes['halign']}`,
      `valign-${cell.attributes['valign']}`,
    )

    return classAttr
  }

  // Render a body cell's inline content as a React tree, preserving the
  // per-paragraph `<p class="tableblock">` wrappers and the
  // column-style wrapping tag (`emphasis`/`strong`/`monospaced`) that the
  // string path bakes into `cell.content`.
  const renderCellInlines = (cell: Cell) => {
    const wrap = (inner: ReactNode) => {
      switch (cell.style) {
        case 'emphasis':
          return <em>{inner}</em>
        case 'strong':
          return <strong>{inner}</strong>
        case 'monospaced':
          return <code>{inner}</code>
        default:
          return inner
      }
    }
    return (cell.contentInlines || []).map((para, pIndex) => (
      <p className="tableblock" key={pIndex}>
        {wrap(<RenderInline nodes={para} />)}
      </p>
    ))
  }

  return (
    <table
      id={node.id || undefined}
      className={cn('tableblock', ...classes)}
      style={{ width: width ? width : undefined }}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      {node.title && (
        <caption className="title" dangerouslySetInnerHTML={{ __html: node.title }} />
      )}
      {node.columns.length > 0 && (
        <colgroup>
          {node.columns.map((col, index) => {
            const colWidth = col.attributes['colpcwidth']
            return (
              <col key={index} style={autowidth ? undefined : { width: `${colWidth}%` }} />
            )
          })}
        </colgroup>
      )}
      {node.headRows.length > 0 &&
        node.headRows.map((row, hIndex) => (
          <thead key={hIndex}>
            <tr>
              {row.map((cell, index) =>
                cellReact(cell) && cell.textInlines ? (
                  <th
                    key={index}
                    className={getCellClass(cell)}
                    colSpan={cell.columnSpan}
                    rowSpan={cell.rowSpan}
                  >
                    <RenderInline nodes={cell.textInlines} />
                  </th>
                ) : (
                  <th
                    key={index}
                    className={getCellClass(cell)}
                    colSpan={cell.columnSpan}
                    rowSpan={cell.rowSpan}
                    dangerouslySetInnerHTML={{ __html: cell.text || '' }}
                  />
                ),
              )}
            </tr>
          </thead>
        ))}
      {node.bodyRows.length > 0 && (
        <tbody>
          {node.bodyRows.map((row, bIndex) => (
            <tr key={bIndex}>
              {row.map((cell, index) => {
                const style = cell.style
                const className = getCellClass(cell)
                const colSpan = cell.columnSpan
                const rowSpan = cell.rowSpan
                const Tag = style === 'header' ? 'th' : 'td'

                // React path: render inline content through <RenderInline>
                // (so inlineOverrides apply). Literal cells keep the string
                // path (escaped source, no inline nodes); asciidoc cells always
                // go through <Content>.
                const renderInlineReact =
                  cellReact(cell) && style !== 'asciidoc' && style !== 'literal'

                let html = ''
                if (style === 'asciidoc' || renderInlineReact) {
                  // Asciidoc cells render via <Content> (React templates),
                  // not dangerouslySetInnerHTML
                } else {
                  const content = cell.content as unknown as string | string[]
                  const arr = Array.isArray(content)
                    ? content
                    : typeof content === 'string'
                      ? [content]
                      : []
                  if (style === 'literal') {
                    html = `<div class="literal"><pre>${arr.join('')}</pre></div>`
                  } else if (style === 'header') {
                    html =
                      arr.length > 0
                        ? `<p class="tableblock">${arr.join('</p>\n<p class="tableblock">')}</p>`
                        : ''
                  } else if (arr.length > 0) {
                    html = `<p class="tableblock">${arr.join('</p>\n<p class="tableblock">')}</p>`
                  }
                }

                return (
                  <Tag
                    key={index}
                    className={className}
                    colSpan={colSpan}
                    rowSpan={rowSpan}
                    dangerouslySetInnerHTML={
                      style === 'asciidoc' || renderInlineReact
                        ? undefined
                        : html
                          ? { __html: html }
                          : undefined
                    }
                  >
                    {style === 'asciidoc' ? (
                      <div className="content">
                        <Content blocks={cell.blocks} />
                      </div>
                    ) : renderInlineReact ? (
                      renderCellInlines(cell)
                    ) : null}
                  </Tag>
                )
              })}
            </tr>
          ))}
        </tbody>
      )}
      {node.footRows.map((row, fIndex) => (
        <tfoot key={fIndex}>
          <tr>
            {row.map((cell, index) => (
              <td key={index} className={getCellClass(cell)}>
                {cellReact(cell) && cell.textInlines ? (
                  <p className="tableblock">
                    <RenderInline nodes={cell.textInlines} />
                  </p>
                ) : (
                  <p
                    className="tableblock"
                    dangerouslySetInnerHTML={{ __html: cell.text || '' }}
                  />
                )}
              </td>
            ))}
          </tr>
        </tfoot>
      ))}
    </table>
  )
}

export default Table
