import cn from 'classnames'

import { Content } from '..'
import { inlineHtml } from '../RenderInline'
import { type Block, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const Example = ({ node }: { node: Block }) => {
  const isCollapsible = isOption(node.attributes, 'collapsible')
  if (isCollapsible) {
    const isOpen = isOption(node.attributes, 'open')

    return (
      <details
        id={node.id || undefined}
        className={node.role || undefined}
        open={isOpen}
        {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      >
        <summary
          className="title"
          dangerouslySetInnerHTML={{
            __html: node.title || 'Details',
          }}
        />
        <div className="content">
          {node.blocks.length > 0 ? (
            <Content blocks={node.blocks} />
          ) : node.inlines ? (
            <div dangerouslySetInnerHTML={inlineHtml(node.inlines)} />
          ) : null}
        </div>
      </details>
    )
  }

  return (
    <div
      id={node.id || undefined}
      className={cn('exampleblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <Title text={node.title} />
      <div
        className="content"
        {...(node.blocks.length === 0 && node.inlines
          ? { dangerouslySetInnerHTML: inlineHtml(node.inlines) }
          : {})}
      >
        {node.blocks.length > 0 ? <Content blocks={node.blocks} /> : null}
      </div>
    </div>
  )
}

export default Example
