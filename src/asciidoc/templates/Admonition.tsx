import parse from 'html-react-parser'
import { useContext } from 'react'

import { Context } from '..'
import { AdmonitionBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Admonition = ({ node }: { node: AdmonitionBlock }) => {
  const { document } = useContext(Context)
  const docAttrs = document.attributes || {}
  const attrs = node.attributes

  const renderIcon = () =>
    docAttrs.icons === 'font' && !attrs.icon ? (
      <i className={`fa icon-${attrs.name}`} title={attrs.textlabel} />
    ) : (
      <img src={node.iconUri} alt={attrs.textlabel} />
    )

  return (
    <div
      className={`admonitionblock ${attrs.name}`}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <table>
        <tbody>
          <tr>
            <td className="icon">
              {docAttrs.icons ? (
                renderIcon()
              ) : (
                <div className="title">{attrs.textlabel}</div>
              )}
            </td>
            <td className="content">
              <Title text={node.title} />
              {node.content && parse(node.content)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Admonition
