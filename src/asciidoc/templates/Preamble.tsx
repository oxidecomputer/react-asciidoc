import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'
import Outline from './Outline'

const Preamble = ({ node }: { node: Asciidoctor.AbstractBlock }) => {
  const document = node.getDocument()

  const hasToc =
    document.getAttribute('toc-placement') === 'preamble' &&
    document.hasSections() &&
    document.hasAttribute('toc')

  return (
    <div id="preamble">
      <div className="sectionbody">
        <Content blocks={node.getBlocks()} />
        {hasToc && <Outline node={document as Asciidoctor.AbstractBlock} />}
      </div>
    </div>
  )
}

export default Preamble
