import type { Asciidoctor } from 'asciidoctor'

import { Title } from './util'

const Quote = ({ node }: { node: Asciidoctor.Block }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')

  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`quoteblock ${node.getRole() || ''}`}
    >
      <Title node={node} />
      <blockquote dangerouslySetInnerHTML={{ __html: node.getContent() }} />
      {attribution && (
        <div className="attribution">
          — {attribution}
          {citetitle && <cite>{citetitle}</cite>}
        </div>
      )}
    </div>
  )
}

export default Quote
