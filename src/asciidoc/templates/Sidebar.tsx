import cn from 'classnames'

import { Content } from '../'
import RenderInline from '../RenderInline'
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
        <div className="content">
          {node.title && (
            <div className="title" dangerouslySetInnerHTML={{ __html: node.title }} />
          )}
          <RenderInline nodes={node.inlines} />
        </div>
      )}
    </div>
  )
}

export default Sidebar
