import cn from 'classnames'

import { Content, inlineHtml, useConverterContext } from '../'
import type { CoListBlock, ListItemBlock } from '../utils/prepareDocument'
import { Title } from './util'

const CoList = ({ node }: { node: CoListBlock }) => {
  const { document } = useConverterContext()
  const fontIcons = document.attributes?.['icons'] === 'font'

  return (
    <div
      id={node.id || undefined}
      className={cn('colist', node.style || 'arabic', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      {fontIcons ? (
        <table>
          {node.items.map((item: ListItemBlock, index) => (
            <tr key={index}>
              <td>
                <i className="conum" data-value={index + 1} />
                <b>{index + 1}</b>
              </td>
              {item.blocks.length > 0 ? (
                <td>
                  <span dangerouslySetInnerHTML={inlineHtml(item.textInlines)} />
                  <Content blocks={item.blocks} />
                </td>
              ) : (
                <td dangerouslySetInnerHTML={inlineHtml(item.textInlines)} />
              )}
            </tr>
          ))}
        </table>
      ) : (
        <ol>
          {node.items.map((item: ListItemBlock, index) => (
            <li key={index}>
              <p dangerouslySetInnerHTML={inlineHtml(item.textInlines)} />
              <Content blocks={item.blocks} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default CoList
