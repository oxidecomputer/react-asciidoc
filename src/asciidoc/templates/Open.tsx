import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'

const Open = ({ node }: { node: Asciidoctor.Block }) => {
  const title = node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>
  const style = node.getStyle()

  if (style === 'abstract') {
    return (
      <div className={`quoteblock abstract ${node.getRole() ? node.getRole() : ''}`}>
        {title}
        <blockquote className="content">
          <Content blocks={node.getBlocks()} />
        </blockquote>
      </div>
    )
  }

  return (
    <div
      className={`openblock ${style && style !== 'open' ? style : ''} ${
        node.getRole() ? node.getRole() : ''
      }`}
    >
      {title}
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}

export default Open
