import type { Asciidoctor } from 'asciidoctor'

const Quote = ({ node }: { node: Asciidoctor.Block }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')

  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`quoteblock ${node.getRole() || ''}`}
    >
      {node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>}
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
