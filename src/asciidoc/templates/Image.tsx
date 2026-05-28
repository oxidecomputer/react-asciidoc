import cn from 'classnames'

import { type ImageBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Image = ({ node }: { node: ImageBlock }) => {
  const alt = node.attributes['alt']?.toString() ?? ''
  const width = node.attributes['width']
  const height = node.attributes['height']
  const link = node.attributes['link']
  const align = node.attributes['align']
  const float = node.attributes['float']

  let img = (
    <img
      src={node.imageUri}
      alt={alt}
      width={width || undefined}
      height={height || undefined}
    />
  )

  if (link) {
    img = (
      <a className="image" href={link.toString()}>
        {img}
      </a>
    )
  }

  return (
    <div
      id={node.id || undefined}
      className={cn(
        'imageblock',
        align ? 'text-' + align : undefined,
        float || undefined,
        node.role,
      )}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
    >
      <div className="content">{img}</div>
      <Title text={node.title} />
    </div>
  )
}

export default Image
