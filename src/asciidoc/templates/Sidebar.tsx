import cn from 'classnames'

import { Content, inlineHtml } from '../'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Sidebar = ({ node }: { node: Block }) => {
  const hasBlocks = node.blocks.length > 0

  return (
    <div
      id={node.id || undefined}
      className={cn('sidebarblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      {hasBlocks ? (
        <div className="content">
          <Title text={node.title} />
          <Content blocks={node.blocks} />
        </div>
      ) : (
        <div
          className="content"
          dangerouslySetInnerHTML={{
            __html:
              (node.title ? `<div class="title">${node.title}</div>` : '') +
              inlineHtml(node.inlines).__html,
          }}
        />
      )}
    </div>
  )
}

export default Sidebar
