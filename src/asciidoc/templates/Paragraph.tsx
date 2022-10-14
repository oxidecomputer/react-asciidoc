import type { Asciidoctor } from 'asciidoctor'

// todo: fix hydration error
// convert() is better than getContent() since it applies the substitutions
// but it gives us hydration issues
const Paragraph = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`paragraph ${node.getRole() || ''}`}
    >
      {node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>}
      <p dangerouslySetInnerHTML={{ __html: node.convert() }} />
    </div>
  )
}

export default Paragraph
