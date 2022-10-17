import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

import { Content } from '../'

const Example = ({ node }: { node: Asciidoctor.Block }) => {
  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <div className={`exampleblock ${node.getRole() || ''}`}>
      {title}
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Example
