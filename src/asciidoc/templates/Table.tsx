import cn from 'classnames'
import parse from 'html-react-parser'
import { useContext } from 'react'

import { Context } from '..'
import {
  type Cell,
  type TableBlock,
  getAttribute,
  hasAttribute,
  isOption,
} from '../utils/prepareDocument'

const Table = ({ node }: { node: TableBlock }) => {
  const { document } = useContext(Context)
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

  const title = node.title
  const id = node.id
  const slug = id || slugify(title || '')

  return (
    <table
      className={cn('tableblock', ...classes)}
      style={{ width: width ? width : undefined }}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      {node.title && (
        <caption className="title">
          {!id && <a className="anchor" id={slug}></a>}
          <a href={`#${slug}`}>{node.title}</a>
        </caption>
      )}
      {node.columns.length > 0 && (
        <colgroup>
          {node.columns.map((col, index) => {
            const colWidth = col.attributes['colpcwidth']
            return <col key={index} style={{ width: `${colWidth}%` }} />
          })}
        </colgroup>
      )}
      {node.headRows.map((row, hIndex) => (
        <thead key={hIndex}>
          <tr>
            {row.map((cell, index) => (
              <th
                key={index}
                className={getCellClass(cell)}
                dangerouslySetInnerHTML={{ __html: cell.text }}
              />
            ))}
          </tr>
        </thead>
      ))}
      <tbody>
        {node.bodyRows.map((row, bIndex) => (
          <tr key={bIndex}>
            {row.map((cell, index) => {
              const colSpan = cell.columnSpan
              const rowSpan = cell.rowSpan
              const content = cell.content

              const cellProps = {
                colSpan,
                rowSpan,
                className: getCellClass(cell),
              }

              const style = cell.style

              if (style === 'asciidoc') {
                return (
                  <td {...cellProps} key={index}>
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{ __html: content || '' }}
                    />
                  </td>
                )
              } else if (style === 'literal') {
                return (
                  <td {...cellProps} key={index}>
                    <div className="literal">
                      <pre dangerouslySetInnerHTML={{ __html: content || '' }} />
                    </div>
                  </td>
                )
              } else if (style === 'header') {
                return (
                  <th {...cellProps} key={index}>
                    <p
                      className="tableblock"
                      dangerouslySetInnerHTML={{ __html: content || '' }}
                    />
                  </th>
                )
              } else {
                let cellContent = content as unknown as string[]
                return (
                  <td {...cellProps} key={index}>
                    {cellContent.length === 0
                      ? ''
                      : parse(
                          `<p class="tableblock">${cellContent.join(
                            '</p>\n<p class="tableblock">',
                          )}</p>`,
                        )}
                  </td>
                )
              }
            })}
          </tr>
        ))}
      </tbody>
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
