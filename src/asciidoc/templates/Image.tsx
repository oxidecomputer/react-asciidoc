import type { Asciidoctor } from 'asciidoctor'
import parse from 'html-react-parser'

const Image = ({ node }: { node: Asciidoctor.Block }) => {
  const target = node.getAttribute('target')

  let img = (
    <img
      src={node.getImageUri(target)}
      alt={node.getAttribute('alt')}
      width={node.getAttribute('width')}
      height={node.getAttribute('height')}
    />
  )

  if (node.hasAttribute('link')) {
    img = (
      <a className="image" href={node.getAttribute('link')}>
        {img}
      </a>
    )
  }

  const title = node.hasTitle() && (
    <div className="title">{parse(node.getCaptionedTitle())}</div>
  )

  return (
    <div
      className={`imageblock ${
        node.hasAttribute('align') ? 'text-' + node.getAttribute('align') : ''
      } ${node.hasAttribute('float') ? node.getAttribute('float') : ''} ${
        node.getRole() ? node.getRole() : ''
      }`}
    >
      <div className="content">{img}</div>
      {title}
    </div>
  )
}

export default Image
