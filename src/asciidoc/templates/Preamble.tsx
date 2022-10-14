import type { Asciidoctor } from 'asciidoctor'

import { Content } from '../'

const Preamble = ({ node }: { node: Asciidoctor.AbstractBlock }) => (
  <div id="preamble">
    <div className="sectionbody">
      <Content blocks={node.getBlocks()} />
    </div>
  </div>
)

export default Preamble
