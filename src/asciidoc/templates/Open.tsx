import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'
import { Title } from './util'

const Open = ({ node }: { node: Asciidoctor.Block }) => {
  const style = node.getStyle()

  if (style === 'abstract') {
    return (
      <div className={`quoteblock abstract ${node.getRole() ? node.getRole() : ''}`}>
        <Title node={node} />
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
      <Title node={node} />
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}

export default Open
