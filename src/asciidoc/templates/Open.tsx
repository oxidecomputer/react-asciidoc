import cn from 'classnames'

import { Content } from '..'
import RenderInline, { inlineHtml, useInlineRenderMode } from '../RenderInline'
import { type BaseBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Open = ({ node }: { node: BaseBlock }) => {
  const { react, iconsFont } = useInlineRenderMode(node.inlines)
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
          {...(node.inlines && node.blocks.length === 0 && !react
            ? { dangerouslySetInnerHTML: inlineHtml(node.inlines, iconsFont) }
            : {})}
        >
          {node.blocks.length > 0 ? (
            <Content blocks={node.blocks} />
          ) : node.inlines && react ? (
            <RenderInline nodes={node.inlines} />
          ) : null}
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
        {...(node.inlines && node.blocks.length === 0 && !react
          ? { dangerouslySetInnerHTML: inlineHtml(node.inlines, iconsFont) }
          : {})}
      >
        {node.blocks.length > 0 ? (
          <Content blocks={node.blocks} />
        ) : node.inlines && react ? (
          <RenderInline nodes={node.inlines} />
        ) : null}
      </div>
    </div>
  )
}

export default Open
