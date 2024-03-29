import type { Block } from '@asciidoctor/core'
import parse from 'html-react-parser'

import { Content } from '../'
import { getContent } from '../utils/getContent'
import { Title, getLineNumber } from './util'

const Admonition = ({ node }: { node: Block }) => {
  const attrs = node.getAttributes()
  const document = node.getDocument()
  const content = getContent(node)

  const renderIcon = () =>
    document.getAttribute('icons') === 'font' && !attrs.icon ? (
      <i className={`fa icon-${attrs.name}`} title={attrs.textlabel} />
    ) : (
      <img src={node.getIconUri(attrs.name)} alt={attrs.textlabel} />
    )

  // Undocumented asciidoc attribute
  // Use this to check if we should render the content as is, or use a <Content /> block
  // @ts-ignore
  const contentModel = node.content_model

  return (
    <div className={`admonitionblock ${attrs.name}`} {...getLineNumber(node)}>
      <table>
        <tbody>
          <tr>
            <td className="icon">
              {document.hasAttribute('icons') ? (
                renderIcon()
              ) : (
                <div className="title">{node.getAttribute('textlabel')}</div>
              )}
            </td>
            <td className="content">
              <Title node={node} />
              {parse(content)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Admonition
