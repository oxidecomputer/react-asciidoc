import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'

const Admonition = ({ node }: { node: Asciidoctor.Block }) => {
  const attrs = node.getAttributes()

  // Undocumented asciidoc attribute
  // Use this to check if we should render the content as is, or use a <Content /> block
  // @ts-ignore
  const contentModel = node.content_model

  return (
    <div className={`admonitionblock ${attrs.name}`}>
      <div className="admonition-icon"></div>
      <div className="admonition-content">
        <div className="adomonition-content-label">{attrs.textlabel}</div>
        {contentModel === 'simple' ? (
          <p dangerouslySetInnerHTML={{ __html: node.getContent() }} />
        ) : (
          <Content blocks={node.getBlocks()} />
        )}
      </div>
    </div>
  )
}

export default Admonition
