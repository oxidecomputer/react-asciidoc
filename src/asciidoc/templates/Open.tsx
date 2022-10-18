import type { Asciidoctor } from 'asciidoctor'
import cn from 'classnames'

import { Content } from '../'
import { Title } from './util'
import { getRole } from './util'

const Open = ({ node }: { node: Asciidoctor.Block }) => {
  const style = node.getStyle()

  if (style === 'abstract') {
    return (
      <div className={cn('quoteblock abstract', getRole(node))}>
        <Title node={node} />
        <blockquote className="content">
          <Content blocks={node.getBlocks()} />
        </blockquote>
      </div>
    )
  }

  return (
    <div className={cn('openblock', style && style !== 'open' ? style : '', getRole(node))}>
      <Title node={node} />
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}

export default Open
