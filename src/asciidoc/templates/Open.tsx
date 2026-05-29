import cn from 'classnames'

import { Content } from '..'
import { inlineHtml } from '../RenderInline'
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
        <blockquote
          {...(node.inlines && node.blocks.length === 0
            ? { dangerouslySetInnerHTML: inlineHtml(node.inlines) }
            : {})}
        >
          {node.blocks.length > 0 ? <Content blocks={node.blocks} /> : null}
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
      <div
        className="content"
        {...(node.inlines && node.blocks.length === 0
          ? { dangerouslySetInnerHTML: inlineHtml(node.inlines) }
          : {})}
      >
        {node.blocks.length > 0 ? <Content blocks={node.blocks} /> : null}
      </div>
    </div>
  )
}

export default Open
