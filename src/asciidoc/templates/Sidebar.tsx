import cn from 'classnames'
import parse from 'html-react-parser'

import { Content } from '../'
import { type Block } from '../utils/prepareDocument'
import { Title } from './util'

const Sidebar = ({ node }: { node: Block }) => (
  <div
    className={cn('sidebarblock', node.role)}
    {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
  >
    <div className="content">
      <Title text={node.title} />
      {node.content && parse(node.content)}
      <Content blocks={node.blocks} />
    </div>
  </div>
)

export default Sidebar
