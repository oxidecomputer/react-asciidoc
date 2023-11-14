import type { Table as TableType } from '@asciidoctor/core'
import cn from 'classnames'
import parse from 'html-react-parser'

import { getContent, getText } from '../utils/getContent'
import { getLineNumber } from './util'

const Table = ({ node }: { node: TableType }) => {
  let classes = [
    'frame-' + node.getAttribute('frame', 'all', 'table-frame'),
    'grid-' + node.getAttribute('grid', 'all', 'table-grid'),
  ]

  let stripes = node.getAttribute('stripes', null, 'table-stripes')

  if (stripes) {
    classes.push('stripes-' + stripes)
  }

  let autowidth = node.hasAutowidthOption()
  let tablewidth = node.getAttribute('tablepcwidth')
  let width: string | null = null

  if (autowidth && !node.hasAttribute('width')) {
    classes.push('fit-content')
  } else if (tablewidth == 100) {
    classes.push('stretch')
  } else {
    width = `${tablewidth}%`
  }

  if (node.hasAttribute('float')) classes.push(node.getAttribute('float'))
  if (node.getRole()) classes.push(node.getRole() || '')

  const rowCount = node.getRowCount()
  const columns = node.getColumns()
  const headRows = node.getHeadRows()
  const bodyRows = node.getBodyRows()
  const footRows = node.getFootRows()

  const getCellClass = (cell: TableType.Cell): string => {
    const classAttr = cn(
      'tableblock', // @ts-ignore
      `halign-${cell.getAttribute('halign')}`, // @ts-ignore
      `valign-${cell.getAttribute('valign')}`, // Undocumented feature
    )

    return classAttr
  }

  const title = node.getTitle()
  const id = node.getId()
  const slug = id || slugify(title || '')

  return (
    <table
      className={cn('tableblock', ...classes)}
      style={{ width: width ? width : undefined }}
      {...getLineNumber(node)}
    >
      {node.hasTitle() && (
        <caption className="title">
          {!id && <a className="anchor" id={slug}></a>}
          <a href={`#${slug}`}>{node.getCaptionedTitle()}</a>
        </caption>
      )}

      {rowCount > 0 && (
        <colgroup>
          {columns.map((col, index) => {
            // @ts-ignore
            // Undocumented feature
            const colWidth = col.getAttribute('colpcwidth')

            return <col key={index} style={{ width: `${colWidth}%` }} />
          })}
        </colgroup>
      )}

      {headRows.map((row, hIndex) => (
        <thead key={hIndex}>
          <tr>
            {row.map((cell, index) => (
              <th
                key={index}
                className={getCellClass(cell)}
                dangerouslySetInnerHTML={{ __html: getText(cell) }}
              />
            ))}
          </tr>
        </thead>
      ))}

      <tbody>
        {bodyRows.map((row, bIndex) => (
          <tr key={bIndex}>
            {row.map((cell, index) => {
              const colSpan = cell.getColumnSpan()
              const rowSpan = cell.getRowSpan()
              const content = getContent(cell)

              const cellProps = {
                colSpan,
                rowSpan,
                className: getCellClass(cell),
              }

              const style = cell.getStyle()

              if (style === 'asciidoc') {
                return (
                  <td {...cellProps} key={index}>
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </td>
                )
              } else if (style === 'literal') {
                return (
                  <td {...cellProps} key={index}>
                    <div className="literal">
                      <pre dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  </td>
                )
              } else if (style === 'header') {
                return (
                  <th {...cellProps} key={index}>
                    <p
                      className="tableblock"
                      dangerouslySetInnerHTML={{ __html: content }}
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

      {footRows.map((row, fIndex) => (
        <tfoot key={fIndex}>
          <tr>
            {row.map((cell, index) => (
              <td key={index} className={getCellClass(cell)}>
                <p
                  className="tableblock"
                  dangerouslySetInnerHTML={{ __html: getText(cell) }}
                />
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
