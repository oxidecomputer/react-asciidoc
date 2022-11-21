import cn from 'classnames'
import parse from 'html-react-parser'

import type { Asciidoctor } from '~/lib/asciidoctor'

import useGetContent from '../hooks/useGetContent'

const Table = ({ node }: { node: Asciidoctor.Table }) => {
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

  const getCellClass = (cell: Asciidoctor.Table.Cell): string => {
    const classAttr = cn(
      'tableblock', // @ts-ignore
      `halign-${cell.getAttribute('halign')}`, // @ts-ignore
      `valign-${cell.getAttribute('valign')}`, // Undocumented feature
    )

    return classAttr
  }

  return (
    <table
      className={cn('tableblock', ...classes)}
      style={{ width: width ? width : undefined }}
    >
      {node.hasTitle() && <caption className="title">{node.getCaptionedTitle()}</caption>}

      {rowCount > 0 && (
        <colgroup>
          {columns.map((col) => {
            // @ts-ignore
            // Undocumented feature
            const colWidth = col.getAttribute('colpcwidth')

            return <col style={{ width: `${colWidth}%` }} />
          })}
        </colgroup>
      )}

      {headRows.map((row) => (
        <thead>
          <tr>
            {row.map((cell) => (
              <th
                className={getCellClass(cell)}
                dangerouslySetInnerHTML={{ __html: cell.getText() }}
              />
            ))}
          </tr>
        </thead>
      ))}

      <tbody>
        {bodyRows.map((row) => (
          <tr>
            {row.map((cell) => {
              const colSpan = cell.getColumnSpan()
              const rowSpan = cell.getRowSpan()
              const content = useGetContent(cell)

              const cellProps = {
                colSpan,
                rowSpan,
                className: getCellClass(cell),
              }

              const style = cell.getStyle()

              if (style === 'asciidoc') {
                return (
                  <td {...cellProps}>
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </td>
                )
              } else if (style === 'literal') {
                return (
                  <td {...cellProps}>
                    <div className="literal">
                      <pre dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  </td>
                )
              } else if (style === 'header') {
                return (
                  <th {...cellProps}>
                    <p
                      className="tableblock"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </th>
                )
              } else {
                const cellContent = cell.getContent() as unknown as string[]
                if (cellContent.length > 0) {
                  return (
                    <td {...cellProps}>
                      {parse(
                        `<p class="tableblock">${cellContent.join(
                          '</p>\n<p class="tableblock">',
                        )}</p>`,
                      )}
                    </td>
                  )
                }
              }
            })}
          </tr>
        ))}
      </tbody>

      {footRows.map((row) => (
        <tfoot>
          <tr>
            {row.map((cell, index) => (
              <td key={index} className={getCellClass(cell)}>
                <p
                  className="tableblock"
                  dangerouslySetInnerHTML={{ __html: cell.getText() }}
                />
              </td>
            ))}
          </tr>
        </tfoot>
      ))}
    </table>
  )
}
export default Table
