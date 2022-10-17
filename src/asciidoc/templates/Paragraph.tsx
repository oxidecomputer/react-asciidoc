import type { Asciidoctor } from 'asciidoctor'

const Paragraph = ({ node }: { node: Asciidoctor.Block }) => {
  return (
    <div
      id={node.getId ? node.getId() : ''}
      className={`paragraph${node.isRole() ? ' ' + node.getRole() : ''}`} // Improve this
    >
      {node.hasTitle() && <div className="title">{node.getCaptionedTitle()}</div>}
      <p dangerouslySetInnerHTML={{ __html: node.getContent() }} />
    </div>
  )
}

export default Paragraph
