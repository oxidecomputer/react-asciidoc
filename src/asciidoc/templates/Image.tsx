import type { Asciidoctor } from '~/lib/asciidoctor'

import { CaptionedTitle } from './util'

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

  return (
    <div
      className={`imageblock ${
        node.hasAttribute('align') ? 'text-' + node.getAttribute('align') : ''
      } ${node.hasAttribute('float') ? node.getAttribute('float') : ''} ${
        node.getRole() ? node.getRole() : ''
      }`}
    >
      <div className="content">{img}</div>
      <CaptionedTitle node={node} />
    </div>
  )
}

export default Image
