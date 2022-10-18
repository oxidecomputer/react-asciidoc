import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'
import { Title } from './util'

const Sidebar = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div className={`sidebarblock ${node.getRole() || ''}`}>
      <div className="content">
        <Title node={node} />
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Sidebar
