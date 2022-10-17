import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

import { Content } from '../'

const Sidebar = ({ node }: { node: Asciidoctor.Block }) => {
  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <div className={`sidebarblock ${node.getRole() || ''}`}>
      <div className="content">
        {title}
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Sidebar
