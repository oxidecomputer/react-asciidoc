import cn from 'classnames'

import { Content, inlineHtml, useConverterContext } from '..'
import { AdmonitionBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Admonition = ({ node }: { node: AdmonitionBlock }) => {
  const { document } = useConverterContext()
  const docAttrs = document.attributes || {}
  const attrs = node.attributes

  const renderIcon = () =>
    docAttrs.icons === 'font' && !attrs.icon ? (
      <i className={`fa icon-${attrs.name}`} title={`${attrs.textlabel}`} />
    ) : (
      <img src={node.iconUri} alt={`${attrs.textlabel}`} />
    )

  return (
    <div
      id={node.id || undefined}
      className={cn('admonitionblock', `${attrs.name}`, node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <table>
        <tr>
          <td className="icon">
            {docAttrs.icons ? (
              renderIcon()
            ) : (
              <div className="title">{`${attrs.textlabel}`}</div>
            )}
          </td>
          {node.blocks.length > 0 ? (
            <td className="content">
              <Title text={node.title} />
              <Content blocks={node.blocks} />
            </td>
          ) : (
            <td
              className="content"
              dangerouslySetInnerHTML={{
                __html:
                  (node.title ? `<div class="title">${node.title}</div>` : '') +
                  inlineHtml(node.inlines).__html,
              }}
            />
          )}
        </tr>
      </table>
    </div>
  )
}

export default Admonition
