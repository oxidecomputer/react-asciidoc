import type { Asciidoctor } from '~/lib/asciidoctor'
import parse from 'html-react-parser'

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
        {hasToc && (
          <div id="toc" className={document.getAttribute('toc-class', 'toc')}>
            <div id="toctitle">{parse(document.getAttribute('toc-title'))}</div>
            <Outline node={document as Asciidoctor.AbstractBlock} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Preamble
