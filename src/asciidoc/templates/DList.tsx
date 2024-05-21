import cn from 'classnames'
import parse from 'html-react-parser'
import { Fragment } from 'react'

import { Content } from '../'
import { type DListBlock, type ListItemBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const DList = ({ node }: { node: DListBlock }) => {
  const getItem = (item: any) => {
    const listItem: [ListItemBlock[], ListItemBlock] = item
    const terms = listItem[0]
    let dd: ListItemBlock | null = listItem[1]
    // If there isn't a description we get a shell of an object
    // this is checking that it is actually a real block
    if (!dd.type) dd = null

    return {
      terms,
      dd,
    }
  }

  const renderDd = (dd: ListItemBlock | null) => {
    if (dd) {
      return (
        <dd>
          {dd.text && <p>{parse(dd.text)}</p>}
          <Content blocks={dd.blocks} />
        </dd>
      )
    }
  }

  if (node.style === 'qanda') {
    return (
      <div
        className={cn('qlist qanda', node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <ol>
          {node.items.map((item: any, index) => {
            const { terms, dd } = getItem(item)

            if (!terms) {
              return
            }

            return (
              <li key={index}>
                {terms.map((dt: any, index: number) => (
                  <p key={index}>
                    <em>{parse(dt.text)}</em>
                  </p>
                ))}
                {renderDd(dd)}
              </li>
            )
          })}
        </ol>
      </div>
    )
  } else if (node.style === 'horizontal') {
    const labelWidth = node.attributes['labelwidth']
    const itemWidth = node.attributes['itemwidth']

    return (
      <div className={cn('hdlist', node.role)}>
        <Title text={node.title} />
        <table>
          {(labelWidth || itemWidth) && (
            <colgroup>
              <col
                style={{
                  width: labelWidth ? `${labelWidth.toString().replace('%', '')}%` : '', // do this because a width could have a % or no unit
                }}
              />
              <col
                style={{
                  width: itemWidth ? `${itemWidth.toString().replace('%', '')}%` : '',
                }}
              />
            </colgroup>
          )}

          <tbody>
            {node.items.map((item: any, index) => {
              const { terms, dd } = getItem(item)

              if (!terms) {
                return
              }

              return (
                <tr key={index}>
                  <td
                    className={cn(
                      'hdlist1',
                      isOption(node.attributes, 'strong') ? 'strong' : '',
                    )}
                  >
                    {terms.map((dt: any, index: number) => (
                      <Fragment key={index}>
                        {index !== 0 && <br />}
                        {parse(dt.text)}
                      </Fragment>
                    ))}
                  </td>
                  {dd && (
                    <td className="hdlist2">
                      {dd.text && <p>{parse(dd.text)}</p>}
                      <Content blocks={dd.blocks} />
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
      <div className={cn('dlist', node.style, node.role)}>
        <Title text={node.title} />
        <dl>
          {node.items.map((item: any, index) => {
            const { terms, dd } = getItem(item)

            if (!terms) {
              return
            }

            return (
              <Fragment key={index}>
                {terms.map((dt: any, index: number) => (
                  <dt key={index} className="hdlist1">
                    {parse(dt.text)}
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
