import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import { Content } from '../'
import { CaptionedTitle } from './util'
import { getLineNumber, getRole } from './util'

const Example = ({ node }: { node: Block }) => {
  if (node.isOption('collapsible')) {
    const isCollapsible = node.isOption('collapsible')
    const title = node.getTitle() || 'Details'
    const isOpen = node.isOption('open') ? true : undefined

    if (isCollapsible) {
      return (
        <details className={getRole(node)} open={isOpen} {...getLineNumber(node)}>
          <summary className="title">{title}</summary>
          <div className="content">
            <Content blocks={node.getBlocks()} />
          </div>
        </details>
      )
    }
  }

  return (
    <div className={cn('exampleblock', getRole(node))} {...getLineNumber(node)}>
      <CaptionedTitle node={node} />
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Example
