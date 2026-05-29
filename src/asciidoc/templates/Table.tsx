import cn from 'classnames'
import parse from 'html-react-parser'

import { Title, useConverterContext } from '..'
import {
  type Cell,
  type TableBlock,
  getAttribute,
  hasAttribute,
  isOption,
} from '../utils/prepareDocument'

const Table = ({ node }: { node: TableBlock }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}

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
              <col
                key={index}
                style={autowidth ? undefined : { width: `${colWidth}%` }}
              />
            )
          })}
        </colgroup>
      )}
      {node.headRows.length > 0 &&
        node.headRows.map((row, hIndex) => (
          <thead key={hIndex}>
            <tr>
              {row.map((cell, index) => (
                <th
                  key={index}
                  className={getCellClass(cell)}
                  colSpan={cell.columnSpan}
                  rowSpan={cell.rowSpan}
                  dangerouslySetInnerHTML={{ __html: cell.text }}
                />
              ))}
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
                const content = cell.content as unknown as string | string[]

                const arr = Array.isArray(content)
                  ? content
                  : typeof content === 'string'
                    ? [content]
                    : []
                let html = ''
                if (style === 'asciidoc') {
                  html = `<div class="content">${arr.join('')}</div>`
                } else if (style === 'literal') {
                  html = `<div class="literal"><pre>${arr.join('')}</pre></div>`
                } else if (style === 'header') {
                  html =
                    arr.length > 0
                      ? `<p class="tableblock">${arr.join('</p>\n<p class="tableblock">')}</p>`
                      : ''
                } else if (arr.length > 0) {
                  html = `<p class="tableblock">${arr.join('</p>\n<p class="tableblock">')}</p>`
                }

                return (
                  <Tag
                    key={index}
                    className={className}
                    colSpan={colSpan}
                    rowSpan={rowSpan}
                    dangerouslySetInnerHTML={html ? { __html: html } : undefined}
                  />
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
                <p className="tableblock" dangerouslySetInnerHTML={{ __html: cell.text }} />
              </td>
            ))}
          </tr>
        </tfoot>
      ))}
    </table>
  )
}

const slugify = (text: string) => {
  return text
    .toString() // Cast to string (optional)
    .normalize('NFKD') // The normalize() using NFKD method returns the Unicode Normalization Form of a given string
    .replace(/[\u0300-\u036f]/g, '') // Removes the normalized accents the accents
    .toLowerCase() // Convert the string to lowercase letters
    .trim() // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '_') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/-$/g, '') // Remove trailing -
}

export default Table
