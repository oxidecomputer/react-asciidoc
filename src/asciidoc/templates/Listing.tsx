import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

const Listing = ({ node }: { node: Asciidoctor.Block }) => {
  const docAttrs = node.getDocument().getAttributes()
  const attrs = node.getAttributes()
  const nowrap = node.isOption('nowrap') || !docAttrs['prewrap']

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  if (node.getStyle() === 'source') {
    const lang = attrs.language

    return (
      <div className="listingblock">
        {title}
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
        {title}
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
