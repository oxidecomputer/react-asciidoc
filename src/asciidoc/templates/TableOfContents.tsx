import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

import Outline from './Outline'

const TableOfContents = ({ node }: { node: Asciidoctor.Block }) => {
  let idAttr: string = node.getId() || 'toc'
  const document = node.getDocument()
  const title = node.hasTitle() ? node.getTitle() : document.getAttribute('toc-title')

  if (
    document.getAttribute('toc-placement') === 'macro' &&
    document.hasSections() &&
    document.hasAttribute('toc')
  ) {
    return (
      <div id={idAttr} className={`toc ${node.getRole() || ''}`}>
        <div id={`${idAttr}title`} className="title">
          {parse(title || '')}
        </div>
        <Outline node={node.getDocument() as Asciidoctor.AbstractBlock} />
      </div>
    )
  } else {
    return null
  }
}

export default TableOfContents