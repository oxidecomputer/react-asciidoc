import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'
import { CaptionedTitle } from './util'

const Example = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div className={`exampleblock ${node.getRole() || ''}`}>
      <CaptionedTitle node={node} />
      <div className="content">
        <Content blocks={node.getBlocks()} />
      </div>
    </div>
  )
}
export default Example
