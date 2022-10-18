import type { Asciidoctor } from 'asciidoctor'
import cn from 'classnames'

import { Title, getRole } from './util'

const Paragraph = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div id={node.getId ? node.getId() : ''} className={cn('paragraph', getRole(node))}>
      <Title node={node} />
      <p dangerouslySetInnerHTML={{ __html: node.getContent() }} />
    </div>
  )
}

export default Paragraph
