import type { Block } from '@asciidoctor/core'

import { CaptionedTitle, getLineNumber } from './util'

const Image = ({ node }: { node: Block }) => {
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
      {...getLineNumber(node)}
    >
      <div className="content">{img}</div>
      <CaptionedTitle node={node} />
    </div>
  )
}

export default Image
