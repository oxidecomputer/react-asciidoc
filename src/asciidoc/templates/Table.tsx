import type { Asciidoctor } from 'asciidoctor'
import cn from 'classNames'

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

  if (autowidth && !node.getAttribute('width')) {
    classes.push('fit-content')
  } else if (tablewidth == 100) {
    classes.push('stretch')
  } else {
    width = `${tablewidth}%`
  }

  if (node.getAttribute('float')) classes.push(node.getAttribute('float'))
  if (node.getRole()) classes.push(node.getRole())

  const rowCount = node.getRowCount()
  const columns = node.getColumns()
  const headRows = node.getHeadRows()
  const bodyRows = node.getBodyRows()

  return (
    <table
      className={cn('tableblock', ...classes)}
      style={{ width: width ? `${width}%` : 'auto' }}
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
              <th dangerouslySetInnerHTML={{ __html: cell.getText() }} />
            ))}
          </tr>
        </thead>
      ))}

      <tbody>
        {bodyRows.map((row) => (
          <tr>
            {row.map((cell) => {
              // @ts-ignore
              // Undocumented feature
              var classAttr = `tableblock halign-${cell.getAttribute(
                'halign',
                // @ts-ignore
              )} valign-${cell.getAttribute('valign')}`
              const colSpan = cell.getColumnSpan()
              const rowSpan = cell.getRowSpan()

              const cellProps = {
                colSpan,
                rowSpan,
                className: classAttr,
              }

              const style = cell.getStyle()

              if (style === 'asciidoc') {
                return (
                  <td {...cellProps}>
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{ __html: cell.getContent() }}
                    />
                  </td>
                )
              } else if (style === 'literal') {
                return (
                  <td {...cellProps}>
                    <div className="literal">
                      <pre dangerouslySetInnerHTML={{ __html: cell.getContent() }} />
                    </div>
                  </td>
                )
              } else {
                return (
                  <td {...cellProps}>
                    <p
                      className="tableblock"
                      dangerouslySetInnerHTML={{ __html: cell.getText() }}
                    />
                  </td>
                )
              }
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
export default Table
