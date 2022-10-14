import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

const Literal = ({ node }: { node: Asciidoctor.Block }) => {
  const docAttrs = node.getDocument().getAttributes()
  const nowrap = node.isOption('nowrap') || !docAttrs['prewrap']

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <div className="literalblock">
      {title}
      <div className="content">
        <pre className={`${nowrap ? ' nowrap' : ''}`}>{node.getSource()}</pre>
      </div>
    </div>
  )
}

export default Literal
