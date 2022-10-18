import type { Asciidoctor } from 'asciidoctor'

import { Title } from './util'

const Verse = ({ node }: { node: Asciidoctor.Block }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')

  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`verseblock ${node.getRole() || ''}`}
    >
      <Title node={node} />
      <pre className="content" dangerouslySetInnerHTML={{ __html: node.getContent() }} />
      {attribution && (
        <div className="attribution">
          — {attribution}
          {citetitle && <cite>{citetitle}</cite>}
        </div>
      )}
    </div>
  )
}

export default Verse
