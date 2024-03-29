import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import { Content } from '../'
import { Title } from './util'
import { getLineNumber, getRole } from './util'

const Open = ({ node }: { node: Block }) => {
  const style = node.getStyle()

  if (style === 'abstract') {
    return (
      <div className={cn('quoteblock abstract', getRole(node))} {...getLineNumber(node)}>
        <Title node={node} />
        <blockquote className="content">
          <Content blocks={node.getBlocks()} />
        </blockquote>
      </div>
    )
  }

  return (
    <div
      className={cn('openblock', style && style !== 'open' ? style : '', getRole(node))}
      {...getLineNumber(node)}
    >
      <Title node={node} />
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}

export default Open
