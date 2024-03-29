import type { List, ListItem } from '@asciidoctor/core'
import cn from 'classnames'
import parse from 'html-react-parser'
import { Fragment } from 'react'

import { Content } from '../'
import { getText } from '../utils/getContent'
import { getLineNumber, getRole } from './util'

const DList = ({ node }: { node: List }) => {
  const style = node.getStyle()

  const getItem = (item: any) => {
    const listItem: [ListItem[], ListItem] = item
    const terms = listItem[0]
    let dd: ListItem | null = listItem[1]
    // If there isn't a description we get a shell of an object
    // this is checking that it is actually a real block
    if (!dd.getNodeName) dd = null

    return {
      terms,
      dd,
    }
  }

  const renderDd = (dd: ListItem | null) => {
    if (dd) {
      return (
        <dd>
          {dd.hasText() && <p>{parse(getText(dd))}</p>}
          {dd.hasBlocks() && <Content blocks={dd.getBlocks()} />}
        </dd>
      )
    }
  }

  const title = node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>

  if (style === 'qanda') {
    return (
      <div className={cn('qlist qanda', getRole(node))} {...getLineNumber(node)}>
        {title}
        <ol>
          {node.getItems().map((item: any, index) => {
            const { terms, dd } = getItem(item)

            return (
              <li key={index}>
                {terms.map((dt: any, index: number) => (
                  <p key={index}>
                    <em>{parse(getText(dt))}</em>
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
      <div className={cn('hdlist', getRole(node))}>
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

          <tbody>
            {node.getItems().map((item: any, index) => {
              const { terms, dd } = getItem(item)

              return (
                <tr key={index}>
                  <td className={cn('hdlist1', node.isOption('strong') ? 'strong' : '')}>
                    {terms.map((dt: any, index: number) => (
                      <Fragment key={index}>
                        {index !== 0 && <br />}
                        {parse(getText(dt))}
                      </Fragment>
                    ))}
                  </td>
                  {dd && (
                    <td className="hdlist2">
                      {dd.hasText() && <p>{parse(getText(dd))}</p>}
                      {dd.hasBlocks() && <Content blocks={dd.getBlocks()} />}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  } else {
    return (
      <div className={cn('dlist', node.getStyle(), getRole(node))}>
        {title}
        <dl>
          {node.getItems().map((item: any, index) => {
            const { terms, dd } = getItem(item)

            return (
              <Fragment key={index}>
                {terms.map((dt: any, index: number) => (
                  <dt key={index} className="hdlist1">
                    {parse(getText(dt))}
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
