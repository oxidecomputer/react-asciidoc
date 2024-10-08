import { type ImageBlock } from '../utils/prepareDocument'
import { Title } from './util'

const Image = ({ node }: { node: ImageBlock }) => {
  let img = (
    <img
      src={node.imageUri}
      alt={node.attributes['alt'].toString()}
      width={node.attributes['width']}
      height={node.attributes['height']}
    />
  )

  if (node.attributes['link']) {
    img = (
      <a className="image" href={node.attributes['link'].toString()}>
        {img}
      </a>
    )
  }

  return (
    <div
      className={`imageblock ${
        node.attributes['align'] ? 'text-' + node.attributes['align'] : ''
      } ${node.attributes['float'] ? node.attributes['float'] : ''} ${
        node.role ? node.role : ''
      }`}
      {...(node.lineNumber ? { 'data-lineno': node.lineNumber } : {})}
      style={{
        maxWidth: node.attributes['width'],
        maxHeight: node.attributes['height'],
      }}
    >
      <div className="content">{img}</div>
      <Title text={node.title} />
    </div>
  )
}

export default Image
