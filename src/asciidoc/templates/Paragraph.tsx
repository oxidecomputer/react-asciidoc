import type { Asciidoctor } from 'asciidoctor'

import { Title } from './util'

const Paragraph = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`paragraph${node.isRole() ? ' ' + node.getRole() : ''}`} // Improve this
    >
      <Title node={node} />
      <p dangerouslySetInnerHTML={{ __html: node.getContent() }} />
    </div>
  )
}

export default Paragraph
