import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { Block } from '../utils/prepareDocument'
import { Title } from './util'

const Example = ({ node }: { node: Block }) => {
  if (node.attributes.collapsible) {
    const isCollapsible = node.attributes.collapsible
    const title = node.title || 'Details'
    const isOpen = node.attributes.open ? true : undefined

    if (isCollapsible) {
      return (
        <details
          className={node.role}
          open={isOpen}
          {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
          {...(node.id ? { id: node.id } : {})}
        >
          <summary className="title">{parse(title)}</summary>
          <div className="content">
            <Content blocks={node.blocks} />
          </div>
        </details>
      )
    }
  }

  return (
    <div
      className={cn('exampleblock', node.role)}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      {...(node.id ? { id: node.id } : {})}
    >
      <Title text={node.title} />
      <div className="content">
        <Content blocks={node.blocks} />
      </div>
    </div>
  )
}

export default Example
