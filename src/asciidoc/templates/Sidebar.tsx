import cn from 'classnames'

import { Content } from '../'
import { Block } from '../utils/prepareDocument'
import { Title } from './util'

const Sidebar = ({ node }: { node: Block }) => (
  <div
    className={cn('sidebarblock', node.role)}
    {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
  >
    <div className="content">
      <Title text={node.title} />
      <Content blocks={node.blocks} />
    </div>
  </div>
)

export default Sidebar
