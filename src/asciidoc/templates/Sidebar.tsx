import cn from 'classnames'

import type { Asciidoctor } from '~/lib/asciidoctor'

import { Content } from '../'
import { getRole } from './util'
import { Title } from './util'

const Sidebar = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div className={cn('sidebarblock', getRole(node))}>
      <div className="content">
        <Title node={node} />
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Sidebar
