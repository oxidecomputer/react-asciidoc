import type { Asciidoctor } from 'asciidoctor'

import { CaptionedTitle } from './util'

const Listing = ({ node }: { node: Asciidoctor.Block }) => {
  const document = node.getDocument()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !document.hasAttribute('prewrap')

  if (node.getStyle() === 'source') {
    const lang = attrs.language

    return (
      <div className="listingblock">
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={`highlight${nowrap ? ' nowrap' : ''}`}>
            {lang ? (
              <code
                className={lang ? `language-${lang}` : ''}
                data-lang={lang}
                dangerouslySetInnerHTML={{ __html: node.getContent() }}
              />
            ) : (
              <code dangerouslySetInnerHTML={{ __html: node.getContent() }} />
            )}
          </pre>
        </div>
      </div>
    )
  } else {
    return (
      <div className="listingblock">
        <CaptionedTitle node={node} />
        <div className="content">
          <pre className={`${nowrap ? ' nowrap' : ''}`}>
            <code dangerouslySetInnerHTML={{ __html: node.getSource() }} />
          </pre>
        </div>
      </div>
    )
  }
}

export default Listing
