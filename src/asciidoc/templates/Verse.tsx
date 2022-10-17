import type { Asciidoctor } from 'asciidoctor'

const Verse = ({ node }: { node: Asciidoctor.List }) => {
  const attribution = node.getAttribute('attribution')
  const citetitle = node.getAttribute('citetitle')

  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`verseblock ${node.getRole() || ''}`}
    >
      {node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>}
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
