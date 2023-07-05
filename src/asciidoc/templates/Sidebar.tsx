import type { Block } from '@asciidoctor/core'
import cn from 'classnames'

import { Content } from '../'
import { getRole } from './util'
import { Title, getLineNumber } from './util'

const Sidebar = ({ node }: { node: Block }) => {
  return (
    <div className={cn('sidebarblock', getRole(node))} {...getLineNumber(node)}>
      <div className="content">
        <Title node={node} />
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Sidebar
