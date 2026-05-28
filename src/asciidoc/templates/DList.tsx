import cn from 'classnames'
import { Fragment } from 'react'

import { Content, inlineHtml } from '../'
import { type DListBlock, type ListItemBlock, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const DList = ({ node }: { node: DListBlock }) => {
  const getItem = (item: any) => {
    const listItem: [ListItemBlock[], ListItemBlock] = item
    const terms = listItem[0]
    let dd: ListItemBlock | null = listItem[1]
    // If there isn't a description we get a shell of an object —
    // distinguish the real ListItem by checking the .type field.
    if (!dd || !dd.type) dd = null
    return { terms, dd }
  }

  const renderDd = (dd: ListItemBlock | null) => {
    if (!dd) return null
    return (
      <dd>
        {dd.text && <p dangerouslySetInnerHTML={inlineHtml(dd.textInlines)} />}
        <Content blocks={dd.blocks} />
      </dd>
    )
  }

  if (node.style === 'qanda') {
    return (
      <div
        id={node.id || undefined}
        className={cn('qlist qanda', node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <ol>
          {node.items.map((item: any, index) => {
            const { terms, dd } = getItem(item)
            if (!terms) return null
            return (
              <li key={index}>
                {terms.map((dt, i) => (
                  <p key={i}>
                    <em dangerouslySetInnerHTML={inlineHtml(dt.textInlines)} />
                  </p>
                ))}
                {dd && (
                  <>
                    {dd.text && (
                      <p dangerouslySetInnerHTML={inlineHtml(dd.textInlines)} />
                    )}
                    <Content blocks={dd.blocks} />
                  </>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  if (node.style === 'horizontal') {
    const labelWidth = node.attributes['labelwidth']
    const itemWidth = node.attributes['itemwidth']
    const colWidth = (w: string | number) => ({
      width: `${w.toString().replace('%', '')}%`,
    })
    return (
      <div
        id={node.id || undefined}
        className={cn('hdlist', node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <table>
          {(labelWidth || itemWidth) && (
            <colgroup>
              <col {...(labelWidth ? { style: colWidth(labelWidth) } : {})} />
              <col {...(itemWidth ? { style: colWidth(itemWidth) } : {})} />
            </colgroup>
          )}
          {node.items.map((item: any, index) => {
            const { terms, dd } = getItem(item)
            if (!terms) return null
            return (
              <tr key={index}>
                <td
                  className={cn(
                    'hdlist1',
                    isOption(node.attributes, 'strong') && 'strong',
                  )}
                  dangerouslySetInnerHTML={{
                    __html: terms
                      .map((dt) => inlineHtml(dt.textInlines).__html)
                      .join('<br>'),
                  }}
                />
                {dd && (
                  <td className="hdlist2">
                    {dd.text && (
                      <p dangerouslySetInnerHTML={inlineHtml(dd.textInlines)} />
                    )}
                    <Content blocks={dd.blocks} />
                  </td>
                )}
              </tr>
            )
          })}
        </table>
      </div>
    )
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('dlist', node.style, node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <dl>
        {node.items.map((item: any, index) => {
          const { terms, dd } = getItem(item)
          if (!terms) return null
          return (
            <Fragment key={index}>
              {terms.map((dt, i) => (
                <dt
                  key={i}
                  className={node.style === 'glossary' ? undefined : 'hdlist1'}
                  dangerouslySetInnerHTML={inlineHtml(dt.textInlines)}
                />
              ))}
              {renderDd(dd)}
            </Fragment>
          )
        })}
      </dl>
    </div>
  )
}

export default DList
