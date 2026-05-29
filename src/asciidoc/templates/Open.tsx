import cn from 'classnames'

import { Content } from '../'
import RenderInline from '../RenderInline'
import { type BaseBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Open = ({ node }: { node: BaseBlock }) => {
  const style = node.style

  if (style === 'abstract') {
    return (
      <div
        id={node.id || undefined}
        className={cn('quoteblock abstract', node.role)}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <Title text={node.title} />
        <blockquote>
          {node.blocks.length > 0 ? (
            <Content blocks={node.blocks} />
          ) : (
            node.content && (
              <span>
              <RenderInline nodes={node.inlines} />
            </span>
            )
          )}
        </blockquote>
      </div>
    )
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('openblock', style && style !== 'open' ? style : null, node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        {node.blocks.length > 0 ? (
          <Content blocks={node.blocks} />
        ) : (
          node.content && (
            <span>
              <RenderInline nodes={node.inlines} />
            </span>
          )
        )}
      </div>
    </div>
  )
}

export default Open
