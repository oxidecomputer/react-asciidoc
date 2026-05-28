import cn from 'classnames'

import { Content, inlineHtml } from '../'
import { type Block, isOption } from '../utils/prepareDocument'
import { Title } from './util'

const Example = ({ node }: { node: Block }) => {
  const isCollapsible = isOption(node.attributes, 'collapsible')
  if (isCollapsible) {
    const isOpen = node.attributes.open ? true : undefined

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
          ) : (
            node.content && (
              <span dangerouslySetInnerHTML={inlineHtml(node.inlines)} />
            )
          )}
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
      <div className="content">
        {node.blocks.length > 0 ? (
          <Content blocks={node.blocks} />
        ) : (
          node.content && (
            <span dangerouslySetInnerHTML={inlineHtml(node.inlines)} />
          )
        )}
      </div>
    </div>
  )
}

export default Example
