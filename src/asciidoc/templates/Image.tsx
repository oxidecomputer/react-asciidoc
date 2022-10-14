import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

const Image = ({ node }: { node: Asciidoctor.Block }) => {
  const target = node.getAttribute('target')

  const img = (
    <img
      src={node.getImageUri(target)}
      alt={node.getAttribute('alt')}
      width={node.getAttribute('width')}
      height={node.getAttribute('height')}
    />
  )

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <div className="imageblock">
      <div className="content">{img}</div>
      {title}
    </div>
  )
}

export default Image
