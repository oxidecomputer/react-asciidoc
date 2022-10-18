import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

import { Content } from '../'

const Admonition = ({ node }: { node: Asciidoctor.Block }) => {
  const attrs = node.getAttributes()
  const document = node.getDocument()

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

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
    <div className={`admonitionblock ${attrs.name}`}>
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
              {title}
              {contentModel === 'simple' ? (
                parse(node.getContent())
              ) : (
                <Content blocks={node.getBlocks()} />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Admonition
