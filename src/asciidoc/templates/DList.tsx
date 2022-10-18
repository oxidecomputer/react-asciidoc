import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'
import { Fragment } from 'react'

import { Content } from '../'

const DList = ({ node }: { node: Asciidoctor.List }) => {
  const style = node.getStyle()

  const getItem = (item: any) => {
    const listItem: [Asciidoctor.ListItem[], Asciidoctor.ListItem] = item
    const terms = listItem[0]
    let dd: Asciidoctor.ListItem | null = listItem[1]
    // If there isn't a description we get a shell of an object
    // this is checking that it is actually a real block
    if (!dd.getNodeName) dd = null

    return {
      terms,
      dd,
    }
  }

  const renderDd = (dd: Asciidoctor.ListItem | null) => {
    if (dd) {
      return (
        <dd>
          {dd.hasText() && <p>{parse(dd.getText())}</p>}
          {dd.hasBlocks() && <Content blocks={dd.getBlocks()} />}
        </dd>
      )
    }
  }

  const title = node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>

  if (style === 'qanda') {
    return (
      <div className={`qlist qanda ${node.getRole() || ''}`}>
        {title}
        <ol>
          {node.getItems().map((item: any, index) => {
            const { terms, dd } = getItem(item)

            return (
              <li key={index}>
                {terms.map((dt: any, index: number) => (
                  <p key={index}>
                    <em>{dt.getText()}</em>
                  </p>
                ))}
                {renderDd(dd)}
              </li>
            )
          })}
        </ol>
      </div>
    )
  } else if (style === 'horizontal') {
    const labelWidth = node.getAttribute('labelwidth')
    const itemWidth = node.getAttribute('itemwidth')

    return (
      <div className={`hdlist ${node.getRole() || ''}`}>
        {title}
        <table>
          {(labelWidth || itemWidth) && (
            <colgroup>
              <col
                style={{
                  width: labelWidth ? `${labelWidth.replace('%', '')}%` : '', // do this because a width could have a % or no unit
                }}
              />
              <col
                style={{
                  width: itemWidth ? `${itemWidth.replace('%', '')}%` : '',
                }}
              />
            </colgroup>
          )}

          {node.getItems().map((item: any, index) => {
            const { terms, dd } = getItem(item)

            return (
              <tr key={index}>
                <td className={`hdlist1 ${node.isOption('strong') ? 'strong' : ''}`}>
                  {terms.map((dt: any, index: number) => (
                    <Fragment key={index}>
                      {index !== 0 && <br />}
                      {parse(dt.getText())}
                    </Fragment>
                  ))}
                </td>
                {dd && (
                  <td className="hdlist2">
                    {dd.hasText() && <p>{parse(dd.getText())}</p>}
                    {dd.hasBlocks() && <Content blocks={dd.getBlocks()} />}
                  </td>
                )}
              </tr>
            )
          })}
        </table>
      </div>
    )
  } else {
    return (
      <div className={`dlist ${node.getStyle() || ''} ${node.getRole() || ''}`}>
        {title}
        <dl>
          {node.getItems().map((item: any, index) => {
            const { terms, dd } = getItem(item)

            return (
              <Fragment key={index}>
                {terms.map((dt: any, index: number) => (
                  <dt key={index} className="hdlist1">
                    {parse(dt.getText())}
                  </dt>
                ))}
                {renderDd(dd)}
              </Fragment>
            )
          })}
        </dl>
      </div>
    )
  }
}

export default DList
