import cn from 'classnames'

import { Content } from '../'
import { type BaseBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Open = ({ node }: { node: BaseBlock }) => {
  const style = node.style

  if (style === 'abstract') {
    return (
      <div
        className={cn('quoteblock abstract', node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <blockquote className="content">
          <Content blocks={node.blocks} />
        </blockquote>
      </div>
    )
  }

  return (
    <div
      className={cn('openblock', style && style !== 'open' ? style : '', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <Content blocks={node.blocks} />
      </div>
    </div>
  )
}

export default Open
